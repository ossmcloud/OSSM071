/**
 * @NApiVersion 2.0
 * @Version 1 [20232.01.11]
 */
define([],

    function () {

        return {
            css: '<style> \
    	    .ossm_modal { \
    		    display: block; \
    		    position: fixed; \
    		    z-index: 9999; \
    		    padding-top: 125px; \
    		    left: 0; \
    		    top: 0; \
    		    width: 100%; \
    		    height: 100%; \
    		    overflow: auto; \
    		    background-color: rgb(0,0,0); \
    		    background-color: rgba(0,0,0,0.4); \
    		} \
    		.ossm_modal-content { \
    		    background-color: #fefefe; \
    			box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.35), 0 6px 20px 0 rgba(0, 0, 0, 0.30); \
    		    margin: auto; \
    		    padding: 20px; \
    		    border: 1px solid #888; \
    		    border-radius: 7px; \
    			min-width: [$ModalMinWidth$]; \
    			max-width: [$ModalMaxWidth$]; \
    			width: 75%; \
    		} \
    		.ossm_close { \
    		    color: #125AB2; \
    		    float: right; \
    		    font-size: 20px; \
    		    font-weight: bold; \
    		    margin-right: 0px; \
    			padding: 7px; \
    			border-radius: 5px; \
    			transition: all 0.3s; \
    		} \
    		.ossm_close:hover, \
    		.ossm_close:focus { \
    			background-color: #0D3B72; \
    			color: white; \
    		    text-decoration: none; \
    		    cursor: pointer; \
    		} \
    		.ossm_title { \
    			color: [$TitleColor$]; \
    		    font-size: 18px; \
    		    font-weight: bold; \
    		    margin-left: 0px; \
    			border-bottom: 1px solid; \
    			padding: 7px; \
    			padding-left: 0px; \
    		} \
    		span.ossm_label { \
    			padding-top: 10px; \
    			display: block; \
    			color: #6E6E6E; \
    		} \
    		div.ossm_dialogButtonPanel { \
    			width: 100%; \
    		 	padding: 7px; \
    			border: 1px solid rgb(125,125,125); \
    			text-align: right; \
    		} \
    		input.ossm_button { \
    			padding: 7px 27px 7px 27px; \
    			margin-right: 7px; \
    			cursor: pointer; \
    			border-radius: 7px; \
    			background-color: #125AB2; \
    			color: white; \
    			transition: all 0.3s; \
    		} \
    		input.ossm_button:hover { \
    			background-color: #0D3B72; \
    			color: white; \
    		} \
    		div.ossm_message { \
    			padding-top: 17px; \
    			padding-bottom: 17px; \
    		} \
    		span.ossm_option_label { \
    			cursor: pointer; \
    		} \
    	</style>',

            modal: '<div  id="ossm_modalForm">[$css$]<div class="ossm_modal"> \
    		[$FormTag$] \
    		<div id="ossm_modalFormContent" class="ossm_modal-content"> \
    			<span class="ossm_title">[$Title$]</span> \
    			<span id="ossm_modal_btn_close" class="ossm_close" style="visibility: [$CloseFunctionDisplay$];" >X</span> \
    			<div class="ossm_message">[$Message$]</div> \
    			<input id="ossm_modal_btn_ok" type="[$OkButtonType$]" value="[$OkFunctionText$]" class="ossm_button"  /> \
    			<input id="ossm_modal_btn_cancel" type="button" value="[$CancelFunctionText$]" class="ossm_button" style="visibility: [$CancelFunctionDisplay$];" /> \
    		</div> \
    		[$FormTagClosed$] \
    	</div></div>',

            modalWait: '<div id="ossm_modalForm" class="ossm_modal"> \
			<div id="ossm_modalFormContent" class="ossm_modal-content"> \
				<span class="ossm_title">[$Title$]</span> \
				<div class="ossm_message">[$Message$]</div> \
			</div> \
        </div>',

        };

    });
