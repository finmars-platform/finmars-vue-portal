/**
 * Created by szhitenev on 27.06.2022.
 */

import cookieService from '@/angular/core/services/cookieService'
import xhrService from '@/angular/core/services/xhrService'
import configureRepositoryUrlService from '../services/configureRepositoryUrlService'
import baseUrlService from '../services/baseUrlService'

var baseUrl = baseUrlService.resolve()

var getSecurityToken = function (id) {
	var prefix = baseUrlService.getMasterUserPrefix()

	return xhrService.fetch(
		baseUrl +
			'/' +
			prefix +
			'/api/' +
			'integrations/superset/get-security-token/?id=' +
			id,
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

export default {
	getSecurityToken: getSecurityToken,
}
