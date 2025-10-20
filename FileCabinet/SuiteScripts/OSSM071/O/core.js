/**
 * @NApiVersion 2.0
 * @Version 1 [20232.01.11]
 */
define(['N/runtime', 'N/util', 'N/log', './core.err.js', 'N/email', 'N/search', 'N/url'],
    function (runtime, util, nsLog, err, nsEmail, search, url) {
        return {
            oVersion: '1.1',

            accountId: function () {
                runtime.accountId;
            },

            url: {
                app: function () {
                    return 'https://' + url.resolveDomain({
                        hostType: url.HostType.APPLICATION,
                        accountId: runtime.accountId
                    });
                },
                record: function (type, id, edit, params, absolute) {
                    var link = url.resolveRecord({ recordType: type, recordId: id, isEditMode: edit || false, params: params });
                    return ((absolute) ? this.app() : '') + link;
                },
                script: function (scriptId, params, absolute) {
                    var deployId = scriptId;
                    if (scriptId.indexOf('customscript_') < 0) {
                        scriptId = 'customscript_' + scriptId;
                        deployId = 'customdeploy_' + scriptId;
                    } else {
                        deployId = scriptId.replace('customscript_', 'customdeploy_');
                    }
                    var link = url.resolveScript({
                        scriptId: scriptId,
                        deploymentId: deployId,
                        params: params
                    });
                    return ((absolute) ? this.app() : '') + link;
                },
                scriptEx: function (scriptId, deployId, params, absolute) {
                    if (scriptId.indexOf('customscript_') < 0) { scriptId = 'customscript_' + scriptId; }
                    if (deployId.indexOf('customdeploy_') < 0) { deployId = 'customdeploy_' + deployId; }
                    var link = url.resolveScript({
                        scriptId: scriptId,
                        deploymentId: deployId,
                        params: params
                    });
                    return ((absolute) ? this.app() : '') + link;
                },

            },

            isLive: function () {
                return runtime.envType == runtime.EnvType.PRODUCTION
            },

            isSB: function () {
                return runtime.envType == runtime.EnvType.SANDBOX
            },

            UI: function () {
                return (runtime.executionContext == runtime.ContextType.USER_INTERFACE);
            },

            getUnits: function () {
                return runtime.getCurrentScript().getRemainingUsage();
            },

            me: function () {
                var email = runtime.getCurrentUser().email;
                return (email.toLowerCase() == 'carlosgamiz@envisagecloud.com' || email.toLowerCase() == 'giuseppegalligani@envisagecloud.com' || email.toLowerCase() == 'giuseppegalligani@ossmcloud.ie');
            },

            ossm: function () {
                var email = runtime.getCurrentUser().email;
                return (email.toLowerCase().indexOf('@ossmcloud.ie') > 0);
            },

            user: function () {
                return runtime.getCurrentUser().id;
            },

            userName: function () {
                return runtime.getCurrentUser().name;
            },

            role: function () {
                return runtime.getCurrentUser().role;
            },

            isObj: function (val) {
                if (val === null) { return false; }
                return ((typeof val === 'function') || (typeof val === 'object'));
            },

            isFunc: function (val) {
                if (val === null) { return false; }
                return ((typeof val === 'function'));
            },

            isEmpty: function (val) {
                return (val === undefined || val == null || val == '');
            },

            isDate: function (val) {
                if (val === null || val === undefined) { return false; }
                return val.constructor.name === 'Date';
            },

            toObj: function (propNames, propValues) {
                return new _createObject(propNames, propValues);
            },

            toArray: function (object) {
                if (object == null || object === undefined) { return new Array(); }
                if (Array.isArray(object)) { return object; }
                var res = new Array();
                res.push(object);
                return res
            },

            toFloat: function (value) {
                var float = parseFloat(value);
                if (isNaN(float)) { return 0; }
                return float;
            },

            toInt: function (value) {
                var int = parseInt(value, 10);
                if (isNaN(int)) { return 0; }
                return int;
            },

            each: function (iterable, callback, _this) {
                try {
                    for (var eachIdx = 0; eachIdx < iterable.length; eachIdx++) {
                        var response = callback(iterable[eachIdx], eachIdx, _this);
                        if (response !== undefined && !response) { break; }
                    }
                } catch (e) {
                    err.throw(err.codes.CORE_ERR, 'function core::each threw an exception: ' + e.message, e);
                }
            },

            loop: function (length, callback, _this) {
                try {
                    for (var eachIdx = 0; eachIdx < length; eachIdx++) {
                        var response = callback(eachIdx, _this);
                        if (response !== undefined && !response) { break; }
                    }
                } catch (e) {
                    err.throw(err.codes.CORE_ERR, 'function core::loop threw an exception: ' + e.message, e);
                }
            },




            findInArray: function (array, keyName, keyValue, throwError) {
                var item = null;
                this.each(array, function (a, idx) {
                    //for(var aIdx = 0; aIdx < array.length; aIdx++) {    
                    //var a = array[aIdx];
                    if (a[keyName] == undefined) { err.throw(err.codes.CORE_ERR, 'Array item does not have property: ' + keyName); }
                    if (a[keyName] === keyValue) {
                        item = array[idx];
                        return false;
                    }
                    return true;
                });
                if (item == null && throwError) { err.throw(err.codes.CORE_ERR, 'Cannot find item in iterable [key]:' + keyName + ' using [keyValue]: ' + keyValue); }
                return item;
            },

            sortArray: function (array, fieldName, isString, descending) {
                array.sort(function (a, b) {
                    var fieldValueA = a[fieldName];
                    var fieldValueB = b[fieldName];
                    if (isString) {
                        fieldValueA = fieldValueA.toString().toLowerCase();
                        fieldValueB = fieldValueB.toString().toLowerCase();
                    }
                    if (fieldValueA < fieldValueB)
                        return (descending) ? 1 : -1;
                    if (fieldValueA > fieldValueB)
                        return (descending) ? -1 : 1;
                    return 0;
                });
            },



            mailMe: function (subject, message) {
                try {
                    var mailBodyFooter = '<br /><br /><br /><div style="border 1px solid silver;">';
                    mailBodyFooter += '<b>account: </b>' + runtime.accountId;
                    mailBodyFooter += '<br /><b>env. type: </b>' + runtime.envType;
                    mailBodyFooter += '<br /><b>context: </b>' + runtime.executionContext;

                    var script = runtime.getCurrentScript();
                    if (script) { mailBodyFooter += '<br /><b>script: </b>' + script.id + '[' + script.deploymentId + ']'; }

                    var user = runtime.getCurrentUser();
                    if (user) { mailBodyFooter += '<br /><b>user: </b>[' + user.id + '] ' + user.name + ' (' + user.email + ')'; }

                    var recordId = null;
                    search.create({ type: 'employee', filters: [['email', 'is', 'giuseppegalligani@ossmcloud.ie']] }).run().each(function (r) {
                        recordId = r.id;
                    });
                    if (!recordId) { throw new Error('There is no ME in the system'); }

                    var emailOptions = {
                        author: recordId,
                        recipients: 'giuseppegalligani@ossmcloud.ie',
                        subject: ('[' + runtime.accountId + '-' + runtime.envType + '] ' + subject),
                        body: (message + mailBodyFooter),
                    }
                    nsEmail.send(emailOptions);
                } catch (error) {
                    try {
                        this.logError('MAILME-SUBJECT', subject);
                        this.logError('MAILME-MESSAGE', message);
                        this.logError('MAILME', error.message);
                    } catch (error) {
                        // ignore
                    }
                }
            },

            logDebug: function (t, m) {
                try {
                    if (t && m) {
                        nsLog.debug({
                            title: t,
                            details: m
                        });
                    } else if (t || m) {
                        nsLog.debug({
                            title: 'OSSMSDK',
                            details: (t || m)
                        });
                    }
                } catch (e) {
                    // NOTE: WE MUST NOT THROW AN ERROR HERE
                    // throw e;
                }
            },
            logError: function (t, m) {
                try {
                    if (t && m) {
                        nsLog.error({
                            title: t,
                            details: m
                        });
                    } else if (t || m) {
                        nsLog.error({
                            title: 'OSSMSDK',
                            details: (t || m)
                        });
                    }
                } catch (e) {
                    // NOTE: WE MUST NOT THROW AN ERROR HERE
                    // throw e;
                }
            },


            beep: function () {
                var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
                snd.play();
            },

            //
            formatNumber: _formatNumber,
            formatMoney: _formatMoney,

            // @DEPRECATED
            log: function () { },

        }

    });


function _createObject(propNames, propValues) {
    if (util.isObject(propNames)) { return propNames; }
    if (Array.isArray(propNames)) {
        for (var i = 0; i < propNames.length; i++) {
            this[propNames[i]] = propValues[i];
        }
    } else {
        this[propNames] = propValues;
    }
}

// NOTE: _formatNumber and _formatMoney are equivalent (2 different ways)
//       only difference is that _formatMoney has 2 decimals by default while _formatNumber has none
function _formatNumber(number, decimals, dec_point, thousands_sep) {
    // Strip all characters but numerical ones.
    number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;
        };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}
function _formatMoney(number, c, d, t) {
    var n = number,
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
}


String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

String.prototype.pad = function (size, char) {
    if (char == undefined) { char = " "; }
    var s = String(this);
    while (s.length < (size || 2)) { s = s + char; }
    return s.substring(0, size);
}

String.prototype.padLeft = function (size, char) {
    if (char == undefined) { char = " "; }
    var s = String(this);
    while (s.length < (size || 2)) { s = char + s; }
    return s.substring(0, size);
}

Number.prototype.pad = function (size, char) {
    if (char == undefined) { char = "0"; }
    var s = String(this);
    while (s.length < (size || 2)) { s = char + s; }
    return s.substring(0, size);
}

Number.prototype.formatMoney = function (c, d, t) {
    return _formatMoney(c, d, t);
};
Number.prototype.formatNumber = function (c, d, t) {
    return _formatNumber(this, c, d, t);
};





