/** 
 * Module Description
 * 
 * Version    Date					Author           				Remarks
 * 1.00       22/10/2025			Samir Bastia
 *
 *Functionality: It will send emails to vendors with the attached PDF and CSV files
 * 
 */

/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/email', 'N/error', 'N/record', 'N/search', 'N/runtime', 'N/query', 'N/file', 'N/render', 'N/runtime', 'N/task'],

    function (email, error, record, search, runtime, query, file, render, runtime, task) {

        /**
         * Definition of the Scheduled script trigger point.
         *
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
         * @Since 2015.2
         */
        function execute(scriptContext) {
            try {
                var authorID = 117741;//117140 Samir Bastia
                var scriptObj = runtime.getCurrentScript();
                var lastRanID = scriptObj.getParameter({ name: 'custscript_ossm_lastranid' });
                var emailBodyOriginal = scriptObj.getParameter({ name: 'custscript_o071_email_body' });
                var emailBodyDanish = scriptObj.getParameter({ name: 'custscript_o071_email_body_danish' });

                if (!lastRanID) {
                    lastRanID = 1;
                }
                log.debug("Last Ran ID", lastRanID);
                var errorMessage = '';

                //search for transactions where custbody_o071_send_email is false
                var transactionSearchObj = search.create({
                    type: "transaction",
                    settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }],
                    filters:
                        [
                            ["mainline", "is", "T"],
                            "AND",
                            ["custbody_o071_send_email", "is", "T"],
                            "AND",
                            ["internalidnumber", "greaterthan", lastRanID],
                            "AND",
                            ["type", "anyof", "CustInvc"],
                            //   "AND", 
                            // ["externalid","noneof","@NONE@"]
                        ],
                    columns:
                        [
                            search.createColumn({ name: "externalid", label: "External ID" }),
                            search.createColumn({ name: "externalrefnumber", label: "External Ref. Number" }),
                            search.createColumn({ name: "internalid", label: "Internal ID", sort: search.Sort.ASC }),
                            search.createColumn({ name: "tranid", label: "Document Number" }),
                            search.createColumn({
                                name: "internalid",
                                join: "customer",
                                label: "Internal ID"
                            }),
                            search.createColumn({
                                name: "email"
                            }),
                            search.createColumn({
                                name: "altname",
                                join: "customer",
                                label: "Name"
                            }),
                            search.createColumn({
                                name: "language",
                                join: "customer",
                                label: "language"
                            })
                        ]
                });
                var searchResultCount = transactionSearchObj.runPaged().count;
                log.debug("transactionSearchObj result count", searchResultCount);
                var searchResults = transactionSearchObj.run().getRange({
                    start: 0,
                    end: 5
                });
                for (var i = 0; i < searchResults.length; i++) {
                    var result = searchResults[i];
                    var invoiceID = result.getValue({ name: 'internalid', sort: search.Sort.ASC });
                    var customerID = result.getValue({ name: 'internalid', join: 'customer' });
                    var externalid = result.getValue({ name: 'externalid' });
                    var customerEmail = result.getValue({ name: 'email' });
                    var customerName = result.getValue({ name: 'altname', join: 'customer' });
                    var preferredLanguage = result.getText({ name: 'language', join: 'customer' });
                    var documentNumber = result.getValue({ name: 'tranid' });
                    log.debug("Processing Invoice ID: " + invoiceID + " for Customer: " + customerName + " (" + customerEmail + ")");

                    if (!customerEmail) {
                        log.debug("No email found for customer " + customerName + " Skipping...");
                        errorMessage += "<tr><td>" + customerName + "</td><td>" + documentNumber + "</td><td>Email address not found</td></tr>"
                        continue;
                    }
                    var attachedExtraFile;
                    if (externalid) {
                        var fileSearchObj = search.create({
                            type: "file",
                            filters:
                                [
                                    ["folder", "anyof", "66831"],
                                    "AND",
                                    ["name", "startswith", externalid]
                                ],
                            columns:
                                [
                                    search.createColumn({ name: "name", label: "Name" }),
                                    search.createColumn({ name: "documentsize", label: "Size (KB)" }),
                                    search.createColumn({ name: "url", label: "URL" }),
                                    search.createColumn({ name: "filetype", label: "Type" }),
                                    search.createColumn({ name: "internalid", label: "Internal ID" })
                                ]
                        });
                        var fileSearchResults = fileSearchObj.run().getRange({
                            start: 0,
                            end: 1
                        });
                        if (fileSearchResults.length > 0) {
                            var fileResult = fileSearchResults[0];
                            var fileId = fileResult.getValue({ name: 'internalid' });
                            var fileType = fileResult.getValue({ name: 'filetype' });
                            log.debug("Found attached file ID: " + fileId + " of type: " + fileType);
                            attachedExtraFile = file.load({
                                id: fileId,
                                type: file.Type.XLSX
                            });
                        }
                    }
                    // Generate PDF

                    var isLocale = preferredLanguage == 'Danish' ? true : false;
                    var pdfContent = render.transaction({
                        entityId: parseInt(invoiceID),
                        printMode: render.PrintMode.PDF,
                        inCustLocale : isLocale
                    });
                    /*
                   // pdfFile.name = 'Invoice_' + documentNumber + '.pdf';
                    var pdfContent = file.create({
                        file: pdfFile,
                        name: 'Invoice_' + documentNumber + '.pdf',
                        folder: 66933, // Specify the folder ID where you want to save the PDF
                        fileType: file.Type.PDF,
                        isOnline: false
                    });
                    var pdfFileId = pdfContent.save();
                    
                   var renderer = render.create();
                    renderer.setTemplateById(202);
                    log.debug('renderer', renderer)

                    renderer.addRecord('record', record.load({
                        type: record.Type.INVOICE,
                        id: parseInt(invoiceID)
                    }));

                    var pdfContent = renderer.renderAsPdf();
                    */
                    // log.debug('pdfFile', pdfContent)
                    //send email to customer
                    var emailSubject = 'Your Invoice ' + documentNumber;

                    var emailBody = preferredLanguage == 'Danish' ? emailBodyDanish : emailBodyOriginal;
                    log.debug('emailBody',emailBody)
                    emailBody = emailBody.replace('{CustomerName}', customerName);
                    emailBody = emailBody.replace('{InvoiceNumber}', documentNumber);
                    email.send({
                        author: authorID,
                        recipients: customerEmail,
                        subject: emailSubject,
                        body: emailBody,
                        attachments: (attachedExtraFile) ? [pdfContent, attachedExtraFile] : [pdfContent],
                        relatedRecords: {
                            transactionId: parseInt(invoiceID)
                        }
                    });

                    log.debug("Processing Invoice ID: " + invoiceID + " for Customer: " + customerName + " (" + customerEmail + ")");
                    record.submitFields({
                        type: record.Type.INVOICE,
                        id: parseInt(invoiceID),
                        values: {
                            custbody_o071_send_email: false
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        }
                    });
                    log.debug("Invoice ID Updated " + invoiceID + " for Customer: " + customerName);
                    var resubmit = checkForResubmit(invoiceID);
                    if (resubmit) {
                        //changes will be lost better to send an email here
                        if (errorMessage) {
                            sendErrorEmail(authorID, errorMessage);
                        }
                        log.debug("Resubmitting Script last ran internal ID : " + invoiceID);
                        break;
                    }
                }
                if (errorMessage) {
                    sendErrorEmail(authorID, errorMessage);
                }
            } catch (e) {
                log.error('Error in Scheduled Script', e.message);
                email.send({
                    author: authorID,
                    recipients: 'kua@mindworking.dk;ryan.price@ravengroup.global',
                    subject: 'Scripting Error: Sending Invoice Email To Customer',
                    body: e.message
                });
            }
        }

        function checkForResubmit(invoiceID) {
            var unitsLeft = runtime.getCurrentScript().getRemainingUsage();
            log.debug("UnitLeft ", unitsLeft);
            if (unitsLeft < 150) {
                var scriptTask = task.create({
                    taskType: task.TaskType.SCHEDULED_SCRIPT,
                    scriptId: "customscript_o071_send_email_cust_sch",
                    deploymentId: "customdeploy_o071_send_email_cust_sch",
                    params: {

                        'custscript_ossm_lastranid': invoiceID
                    }
                });
                var scriptTaskId = scriptTask.submit();
                log.debug("RE-SUBMITTING- Task Sending Email to customer", scriptTaskId);
                return true;
            } else {
                return false;
            }
        }

        function sendErrorEmail(authorID, errorMessage) {
            errorMessage = "<table style='border: 1px solid black;'><tr><th>Customer</th><th>Transaction ID</th><th>Error Detail</th></tr>" + errorMessage + "</table>";
            email.send({
                author: authorID,
                recipients: 'kua@mindworking.dk;ryan.price@ravengroup.global',
                subject: 'Standard Error: Sending Invoice Email To Customer',
                body: errorMessage
            });
        }

        return {
            execute: execute
        };

    });
