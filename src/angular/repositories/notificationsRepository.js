/**
 * Created by szhitenev on 04.05.2016.
 */

import baseUrlService from '../services/baseUrlService'

var baseUrl = baseUrlService.resolve()
import cookieService from '@/angular/core/services/cookieService'
import xhrService from '@/angular/core/services/xhrService'

var getList = function (page, type) {
	var listUrl = ''
	switch (type) {
		case 'unreaded':
			listUrl = '?all=false&page=' + page
			break
		default:
			listUrl = '?all=true&page=' + page
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
			'notifications/notification/' +
			listUrl,
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

var markAsReaded = function (url, data) {
	var markUrl

	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	return xhrService.fetch(
		baseUrl +
			'/' +
			prefix +
			'/' +
			apiVersion +
			'/' +
			'notifications/notification/' +
			url +
			'/mark-as-read/',
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
}

var markAllAsReaded = function () {
	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	return xhrService.fetch(
		baseUrl +
			'/' +
			prefix +
			'/' +
			apiVersion +
			'/' +
			'notifications/notification/mark-all-as-read/',
		{
			method: 'POST',
			credentials: 'include',
			headers: {
				'X-CSRFToken': cookieService.getCookie('csrftoken'),
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
			body: JSON.stringify({}),
		}
	)
}

export default {
	getList: getList,
	markAsReaded: markAsReaded,
	markAllAsReaded: markAllAsReaded,
}
