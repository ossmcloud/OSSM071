/**
 * @NApiVersion 2.0
 * @Version 1 [20232.01.11]
 */
define(['N/util', 'N/format', './core.js', './core.err.js'],
    function (nutil, format, core, err) {
        var _monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var _weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        var _weekDaysJs = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        return {
            Months: _monthNames,
            WeekDays: _weekDays,
            WeekDaysJs: _weekDaysJs,

            parse: function (dateString, separator, inverted) {
                if (core.isEmpty(dateString)) { return 'Invalid Date'; }
                if (core.isEmpty(separator)) { separator = '/'; }
                var dValues = dateString.split(separator);
                if (dValues.length < 3) { return 'Invalid Date'; }
                var month = parseInt(dValues[1], 10);
                if (inverted) {
                    return new Date(dValues[0], month, dValues[2])
                } else {
                    return new Date(dValues[2], month, dValues[0])
                }
            },

            format: function (o) {
                try {
                    if (o instanceof Date) { o = { date: o }; }
                    if (!o) { o = {}; }
                    if (core.isEmpty(o.date)) { o.date = new Date(); }
                    if (core.isEmpty(o.separator)) { o.separator = '/'; }
                    if (o.timeSeparator == undefined) { o.timeSeparator = ':'; }
                    if (core.isEmpty(o.dateTimeSeparator)) { o.dateTimeSeparator = ' '; }
                    if (core.isEmpty(o.useMonthName)) { o.useMonthName = false; }
                    if (core.isEmpty(o.invert)) { o.invert = false; }
                    if (core.isEmpty(o.addTime)) { o.addTime = false; }
                    if (core.isEmpty(o.noSeconds)) { o.noSeconds = false; }
                    //o.pad = o.doNotPad || false;

                    var month = (o.useMonthName) ? _monthNames[o.date.getMonth()] : (o.date.getMonth() + 1);
                    if (o.pad) { month = month.pad(); }

                    var dateStr = '';
                    var dayStr = o.date.getDate();
                    if (o.pad) { dayStr = dayStr.pad(); }

                    if (o.invert) {
                        dateStr = o.date.getFullYear() + o.separator + month + o.separator + dayStr;
                    } else {
                        dateStr = dayStr + o.separator + month + o.separator + o.date.getFullYear();
                    }
                    if (o.addTime) {
                        dateStr += o.dateTimeSeparator + o.date.getHours().pad() + o.timeSeparator + o.date.getMinutes().pad()
                        if (!o.noSeconds) { dateStr += o.timeSeparator + o.date.getSeconds().pad(); }
                    }
                    return dateStr;
                } catch (e) {
                    core.log('core.date::format', e.message);
                    return 'Invalid Date';
                }
            },

            formatPad: function (o) {
                if (core.isEmpty(o)) { o = {}; }
                o.pad = true;
                return this.format(o);
            },

            formatSerial: function (date, addTime, noSeconds) {
                if (core.isEmpty(date)) { date = new Date(); }

                if (date.constructor.name == 'Boolean') {
                    noSeconds = addTime;
                    addTime = date;
                    date = new Date();
                }
                var o = { date: date, separator: '_', invert: true, pad: true };
                if (addTime) {
                    o.addTime = true;
                    o.timeSeparator = '_';
                    o.dateTimeSeparator = '-';
                    o.noSeconds = noSeconds || false;

                }
                return this.format(o);
            },



            now: function () {
                return new Date();
            },

            today: function () {
                return this.dropTime();
            },

            thisMonth: function () {
                var today = this.dropTime();
                return new Date(today.getFullYear(), today.getMonth(), 1);
            },

            thisPeriod: function (returnObject) {
                return this.getPeriod(this.dropTime(), returnObject);
            },

            getPeriod: function (date, returnObject) {
                if (!date) { date = this.dropTime(); }
                var month = (date.getMonth() + 1);
                if (month < 10) { month = '0' + month; }
                var periodStr = date.getFullYear().toString() + month.toString();
                var period = {
                    str: date.getFullYear().toString() + '-' + month.toString(),
                    m: (date.getMonth() + 1),
                    y: date.getFullYear(),
                    p: parseInt(periodStr),
                };
                if (returnObject) { return period; }
                return period.p;
            },

            dropTime: function (d) {
                if (!d) { d = new Date(); }
                if (!nutil.isDate(d)) { err.throwInvalidArg("Date", d); }
                return new Date(d.getFullYear(), d.getMonth(), d.getDate());
            }

        };

    });




Date.prototype.addMinutes = function (minsCount) {
    var value = this.getTime();
    value += (minsCount * 60000);
    return new Date(value);
}
Date.prototype.addHours = function (hoursCount) {
    var value = this.getTime();
    value += ((hoursCount * 60000) * 60);
    return new Date(value);
}
Date.prototype.addDays = function (daysCount) {
    var value = this.valueOf();
    value += 86400000 * daysCount;
    return new Date(value);
}
Date.prototype.addWeeks = function (weeksCount, excludeLastDay) {
    var value = this.valueOf();
    value += 86400000 * (weeksCount * 7);
    var addDays = (weeksCount < 0) ? addDays = 1 : addDays = -1;
    return (excludeLastDay) ? new Date(value).addDays(addDays) : new Date(value);
}
Date.prototype.addMonths = function (monthsCount, excludeLastDay) {
    var sign = (monthsCount < 0) ? -1 : 1;
    // get years to add or subtract
    var y_add = (Math.floor(Math.abs(monthsCount) / 12)) * sign;
    // get months to add or subtract
    var m_add = (Math.abs(monthsCount) - (Math.abs(y_add) * 12)) * sign;
    // calculate new month
    var m = (this.getMonth()) + m_add;
    if (m > 11) { m = m - 12; y_add += 1; }
    if (m < 0) { m = 12 + m; y_add -= 1; }
    // calculate new year
    var y = this.getFullYear() + y_add;
    // calculate new day
    var d = Math.min(this.getDate(), this.getDaysInMonth(y, m));
    // create new date
    var value = new Date(y, m, d);
    return (excludeLastDay) ? value.addDays(-sign) : value;
}
Date.prototype.isLeapYear = function (year) {
    if (!year) { year = this.getFullYear(); }
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
}

Date.prototype.getWeekNumber = function () {
    var d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}
Date.prototype.getDaysInMonthDays = function (year, month) {
    return [31, (this.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
}
Date.prototype.getDaysInMonth = function () {
    return this.getDaysInMonthDays(this.getFullYear(), this.getMonth());
}

Date.prototype.now = function () {
    return new Date();
}
Date.today = function () {
    var today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}
