import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('transactionNotificationClass.get', { filters: options });
export function getEntitiesWithoutBaseAttrsList() {
	return [
		'price-history',
		'currency-history',
		'price-history-error',
		'currency-history-error',
		'complex-transaction',
		'transaction',
		'balance-report',
		'pl-report',
		'transaction-report',
		'cash-flow-projection-report',
		'performance-report',
		'audit-transaction',
		'audit-instrument',
		'generated-event'
	];
}

export function getEntitiesWithoutDynamicAttrsList() {
	return [
		'price-history',
		'currency-history',
		'price-history-error',
		'currency-history-error',
		'pricing-policy',
		'strategy-1-group',
		'strategy-2-group',
		'strategy-3-group',
		'balance-report',
		'pl-report',
		'transaction-report',
		'cash-flow-projection-report',
		'performance-report',
		'counterparty-group',
		'responsible-group',
		'tag',
		'transaction-type-group',
		'strategy-1-subgroup',
		'strategy-2-subgroup',
		'strategy-3-subgroup',
		'audit-transaction',
		'audit-instrument',
		'portfolio-register-record',
		'portfolio-history',
		'portfolio-reconcile-history',
		'complex-transaction-import-scheme',
		'csv-import-scheme',
		'portfolio-reconcile-group',
		'generated-event'
	];
}
