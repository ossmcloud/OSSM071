/**
 * @NApiVersion 2.0
 * @Version 1 [20232.01.11]
 */
define(['./core.js', 'N/runtime', 'N/task'],
    function (core, runtime, task) {
        return {

            getUnits: function () {
                return runtime.getCurrentScript().getRemainingUsage();
            },

            getParam: function (parameterFieldId) {
                if (parameterFieldId.indexOf('custscript_') < 0) { parameterFieldId = 'custscript_' + parameterFieldId; }
                return runtime.getCurrentScript().getParameter({ name: parameterFieldId });
            },

            validateUnits: function (minValue, restartScriptId, params) {
                if (!minValue) { minValue = 500; }
                var remainingUnits = runtime.getCurrentScript().getRemainingUsage();
                if (remainingUnits <= minValue) { core.logDebug('OSSMSDK::validateRemainingUnits', 'RUNNING: remaining script units low (' + remainingUnits + '), need to restart script'); }
                if (remainingUnits > minValue) { return true; }
                if (restartScriptId) { this.startService(restartScriptId, params); }
                return false;
            },

            validateUnitsEx: function (minValue, restartScriptId, restartDeployId, params) {
                if (!minValue) { minValue = 500; }
                var remainingUnits = runtime.getCurrentScript().getRemainingUsage();
                if (remainingUnits <= minValue) { core.logDebug('OSSMSDK::validateRemainingUnits', 'RUNNING: remaining script units low (' + remainingUnits + '), need to restart script'); }
                if (remainingUnits > minValue) { return true; }
                if (restartScriptId) { this.startServiceEx(restartScriptId, restartDeployId, params); }
                return false;
            },

            startService: function (scriptId, params) {
                try {
                    core.logDebug('OSSMSDK::startService', 'TASK START: (re)starting script...');
                    if (params) { core.logDebug('OSSMSDK::startService', 'TASK START: parameters...' + JSON.stringify(params)); }
                    if (!params) { params = {}; }
                    task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT,
                        scriptId: 'customscript' + scriptId,
                        deploymentId: 'customdeploy' + scriptId,
                        params: params,
                    }).submit();
                    core.logDebug('OSSMSDK::startService', 'TASK START: task started');
                } catch (e) {
                    core.logError('OSSMSDK::startService', e.message);
                    throw e;
                }
            },

            startServiceEx: function (scriptId, deployId, params) {
                try {

                    core.logDebug('OSSMSDK::startService', 'TASK START: (re)starting script...');
                    if (params) { core.logDebug('OSSMSDK::startService', 'TASK START: parameters...' + JSON.stringify(params)); }
                    if (!params) { params = {}; }
                    task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT,
                        scriptId: 'customscript' + scriptId,
                        deploymentId: 'customdeploy' + deployId,
                        params: params,
                    }).submit();
                    core.logDebug('OSSMSDK::startService', 'TASK START: task started');
                } catch (e) {
                    core.logError('OSSMSDK::startService', e.message);
                    throw e;
                }
            },




        }
    });
