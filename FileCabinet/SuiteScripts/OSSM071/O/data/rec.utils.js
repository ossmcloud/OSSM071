/**
 * @NApiVersion 2.0
 * @Version 1 [20232.01.11]
 */
define(['N/record', '.././core.err.js', '.././core.js', 'N/search'],
    function (record, err, core, src) {


        //#region NS Record wrapper
        function NSRecord(nsRecord) {
            if (!nsRecord) { err.throwNullArg('nsRecord'); }

            this.ignoreFieldChange = false;
            this.subList = null;

            //
            //#region declarations & properties
            //
            var _nsRecord = nsRecord;

            Object.defineProperty(this, 'r', {
                get: function () {
                    if (!_nsRecord) { err.throwNullObj('nsRecord'); }
                    return _nsRecord;
                },
                set: function (value) { err.throwReadOnly('r'); }
            });

            Object.defineProperty(this, 'id', {
                get: function () { return this.r.id; },
                set: function (value) { err.throwReadOnly('id'); }
            });

            Object.defineProperty(this, 'type', {
                get: function () { return this.r.type; },
                set: function (value) { err.throwReadOnly('type'); }
            });

            Object.defineProperty(this, 'isDynamic', {
                get: function () { return this.r.isDynamic; },
                set: function (value) { err.throwReadOnly('isDinamic'); }
            });

            Object.defineProperty(this, 'isNew', {
                get: function () { return (this.r.id == null); },
                set: function (value) { err.throwReadOnly('inNew'); }
            });
            //#endregion



            //#region getters and setters

            this.getField = function (fieldId) {
                if (fieldId = 'inernalid') { return this.id; }
                return this.r.getField({ fieldId: fieldId });
            }

            this.get = function (fieldName) {
                return this.r.getValue({ fieldId: fieldName });
            }
            this.getText = function (fieldName) {
                return this.r.getText({ fieldId: fieldName });
            }
            this.set = function (fieldName, value, ignoreFieldChange) {
                this.r.setValue({ fieldId: fieldName, value: value, ignoreFieldChange: ignoreFieldChange || this.ignoreFieldChange });
            }



            this.getSub = function (sublistId, fieldName, lineno) {
                if (this.isDynamic && lineno !== undefined && lineno !== null) {
                    return this.r.getCurrentSublistValue({ sublistId: sublistId, fieldId: fieldName });
                } else {
                    return this.r.getSublistValue({ sublistId: sublistId, fieldId: fieldName, line: lineno });
                }
            }
            this.getSubText = function (sublistId, fieldName, lineno) {
                if (this.isDynamic && lineno !== undefined && lineno !== null) {
                    return this.r.getCurrentSublistText({ sublistId: sublistId, fieldId: fieldName });
                } else {
                    return this.r.getSublistText({ sublistId: sublistId, fieldId: fieldName, line: lineno });
                }
            }
            this.getList = function (fieldName, lineNo) {
                //if (!this.subList){this.subList='item'; }
                return this.getSub(this.subList, fieldName, lineNo);
            }
            this.getListText = function (fieldName, lineNo) {
                //if (!this.subList){this.subList='item'; }
                return this.getSubText(this.subList, fieldName, lineNo);
            }

            this.getSubItem = function (fieldName, lineno) {
                return this.getSub('item', fieldName, lineno);
            }
            this.getSubItemText = function (fieldName, lineno) {
                return this.getSubText('item', fieldName, lineno);
            }

            
            this.setSub = function (sublistId, fieldName, value, lineno, commitLine) {
                if (this.isDynamic) {
                    if (lineno !== undefined && lineno !== null) { this.r.selectLine({ sublistId: sublistId, line: lineno }); }
                    this.r.setCurrentSublistValue({ sublistId: sublistId, fieldId: fieldName, value: value, ignoreFieldChange: this.ignoreFieldChange });
                    if (commitLine) { this.r.commitLine({ sublistId: sublistId }); }
                } else {
                    this.r.setSublistValue({ sublistId: sublistId, fieldId: fieldName, line: parseInt(lineno), value: value, ignoreFieldChange: this.ignoreFieldChange });
                }
            }
            this.setList = function (fieldName, value, lineno, commitLine) {
                this.setSub(this.subList, fieldName, value, lineno, commitLine);
            }
            this.setSubItem = function (fieldName, value, lineno, commitLine) {
                this.setSub('item', fieldName, value, lineno, commitLine);
            }
            



            this.addLine = function (sublistId) {
                if (!this.isDynamic) { return; }
                if (!sublistId) { sublistId = 'item'; }
                return new NSRecord(this.r.selectNewLine({ sublistId: sublistId }));
            }
            this.selectLine = function (sublistId, lineNo) {
                if (!lineNo) { lineNo = 0; }
                if (!sublistId) { sublistId = 'item'; }
                return new NSRecord(this.r.selectLine({ sublistId: sublistId, line: lineNo }));
            }
            this.commitLine = function (sublistId) {
                if (!this.isDynamic) { return; }
                if (!sublistId) { sublistId = 'item'; }
                return this.r.commitLine({ sublistId: sublistId });
            }
            this.removeLine = function (sublistId, line) {
                this.r.removeLine({
                    sublistId: sublistId || 'item',
                    line: line || 0,
                    ignoreRecalc: true
                });
            }

            //#endregion


            //#region child record helpers

            this.countSub = function (sublistId) {
                if (core.isEmpty(sublistId)) { sublistId = 'item'; }
                return this.r.getLineCount({ sublistId: sublistId });
            }

            this.countList = function () {
                return this.r.getLineCount({ sublistId: this.subList });
            }

            this.getSubs = function (sublistId, keyFieldName, keyFieldValue) {
                var c = this.countSub(sublistId);
                for (var ic = 0; ic < c; ic++) {
                    var key = this.r.getSublistValue({ sublistId: sublistId, fieldId: keyFieldName, line: ic });
                    if (key == keyFieldValue) {
                        return ic;
                    }
                }
                return null;
            }

            this.getSubRecord = function (sublistId, fieldId) {
                if (sublistId) {
                    return new NSRecord(this.r.getCurrentSublistSubrecord({
                        sublistId: sublistId,
                        fieldId: fieldId,
                    }));
                } else {
                    return new NSRecord(this.r.getSubrecord({
                        fieldId: fieldId
                    }));
                }
            }

            this.getListRecord = function (fieldId) {
                if (this.subList) {
                    return new NSRecord(this.r.getCurrentSublistSubrecord({
                        sublistId: this.subList,
                        fieldId: fieldId,
                    }));
                } else {
                    return new NSRecord(this.r.getSubrecord({
                        fieldId: fieldId
                    }));
                }
            }

            //#endregion


            //#region record maintenance functions

            this.submit = function (fieldNames, fieldValues) {
                _submit(this.r.type, this.r.id, fieldNames, fieldValues);
            }

            this.save = function (ignoreMandatoryFields) {
                this.newId = this.r.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: ignoreMandatoryFields
                });
                return this.newId;
            }

            this.reload = function (isDynamic) {
                _nsRecord = record.load({ type: this.type, id: this.id, isDynamic: isDynamic || this.isDynamic });
            }

            this.del = function () {
                _delete(this.r.type, this.r.id);
            }

            this.copy = function (isNOTDynamic) {
                return new NSRecord(record.copy({ type: this.type, id: this.id, isDynamic: isNOTDynamic !== false }));
            }

            //#endregion



            this.setSubValue = this.setSub;

        }

        //#endregion

        //#region private methods

        function _lookUp(recordType, id, fieldNames) {
            if (!Array.isArray(fieldNames)) { fieldNames = [fieldNames]; }
            return src.lookupFields({ type: recordType, id: id, columns: fieldNames });
        }

        function _submit(recordType, id, fieldNames, values) {
            record.submitFields({
                type: recordType,
                id: id,
                values: core.toObj(fieldNames, values),
                options: {
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                }
            });
        }

        function _delete(recordType, id) {
            record.delete({ type: recordType, id: id });
        }

        //#endregion

        //#region  module return object

        return {
            del: _delete,
            submit: _submit,

            get: function (nsRecord) {
                return new NSRecord(nsRecord);
            },

            new: function (recordType, isDynamic, defaultValues) {
                var rec = new NSRecord(record.create({ type: recordType, isDynamic: isDynamic, defaultValues: defaultValues }));
                return rec;
            },

            load: function (recordType, nsRecordId, isDynamic) {
                var rec = new NSRecord(record.load({ type: recordType, id: nsRecordId, isDynamic: isDynamic }));
                return rec;
            },

            copy: function (recordType, recordId, isDynamic, defaultValues) {
                return new NSRecord(record.copy({
                    type: recordType,
                    id: recordId,
                    isDynamic: isDynamic,
                    defaultValues: defaultValues
                }));
            },

            lookUp: function (recordType, id, fieldNames) {
                var val = src.lookupFields({ type: recordType, id: id, columns: fieldNames });
                if (!Array.isArray(fieldNames)) {
                    var fVal = val[fieldNames]
                    return (Array.isArray(fVal)) ? fVal[0] : fVal;
                }
                for (var f = 0; f < fieldNames.length; f++) {
                    var fVal = val[fieldNames[f]];
                    if (Array.isArray(fVal) && fVal.length == 1) {
                        val[fieldNames[f]] = fVal[0];
                    }
                }
                return val;
            },




            transf: function (fromType, fromId, toType, dynamic) {
                return new NSRecord(record.transform({
                    fromType: fromType,
                    fromId: fromId,
                    toType: toType,
                    isDynamic: dynamic,
                }));
            },

            receivePurchOrder: function (poId, poLineId, poLineQty) {
                var receipt = new NSRecord(record.transform({
                    fromType: record.Type.PURCHASE_ORDER,
                    fromId: poId,
                    toType: record.Type.ITEM_RECEIPT,
                    isDynamic: true,
                }));
                var lineNo = null;
                if (poLineId) {
                    for (var lx = 0; lx < receipt.countSub(); lx++) {
                        var l = receipt.getSubItem('orderline', lx);
                        receipt.setSubItem('itemreceive', (l == poLineId), lx);
                        if (poLineQty !== undefined && (l == poLineId)) {
                            receipt.setSubItem('quantity', poLineQty, lx);
                        }
                        if (l == poLineId) {
                            //receipt.selectLine('item', lx);
                            lineNo = lx;
                            //break;
                        }

                    }
                }

                receipt.selectLine('item', lineNo);

                return {
                    receipt: receipt,
                    line: lineNo
                };
            },

            fulfilSalesOrder: function (soId, soLineId, soLineQty) {
                var fulfilment = new NSRecord(record.transform({
                    fromType: record.Type.SALES_ORDER,
                    fromId: soId,
                    toType: record.Type.ITEM_FULFILLMENT,
                    isDynamic: true,
                }));
                var lineNo = null;
                if (soLineId) {
                    for (var lx = 0; lx < fulfilment.countSub(); lx++) {
                        var l = fulfilment.getSubItem('line', lx);
                        fulfilment.setSubItem('itemreceive', (l == soLineId), lx);
                        if (soLineQty !== undefined && (l == soLineId)) {
                            fulfilment.setSubItem('quantity', soLineQty, lx);
                        }
                        if (l == soLineId) {
                            fulfilment.selectLine('item', lx);
                            lineNo = lx;
                            break;
                        }
                    }
                }
                return {
                    fulfil: fulfilment,
                    line: lineNo
                };
            },

            completeWorkOrder: function (woId) {
                return new NSRecord(record.transform({
                    fromType: record.Type.WORK_ORDER,
                    fromId: woId,
                    toType: record.Type.ASSEMBLY_BUILD,
                    isDynamic: true,
                }));
            },




            fetchEntityByRef: function (entityType, entityRef, returnId, isDynamic) {
                return this.fetchRecordByRef(entityType, 'entityid', entityRef, returnId, isDynamic);
            },

            fetchEntityByRefEx: function (entityType, entityRef, returnId, isDynamic) {
                try {
                    return this.fetchRecordByRef(entityType, 'entityid', entityRef, returnId, isDynamic);
                } catch (e) {
                    if (e.message.indexOf('record not found using') < 0) { throw e; }
                    return null;
                }
            },

            fetchTranByRef: function (tranType, tranRef, returnId, isDynamic) {
                return this.fetchRecordByRef(tranType, 'tranid', tranRef, returnId, isDynamic);
            },

            fetchRecordByRef: function (recordType, referenceField, entityRef, returnId, isDynamic) {
                var recordId = null;
                src.create({
                    type: recordType,
                    columns: [{ name: 'internalid', sort: src.Sort.ASC }],
                    filters: [[referenceField, 'is', entityRef]]
                }).run().each(function (r) {
                    recordId = r.id;
                });
                if (!returnId) {
                    if (!recordId) {
                        //err.throwNotFound(recordType, entityRef);
                        return null;
                    }
                    return this.load(recordType, recordId, isDynamic);
                }
                return recordId;
            },

            getEntityRef: function (entityType, id) {
                return this.getRecordRef(entityType, id, 'entityid');
            },
            getTranRef: function (tranType, id) {
                return this.getRecordRef(tranType, id, 'tranid');
            },
            getRecordRef: function (recordType, id, referenceField) {
                return this.lookUp(recordType, id, referenceField);
            },
            getCurrency: function (isoCode) {
                return this.fetchRecordByRef('currency', 'symbol', isoCode, true);
            },
            getCurrencyISOCode: function (id) {
                return this.lookUp('currency', id, 'symbol');
            },

            convertNsNativeType: function (nativeType) {
                if (nativeType == 'CustInvc') {
                    return 'invoice';
                } else if (nativeType == 'VendCred') {
                    return 'vendorcredit';
                } else if (nativeType == 'VendBill') {
                    return 'vendorbill';
                } else {
                    throw new Error('unrecognised native type: [' + nativeType + ']');
                }
            },

            compare: function (recType, id1, id2) {
                if (core.isEmpty(recType)) { err.throwNullArg('recordType'); }
                var ids = { id1: parseInt(id1), id2: parseInt(id2) };
                if (isNaN(ids.id1)) { err.throwInvalidArg('id1', id1); }
                if (isNaN(ids.id2)) { err.throwInvalidArg('id2', id2); }

                var rec1 = this.load(recType, ids.id1);
                var rec2 = this.load(recType, ids.id2);
                var l = '"' + recType + '.FieldName","Rec1(' + id1 + ')","Rec2(' + id2 + ')"\n';
                var fields = rec1.r.getFields();
                var diffFields = new Array();
                core.loop(fields.length, function (idx) {
                    var fName = fields[idx];
                    if (fName == 'nsapiCT' || fName == 'sys_id') { return true; }
                    var v1 = JSON.stringify(rec1.get(fName));
                    var v2 = JSON.stringify(rec2.get(fName));
                    if (v1 != v2) {
                        var logInfo = '"' + fName + '","' + rec1.get(fName) + '","' + rec2.get(fName) + '"';
                        l += logInfo + '\n';
                        diffFields.push({ field: fName, v1: v1, v2: v2 });
                    }
                    return true;
                });
                //
                return {
                    then: function (f) {
                        var res = {
                            fields: diffFields,
                            msg: (diffFields.length == 0) ? 'records are identical' : diffFields.length + ' fields have different values',
                            csv: l,
                            csvName: recType + '_' + ids.id1 + '_vs_' + ids.id2 + '.csv'
                        }
                        if (core.isFunc(f)) { f(res); }
                    }
                }

            }

        }

        //#endregion


    });
