/**
 *
 * 
 * Module Description
 * 
 * Version    Date					Author           				Remarks
 * 1.0      22/10/2025			Samir Bastia
 *  
 *Functionality: It will check for the status change of the transaction and check the checkbox
 * 
 */
/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record','N/runtime','N/ui/message','N/search'],
    /**
     * @param {record} record
     * @param {runtime} runtime
     */
    function(record,runtime,message,search) {

       
        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type
         * @param {Form} scriptContext.form - Current form
         * @Since 2015.2
         */
        function beforeLoad(scriptContext) {
          
        }
    
        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
      
        function beforeSubmit(scriptContext) {
          
        }
    
        function afterSubmit(scriptContext) {
            log.debug('Script Context Type', scriptContext.type);
            if ((scriptContext.type == scriptContext.UserEventType.CREATE) || (scriptContext.type == scriptContext.UserEventType.COPY)){
            try {
                var newRec = scriptContext.newRecord;
                var recId = newRec.id;
                var recType = newRec.type;
                //newRec is not giving any value for status field so using search.lookupFields
                var InvLookup = search.lookupFields({
                    type: recType,
                    id: recId,
                    columns: ['status']
                });
                log.debug('InvLookup',InvLookup);
               // var oldRec = scriptContext.oldRecord;
               // var oldStatus = oldRec.getValue({fieldId: 'status'});
                var newStatus = InvLookup.status[0].value;
                log.debug('Status Values',newStatus);
                if (newStatus == "open")
                {
                    var recLoad = record.submitFields({
                        type: recType,
                        id: recId,  
                        values: {
                            custbody_o071_send_email: true
                        },
                        options: {enableSourcing: false, ignoreMandatoryFields : true}
                    });
                    log.debug('Record Updated', 'Record Updated Successfully with Status Change Checkbox Checked');
                }
                return true;
            }
            catch (e)
                {
                    log.error("Error checking the checkbox", e.message);
                
                }
            }

        }
      
        return {
         // beforeLoad: beforeLoad,
          //beforeSubmit: beforeSubmit,
           afterSubmit: afterSubmit
        };
        
    });
    