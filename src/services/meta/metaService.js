export function isReport(entityType) {
	return [
		'balance-report',
		'cash-flow-projection-report',
		'performance-report',
		'pl-report',
		'transaction-report'
	].includes(entityType);
}
