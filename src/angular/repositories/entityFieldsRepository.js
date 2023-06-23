/**
 * Created by szhitenev on 17.06.2016.
 */

import baseUrlService from '../services/baseUrlService'
import cookieService from '@/angular/core/services/cookieService'
import xhrService from '@/angular/core/services/xhrService'
var baseUrl = baseUrlService.resolve()

var getPricingConditionChoices = function () {
	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	return xhrService.fetch(
		baseUrl +
			'/' +
			prefix +
			'/' +
			apiVersion +
			'/' +
			'instruments/pricing-condition/',
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

var getCountryChoices = function () {
	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	return xhrService.fetch(
		baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'instruments/country/',
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

var getDailyPricingModelChoices = function () {
	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	return xhrService.fetch(
		baseUrl +
			'/' +
			prefix +
			'/' +
			apiVersion +
			'/' +
			'instruments/daily-pricing-model/',
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

var getPaymentSizeDetailChoices = function () {
	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	return xhrService.fetch(
		baseUrl +
			'/' +
			prefix +
			'/' +
			apiVersion +
			'/' +
			'instruments/payment-size-detail/',
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

var getTransactionClassList = function () {
	/* return new Promise(function (resolve, reject) {
			resolve([
				{
					"id": 1,
					"user_code": "BUY",
					"name": "Buy",
					"description": "Buy"
				},
				{
					"id": 8,
					"user_code": "CASH_INFLOW",
					"name": "Cash-Inflow",
					"description": "Cash-Inflow"
				},
				{
					"id": 9,
					"user_code": "CASH_OUTFLOW",
					"name": "Cash-Outflow",
					"description": "Cash-Outflow"
				},
				{
					"id": 10,
					"user_code": "PLACEHOLDER",
					"name": "Default",
					"description": "Default"
				},
				{
					"id": 3,
					"user_code": "FX_TRADE",
					"name": "FX Trade",
					"description": "FX Trade"
				},
				{
					"id": 7,
					"user_code": "FX_TRANSFER",
					"name": "FX Transfer",
					"description": "FX Transfer"
				},
				{
					"id": 4,
					"user_code": "INSTRUMENT_PL",
					"name": "Instrument PL",
					"description": "Instrument PL"
				},
				{
					"id": 2,
					"user_code": "SELL",
					"name": "Sell",
					"description": "Sell"
				},
				{
					"id": 5,
					"user_code": "TRANSACTION_PL",
					"name": "Transaction PL",
					"description": "Transaction PL"
				},
				{
					"id": 6,
					"user_code": "TRANSFER",
					"name": "Transfer",
					"description": "Transfer"
				}
			]);
		}); */
	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	return xhrService.fetch(
		baseUrl +
			'/' +
			prefix +
			'/' +
			apiVersion +
			'/' +
			'transactions/transaction-class/',
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
	getDailyPricingModelChoices: getDailyPricingModelChoices,
	getPaymentSizeDetailChoices: getPaymentSizeDetailChoices,
	getTransactionClassList: getTransactionClassList,
	getPricingConditionChoices: getPricingConditionChoices,
	getCountryChoices: getCountryChoices,
}
