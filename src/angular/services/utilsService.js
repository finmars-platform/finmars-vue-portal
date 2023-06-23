'use strict'

import configureRepositoryUrlService from '@/angular/shell/scripts/app/services/configureRepositoryUrlService'
import baseUrlService from '../services/baseUrlService'
const baseUrl = baseUrlService.resolve()

/** @module utilsService */
export default function (cookieService, xhrService) {
	const getSystemInfo = function () {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'utils/system-info/',
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

	const getSystemLogs = function () {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'utils/system-logs/',
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

	const getSystemLog = function (file_name) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'utils/system-logs/view-log/?log_file=' +
				file_name,
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
		).then(function (data) {
			return data.text()
		})
	}

	var getTablesSize = function () {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'utils/tables-size/',
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

	const getRecycleBin = function (options) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			configureRepositoryUrlService.configureUrl(
				baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'utils/recycle-bin/',
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

	var clearRecycleBin = function (data) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'utils/recycle-bin/clear-bin/',
			{
				method: 'POST',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					Authorization: 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json',
				},
				data: JSON.stringify(data),
			}
		)
	}

	return {
		getSystemInfo: getSystemInfo,
		getSystemLogs: getSystemLogs,
		getSystemLog: getSystemLog,
		getTablesSize: getTablesSize,

		getRecycleBin: getRecycleBin,
		clearRecycleBin: clearRecycleBin,
	}
}
