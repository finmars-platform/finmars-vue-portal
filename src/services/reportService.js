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
