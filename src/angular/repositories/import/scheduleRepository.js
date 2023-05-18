/**
 * Created by szhitenev on 19.08.2016.
 */

import cookieService from '@/angular/core/services/cookieService'
import xhrService from '@/angular/core/services/xhrService'
import configureRepositoryUrlService from '../../services/configureRepositoryUrlService'
import baseUrlService from '../../services/baseUrlService'

var baseUrl = baseUrlService.resolve()

var getAccrualScheduleDownloadMethodList = function () {
	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	return xhrService.fetch(
		baseUrl +
			'/' +
			prefix +
			'/' +
			apiVersion +
			'/' +
			'import/accrual-schedule-download-method/',
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
}

var getFactorScheduleDownloadMethodList = function () {
	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	return xhrService.fetch(
		baseUrl +
			'/' +
			prefix +
			'/' +
			apiVersion +
			'/' +
			'import/factor-schedule-download-method/',
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
}

export default {
	getAccrualScheduleDownloadMethodList: getAccrualScheduleDownloadMethodList,
	getFactorScheduleDownloadMethodList: getFactorScheduleDownloadMethodList,
}
