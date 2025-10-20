/**
 * @NApiVersion 2.0
 * @Version 1 [20232.01.11]
 */
define(['./core.js'],
    function (core) {

        function splitValues(line, delimiter) {
            //The CSV file line is like:   "StringField","StringField with a comma, maybe",1234,"",0
            //      if i just use the .Split(",") function i will catch commas within quotes which is not correct
            //      the best thing to do is to loop through each char in the string and trigger a Boolean value to know whether quotes have been opened
            //      any comma found within quotes opened will be replaced by a space
            //      then i will be successfully able to use .Split(",")
            if (!delimiter) { delimiter = ','; }
            var quoteOpen = false; var commaAsDelimiterFound = true; var formattedLine = '';
            // loop line chars
            for (var i = 0; i <= line.length - 1; i++) {
                var currentChar = line[i];
                // check for quotes
                if (line[i] == '"') {
                    if (!quoteOpen) {
                        // this is an opening quote, from now on 'delimiter chars' wil NOT be considered as delimiters
                        quoteOpen = true;
                        commaAsDelimiterFound = false;
                    } else {
                        // this means the quote is a closing quote
                        if (i < (line.length - 1)) {
                            // check the next char.. and the following one for a delimiter
                            if (line.substring(i + 1, i + 2) == delimiter) {
                                commaAsDelimiterFound = true;
                            } else if (line.substring(i + 1, i + 2) == " ") {
                                if (line.substring(i + 2, i + 3) == delimiter) { commaAsDelimiterFound = true; }
                            }
                        }
                        // check
                        if (commaAsDelimiterFound) {
                            // if a delimiter is found then this is an actual closing quote
                            quoteOpen = false;
                        }
                        else {
                            //it appears that the quote are closing before a comma is found to separate the field
                            //it means this quote is not a closing quote so we keep the flag on                            
                            quoteOpen = true;
                        }
                    }
                }
                // check for delimiter
                if (line[i] == delimiter) {
                    if (quoteOpen) {
                        // this delimiter is inside quotes so we replace it with a place holder
                        currentChar = '$[#comma#]$';
                    }
                    else {
                        // next field
                        commaAsDelimiterFound = true;
                    }
                }
                // add current char to fomratted line
                formattedLine += currentChar;
            }
            // now remove all quotes from the line
            formattedLine = formattedLine.replaceAll('"', ' ');
            // split it with delimiter
            var values = formattedLine.split(delimiter);
            for (var i = 0; i < values.length; i++) {
                // put back actual delimiter in field and trim
                values[i] = values[i].replaceAll('"', ' ').replaceAll("$[#comma#]$", delimiter).trim();
            }
            // that's it
            return values;
        }


        function CSVFile(options) {
            // validate & sanitize argument
            if (!options) { throw new Error('no argument passed!'); }
            if (typeof options == 'string') { options = { content: options } }
            if (core.isObj(options)) {
                if (!options.content) { throw new Error('invalid argument, file content must be provided!'); }
                if (!options.delimiter) { options.delimiter = ','; }
                if (!options.newLineDelimiter) { options.newLineDelimiter = '\n'; }
            } else {
                throw new Error('invalid argument, must be a string or an object');
            }
            // set object properties
            this.o = options;
            this.rawHeader = new Array();
            this.rawLines = options.content.split(options.newLineDelimiter);
            this.header = new Array();
            this.lines = new Array();
            this.errors = new Array();
            // split lines 
            for (var l = 0; l < this.rawLines.length; l++) {
                if (!this.rawLines[l]) { continue; }
                //var lineValues = splitValues(this.rawLines[l], this.o.delimiter);
                //this.lines.push(lineValues);
                this.lines.push({ values: splitValues(this.rawLines[l], this.o.delimiter) });
                if (this.o.columnCount && this.o.columnCount != lineValues.length) {
                    this.errors.push('line ' + ((this.o.hasHeader) ? l : (l + 1)) + ' has the wrong number of columns: ' + lineValues.length + ' instead of: ' + this.o.columnCount);
                }
            }
            // move header to own property of required
            if (this.o.hasHeader) {
                this.rawHeader = this.rawLines.shift();
                this.header = this.lines.shift();
            }

            //
            this.hasErrors = function () {
                return this.errors.length > 0;
            }
            //
            this.validate = function () {
                if (this.hasErrors()) {
                    var e = new Error(this.errors.length + ' lines has broken validation rules, check the "error" property of the "CSVFile" object or of this error object');
                    e.errors = this.errors;
                    throw e;
                }
            }

            this.getValue = function (colNoOrName, rowNo, throwError) {
                // validate column no or name
                var col = parseInt(colNoOrName);
                if (typeof colNoOrName == 'string') {
                    // we can only do this if we have an header in the file
                    if (!this.o.hasHeader) {
                        if (throwError) { throw new Error('Column: [' + colNoOrName + '] cannot be found as file has no header'); }
                        return undefined;
                    }
                    // find it in header
                    if (this.header.indexOf(colNoOrName) < 0) {
                        if (throwError) { throw new Error('Column: [' + colNoOrName + '] cannot be found'); }
                        return undefined;
                    }
                    col = this.header.indexOf(colNoOrName);
                } else {
                    // validate column value
                    if (isNaN(col)) {
                        if (throwError) { throw new Error('Column: [' + colNoOrName + '] is invalid'); }
                        return undefined;
                    }
                    // col -= 1;
                }

                // validate row number
                var row = parseInt(rowNo);
                if (isNaN(row)) {
                    if (throwError) { throw new Error('Row No: ' + rowNo + ' is invalid'); }
                    return undefined;
                }
                // row -= 1;
                if (row >= this.lines.length || row < 0) {
                    if (throwError) { throw new Error('Row No: ' + rowNo + ' is outside the lines count: ' + this.line.length); }
                    return undefined;
                }
                // validate column no against row
                if (col >= this.lines[row].length || col < 0) {
                    if (throwError) { throw new Error('Col No: ' + colNoOrName + ' is outside the columns count: ' + this.lines[row].length); }
                    return undefined;
                }
                // return value
                return this.lines[row][col];
            }

            this.each = function (callBack) {
                var t = this;
                core.loop(this.lines.length, function (idx) {
                    var newLine = true;
                    core.loop(t.lines[idx].values.length, function (iidx) {
                        var res = callBack({
                            lineNo: idx,
                            colNo: iidx,
                            value: t.lines[idx].values[iidx],
                            newLine: newLine,
                        });
                        newLine = false;
                        return res;
                    });
                    return true;
                });
            };
        }


        return {
            get: function (csvContent) {
                return new CSVFile(csvContent);
            }
        }


    });