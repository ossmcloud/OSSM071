/**
 * @NApiVersion 2.0
 * @Version 1 [20232.01.11]
 */
define(['./core.js', '../O/data/rec.search.js', './core.date.js'],
    function (core, src, cored) {

        function getTaskLogs(scriptId, goBackDays) {
            goBackDays = parseInt(goBackDays);
            if (isNaN(goBackDays)) { goBackDays = 0; }
            var dt = Date.today().addDays(-goBackDays);

            var queue = src.new('scheduledscriptinstance');
            queue.addColumn('status');
            queue.addColumn({ name: 'startdate', sort: 'DESC' });
            queue.addColumn({ name: 'enddate', sort: 'DESC' });
            queue.addFilter({ name: 'scriptid', join: 'script', values: 'customscript' + scriptId });
            queue.addFilter({ name: 'scriptid', join: 'scriptdeployment', values: 'customdeploy' + scriptId });
            queue.addFilter({ name: 'datecreated', operator: 'onorafter', values: cored.format(dt) });
            return queue;
        }


        return {
            getTaskLogs: getTaskLogs,
            getLatestLog: function (scriptId) {
                var log = {
                    start: null,
                    end: null,
                    status: 'NO LOG FOUND',
                    toNow: function () {
                        if (!this.end) { return 0; }
                        return ((Date.now() - this.end) / (1000 * 60 * 60)) - 8;
                    },
                    elapsed: function () {
                        if (!this.end || !this.start) { return 0; }
                        return ((this.end - this.start) / (1000 * 60 * 60)) - 8;
                    },
                    message: function () {
                        if (this.status == 'NO LOG FOUND') { return 'no log found in the last 7 days...'; }
                        if (this.status == 'processing') { return 'working on it...'; }
                        return 'last run ' + this.toNow().toFixed(2) + ' hours ago';
                    }
                };
                this.getTaskLogs(scriptId, 7).each(function (res) {
                    log.start = cored.nsParse(res.get('startdate'));
                    log.end = cored.nsParse(res.get('enddate'));
                    log.status = res.get('status').toLowerCase();
                    return false;
                })
                return log;
            },
            renderLatestLogInfo: function (scriptId, expectedFrequencyInHours) {
                expectedFrequencyInHours = parseFloat(expectedFrequencyInHours);
                if (isNaN(expectedFrequencyInHours)) { expectedFrequencyInHours = 1; }
                var log = this.getLatestLog(scriptId);
                if (!log) { return '<span style="color:red"><b>no runs in over a week!</b></span>'; }

                var lastStatus = '';
                var lastStatusColor = 'black';
                if (log.status == 'pending') {
                    lastStatus = 'queued';
                    lastStatusColor = 'orange';
                } else if (log.status == 'processing') {
                    lastStatus = '<i>working on it...</i>';
                    lastStatusColor = 'blue';
                } else if (log.status == 'complete') {
                    lastStatus = 'idle';
                    lastStatusColor = 'gray';
                } else if (log.status == 'failed') {
                    lastStatus = '<b>ERRORS</b>';
                    lastStatusColor = 'red';
                }

                var differenceColor = 'black';
                var difference = ((Date.now() - log.end) / (1000 * 60 * 60)) - 8;
                if (log.status == 'processing') { difference = 0; }

                if (difference > expectedFrequencyInHours && log.status != 'processing') {
                    differenceColor = 'red';
                    lastStatusColor = 'red';
                    if (log.status != 'failed') { lastStatus = '<b>not running!</b>'; }
                }
                difference = '<span style="font-size: 15px; color:' + differenceColor + '"><i>task last run ' + difference.toFixed(2) + ' hours ago</i></span>';
                lastStatus = '<span style="color:' + lastStatusColor + '">' + lastStatus + '</span>';
                return lastStatus + '<br />' + difference;

            },


        }
    });
