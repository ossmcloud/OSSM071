/**
 * @NApiVersion 2.0
 * @Version 1 [20232.01.11]
 */
define(['N/search', '.././core.js', '.././core.err.js'],
    function (src, core, err) {

        function o_Search(recType) {
            if (core.isEmpty(recType)) { err.throwNullArg('record type'); }
            this.type = recType;
            this.columns = new Array();
            this.filters = new Array();

            this.getColumn = function (name, join) {
                for (var cx = 0; cx < this.columns.length; cx++) {
                    if (this.columns[cx].name == name) {
                        if (!join) { return this.columns[cx]; }
                        if (this.columns[cx].join == join) { return this.columns[cx]; }
                    }
                }
                return null;
            }

            this.addColumn = function (column) {
                if (Array.isArray(column)) {
                    var cols = new Array();
                    var t = this;
                    core.each(column, function (c) {
                        cols.push(_addColumn(t, c));
                    });
                    return cols;
                } else {
                    return _addColumn(this, column);
                }
            }

            // @REGRESSION:: use form OSSM027 
            function _addColumn(obj, column) {
                var col = { name: '' };
                if (!core.isObj(column)) {
                    col.name = column;
                } else {
                    col.name = column.name;
                    if (column.sort) { col.sort = column.sort; }
                    if (column.summary) { col.summary = column.summary; }
                    if (column.join) { col.join = column.join; }
                    if (column.formula) { col.join = column.formula; }
                }
                var newCol = src.createColumn(col);
                obj.columns.push(newCol);
                return newCol;
            }

            this.addFilter = function (field, value, operator) {
                if (Array.isArray(field)) {
                    var t = this;
                    var filters = new Array();
                    core.each(field, function (i) {
                        filters.push(_addFilter(t, i));
                    });
                    return filters;
                } else {
                    return _addFilter(this, field, value, operator);
                }
            }

            // @REGRESSION:: use form OSSM027 
            function _addFilter(obj, field, value, operator) {
                var fil = { name: '' };
                if (!core.isObj(field)) {
                    fil.name = field;
                    fil.operator = operator || 'is';
                    fil.values = value;
                    var col = core.findInArray(obj.columns, 'name', field);
                    if (col) {
                        fil.join = col.join;
                        fil.summary = col.summary;
                    }
                } else {
                    fil.name = field.name;
                    fil.operator = field.operator;
                    fil.values = field.value || field.values;
                    fil.join = field.join;
                    fil.summary = field.summary;
                    fil.formula = field.formula;
                    if (!fil.operator) { fil.operator = 'is'; }
                }
                var newFilter = src.createFilter(fil);
                obj.filters.push(newFilter);
                return newFilter;
            }

            // @REGRESSION:: use form OSSM027 
            this.create = function () {
                return src.create({
                    type: this.type,
                    columns: this.columns,
                    filters: this.filters
                });
            }

            this.run = function () {
                return this.create().run();
            }

            this.first = function () {
                var first = null;
                this.each(function (res) {
                    first = res;
                    return false;
                })
                return first;
            }

            this.getResult = function (searchResult) {
                return new o_SerachRes(this, searchResult);
            }

            this.each = function (callback, _this) {
                var idx = 0;
                var t = this;
                this.run().each(function (res) {
                    if (callback(new o_SerachRes(t, res), idx++, _this) === false) { return false; }
                    return true;
                });
            }


            this.eachEx = function (callback, pageSize, _this, outerCounterMax) {
                var outerCounter = 0;
                if (isNaN(parseInt(pageSize))) { pageSize = 1000; }
                if (parseInt(pageSize) > 1000) { pageSize = 1000; }
                if (parseInt(pageSize) < 1) { pageSize = 1; }

                if (isNaN(parseInt(outerCounterMax))) { outerCounterMax = 1000000; }

                // we still want to put an outer limit to this
                while (outerCounter < outerCounterMax) {
                    // we get 1000 results (which is the max) per loop
                    var results = this.run().getRange({ start: outerCounter, end: (outerCounter + pageSize) });
                    // loop each result and callback
                    var exitLoop = false;
                    for (var x = 0; x < results.length; x++) {
                        outerCounter++;
                        if (callback(new o_SerachRes(this, results[x]), x, _this, outerCounter) === false) {
                            // if call returns false (bool) then exit for and make sure we exit while as well
                            exitLoop = true;
                            break;
                        }
                    }
                    if (results.length == 0 || exitLoop) {
                        // no more results, exit for and make sure we exit while as well
                        outerCounter = outerCounterMax;
                        //break;
                    } else {
                        // next 1000 results
                        //outerCounter += pageSize;
                    }
                }
            }

        }

        function o_SerachRes(srcObj, res) {
            this.r = res;
            this.id = res.id;

            this.get = function (column) {
                if (column) {
                    if (core.isObj(column)) {
                        return this.r.getValue(column);
                    } else {
                        var col = (isNaN(parseInt(column))) ? core.findInArray(srcObj.columns, 'name', column, true) : srcObj.columns[column];
                        return this.r.getValue(col);
                    }
                } else {
                    var resObj = { id: this.id };
                    core.each(srcObj.columns, function (c) {
                        resObj[c.name] = res.getValue(c);
                    });
                    return resObj;
                }
            }

            this.getText = function (column) {
                if (core.isObj(column)) {
                    return this.r.getText(column);
                } else {
                    var col = (isNaN(parseInt(column))) ? core.findInArray(srcObj.columns, 'name', column, true) : srcObj.columns[column];
                    return this.r.getText(col);
                }
            }
        }

        return {
            new: function (recType) {
                return new o_Search(recType);
            },
            run: function (recType, columns, filters) {
                var s = new o_Search(recType);
                s.addColumn(columns);
                s.addFilter(filters);
                return s.run();
            },
            load: function (srcId) {
                var nsScr = src.load({ id: srcId });
                var oSrc = new o_Search(nsScr.searchType);
                core.each(nsScr.columns, function (col, idx) {
                    oSrc.addColumn(col);
                });
                core.each(nsScr.filters, function (fil, idx) {
                    oSrc.addFilter(fil);
                });
                oSrc.s = nsScr;
                return oSrc;
            },

            getFolder: function (path) {
                return this.getNSFolder(path, -15);
            },
            getNSFolder: function (path, startAtParent) {
                if (!path) { err.throw('core.getFolder', 'path parameter cannot be empty'); }
                if (path[path.length - 1] == '/') { path = path.substr(0, path.length - 1); }

                var parent = startAtParent;
                var paths = path.split('/');
                for (var px = 0; px < paths.length; px++) {
                    var folder = this.new('folder');
                    if (parent) {
                        folder.addFilter('parent', parent);
                    } else {
                        folder.addFilter('parent', '@NONE@', 'anyof');
                    }
                    folder.addFilter('name', paths[px]);
                    if (!folder.first()) { err.throw('core.getFolder', 'Folder [' + path + '] does not exist.') };
                    parent = folder.first().id;
                }
                return parent;
            }

        }

    });
