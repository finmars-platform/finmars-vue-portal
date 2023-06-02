/**
 * Created by szhitenev on 22.04.2022.
 */

import cookieService from '@/angular/core/services/cookieService'
import xhrService from '@/angular/core/services/xhrService'
import configureRepositoryUrlService from '../../services/configureRepositoryUrlService'
import baseUrlService from '../../services/baseUrlService'

var baseUrl = baseUrlService.resolve()

var getList = function (name, page) {
	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	if (page === null || page === undefined) {
		page = 0
	}

	var url =
		baseUrl +
		'/' +
		prefix +
		'/api/' +
		'currencies/currency-database-search/?name=' +
		name +
		'&page=' +
		page

	return xhrService.fetch(url, {
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
	getList: getList,
}
