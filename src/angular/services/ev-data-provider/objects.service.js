import cookieService from '@/angular/core/services/cookieService'
import configureRepositoryUrlService from '../../services/configureRepositoryUrlService'
import baseUrlService from '../../services/baseUrlService'
import entityUrlService from '../../services/entityUrlService'
import queryParamsHelper from '../../helpers/queryParamsHelper'

import filterService from './filter.service'
import xhrService from '@/angular/core/services/xhrService'

var baseUrl = baseUrlService.resolve()

var getFilteredList = function (entityType, options) {
	console.log('getFilteredList.options', options)

	// options.filter_settings = filter_settings;

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
			'-ev/filtered/',
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
	getFilteredList: getFilteredList,
}
