/**
 * @NApiVersion 2.0
 * @Version 1 [20232.01.11]
 */
define(['.././core.js', './modal.tmpl.js'],
    function (core, tmpl) {

        return {

            downloadText: function (filename, text) {
                var element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                element.setAttribute('download', filename);
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            },

            showModal: _showModal,
            closeModal: _closeModal,
            showModalWait: _showModalWait,

            showMessage: function (title, message, onClosed) {
                this.showModal({
                    title: core.isEmpty(message) ? null : title,
                    message: core.isEmpty(message) ? title : message,
                    onClosedFunc: onClosed
                });
            },


            showError: function (e, unexpected) {
                var msgHtml = (e.message || e);
                if (unexpected || e.message) {
                    msgHtml = '<div style="padding: 7px; background-color: yellow; color: red; border: 1px solid red;">' + e.message + '</div>';
                    msgHtml += '<div style="margin-top:17px; padding: 7px; background-color: black; border: 1px solid yellow; color: yellow; font-size: 14px; font-family: \'Courier New\'"><b>NAME: </b>' + e.name;
                    if (e.fileName) { msgHtml += '<b>FILE NAME: </b><br /><br />' + e.fileName; }
                    if (e.lineNumber) { msgHtml += '<b>LINE #: </b><br /><br />' + e.lineNumber; }
                    if (e.columnNumber) { msgHtml += '<b>COL #: </b><br /><br />' + e.columnNumber; }
                    msgHtml += '<br /><br /><b>STACK TRACE:</b>' + e.stack + '</div>';
                }

                this.showModal({
                    title: (unexpected) ? 'UNEXPECTED ERROR OCCURRED!' : 'error message',
                    titleColor: 'red',
                    message: msgHtml,
                    maxWidth: (!unexpected) ? null : '100%',
                    okText: 'close',
                    cancText: 'send error to OSSM Support',
                    cancFunc: (!unexpected) ? null : function () {
                        if (core.sendEMail('UNEXPECTED ERROR REPORT', msgHtml, null, true)) {
                            alert('email succesfully sent!');
                        }
                    }
                });
            },

            confirm: function (title, message) {
                var options = {
                    title: core.isEmpty(message) ? null : title,
                    message: core.isEmpty(message) ? title : message,
                    okText: 'ok',
                    cancText: 'cancel',
                };

                if (!options.title) { options.title = 'confimration required'; }

                return {
                    then: function (f) {
                        options.okFunc = function () {
                            _closeModal();
                            f(true);
                        };
                        options.cancFunc = function () {
                            f(false);
                        };
                        _showModal(options);
                    },

                    ok: function (f) {
                        options.okFunc = function () {
                            _closeModal();
                            f();
                        };
                        options.cancFunc = function () {
                            return;
                        };
                        _showModal(options);
                    },

                }
            },

            form: function (title, controlsContainer) {
                var options = {
                    title: title,
                    message: controlsContainer.toHtml(),
                    okText: 'ok',
                    cancText: 'cancel',
                    isForm: true,
                    formId: 'ossmsdk_form_modal',
                    hideClose: true,
                };

                return {
                    then: function (f, f2) {
                        options.okFunc = function () {
                            if (f(true)) {
                                // close the form
                                _closeModal();
                                // now, if an after close function passed execute it
                                if (f2) { f2(); }	// window.setTimeout( f2, 250 );
                            }
                        };
                        options.cancFunc = function () {
                            // TRUE: means the modal won't be closed
                            return f(false);
                        };
                        _showModal(options);
                        controlsContainer.attachListeners();

                        jQuery('#' + controlsContainer.controls[0].op.id).focus();
                    },

                }
            },


            formEx: function (options, form) {
                if (!options.formId) { options.formId = 'ossmsdk_form_modal'; }
                options.isForm = true;
                options.hideClose = true;
                options.message = form.toHtml();

                return {
                    then: function (f, f2) {
                        options.okFunc = function () {
                            if (f(true)) {
                                // close the form
                                _closeModal();
                                // now, if an after close function passed execute it
                                if (f2) { f2(); }	// window.setTimeout( f2, 250 );
                            }
                        };
                        options.cancFunc = function () {
                            // TRUE: means the modal won't be closed
                            return f(false);
                        };
                        _showModal(options);
                        form.attachListeners();

                        jQuery('#' + form.controls[0].op.id).focus();
                    },

                }

            },



        };

        function _showModalWait(options) {
            try {
                // make sure modal is closed
                _closeModal();
                // if no option passed we should throw an error, however...
                if (core.isEmpty(options) || !core.isObj(options)) { options = {}; }
                // init properties if required
                if (!options.title) { options.title = 'processing...'; }
                if (!options.titleColor) { options.titleColor = '#125AB2'; }
                if (!options.message) { options.message = '<i>perfoming task... this screen will close when the task is complete.</i>'; }

                var modalContentHtml = tmpl.css + tmpl.modalWait;
                modalContentHtml = modalContentHtml.replace('[$Title$]', options.title);
                modalContentHtml = modalContentHtml.replace('[$TitleColor$]', options.titleColor);
                modalContentHtml = modalContentHtml.replace('[$Message$]', options.message);
                jQuery('body').append(modalContentHtml);
            } catch (e) {
                core.log('_showModalWait', e.message, 'lime');
                alert(e.message);
            } finally {
                if (options.execFunc) {
                    window.setTimeout(function () {
                        options.execFunc();
                        _closeModal(options.onClosedFunc);
                    }, 500);
                }
            }
        }

        function _closeModal(onClosedFunction) {
            var modal = jQuery('#ossm_modalForm');
            if (modal) {
                modal.remove();
            }
            if (onClosedFunction) { window.setTimeout(onClosedFunction, 250); }
        }

        function _showModal(options) {
            try {
                // make sure modal is closed
                _closeModal();
                // if no option passed we should throw an error, however...
                if (core.isEmpty(options) || !core.isObj(options)) { options = {}; }
                // init properties if required
                if (!options.title) { options.title = 'message box (by OSSM)'; }
                if (!options.titleColor) { options.titleColor = '#125AB2'; }
                if (!options.message) { options.message = '<i><b>NO MESSAGE PASSED BY CALLING FUNCTION</b></i>'; }
                if (!options.maxWidth) { options.maxWidth = '1000px'; }
                if (!options.minWidth) { options.minWidth = '300px'; }
                if (!options.okText) { options.okText = 'Ok'; }
                if (!options.cancText) { options.cancText = 'Cancel'; }
                if (!options.formId) { options.formId = 'ossm_form' }
                // build html and append to page
                var modalContentHtml = tmpl.modal;
                modalContentHtml = modalContentHtml.replace('[$css$]', tmpl.css);
                if (options.isForm) {
                    modalContentHtml = modalContentHtml.replace('[$FormTag$]', '<form id="' + options.formId + '">');
                    modalContentHtml = modalContentHtml.replace('[$FormTagClosed$]', '</form>');
                    modalContentHtml = modalContentHtml.replace('[$OkButtonType$]', 'submit');
                } else {
                    modalContentHtml = modalContentHtml.replace('[$FormTag$]', '');
                    modalContentHtml = modalContentHtml.replace('[$FormTagClosed$]', '');
                    modalContentHtml = modalContentHtml.replace('[$OkButtonType$]', 'button');
                }

                modalContentHtml = modalContentHtml.replace('[$Title$]', options.title);
                modalContentHtml = modalContentHtml.replace('[$TitleColor$]', options.titleColor);
                modalContentHtml = modalContentHtml.replace('[$Message$]', options.message);
                modalContentHtml = modalContentHtml.replace('[$ModalMaxWidth$]', options.maxWidth);
                modalContentHtml = modalContentHtml.replace('[$ModalMinWidth$]', options.minWidth);
                modalContentHtml = modalContentHtml.replace('[$CloseFunctionDisplay$]', (!options.hideClose) ? 'visible' : 'hidden');
                modalContentHtml = modalContentHtml.replace('[$OkFunctionText$]', options.okText);
                modalContentHtml = modalContentHtml.replace('[$CancelFunctionText$]', options.cancText);
                modalContentHtml = modalContentHtml.replace('[$CancelFunctionDisplay$]', (options.cancFunc) ? 'visible' : 'hidden');
                jQuery('body').append(modalContentHtml);
                // add click listener for modal close button
                jQuery('#ossm_modal_btn_close').click(function () { _closeModal(); });
                // add click listener for modal ok button
                jQuery('#ossm_modal_btn_ok').click(function () {
                    if (options.okFunc) {
                        if (options.okFunc()) {
                            _closeModal(options.onClosedFunc);
                        }
                    } else {
                        _closeModal(options.onClosedFunc);
                    }
                });
                // add click listener for modal cancel button
                if (options.cancFunc) {
                    jQuery('#ossm_modal_btn_cancel').click(function () {
                        if (!options.cancFunc()) {
                            _closeModal(options.onClosedFunc);
                        }
                    });
                }
                //
                if (options.isForm) {
                    jQuery('#' + options.formId).submit(function () {
                        // we don;t want to really submit the form and the save button is already handled with the click
                        // the use of forms is for two main reasons: 
                        //		1. browsers auto-fill options
                        //		2. when used on tablet/mobile the keyboard would show a navigation button (i.e.: Tab, or Next or arrows)
                        return false;
                    });
                }
            } catch (e) {
                core.log('_showModal', e.message, 'lime');
                alert(e.message);
            }
        }

    });
