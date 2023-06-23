/**
 * Created by szhitenev on 22.08.2018.
 */

import cookieService from '@/angular/core/services/cookieService'
import xhrService from '@/angular/core/services/xhrService'
import baseUrlService from '../../services/baseUrlService'

var baseUrl = baseUrlService.resolve()

var getRelatedAttributesList = function () {
	return [
		{
			key: 'portfolios',
			attributeName: 'Portfolios',
			name: 'portfolio',
		},
		{
			key: 'accounts',
			attributeName: 'Accounts',
			name: 'account',
		},
		{
			key: 'counterparties',
			attributeName: 'Counterparties',
			name: 'counterparty',
		},
		{
			key: 'responsibles',
			attributeName: 'Responsibles',
			name: 'responsible',
		},
	]
}

var create = function (attrs, schemeId) {
	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	return xhrService.fetch(
		baseUrl +
			'/' +
			prefix +
			'/' +
			apiVersion +
			'/' +
			'import/schema_matching/?schema_id=' +
			schemeId,
		{
			method: 'PATCH',
			credentials: 'include',
			headers: {
				'X-CSRFToken': cookieService.getCookie('csrftoken'),
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
			body: JSON.stringify(attrs),
		}
	)
}

export default {
	getRelatedAttributesList: getRelatedAttributesList,
	create: create,
}
