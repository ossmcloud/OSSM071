/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(['./O/core.js', './O/data/rec.search.js', './O/data/rec.utils.js'],
    function (core, src, recu) {

        function pageInit(context) {
            console.log('debug -------------> ')
        }

        return {
            pageInit: pageInit,
            testFunction: function () {
                try {
                    throw new Error('no test at this time');
                } catch (error) {
                    console.log(error);
                    alert(error.message);
                }
            }
        }
    });
