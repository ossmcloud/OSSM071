/**
 * @NApiVersion 2.0
 * @Version 1 [20232.01.11]
 */
define([],
    function () {

        var _errorCodes = {
            UNKNOWN: 'UNKNOWN_CODE',
            NULL_ARG: 'NULL_ARG',
            NULL_OBJ: 'NULL_OBJ',
            READ_ONLY: 'READ_ONLY',
            CORE_ERR: 'CORE_ERR',
            REC_NOT_FOUND: 'REC_NOT_FOUND',
        }

        function o_Error(code, message, innerError) {
            var _code = code || 'UNKNOWN_CODE';
            Object.defineProperty(this, 'code', {
                get: function () { return _code; },
                set: function (value) { throw new Error('property is read only and can\'t be set!'); }
            });

            var _message = message || 'no error message';
            Object.defineProperty(this, 'message', {
                get: function () { return _message; },
                set: function (value) { throw new Error('property is read only and can\'t be set!'); }
            });

            var _innerError = innerError || null;
            Object.defineProperty(this, 'innerError', {
                get: function () { return _innerError; },
                set: function (value) { throw new Error('property is read only and can\'t be set!'); }
            });
        }
        o_Error.prototype = Object.create(Error.prototype);

        return {
            throw: function (code, message, innerError) {
                throw new o_Error(code, message, innerError);
            },

            throwError: function (error, source) {
                throw new o_Error(source, error.message, error);
            },

            throwNullArg: function (argName) {
                this.throw(_errorCodes.NULL_ARG, 'argument [' + argName + '] cannot be null or undefined');
            },

            throwInvalidArg: function (argName, argValue) {
                this.throw(_errorCodes.NULL_ARG, 'argument [' + argName + '] is invalid: ' + argValue);
            },

            throwReadOnly: function (propName) {
                propName = (propName) ? '[' + propName + ']' : '';
                this.throw(_errorCodes.READ_ONLY, 'property ' + propName + ' is read only and can\'t be set!');
            },

            throwNullObj: function (argName) {
                this.throw(_errorCodes.NULL_OBJ, 'object [' + argName + '] is null or undefined');
            },

            throwNotFound: function (recType, recRef) {
                this.throw(_errorCodes.REC_NOT_FOUND, '[' + recType + '] record not found using: ' + recRef);
            },

            codes: _errorCodes,
        }

    });
