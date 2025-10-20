/**
 * @NApiVersion 2.0
 * @Version 1 [20232.01.11]
 */
define(['N/ui/serverWidget', '.././core.js', 'N/redirect'],
    function (ui, core, redirect) {
        var _obj_id_count = 0;
        var _field_group_id = '';

        function o_Field(field) {
            this.field = field;
            this.f = field;
            this.id = field.id;

            this.populateSelect = function (options, selectedValue) {
                if (this.field.type.toUpperCase() != ui.FieldType.SELECT) { return; }
                options = core.toArray(options);
                for (var i = 0; i < options.length; i++) {
                    var option = options[i];
                    this.field.addSelectOption({
                        value: option.value || option,
                        text: option.text || option,
                        isSelected: (option.value || option) == selectedValue,
                    });
                }
                return this;
            }

            this.addSelectOption = function (option) {
                this.field.addSelectOption(option);
            }

            this.hide = function () {
                this.field.updateDisplayType({ displayType: ui.FieldDisplayType.HIDDEN });
                return this;
            }

            this.setInline = function () {
                this.field.updateDisplayType({ displayType: ui.FieldDisplayType.INLINE });
                return this;
            }

            this.disable = function () {
                this.field.updateDisplayType({ displayType: ui.FieldDisplayType.DISABLED });
                return this;
            }

            this.newRow = function () {
                this.field.updateBreakType({ breakType: ui.FieldBreakType.STARTROW });
                return this;
            }

            this.newCol = function () {
                this.field.updateBreakType({ breakType: ui.FieldBreakType.STARTCOL });
                return this;
            }


            this.startRow = function () {
                this.field.updateLayoutType({ layoutType: ui.FieldLayoutType.STARTROW });
                return this;
            }
            this.midRow = function () {
                this.field.updateLayoutType({ layoutType: ui.FieldLayoutType.MIDROW });
                return this;
            }
            this.endRow = function () {
                this.field.updateLayoutType({ layoutType: ui.FieldLayoutType.ENDROW });
                return this;
            }


        }

        function o_Form(form, addSubmitButton) {
            try {
                if (core.isEmpty(form)) { form = ui.createForm({ title: 'OSSM FORM' }); }
                this.form = form;
                this.f = form;

                this.addSubmitButton = function (label) {
                    if (!label) { label = 'Save'; }
                    return form.addSubmitButton({ label: label });
                }

                if (addSubmitButton) { this.addSubmitButton(); }
            } catch (e) {
                throw e;
            }

            this.setClientScriptFile = function (csFileName) {
                if (core.isEmpty(csFileName)) { err.throwNullArg('csFileName'); }
                this.f.clientScriptModulePath = csFileName;
            }



            this.initBanner = function (type, title, message, duration) {
                this.f.addPageInitMessage({
                    type: type,
                    title: title,
                    message: message,
                    duration: duration || 0
                });
            }
            this.initInfoBanner = function (title, message, duration) {
                this.initBanner(1, title, message, duration);
            }
            this.initOkBanner = function (title, message, duration) {
                this.initBanner(0, title, message, duration);
            }
            this.initWarnBanner = function (title, message, duration) {
                this.initBanner(2, title, message, duration);
            }
            this.initErrorBanner = function (title, message, duration) {
                this.initBanner(3, title, message, duration);
            }




            this.addGroup = function (label, id) {
                if (!id) { id = 'custpage_ossmsdk_grp_' + ++_obj_id_count };
                _field_group_id = id;
                return this.form.addFieldGroup({ id: id, label: label });
            }

            this.addButton = function (label, functionName, id) {
                if (!id) { id = 'custpage_ossmsdk_btn_' + ++_obj_id_count };
                return this.form.addButton({ id: id, label: label, functionName: functionName });
            }
            this.getButton = function (buttonId) {
                return this.f.getButton({
                    id: buttonId
                });
            }
            this.hideButton = function (buttonId) {
                var btn = this.getButton(buttonId);
                if (btn) { btn.isHidden = true };
            }

            this.addField = function (label, id, type, defaultValue, container, source) {
                if (id.indexOf('custpage_') < 0) { id = 'custpage_' + id; }
                if (container === undefined) { container = _field_group_id; }
                var f = this.form.addField({ id: id, type: type, label: label, container: container, source: source });
                if (!core.isEmpty(defaultValue)) { f.defaultValue = defaultValue };
                return new o_Field(f);
            }

            this.addText = function (label, id, defaultValue, container) {
                return this.addField(label, id, ui.FieldType.TEXT, defaultValue, container);
            }

            this.addTextArea = function (label, id, defaultValue, container) {
                return this.addField(label, id, ui.FieldType.TEXTAREA, defaultValue, container);
            }

            this.addSelect = function (label, id, options, container) {
                if (!options) { options = {}; }
                if (id.indexOf('custpage_') < 0) { id = 'custpage_' + id; }
                if (container === undefined) { container = _field_group_id; }
                var f = this.form.addField({ id: id, type: ui.FieldType.SELECT, label: label, container: container, source: options.source });
                if (options.selected) { f.defaultValue = options.selected };
                return new o_Field(f);
            }

            this.addHtml = function (id, html, container) {
                return this.addField('html', id, ui.FieldType.INLINEHTML, html, container);
            }

            this.addHtmlWrap = function (id, html, container) {
                html = '<div style="font-size: 18px; margin-top: 7px; padding: 7px; width: 100%; border: 1px solid rgb(26,26,26);">' + html + '</div>';
                return this.addHtml(id, html, container);
            }

            this.addHtmlErr = function (id, html, container) {
                html = '<div style="font-size: 18px; margin-top: 7px; padding: 7px; width: 100%; border: 1px solid maroon; color: red;">' + html + '</div>';
                return this.addHtml(id, html, container);
            }

            this.getField = function (fieldId) {
                var nsField = this.f.getField({ id: fieldId });
                if (!nsField) { return null; }
                return new o_Field(nsField);
            }

            this.getSublistField = function (sublistId, fieldId) {
                var sublist = this.form.getSublist({ id: sublistId });
                if (!sublist) { return null; }
                var nsField = sublist.getField({ id: fieldId });
                if (!nsField) { return null; }
                return new o_Field(nsField);
            }

            this.addSublistField = function (sublistId, fieldId, label, type, source, container) {
                var sublist = this.form.getSublist({ id: sublistId });
                if (!sublist) { return null; }
                var nsField = sublist.addField({
                    id: fieldId,
                    label: label,
                    type: type,
                    source: source,
                    container: container,
                });
                if (!nsField) { return null; }
                return new o_Field(nsField);
            }




            this.setFieldDisabled = function (fieldName) {
                var f = this.getField(fieldName);
                if (f) { f.disable(); }
                return f;
            }

            this.setFieldHidden = function (fieldName) {
                var f = this.getField(fieldName);
                if (f) { f.hide(); }
                return f;
            }

            this.setFieldInline = function (fieldName) {
                var f = this.getField(fieldName);
                if (f) { f.setInline(); }
                return f;
            }

            this.setFieldEditable = function (fieldName) {
                var f = this.getField(fieldName);
                if (f) { f.editable(); }
                return f;
            }



            this.redirect = function (record, edit, params) {
                redirect.toRecord({
                    type: record.type,
                    id: record.id,
                    isEditMode: (edit === true) ? true : false,
                    parameters: params
                });
            }


        }


        return {
            get: function (form, addSubmitButton) {
                return new o_Form(form, addSubmitButton);
            },
            new: function (title, addSubmitButton) {
                var form = new o_Form(ui.createForm({ title: title || 'OSSM Form' }), addSubmitButton);
                return form;
            }
        };

    });
