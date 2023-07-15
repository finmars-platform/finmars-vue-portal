/**
 * Created by szhitenev on 15.06.2016.
 *
 * Deprecated. Use shell/scripts/app/services/xhrService.js instead
 *
 */

'use strict'

import ToastNotificationService from '../../shell/scripts/app/services/toastNotificationService'
import ErrorService from '../../shell/scripts/app/services/errorService'
import XhrService from '../../shell/scripts/app/services/xhrService'

/*var errorService = require('./errorService');
	var axService = require('./axService');*/
const toastNotificationService = new ToastNotificationService()
const errorService = new ErrorService(toastNotificationService)
const xhrService = new XhrService(errorService)

/*var fetch = function (url, params, options) {

		if (!options) options = {};

		var requestId;

		if (window.developerConsoleService) {
			requestId = window.developerConsoleService.pushRequest({
				url: url,
				params: params
			})
		}

		params.url = url

		return axService.ax.request(params)
			.then(function (response) {

				return new Promise(function (resolve, reject) {

					if (window.developerConsoleService) {
						window.developerConsoleService.resolveRequest(requestId, response.clone())
					}

					if (response.status === 204) { // No content
						resolve(response);
					}
					else if (response.status >= 400 && response.status < 500) {

						if (response.headers.get('Content-Type').indexOf('json') !== -1 ) {

							response.json().then(function (data) {

								var error = {
									status: response.status,
									statusText: response.statusText,
									message: data
								};

								reject(error)

							})
						} else {
							var error = {
								status: response.status,
								statusText: response.statusText,
								message: '-'
							};

							reject(error)

						}

					} else if (response.status >= 500 && response.status < 600) {

						;

						try {

							response.json().then(function (data) {

								var error = {
									status: response.status,
									statusText: response.statusText,
									message: data
								};

								reject(error)

							}).catch(function(data){

								var error = {
									status: response.status,
									statusText: response.statusText,
									message: data
								};

								reject(error)

							})

						} catch (e) {

							var error = {
								status: response.status,
								statusText: response.statusText,
								message: response.text()
							};

							reject(error)

						}

					} else {

						if (params.method !== "DELETE") {
							resolve(response.data);
						}
						else {
							resolve(response);
						}



					}

				})
			})
			.catch(function (reason) {

				if (window.developerConsoleService) {
					window.developerConsoleService.rejectRequest(requestId, reason)
				}

				// if (options.notifyError !== false) errorService.notifyError(reason);

				errorService.recordError(reason)
				errorService.notifyError(reason)

				;

				throw reason;

			})

	};*/

export default {
	fetch: xhrService.fetch,
}
