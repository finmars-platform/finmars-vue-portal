/**
 * Created by szhitenev on 19.01.2022.
 */

import cookieService from '@/angular/core/services/cookieService'
import xhrService from '@/angular/core/services/xhrService'
import configureRepositoryUrlService from '../services/configureRepositoryUrlService'
import baseUrlService from '../services/baseUrlService'

var baseUrl = 'https://udp.finmars.com'

var getList = function (entityType, options) {
	var path = ''

	if (entityType === 'counterparty') {
		path = 'company'
	}

	if (entityType === 'currency') {
		return new Promise(function (resolve) {
			resolve({
				count: 0,
				results: [],
			})
		})
	}

	return xhrService.fetch(
		configureRepositoryUrlService.configureUrl(
			baseUrl + '/data/' + path + '/',
			options
		),
		{
			method: 'GET',
			credentials: 'include',
			headers: {
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
		}
	)
}

var getConfigurationPackageGroupList = function (options) {
	return xhrService.fetch(
		configureRepositoryUrlService.configureUrl(
			baseUrl + '/data/configuration-package-group/',
			options
		),
		{
			method: 'GET',
			credentials: 'include',
			headers: {
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
		}
	)
}

var getConfigurationPackageList = function (options) {
	return xhrService.fetch(
		configureRepositoryUrlService.configureUrl(
			baseUrl + '/data/configuration-package/',
			options
		),
		{
			method: 'GET',
			credentials: 'include',
			headers: {
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
		}
	)
}

var getConfigurationPackageFile = function (id) {
	return xhrService.fetch(
		configureRepositoryUrlService.configureUrl(
			baseUrl + '/data/configuration-package/' + id + '/view/',
			{}
		),
		{
			method: 'GET',
			credentials: 'include',
			headers: {
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
		}
	)
}

export default {
	getList: getList,
	getConfigurationPackageGroupList: getConfigurationPackageGroupList,
	getConfigurationPackageList: getConfigurationPackageList,
	getConfigurationPackageFile: getConfigurationPackageFile,
}
