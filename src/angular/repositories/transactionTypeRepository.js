/**
 * Created by szhitenev on 04.05.2016.
 */

import configureRepositoryUrlService from '@/angular/shell/scripts/app/services/configureRepositoryUrlService'
import baseUrlService from '@/angular/shell/scripts/app/services/baseUrlService'

export default function (cookieService, xhrService) {
	const baseUrl = baseUrlService.resolve()

	/*var getList = function (options) {

var prefix = baseUrlService.getMasterUserPrefix();
var apiVersion = baseUrlService.getApiVersion();

return xhrService.fetch(configureRepositoryUrlService.configureUrl(baseUrl   +  '/' + prefix + '/' + apiVersion + '/' + 'transactions/transaction-type/', options),
            {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'X-CSRFToken': cookieService.getCookie('csrftoken'),
                   'Authorization': 'Token ' + cookieService.getCookie('access_token'),
 Accept: 'application/json',
                    'Content-type': 'application/json'
                }
            })
    };*/

	var getListLight = function (options) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			configureRepositoryUrlService.configureUrl(
				baseUrl +
					'/' +
					prefix +
					'/' +
					apiVersion +
					'/' +
					'transactions/transaction-type/light/',
				options
			),
			{
				method: 'GET',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					Authorization: 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json',
				},
			}
		)
	}

	var getListLightWithInputs = function (options) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			configureRepositoryUrlService.configureUrl(
				baseUrl +
					'/' +
					prefix +
					'/' +
					apiVersion +
					'/' +
					'transactions/transaction-type-light-with-inputs/',
				options
			),
			{
				method: 'GET',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					Authorization: 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json',
				},
			}
		)
	}

	var getByKey = function (id) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'transactions/transaction-type/' +
				id +
				'/',
			{
				method: 'GET',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					Authorization: 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json',
				},
			}
		)
	}

	var getByKeyLight = function (id) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'transactions/transaction-type-light/' +
				id +
				'/',
			{
				method: 'GET',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					Authorization: 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json',
				},
			}
		)
	}

	var create = function (transaction) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'transactions/transaction-type/',
			{
				method: 'POST',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					Authorization: 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json',
				},
				body: JSON.stringify(transaction),
			}
		)
	}

	var update = function (id, data) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'transactions/transaction-type/' +
				id +
				'/',
			{
				method: 'PUT',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					Authorization: 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json',
				},
				body: JSON.stringify(data),
			}
		)
	}

	var patch = function (id, data) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'transactions/transaction-type/' +
				id +
				'/',
			{
				method: 'PATCH',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					Authorization: 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json',
				},
				body: JSON.stringify(data),
			}
		)
	}

	var updateBulkLight = function (transactionTypes) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'transactions/transaction-type-light/bulk-update/',
			{
				method: 'PATCH',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					Authorization: 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json',
				},
				body: JSON.stringify(transactionTypes),
			}
		)
	}

	var updateBulk = function (transactionTypes) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'transactions/transaction-type/bulk-update/',
			{
				method: 'PATCH',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					Authorization: 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json',
				},
				body: JSON.stringify(transactionTypes),
			}
		)
	}

	var deleteByKey = function (id) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService
			.fetch(
				baseUrl +
					'/' +
					prefix +
					'/' +
					apiVersion +
					'/' +
					'transactions/transaction-type/' +
					id +
					'/',
				{
					method: 'DELETE',
					credentials: 'include',
					headers: {
						'X-CSRFToken': cookieService.getCookie('csrftoken'),
						Authorization: 'Token ' + cookieService.getCookie('access_token'),
						Accept: 'application/json',
						'Content-type': 'application/json',
					},
				}
			)
			.then(function (data) {
				return new Promise(function (resolve, reject) {
					resolve({ status: 'deleted' })
				})
			})
	}

	var initBookComplexTransaction = function (id, contextData) {
		var contextDataAsQueryParameters = ''

		if (contextData && Object.keys(contextData).length) {
			var list = []

			Object.keys(contextData).forEach(function (key) {
				if (contextData[key]) {
					list.push(key + '=' + contextData[key])
				}
			})

			contextDataAsQueryParameters = '?' + list.join('&')
		}

		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'transactions/transaction-type/' +
				id +
				'/book/' +
				contextDataAsQueryParameters,
			{
				method: 'GET',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					Authorization: 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json',
				},
			}
		)
	}

	var bookComplexTransaction = function (id, transaction) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'transactions/transaction-type/' +
				id +
				'/book/',
			{
				method: 'PUT',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					Authorization: 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json',
				},
				body: JSON.stringify(transaction),
			}
		)
	}

	var recalculateComplexTransaction = function (id, transaction) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'transactions/transaction-type/' +
				id +
				'/recalculate/',
			{
				method: 'PUT',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					Authorization: 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json',
				},
				body: JSON.stringify(transaction),
			}
		)
	}

	var initBookPendingComplexTransaction = function (id) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'transactions/transaction-type/' +
				id +
				'/book-pending/',
			{
				method: 'GET',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					Authorization: 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json',
				},
			}
		)
	}

	var bookPendingComplexTransaction = function (id, transaction) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'transactions/transaction-type/' +
				id +
				'/book-pending/',
			{
				method: 'PUT',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					Authorization: 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json',
				},
				body: JSON.stringify(transaction),
			}
		)
	}

	var deleteBulk = function (data) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService
			.fetch(
				baseUrl +
					'/' +
					prefix +
					'/' +
					apiVersion +
					'/' +
					'transactions/transaction-type/bulk-delete/',
				{
					method: 'POST',
					credentials: 'include',
					headers: {
						'X-CSRFToken': cookieService.getCookie('csrftoken'),
						Authorization: 'Token ' + cookieService.getCookie('access_token'),
						Accept: 'application/json',
						'Content-type': 'application/json',
					},
					body: JSON.stringify(data),
				}
			)
			.then(function (data) {
				return new Promise(function (resolve, reject) {
					resolve({ status: 'deleted' })
				})
			})
	}

	var recalculateUserFields = function (id, data) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService
			.fetch(
				baseUrl +
					'/' +
					prefix +
					'/' +
					apiVersion +
					'/' +
					'transactions/transaction-type/' +
					id +
					'/recalculate-user-fields/',
				{
					method: 'POST',
					credentials: 'include',
					headers: {
						'X-CSRFToken': cookieService.getCookie('csrftoken'),
						Authorization: 'Token ' + cookieService.getCookie('access_token'),
						Accept: 'application/json',
						'Content-type': 'application/json',
					},
					body: JSON.stringify(data),
				}
			)
			.then(function (data) {
				return new Promise(function (resolve, reject) {
					resolve({ status: 'deleted' })
				})
			})
	}

	return {
		// getList: getList,
		getListLight: getListLight,
		getListLightWithInputs: getListLightWithInputs,
		getByKey: getByKey,
		getByKeyLight: getByKeyLight,
		create: create,
		update: update,
		patch: patch,
		deleteByKey: deleteByKey,

		initBookComplexTransaction: initBookComplexTransaction,
		bookComplexTransaction: bookComplexTransaction,

		recalculateComplexTransaction: recalculateComplexTransaction,

		initBookPendingComplexTransaction: initBookPendingComplexTransaction,
		bookPendingComplexTransaction: bookPendingComplexTransaction,

		updateBulkLight: updateBulkLight,
		updateBulk: updateBulk,
		deleteBulk: deleteBulk,

		recalculateUserFields: recalculateUserFields,
	}
}
