/**
 * @NApiVersion 2.0
 * @Version 1 [20232.01.11]
 */
define(['.././core.js'],
    function (core) {

        return {
            input: function (options) {
                return new InputControl(options);
            },

            message: function (options) {
                return new MessageControl(options);
            },

            html: function (html) {
                return new HTMLControl(html);
            },

            text: function (id, label, value) {
                return new InputControl({
                    id: id,
                    type: 'text',
                    label: label,
                    value: value,
                });
            },

            number: function (id, label, value) {
                return new InputControl({
                    id: id,
                    type: 'number',
                    label: label,
                    value: value,
                });
            },

            button: function (id, value, clickFunc) {
                return new InputControl({
                    id: id,
                    type: 'button',
                    value: value,
                    clickFunc: clickFunc
                });
            },

            container: function (id) {
                return new Container({
                    id: id
                });
            },

            table: function (options) {
                return new Table(options);
            }
        };

        function Container(options) {
            validateBasicOptions(options);

            this.op = options;
            this.controls = new Array();

            this.add = function (input) {
                this.controls.push(input);
            }

            this.addLineBreak = function () {
                this.controls.push(new LineBreak());
            }

            this.toHtml = function () {
                this.html = css();
                //this.html += '<form id="' + ((this.op.formId) ? this.op.formId :'ossm_form') + '"><div class="ossm_inputContainer">';
                this.html += '<div class="ossm_inputContainer">';

                for (var cx = 0; cx < this.controls.length; cx++) {
                    this.html += this.controls[cx].toHtml();
                }

                //this.html += '</div></form>';
                this.html += '</div>';
                return this.html;
            }

            this.attachListeners = function () {
                core.log('attach listeners...');
                for (var cx = 0; cx < this.controls.length; cx++) {
                    if (this.controls[cx].op.collection) {
                        this.controls[cx].attachListeners();
                    } else if (this.controls[cx].op.clickFunc) {
                        var func = this.controls[cx].op.clickFunc;
                        var ctrlId = this.controls[cx].op.id;
                        jQuery('#' + ctrlId).click(function () {
                            func(jQuery('#' + ctrlId));
                        });
                    }
                }
            }

            this.get = function (id) {
                for (var cx = 0; cx < this.controls.length; cx++) {
                    if (this.controls[cx].op.id == id) { return this.controls[cx]; }
                }
            }

            this.getValue = function (id, defaultValue) {
                var ctrl = this.get(id);
                if (ctrl) { return ctrl.value(); }
                if (defaultValue === undefined) { core.throwError('no control found with id: ' + id); }
                return defaultValue;
            }
        }



        function InputControl(options) {
            validateBasicOptions(options);
            this.op = options;
            if (!this.op.type) { this.op.type = 'text'; }
            if (!this.op.value) { this.op.value = ''; }
            if (!this.op.textHint) { this.op.textHint = ''; }

            this.toHtml = function (includeCss) {
                var widthStyle = (this.op.width) ? 'style="width:' + this.op.width + '"' : '';
                this.html = (includeCss) ? css() : '';
                this.html += '<div class="ossm_inputWrapper" ' + widthStyle + '>';
                if (this.op.label && this.op.type != 'checkbox') {
                    this.html += '<span class="ossm_inputLabel">' + this.op.label + ': </span><br />';
                }
                if (this.op.type == 'select') {
                    this.html += '<select class="ossm_input" id="' + this.op.id + '" >';
                    if (Array.isArray(this.op.selectOptions)) {
                        for (var i = 0; i < this.op.selectOptions.length; i++) {
                            this.html += '<option value="' + this.op.selectOptions[i].value + '" ' + ((this.op.selectOptions[i].selected) ? 'selected' : '') + '>' + ((this.op.selectOptions[i].label) ? this.op.selectOptions[i].label : this.op.selectOptions[i].text) + '</option>'
                        }
                    }
                    this.html += '</select>'
                } else if (this.op.type == 'checkbox') {
                    this.html += '<input class="ossm_input" style="width: auto" id="' + this.op.id + '" type="' + this.op.type + '" >' + this.op.label;
                } else {
                    this.html += '<input class="ossm_input" id="' + this.op.id + '" type="' + this.op.type + '" value="' + this.op.value + '" placeholder="' + this.op.textHint + '" >';
                }
                this.html += '</div>';

                return this.html;
            }

            this.value = function () {
                if (this.op.type == 'checkbox') {
                    return jQuery('#' + this.op.id).is(":checked");
                } else {
                    return jQuery('#' + this.op.id).val();
                }
            }
        }

        function MessageControl(options) {
            this.op = options;
            if (!this.op.value) { this.op.value = ''; }

            this.toHtml = function (includeCss) {
                var widthStyle = (this.op.width) ? 'style="width:' + this.op.width + '"' : 'style="width:100%"';
                this.html = (includeCss) ? css() : '';
                this.html += '<div class="ossm_inputWrapper" ' + widthStyle + '>';
                this.html += '<span class="ossm_messageText">' + this.op.value + '</span>';
                this.html += '</div>';
                return this.html;
            }
        }

        function HTMLControl(html) {
            this.op = { value: html };

            this.toHtml = function () {
                return this.op.value;
            }
        }


        function LineBreak() {
            this.op = {};
            this.toHtml = function () {
                return '<div style="height: 11px"></div>';
            }
        }

        function Table(options) {
            this.op = options;
            this.collection = options.collection;
            this.selected = null;
            if (!this.op.id) { this.op.id = 'ossm_tbl' }

            this.toHtml = function () {
                var html = '<span><b>NO COLLECTION</b></span>';
                if (options.collection && options.collection.length > 0) {
                    var html = '<table id="' + this.op.id + '">';
                    html += '<tr>';
                    for (var key in options.collection[0]) {
                        html += '<td class="ossm_td"';
                        if (!isNaN(parseFloat(options.collection[0][key]))) { html += ' style="text-align: right;"'; }
                        html += '><b>'
                        if (key != 'id') { html += key; }
                        html += '</b></td>';
                    }
                    html += '</tr>';

                    for (var cx = 0; cx < options.collection.length; cx++) {
                        var collItem = options.collection[cx];
                        html += '<tr>';
                        html += '<td><input type="radio" id="ossm_tbl_row_select_' + collItem.id + '"></td>';
                        for (var key in collItem) {
                            if (key == 'id') { continue; }
                            html += '<td class="ossm_td"';
                            if (!isNaN(parseFloat(collItem[key]))) { html += ' style="text-align: right;"'; }
                            html += '>' + collItem[key] + '</td>';
                        }
                        html += '</tr>';
                    }

                    html += '</table>';
                }
                return html;
            }

            this.attachListeners = function () {
                jQuery('input[type=radio]').click(function (t) {
                    jQuery('input[type=radio]').prop("checked", false);
                    jQuery('#' + t.target.id).prop("checked", true);
                    this.selected = t.target.id.replace('ossm_tbl_row_select_', '');
                    options.clickFunc(this.selected);
                });
            }

            this.selected = function () {
                var t = jQuery('input[type=radio]:checked');
                if (t.length == 0) {
                    return null;
                }
                return t[0].id.replace('ossm_tbl_row_select_', '');
            }



        }

        function validateBasicOptions(options) {
            if (!core.isObj(options)) { core.throwError('parameter options is not an object', 'html.controls.InputControl::constr'); }
            if (!options.id) { core.throwError('parameter options.id is missing', 'html.controls.InputControl::constr'); }
        }


        function css() {
            return '<style> \
    	div.ossm_inputContainer { \
        } \
    	div.ossm_inputWrapper { \
	    	display: inline-block; \
			margin-right: 7px; \
    	} \
    	.ossm_input { \
    		width: 100%; \
    		padding: 3px; \
			border: 1px solid rgba(0,0,0,0) !important; \
			border-left: 1px solid rgba(125,125,125,0.35) !important; \
			color: darkblue; \
			transition: all 0.3s; \
		} \
		input.ossm_input:hover { \
			border: 1px solid rgba(125,125,125,0.35) !important; \
			background-color: rgba(0, 173, 238,0.05); \
		} \
		input.ossm_input:focus { \
			background-color: rgba(0, 173, 238,0.1); \
		} \
	    input[type=\'button\'].ossm_input { \
	    	padding: 3px 17px 3px 17px; \
			margin-top: 3px; \
    		margin-right: 7px; \
			cursor: pointer; \
			border-radius: 3px; \
			background-color: #125AB2; \
			color: white; \
			transition: all 0.3s; \
    	} \
    	input[type=\'button\'].ossm_input:hover { \
	    	background-color: #0D3B72; \
			color: white; \
		} \
		input[type=\'text\'].ossm_input { \
    		border: 1px solid rgba(0,0,0,0) !important; \
    		/* border-top: 1px solid rgba(125,125,125,0.35) !important; */ \
    		border-left: 1px solid rgba(125,125,125,0.35) !important; \
    		color: darkblue; \
    		transition: all 0.3s; \
    	} \
    	input[type=\'text\'].ossm_input:hover { \
    		border: 1px solid rgba(125,125,125,0.35) !important; \
    		background-color: rgba(0, 173, 238,0.05); \
    	} \
    	input[type=\'text\'].ossm_input:focus { \
			background-color: rgba(0, 173, 238,0.1); \
		} \
    	.ossm_inputLabel { \
	        font-size: 11px; \
	        font-weight: bold; \
	        font-style: italic; \
        	color: rgba(125,125,125,0.75); \
    		border-left: 1px solid rgba(125,125,125,0.35) !important; \
    		padding-left: 3px; \
    	} \
    	.ossm_messageText { \
    		display: block; \
    		padding: 5px; \
    		border: 1px solid rgb(210, 210, 210); \
		} \
		td.ossm_td { \
			padding: 3px 17px 3px 3px; \
		} \
    	</style>';
        }


    });
