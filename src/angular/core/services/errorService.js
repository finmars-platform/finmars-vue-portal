/**
 * Created by szhitenev on 15.06.2016.
 *
 * Deprecated. Use shell/scripts/app/services/errorService.js instead.
 *
 */

'use strict';

import ToastNotificationService from "../../shell/scripts/app/services/toastNotificationService";
import ErrorService from "../../shell/scripts/app/services/errorService";

(function () {

	// var toastNotificationService = require('./toastNotificationService');

	const toastNotificationService = new ToastNotificationService();
	const errorService = new ErrorService(toastNotificationService);

	/* function ErrorObject(message, status, statusText) {
		this.status = status;
		this.statusText = statusText;
		this.message = message || 'Oops something went wrong, please try again.';
		this.stack = (new Error()).stack;
	}

	ErrorObject.prototype = Object.create(Error.prototype);
	ErrorObject.prototype.constructor = ErrorObject;

	'use strict';

	var getFullErrorAsHtml = function (obj, message) {

		// ;

		Object.keys(obj).forEach(function (key) {

			message = message + '<br/>';

			if (Array.isArray(obj[key])) {

				if (obj[key].length) {

					if (typeof obj[key][0] === 'object') {

						obj[key].forEach(function (item) {

							message = message +  getFullErrorAsHtml(item, message)

						})

					} else {

						message = message + key + ': ' + obj[key].join(', ');
					}
				}
			} else {

				if (typeof obj[key] === 'object') {

					message = message + getFullErrorAsHtml(obj[key], message)

				} else {
					message = message + key + ': ' + obj[key];
				}
			}

		});

		return message

	};

	var notifyError = function (data) {


		console.error('notifyError.data', data);

		var message = '';

		message = data.response.status + ' ' + data.response.statusText + '<br>'

		if (data.response.data) {

			message = getFullErrorAsHtml(data.response.data, message)

		}



		toastNotificationService.error(message);


		return Promise.reject(data)

	};

	var recordError = function (data){

		if (!window.system_errors) {
			window.system_errors = []
		}

		window.system_errors.push({
			created: new Date().toISOString(),
			location: window.location.href,
			data: data,
			text: JSON.stringify(data)
		})


		return Promise.reject(data)
	} */

	module.exports = {
		notifyError: errorService.notifyError,
		recordError: errorService.recordError
	}


}());
