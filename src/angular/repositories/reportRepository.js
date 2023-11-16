/**
 * Created by szhitenev on 04.05.2016.
 */
import baseUrlService from '@/angular/shell/scripts/app/services/baseUrlService.js'

export default function () {

	const baseUrl = baseUrlService.resolve();

	var getList = function (options) {

		var prefix = baseUrlService.getMasterUserPrefix();
		var apiVersion = baseUrlService.getApiVersion();

		return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'reports/report/',
			{
				method: 'POST',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					'Authorization': 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json'
				},
				body: JSON.stringify(options)
			})
	};

	var getBalanceReport = function (options) {

		var prefix = baseUrlService.getMasterUserPrefix();
		var apiVersion = baseUrlService.getApiVersion();

		return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/reports/balance-report/',
			{
				method: 'POST',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					'Authorization': 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json'
				},
				body: JSON.stringify(options)
			})
	};

	var getPnlReport = function (options) {

		var prefix = baseUrlService.getMasterUserPrefix();
		var apiVersion = baseUrlService.getApiVersion();

		return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/reports/pl-report/',
			{
				method: 'POST',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					'Authorization': 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json'
				},
				body: JSON.stringify(options)
			})
	};

	var getTransactionReport = function (options) {

		var prefix = baseUrlService.getMasterUserPrefix();
		var apiVersion = baseUrlService.getApiVersion();

		return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/reports/transaction-report/',
			{
				method: 'POST',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					'Authorization': 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json'
				},
				body: JSON.stringify(options)
			})
	};

	// NOT IMPLEMENTED
	var getCashFlowProjectionReport = function (options) {

		var prefix = baseUrlService.getMasterUserPrefix();
		var apiVersion = baseUrlService.getApiVersion();

		return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'reports/cash-flow-projection-report/',
			{
				method: 'POST',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					'Authorization': 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json'
				},
				body: JSON.stringify(options)
			})
	};

	var getPerformanceReport = function (options) {

		var prefix = baseUrlService.getMasterUserPrefix();
		var apiVersion = baseUrlService.getApiVersion();

		return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'reports/performance-report/',
			{
				method: 'POST',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					'Authorization': 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json'
				},
				body: JSON.stringify(options)
			})
	};


	// Backend Reports

	var getBackendBalanceReportGroups = function (options) {

		var prefix = baseUrlService.getMasterUserPrefix();
		var apiVersion = baseUrlService.getApiVersion();

		return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/reports/backend-balance-report/groups/',
			{
				method: 'POST',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					'Authorization': 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json'
				},
				body: JSON.stringify(options)
			})
	};


	var getBackendBalanceReportItems = function (options) {

		var prefix = baseUrlService.getMasterUserPrefix();
		var apiVersion = baseUrlService.getApiVersion();

		return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/reports/backend-balance-report/items/',
			{
				method: 'POST',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					'Authorization': 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json'
				},
				body: JSON.stringify(options)
			})
	};


	var getBackendPnlReportGroups = function (options) {

		var prefix = baseUrlService.getMasterUserPrefix();
		var apiVersion = baseUrlService.getApiVersion();

		return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/reports/backend-pl-report/groups/',
			{
				method: 'POST',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					'Authorization': 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json'
				},
				body: JSON.stringify(options)
			})
	};

	var getBackendPnlReportItems = function (options) {

		var prefix = baseUrlService.getMasterUserPrefix();
		var apiVersion = baseUrlService.getApiVersion();

		return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/reports/backend-pl-report/items/',
			{
				method: 'POST',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					'Authorization': 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json'
				},
				body: JSON.stringify(options)
			})
	};


	var getBackendTransactionReportGroups = function (options) {

		var prefix = baseUrlService.getMasterUserPrefix();
		var apiVersion = baseUrlService.getApiVersion();

		return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/reports/backend-transaction-report/groups/',
			{
				method: 'POST',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					'Authorization': 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json'
				},
				body: JSON.stringify(options)
			})
	};

	var getBackendTransactionReportItems = function (options) {

		var prefix = baseUrlService.getMasterUserPrefix();
		var apiVersion = baseUrlService.getApiVersion();

		return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/reports/backend-transaction-report/items/',
			{
				method: 'POST',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					'Authorization': 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json'
				},
				body: JSON.stringify(options)
			})
	};

	return {
		getList: getList,
		getBalanceReport: getBalanceReport,
		getPnlReport: getPnlReport,
		getTransactionReport: getTransactionReport,
		getCashFlowProjectionReport: getCashFlowProjectionReport,
		getPerformanceReport: getPerformanceReport,


		getBackendBalanceReportGroups: getBackendBalanceReportGroups,
		getBackendBalanceReportItems: getBackendBalanceReportItems,

		getBackendPnlReportGroups: getBackendPnlReportGroups,
		getBackendPnlReportItems: getBackendPnlReportItems,

		getBackendTransactionReportGroups: getBackendTransactionReportGroups,
		getBackendTransactionReportItems: getBackendTransactionReportItems

	}

}
