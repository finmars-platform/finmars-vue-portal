/**
 * Created by szhitenev on 10.12.2019.
 */

import cookieService from '@/angular/core/services/cookieService'
import xhrService from '@/angular/core/services/xhrService'
import baseUrlService from '../../services/baseUrlService'

var baseUrl = baseUrlService.resolve()

var process = function (config) {
	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	return xhrService.fetch(
		baseUrl +
			'/' +
			prefix +
			'/' +
			apiVersion +
			'/' +
			'reconciliation/process-bank-file/',
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
	process: process,
}
