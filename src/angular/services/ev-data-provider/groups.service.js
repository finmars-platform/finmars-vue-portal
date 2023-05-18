import cookieService from '@/angular/core/services/cookieService'
import configureRepositoryUrlService from '../../services/configureRepositoryUrlService'
import baseUrlService from '../../services/baseUrlService'
import entityUrlService from '../../services/entityUrlService'
import queryParamsHelper from '../../helpers/queryParamsHelper'

var baseUrl = baseUrlService.resolve()
import xhrService from '@/angular/core/services/xhrService'

// DEPRECATED
var getList = function (entityType, options) {
	var entityUrl = entityUrlService.resolve(entityType)

	var queryParams = ''

	if (options) {
		queryParams = '?' + queryParamsHelper.toQueryParamsString(options)
	}

	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	return window
		.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				entityUrl +
				'-ev-group/' +
				queryParams,
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
		.then(function (data) {
			return data.json()
		})
}

var getFilteredList = function (entityType, options) {
	var entityUrl = entityUrlService.resolve(entityType)

	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	return xhrService.fetch(
		baseUrl +
			'/' +
			prefix +
			'/' +
			apiVersion +
			'/' +
			entityUrl +
			'-ev-group/filtered/',
		{
			method: 'POST',
			credentials: 'include',
			headers: {
				'X-CSRFToken': cookieService.getCookie('csrftoken'),
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
			body: JSON.stringify(options),
		}
	)
}

export default {
	getList: getList, // DEPRECATED
	getFilteredList: getFilteredList,
}
