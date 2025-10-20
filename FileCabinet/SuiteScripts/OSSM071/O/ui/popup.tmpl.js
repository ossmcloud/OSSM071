/**
 * @NApiVersion 2.0
 * @Version 1 [20232.01.11]
 */
define([],

    function () {

        return {
            css: 'position: absolute; \
    		opacity: 0; \
    		bottom: 0px; \
    	    z-index: 99999; \
    	    right: 0px; \
    	    padding: 17px; \
    	    max-width: 50%; \
    	    width: 0; \
    	    height: 0px; \
    	    box-shadow: -4px -4px 8px 0 rgba(0, 0, 0, 0.35); \
    	    border: 1px solid rgb(125,125,125); \
    		color: white; \
    		background-color: rgba(0, 173, 238, 0.85); \
    		overflow: auto; \
    		',

            js: 'function osdk_showPopup() { \
    			jQuery( "#osdk_discountSummary" ).animate({ opacity: 1, width: "[$WIDTH$]", height: "[$HEIGHT$]"}, 750); \
    		 } \
    		 function osdk_closePopup() { \
    			jQuery( "#osdk_discountSummary" ).animate({ opacity: 0.25, width: "0", height: "toggle" }, 1000, function() { \
    				jQuery( "#osdk_discountSummary" ).remove(); \
    			}); \
    		 } \
    		 function osdk_resetTimer() { \
    			window.clearTimeout(_osdk_popouid); \
    			_osdk_popouid =  window.setTimeout(osdk_closePopup, [$TIMEOUT$]); \
    		 } \
    		 osdk_showPopup(); \
    		',

            title: '<div style="width: 100%; font-weight: bold; font-size: 20px; padding-left: 0px;border-bottom:1px solid white;margin-bottom:17px;">[$TITLE$]<a style="float: right;font-size: 15px;font-weight: normal;text-decoration: none;" href="#" onclick="osdk_closePopup()">close</a></div>',

            popup: '<div id="osdk_discountSummary" [$JSONMOUSEOVER$] style="[$CSS$]"><script>[$JS$]</script>[$CONTENT$]</div>',

        };

    });
