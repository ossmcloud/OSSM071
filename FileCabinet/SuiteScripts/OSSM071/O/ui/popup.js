/**
 * @NApiVersion 2.0
 * @Version 1 [20232.01.11]
 */
define(['.././core.js', './popup.tmpl.js'],
    function (core, tmpl) {
        return {
            showPopup: function (options) {
                if (jQuery("#osdk_discountSummary").length > 0) {
                    jQuery("#osdk_discountSummary").remove();
                    //return;
                }

                var js = tmpl.js;
                var jsOnMouseOver = ' onmouseover="osdk_resetTimer()" ';
                if (options.timeout) {
                    js = js.replaceAll('[$TIMEOUT$]', options.timeout);
                    js += 'var _osdk_popouid =  window.setTimeout(osdk_closePopup, ' + options.timeout + ');';
                } else {
                    js = js.replaceAll('[$TIMEOUT$]', '0');
                    jsOnMouseOver = '';
                }

                if (!options.width) { options.width = '50%'; }
                if (!options.height) { options.height = '200px'; }
                js = js.replace('[$WIDTH$]', options.width);
                js = js.replace('[$HEIGHT$]', options.height);

                var content = (options.title) ? tmpl.title.replace('[$TITLE$]', options.title) : '';
                content += (options.content) ? options.content : '';

                var popupHtml = tmpl.popup.replace('[$JSONMOUSEOVER$]', jsOnMouseOver);
                popupHtml = popupHtml.replace('[$CSS$]', tmpl.css);
                popupHtml = popupHtml.replace('[$JS$]', js);
                popupHtml = popupHtml.replace('[$CONTENT$]', content);


                jQuery('body').append(popupHtml);
            }

        }


    });