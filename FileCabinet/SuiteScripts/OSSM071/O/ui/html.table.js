/**
 * @NApiVersion 2.0
 * @Version 1 [20232.01.11]
 */
define(['.././core.js', '.././core.date.js'],
    function (core, cored) {

        return {
            get: function (options) {
                return new Table(options);
            }
        };

        function Table(options) {
            if (core.isEmpty(options)) { options = {}; }
            this.columns = options.columns || new Array();
            this.rows = options.rows || new Array();

            this.addCol = function (options, type, align) {
                if (!core.isObject(options)) {
                    options = {
                        title: options,
                        type: type,
                        align: align
                    };
                }
                this.columns.push(new Column(options));
            };

            this.addRow = function (values) {
                this.rows.push(new Row(this.columns, values));
            }

            this.toHtml = function () {
                this.html = css();
                this.html += '<table class="ossm_table">';

                this.html += '<thead><tr>';
                for (var c = 0; c < this.columns.length; c++) {
                    this.html += '<th style="text-align: ' + this.columns[c].align + '">' + this.columns[c].title + '</th>';
                }
                this.html += '</tr></thead>';


                this.html += '<tbody>';
                for (var r = 0; r < this.rows.length; r++) {
                    this.html += '<tr>';
                    for (var c = 0; c < this.columns.length; c++) {
                        this.html += '<td style="text-align: ' + this.columns[c].align + '">';
                        var formattedValue = this.rows[r].cells[c];
                        if (this.columns[c].type == 'date' || this.columns[c].type == 'datetime') {
                            formattedValue = cored.format({ date: formattedValue, addTime: this.columns[c].type == 'datetime' });
                        } else if (this.columns[c].type == 'float') {
                            formattedValue = parseFloat(formattedValue).toFixed(2);
                        } else if (this.columns[c].type == 'money') {
                            formattedValue = parseFloat(formattedValue).formatMoney();
                        } else if (this.columns[c].type == 'int') {
                            formattedValue = parseFloat(formattedValue).toFixed(0);
                        } else if (this.columns[c].type == 'bool') {
                            formattedValue = (formattedValue) ? 'yes' : 'no';
                        }
                        this.html += formattedValue;
                        this.html += '</td>';
                    }
                    this.html += '</tr>';
                }
                this.html += '</tbody>';

                this.html += '</table>';
                return this.html;
            };



        }


        function Column(options) {
            this.title = options.title;
            this.name = options.name || this.title.replaceAll(' ', '_');
            this.type = options.type || 'string';
            if (options.align) {
                this.align = options.align;
            } else {
                if (this.type == 'float' || this.type == 'int' || this.type == 'money') {
                    this.align = 'right';
                } else if (this.type == 'date' || this.type == 'datetime' || this.type == 'bool') {
                    this.align = 'center';
                } else {
                    this.align = 'left';
                }
            }
        }

        function Row(columns, values) {
            this.cells = new Array();

            var isArray = Array.isArray(values);
            for (var c = 0; c < columns.length; c++) {
                var cellValue = (isArray) ? values[c] : values[columns[c].name];
                this.cells.push(cellValue);
            }

        }






        function css() {
            return '<style> \
	    .ossm_table { \
    		width: 100% \
    	} \
    	.ossm_table > thead > tr > th { \
    		padding: 7px; \
    		background-color: #125AB2; \
    		font-weight: bold; \
    		color: white; \
    	} \
    	.ossm_table > tbody > tr:hover { \
    		background-color: rgba(18, 90, 178, 0.15); \
    	} \
    	</style>';
        }


    });
