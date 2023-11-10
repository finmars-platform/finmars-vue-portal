/**
 * Created by szhitenev on 16.11.2016.
 */
import ReportRepository from "../repositories/reportRepository";

export default function (cookieService, xhrService) {

	const reportRepository = new ReportRepository(cookieService, xhrService);

	var getList = function (options) {
		return reportRepository.getList(options);
	};

	var getBalanceReport = function (options) {
		return reportRepository.getBalanceReport(options);
	};

	var getPnlReport = function (options) {
		return reportRepository.getPnlReport(options);
	};

	var getCashFlowProjectionReport = function (options) {
		return reportRepository.getCashFlowProjectionReport(options);
	};

	var getTransactionReport = function (options) {
		return reportRepository.getTransactionReport(options);
	};

	var getPerformanceReport = function (options) {
		return reportRepository.getPerformanceReport(options);
	};

	var getBackendBalanceReportGroups = function (options) {
		return reportRepository.getBackendBalanceReportGroups(options);
	};

	var getBackendBalanceReportItems = function (options) {
		return reportRepository.getBackendBalanceReportItems(options);
	};


	var getBackendPnlReportGroups = function (options) {
		return reportRepository.getBackendPnlReportGroups(options);
	};

	var getBackendPnlReportItems = function (options) {
		return reportRepository.getBackendPnlReportItems(options);
	};

	var getBackendTransactionReportGroups = function (options) {
		return reportRepository.getBackendTransactionReportGroups(options);
	};

	var getBackendTransactionReportItems = function (options) {
		return reportRepository.getBackendTransactionReportItems(options);
	};

	return {
		getList: getList,
		getBalanceReport: getBalanceReport,
		getPnlReport: getPnlReport,
		getCashFlowProjectionReport: getCashFlowProjectionReport,
		getTransactionReport: getTransactionReport,
		getPerformanceReport: getPerformanceReport,



		getBackendBalanceReportGroups: getBackendBalanceReportGroups,
		getBackendBalanceReportItems: getBackendBalanceReportItems,

		getBackendPnlReportGroups: getBackendPnlReportGroups,
		getBackendPnlReportItems: getBackendPnlReportItems,

		getBackendTransactionReportGroups: getBackendTransactionReportGroups,
		getBackendTransactionReportItems: getBackendTransactionReportItems

	};

};
