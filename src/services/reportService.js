import useApi from '~/composables/useApi';

export async function getBalanceReport(options = {}) {
	return useApi('balanceReport.post', { body: options });
}

export async function getPnlReport(options = {}) {
	return useApi('pnlReport.post', { body: options });
}

export async function getTransactionReport(options = {}) {
	return useApi('transactionReport.post', { body: options });
}

export async function getPerformanceReport(options = {}) {
	return useApi('performanceReport.post', { body: options });
}

export async function getBackendBalanceReportGroups(options = {}) {
	return useApi('balanceReportGroups.post', { body: options });
}

export async function getBackendPnlReportGroups(options = {}) {
	return useApi('plReportGroups.post', { body: options });
}

export async function getBackendTransactionReportGroups(options = {}) {
	return useApi('transactionReportGroups.post', { body: options });
}

export async function getBackendBalanceReportItems(options = {}) {
	const versionQueryForHash = `${Date.now()}`;
	return useApi('balanceReportItems.post', { filters: { v: versionQueryForHash }, body: options });
}

export async function getBackendPnlReportItems(options = {}) {
	const versionQueryForHash = `${Date.now()}`;
	return useApi('plReportItems.post', { filters: { v: versionQueryForHash }, body: options });
}

export async function getBackendTransactionReportItems(options = {}) {
	const versionQueryForHash = `${Date.now()}`;
	return useApi('transactionReportItems.post', {
		filters: { v: versionQueryForHash },
		body: options
	});
}
