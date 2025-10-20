/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(['N/ui/serverWidget', './O/ui/form.js', './O/core.js'],
    function (ui, oui, core) {
        function onRequest(context) {
            var form = oui.get(ui.createForm({ title: 'OSSM Control Page' }), true);
            try {
                if (!core.ossm()) { throw new Error('No permission to use this page!'); }
                form.f.clientScriptModulePath = './o071_controls_cs.js';
                if (context.request.method === 'GET') {
                    form.addButton('Test', 'testFunction');
                    context.response.writePage(form.f);
                } else {
                    throw new Error('no post allowed at this time');
                }
            } catch (e) {
                form.addHtmlErr('err', e.message)
                context.response.writePage(form.f);
            }
        }

        return {
            onRequest: onRequest
        }
    });
