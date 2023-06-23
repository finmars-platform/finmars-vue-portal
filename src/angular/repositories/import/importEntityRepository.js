/**
 * Created by szhitenev on 18.03.2018.
 */

import cookieService from '@/angular/core/services/cookieService'
import xhrService from '@/angular/core/services/xhrService'
import configureRepositoryUrlService from '../../services/configureRepositoryUrlService'
import baseUrlService from '../../services/baseUrlService'

var baseUrl = baseUrlService.resolve()

var startImport = function (config) {
	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	return xhrService.fetch(
		baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'import/csv/',
		{
			method: 'POST',
			credentials: 'include',
			headers: {
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				'X-CSRFToken': cookieService.getCookie('csrftoken'),
			},
			body: config,
		}
	)
}

var validateImport = function (config) {
	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	return xhrService.fetch(
		baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'import/csv-validate/',
		{
			method: 'POST',
			credentials: 'include',
			headers: {
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				'X-CSRFToken': cookieService.getCookie('csrftoken'),
			},
			body: config,
		}
	)
}

export default {
	startImport: startImport,
	validateImport: validateImport,
}
