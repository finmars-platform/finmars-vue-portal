/**
 * Created by szhitenev on 04.05.2016.
 */

import cookieService from '@/angular/core/services/cookieService'
import xhrService from '@/angular/core/services/xhrService'
import configureRepositoryUrlService from '../services/configureRepositoryUrlService'
import baseUrlService from '../services/baseUrlService'

var baseUrl = baseUrlService.resolve()

var getList = function (options) {
	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	return xhrService.fetch(
		configureRepositoryUrlService.configureUrl(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/active_processes/active_processes/',
			options
		),
		{
			method: 'GET',
			credentials: 'include',
			headers: {
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
			'/active_processes/active_processes/' +
			id +
			'/',
		{
			method: 'GET',
			credentials: 'include',
			headers: {
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
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
				'/active_processes/active_processes/' +
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
			//return data.json();
		})
}

var getStatus = function (id, celery_task_id) {
	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	return xhrService.fetch(
		baseUrl +
			'/' +
			prefix +
			'/' +
			apiVersion +
			'/active_processes/active_processes/' +
			id +
			'/status/?celery_task_id=' +
			celery_task_id,
		{
			method: 'GET',
			credentials: 'include',
			headers: {
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
		}
	)
}

var cancelTask = function (id) {
	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	return xhrService.fetch(
		baseUrl +
			'/' +
			prefix +
			'/' +
			apiVersion +
			'/active_processes/active_processes/' +
			id +
			'/cancel/',
		{
			method: 'PUT',
			credentials: 'include',
			headers: {
				'X-CSRFToken': cookieService.getCookie('csrftoken'),
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
			body: JSON.stringify({
				action: 'cancel',
			}),
		}
	)
}

var abortTransactionImport = function (id) {
	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	return xhrService.fetch(
		baseUrl +
			'/' +
			prefix +
			'/' +
			apiVersion +
			'/active_processes/active_processes/' +
			id +
			'/abort-transaction-import/',
		{
			method: 'PUT',
			credentials: 'include',
			headers: {
				'X-CSRFToken': cookieService.getCookie('csrftoken'),
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
			body: JSON.stringify({
				action: 'abort-transaction-import',
			}),
		}
	)
}

export default {
	deleteByKey: deleteByKey,
	getList: getList,
	getByKey: getByKey,
	getStatus: getStatus,
	cancelTask: cancelTask,
	abortTransactionImport: abortTransactionImport,
}
