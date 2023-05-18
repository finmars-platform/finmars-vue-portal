/**
 * Created by szhitenev on 04.05.2016.
 */

import cookieService from '@/angular/core/services/cookieService'
import xhrService from '@/angular/core/services/xhrService'
import configureRepositoryUrlService from '../../services/configureRepositoryUrlService'
import baseUrlService from '../../services/baseUrlService'

var baseUrl = baseUrlService.resolve()

var getList = function (options) {
	if (!options) {
		options = {}
	}

	options.pageSize = options.pageSize || 1000

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
				'instruments/instrument-attribute-type/',
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

var getListByAttributeType = function (options) {
	var filters = '?value_type=' + options[0]

	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	return xhrService.fetch(
		baseUrl +
			'/' +
			prefix +
			'/' +
			apiVersion +
			'/' +
			'instruments/instrument-attribute-type/' +
			filters +
			'&show_classifiers=1',
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
			'instruments/instrument-attribute-type/' +
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
			'instruments/instrument-attribute-type/',
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
			'instruments/instrument-attribute-type/' +
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
				'instruments/instrument-attribute-type/' +
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
	getListByAttributeType: getListByAttributeType,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
