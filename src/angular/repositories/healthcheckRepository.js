/**
 * Created by szhitenev on 28.07.2020.
 */

import xhrService from '@/angular/core/services/xhrService'
import cookieService from '@/angular/core/services/cookieService'

var getData = function () {
	// var prefix = baseUrlService.getMasterUserPrefix();
	// var apiVersion = baseUrlService.getApiVersion();

	// return xhrService.fetch('__HEALTHCHECK_HOST__',
	return xhrService.fetch(window.HEALTHCHECK_HOST, {
		method: 'GET',
		credentials: 'include',
		headers: {
			Authorization: 'Token ' + cookieService.getCookie('access_token'),
			Accept: 'application/json',
			'Content-type': 'application/json',
		},
	})
}

export default {
	getData: getData,
}
