/**
 * Created by szhitenev on 04.05.2016.
 */

import cookieService from '@/angular/core/services/cookieService'
import xhrService from '@/angular/core/services/xhrService'
import configureRepositoryUrlService from '../../services/configureRepositoryUrlService'
import baseUrlService from '../../services/baseUrlService'

var baseUrl = baseUrlService.resolve()

var getList = function (name, page, instrument_type) {
	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	if (page === null || page === undefined) {
		page = 0
	}

	var instrumentDatabaseUrl =
		baseUrl +
		'/' +
		prefix +
		'/api/' +
		'instruments/instrument-database-search/?name=' +
		name +
		'&page=' +
		page

	if (instrument_type) {
		instrumentDatabaseUrl =
			instrumentDatabaseUrl + '&instrument_type=' + instrument_type
	}

	return xhrService.fetch(instrumentDatabaseUrl, {
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
