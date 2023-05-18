/**
 * Created by szhitenev on 04.05.2016.
 */

import configureRepositoryUrlService from '@/angular/shell/scripts/app/services/configureRepositoryUrlService'
import baseUrlService from '@/angular/shell/scripts/app/services/baseUrlService'

export default function (cookieService, xhrService) {
	const baseUrl = baseUrlService.resolve()

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
					'instruments/price-history/',
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
				'instruments/price-history/' +
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

	var create = function (price) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'instruments/price-history/',
			{
				method: 'POST',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					Authorization: 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json',
				},
				body: JSON.stringify(price),
			}
		)
	}

	var update = function (id, price) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'instruments/price-history/' +
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
				body: JSON.stringify(price),
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
					'instruments/price-history/' +
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
					'instruments/price-history/bulk-delete/',
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
		getList: getList,
		getByKey: getByKey,
		create: create,
		update: update,
		deleteByKey: deleteByKey,
		deleteBulk: deleteBulk,
	}
}
