/**
 * Created by szhitenev on 04.05.2016.
 */

import cookieService from '@/angular/core/services/cookieService'
import xhrService from '@/angular/core/services/xhrService'
import configureRepositoryUrlService from '../../services/configureRepositoryUrlService'
import baseUrlService from '../../services/baseUrlService'

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
				'/' +
				'import/price-download-scheme/',
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
			'/' +
			'import/price-download-scheme/' +
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

var create = function (account) {
	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	return xhrService.fetch(
		baseUrl +
			'/' +
			prefix +
			'/' +
			apiVersion +
			'/' +
			'import/price-download-scheme/',
		{
			method: 'POST',
			credentials: 'include',
			headers: {
				'X-CSRFToken': cookieService.getCookie('csrftoken'),
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
			body: JSON.stringify(account),
		}
	)
}

var update = function (id, account) {
	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	return xhrService.fetch(
		baseUrl +
			'/' +
			prefix +
			'/' +
			apiVersion +
			'/' +
			'import/price-download-scheme/' +
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
			body: JSON.stringify(account),
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
				'import/price-download-scheme/' +
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

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
