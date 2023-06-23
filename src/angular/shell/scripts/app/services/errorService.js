/**
 * Created by mevstratov on 25.05.2021.
 */
'use strict';

export default function (toastNotificationService) {

    function ErrorObject(message, status, statusText) {
        this.status = status;
        this.statusText = statusText;
        this.message = message || 'Oops something went wrong, please try again.';
        this.stack = (new Error()).stack;
    }

    ErrorObject.prototype = Object.create(Error.prototype);
    ErrorObject.prototype.constructor = ErrorObject;

    'use strict';

    // DEPRECATED
    const handleXhrErrors = function (response) {

        // console.log('handleXhrErrors.response', response);

        return new Promise(function (resolve, reject) {

            if (response.status === 500) {

                if (!response.ok) {

                    const errorObj = {
                        status: response.status,
                        statusText: response.statusText,
                        message: response.statusText
                    };

                    reject(new ErrorObject(errorObj.message, errorObj.status, response.statusText))
                }

                reject(response)

            } else {

                if (response.status !== 204) {

                    response.json().then(function (data) {

                        if (!response.ok) {

                            const errorObj = {
                                status: response.status,
                                statusText: response.statusText,
                                message: data
                            };

                            reject(new ErrorObject(errorObj.message, errorObj.status, response.statusText));

                        }

                        resolve(data)

                    })

                } else {
                    resolve({});
                }

            }

        })
    };

    const getFullErrorAsHtml = function (obj, message) {

        // console.log('getFullErrorAsHtml.obj', obj);

        Object.keys(obj).forEach(function (key) {

            message = message + '<br/>';

            if (Array.isArray(obj[key])) {

                if (obj[key].length) {

                    if (typeof obj[key][0] === 'object') {

                        obj[key].forEach(function (item) {

                            message = getFullErrorAsHtml(item, message)

                        })

                    } else {

                        message = message + key + ': ' + obj[key].join('. ');
                    }
                }
            } else {

                if (typeof obj[key] === 'object') {

                    message = getFullErrorAsHtml(obj[key], message)

                } else {
                    message = message + key + ': ' + obj[key]
                }
            }

        });

        return message;

    };

    const notifyError = function (reason) {

        console.log('notifyError.reason', reason);

        let error_object = reason.response.data.error

        let message = ''

        message = message + '<span class="toast-error-field">Title</span>: ' + error_object.message + '<br/>'
        message = message + '<span class="toast-error-field">Code</span>: ' + error_object.status_code + '<br/>'
        message = message + '<span class="toast-error-field">URL</span>: ' + error_object.url + '<br/>'
        message = message + '<span class="toast-error-field">Username</span>: ' + error_object.username + '<br/>'
        message = message + '<span class="toast-error-field">Date & Time</span>: ' + error_object.datetime + '<br/>'
        message = message + '<span class="toast-error-field">Details</span>: <div><pre>' + JSON.stringify(error_object.details, null, 4) + '</pre></div>'

        let raw_title = 'Client Error'

        if (error_object.status_code === 500) {
            raw_title = 'Server Error'
        }

        let title = raw_title + '<span class="toast-click-to-copy">click to copy</span>'

        toastNotificationService.error(message, title, {
            progressBar: true,
            closeButton: true,
            tapToDismiss: false,
            onclick: function (event){

                var listener = function (e) {

                    e.clipboardData.setData('text/plain', JSON.stringify(error_object, null, 4));

                    e.preventDefault();
                };

                document.addEventListener('copy', listener, false);

                document.execCommand("copy");

                document.removeEventListener('copy', listener, false);

            },
            timeOut: '10000',
            extendedTimeOut: '10000'
        });

        // DEPRECATED
        // if (reason.statusText) {
        //
        // 	message = reason.statusText + ' (' + reason.status + ')';
        //
        // 	if (reason.hasOwnProperty('message')) {
        //
        // 		if (typeof reason.message === 'object') {
        //
        // 			message = getFullErrorAsHtml(reason.message, message)
        //
        // 		}
        //
        //
        // 	}
        //
        // } else if (reason.message) {
        //
        // 	message = reason.message
        //
        // }
        //
        // toastNotificationService.error(message);
        //
        // // return reason
        //
        // // throw new Error("Error processing request", reason);

        return Promise.reject(reason)

    };

    return {
        handleXhrErrors: handleXhrErrors,
        notifyError: notifyError
    }

};