/**
 * @NApiVersion 2.0
 * @Version 1 [20232.01.11]
 */
define(['N/record', '.././core', '.././core.err.js'],

    function (record, ossm, err) {

        function OSSMRecord(recordType, recordId, isDynamic) {
            try {
                // this must be passed
                if (!recordType) { err.throwNullArg('recordType'); }

                this.isDirty = false;
                this.isNew = false;

                // get NetSuite record
                var _nsRecord = null;
                if (ossm.isEmpty(recordId)) {
                    // if nothing passed we create a new record
                    _nsRecord = record.create({ type: recordType, isDynamic: isDynamic });
                    this.isDirty = true;
                    this.isNew = true;

                } else {
                    // check if object passed
                    if (ossm.isObj(recordId)) {
                        _nsRecord = recordId;
                        // NOTE: if the entity return undefined is because the object is not complete (usually happens when running a client script in view mode)
                        if (_nsRecord.getValue({ fieldId: 'name' }) === undefined) { _nsRecord = null; }
                    }

                    // if we have no record then load it from server
                    this.recordLoaded = false;
                    if (_nsRecord == null) {
                        var nsRecordId = recordId.id || recordId;
                        _nsRecord = record.load({ type: recordType, id: nsRecordId, isDynamic: isDynamic, });
                        this.recordLoaded = true;
                    }
                }
                // if unable to get/load/create
                if (_nsRecord == null) { err.throwError('could not get/load/create ' + recordType + ' id: - ' + recordId, 'OSSMRecord.prototype.constructor'); }

                // set properties
                this.recordId = parseInt(recordId);
                this.recordType = recordType;
                this.isDynamic = isDynamic;
                this.r = _nsRecord;

            } catch (e) {
                err.throwError(e, 'rec.base::new OSSMRecord');
            }

            // only expose record with a method
            this.getNsRecord = function () { return _nsRecord; }

            // reload function
            this.reload = function () {
                _nsRecord = record.load({ type: this.recordType, id: this.recordId, isDynamic: this.isDynamic, });
                this.recordLoaded = true;
            }


        }

        OSSMRecord.prototype.addProperty = function (prop) {
            if (!prop) { err.throwError('argument prop cannot be undefined', 'OSSMRecord.prototype.addProperty'); }
            if (!prop.fieldName) { err.throwError('argument prop.fieldName cannot be undefined', 'OSSMRecord.prototype.addProperty'); }
            if (!prop.name) { prop.name = prop.fieldName; }
            Object.defineProperty(this, prop.name, {
                get: function () { return this.getPropValue(prop); },
                set: function (value) { this.setPropValue(prop, value); }
            });
            var probObj = '_' + prop.name;
            Object.defineProperty(this, probObj, {
                get: function () { return this.getPropValue(prop, true); },
                set: function (value) { this.setPropValue(prop, value); }
            });
        }

        OSSMRecord.prototype.getPropValue = function (prop, returnObject) {
            if (!prop) { err.throwError('argument prop cannot be undefined', 'OSSMRecord.prototype.getPropValue'); }
            if (prop.value == null || prop.value == undefined) {
                if (prop.asText) {
                    prop.value = this.getNsRecord().getText({ fieldId: prop.fieldName });
                    //prop.readOnly = true;
                } else {
                    prop.value = this.getNsRecord().getValue({ fieldId: prop.fieldName });
                }
                prop.valueOriginal = prop.value;
                prop.isDirty = false;
            }
            prop.v = prop.value;
            return (returnObject) ? prop : prop.v;
        }

        OSSMRecord.prototype.setPropValue = function (prop, val) {
            if (prop.readOnly) { err.throwError('property [' + prop.name + '] is read-only!!!', 'OSSMRecord.prototype.setPropValue'); }
            prop.value = val
            prop.isDirty = prop.value !== prop.valueOriginal;
            if (prop.isDirty) {
                this.isDirty = true;
                this.getNsRecord().setValue({ fieldId: prop.fieldName, value: val, ignoreFieldChange: true });
            }
        }

        OSSMRecord.prototype.getValue = function (nsFieldName, asText) {
            if (!nsFieldName) { err.throwError('argument [nsFieldName] cannot be undefined', 'OSSMRecord.prototype.getValue'); }
            if (asText) { return this.getNsRecord().getText({ fieldId: nsFieldName }); }
            return this.getNsRecord().getValue({ fieldId: nsFieldName });
        }

        OSSMRecord.prototype.setValue = function (nsFieldName, value) {
            if (!nsFieldName) { err.throwError('argument [nsFieldName] cannot be undefined', 'OSSMRecord.prototype.setValue'); }
            this.getNsRecord().setValue({ fieldId: nsFieldName, value: value });
            this.isDirty = true;
        }

        OSSMRecord.prototype.getSubListValue = function (nsSubListId, nsFieldName, nsLineNo, asText) {
            if (!nsSubListId) { err.throwError('argument [nsSubListId] cannot be undefined', 'OSSMRecord.prototype.getSubListValue'); }
            if (!nsFieldName) { err.throwError('argument [nsFieldName] cannot be undefined', 'OSSMRecord.prototype.getSubListValue'); }
            if (!nsLineNo) { nsLineNo = 0; }
            if (asText) { return this.getNsRecord().getSublistText({ sublistId: nsSubListId, fieldId: nsFieldName, line: nsLineNo }); }
            return this.getNsRecord().getSublistValue({ sublistId: nsSubListId, fieldId: nsFieldName, line: nsLineNo });
        }

        OSSMRecord.prototype.getSubListCount = function (nsSubListId) {
            if (!nsSubListId) { err.throwError('argument [nsSubListId] cannot be undefined', 'OSSMRecord.prototype.getSubListValue'); }
            return this.getNsRecord().getLineCount({ sublistId: nsSubListId });
        }

        OSSMRecord.prototype.save = function (ignoreMandatoryFields) {
            try {
                if (ignoreMandatoryFields == undefined) { ignoreMandatoryFields = false; }
                this.recordId = this.getNsRecord().save({
                    enableSourcing: true,
                    ignoreMandatoryFields: ignoreMandatoryFields
                });
                this.recordType = this.getNsRecord().type;
                this.reload();
                this.isDirty = false;
                this.isNew = false;
                return this.recordId;
            } catch (e) {
                err.throwError(e, 'OSSMRecord.prototype.save');
            }
        }

        OSSMRecord.prototype.del = function () {
            try {
                record.delete({
                    type: this.recordType,
                    id: this.recordId,
                });
            } catch (e) {
                err.throwError(e, 'OSSMRecord.prototype.delete');
            }
        }


        return OSSMRecord;

    });
