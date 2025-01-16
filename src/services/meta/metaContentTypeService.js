export function getList() {
	return [
		{
			name: 'Dashboard',
			entity: 'dashboard',
			key: 'ui.dashboard'
		},
		{
			name: 'Account Type',
			entity: 'account-type',
			key: 'accounts.accounttype'
		},
		{
			name: 'Account',
			entity: 'account',
			key: 'accounts.account'
		},
		{
			name: 'Counterparty',
			entity: 'counterparty',
			key: 'counterparties.counterparty'
		},
		{
			name: 'Responsible',
			entity: 'responsible',
			key: 'counterparties.responsible'
		},
		{
			name: 'Currency',
			entity: 'currency',
			key: 'currencies.currency'
		},
		{
			name: 'Currency history',
			entity: 'currency-history',
			key: 'currencies.currencyhistory'
		},
		{
			name: 'Instrument',
			entity: 'instrument',
			key: 'instruments.instrument'
		},
		{
			name: 'Generated Event',
			entity: 'generated-event',
			key: 'instruments.generatedevent'
		},
		{
			name: 'Price History',
			entity: 'price-history',
			key: 'instruments.pricehistory'
		},
		{
			name: 'Portfolio',
			entity: 'portfolio',
			key: 'portfolios.portfolio'
		},
		{
			name: 'Portfolio Type',
			entity: 'portfolio-type',
			key: 'portfolios.portfoliotype'
		},
		{
			name: 'Portfolio Reconcile Group',
			entity: 'portfolio-reconcile-group',
			key: 'portfolios.portfolioreconcilegroup'
		},
		{
			name: 'Portfolio Register',
			entity: 'portfolio-register',
			key: 'portfolios.portfolioregister'
		},
		{
			name: 'Portfolio Register Record',
			entity: 'portfolio-register-record',
			key: 'portfolios.portfolioregisterrecord'
		},
		{
			name: 'Portfolio History',
			entity: 'portfolio-history',
			key: 'portfolios.portfoliohistory'
		},
		{
			name: 'Portfolio Reconcile History',
			entity: 'portfolio-reconcile-history',
			key: 'portfolios.portfolioreconcilehistory'
		},
		{
			name: 'Instrument Type',
			entity: 'instrument-type',
			key: 'instruments.instrumenttype'
		},
		{
			name: 'Transaction',
			entity: 'transaction',
			key: 'transactions.transaction'
		},
		{
			name: 'Transaction Type',
			entity: 'transaction-type',
			key: 'transactions.transactiontype'
		},
		{
			name: 'Transaction Type Group',
			entity: 'transaction-type-group',
			key: 'transactions.transactiontypegroup'
		},
		{
			name: 'Counterparty group',
			entity: 'counterparty-group',
			key: 'counterparties.counterpartygroup'
		},
		{
			name: 'Responsible group',
			entity: 'responsible-group',
			key: 'counterparties.responsiblegroup'
		},
		{
			name: 'Strategy 1',
			entity: 'strategy-1',
			key: 'strategies.strategy1'
		},
		{
			name: 'Strategy 2',
			entity: 'strategy-2',
			key: 'strategies.strategy2'
		},
		{
			name: 'Strategy 3',
			entity: 'strategy-3',
			key: 'strategies.strategy3'
		},
		{
			name: 'Strategy 1 group',
			entity: 'strategy-1-group',
			key: 'strategies.strategy1group'
		},
		{
			name: 'Strategy 2 group',
			entity: 'strategy-2-group',
			key: 'strategies.strategy2group'
		},
		{
			name: 'Strategy 3 group',
			entity: 'strategy-3-group',
			key: 'strategies.strategy3group'
		},
		{
			name: 'Strategy 1 subgroup',
			entity: 'strategy-1-subgroup',
			key: 'strategies.strategy1subgroup'
		},
		{
			name: 'Strategy 2 subgroup',
			entity: 'strategy-2-subgroup',
			key: 'strategies.strategy2subgroup'
		},
		{
			name: 'Strategy 3 subgroup',
			entity: 'strategy-3-subgroup',
			key: 'strategies.strategy3subgroup'
		},
		{
			name: 'Transaction',
			entity: 'complex-transaction',
			key: 'transactions.complextransaction'
		},

		{
			name: 'Daily pricing model',
			entity: 'daily-pricing-model',
			key: 'instruments.dailypricingmodel'
		},
		{
			name: 'Payment size detail',
			entity: 'payment-size-detail',
			key: 'instruments.paymentsizedetail'
		},
		{
			name: 'Price download scheme',
			entity: 'price-download-scheme',
			key: 'integrations.pricedownloadscheme'
		},
		{
			name: 'Pricing policy',
			entity: 'pricing-policy',
			key: 'instruments.pricingpolicy'
		},
		{
			name: 'Periodicity',
			entity: 'periodicity',
			key: 'instruments.periodicity'
		},
		{
			name: 'Accrual calculation model',
			entity: 'accrual-calculation-model',
			key: 'instruments.accrualcalculationmodel'
		},
		{
			name: 'Event Class',
			entity: 'event-class',
			key: 'transactions.eventclass'
		},
		{
			name: 'Notification Class',
			entity: 'notification-class',
			key: 'transactions.notificationclass'
		},
		{
			name: 'Complex Import Scheme',
			entity: 'complex-import-scheme',
			key: 'complex_import.compleximportscheme'
		},
		{
			name: 'Simple Entity Import Scheme',
			entity: 'simple-entity-import-scheme',
			key: 'csv_import.csvimportscheme'
		},
		{
			name: 'Balance report',
			entity: 'balance-report',
			key: 'reports.balancereport'
		},
		{
			name: 'Balance report Performance',
			entity: 'balance-report-performance',
			key: 'reports.balancereportperformance'
		},
		{
			name: 'Balance report Mismatch',
			entity: 'balance-report-mismatch',
			key: 'reports.balancereportmismatch'
		},
		{
			name: 'P&L report',
			entity: 'pl-report',
			key: 'reports.plreport'
		},
		{
			name: 'P&L report Performance',
			entity: 'pl-report-performance',
			key: 'reports.plreportperformance'
		},
		{
			name: 'P&L report Mismatch',
			entity: 'pl-report-mismatch',
			key: 'reports.plreportmismatch'
		},
		{
			name: 'Transaction report',
			entity: 'transaction-report',
			key: 'reports.transactionreport'
		},
		{
			name: 'Cash flow projection report',
			entity: 'cash-flow-projection-report',
			key: 'reports.cashflowreport'
		},
		{
			name: 'Performance report',
			entity: 'performance-report',
			key: 'reports.performancereport'
		},

		{
			name: 'Transaction Class',
			entity: 'transaction-class',
			key: 'transactions.transactionclass'
		},

		{
			name: 'Status',
			entity: 'complex-transaction-status',
			key: 'transactions.complextransactionstatus'
		},

		{
			name: 'Audit transaction',
			entity: 'audit-transaction',
			key: 'audit.objecthistory4entry'
		},

		{
			name: 'Audit instrument',
			entity: 'audit-instrument',
			key: 'audit.objecthistory4entry'
		},
		{
			name: 'Country',
			entity: 'country',
			key: 'instruments.country'
		},
		{
			name: 'Complex Transaction Import Scheme',
			entity: 'complex-transaction-import-scheme',
			key: 'integrations.complextransactionimportscheme'
		},
		{
			name: 'Simple Import Scheme',
			entity: 'csv-import-scheme',
			key: 'csv_import.csvimportscheme'
		}
	];
}

export function getListForUi() {
	return [
		{
			name: 'Dashboard',
			entity: 'dashboard',
			key: 'ui.dashboard'
		},
		{
			name: 'Account Type',
			entity: 'account-type',
			key: 'accounts.accounttype'
		},
		{
			name: 'Account',
			entity: 'account',
			key: 'accounts.account'
		},
		{
			name: 'Counterparty',
			entity: 'counterparty',
			key: 'counterparties.counterparty'
		},
		{
			name: 'Responsible',
			entity: 'responsible',
			key: 'counterparties.responsible'
		},
		{
			name: 'Currency',
			entity: 'currency',
			key: 'currencies.currency'
		},
		{
			name: 'Currency history',
			entity: 'currency-history',
			key: 'currencies.currencyhistory'
		},
		{
			name: 'Instrument',
			entity: 'instrument',
			key: 'instruments.instrument'
		},
		{
			name: 'Generated Event',
			entity: 'generated-event',
			key: 'instruments.generatedevent'
		},
		{
			name: 'Pricing Policy',
			entity: 'pricing-policy',
			key: 'instruments.pricingpolicy'
		},
		{
			name: 'Price History',
			entity: 'price-history',
			key: 'instruments.pricehistory'
		},
		{
			name: 'Portfolio',
			entity: 'portfolio',
			key: 'portfolios.portfolio'
		},
		{
			name: 'Portfolio Type',
			entity: 'portfolio-type',
			key: 'portfolios.portfoliotype'
		},
		{
			name: 'Portfolio Reconcile Group',
			entity: 'portfolio-reconcile-group',
			key: 'portfolios.portfolioreconcilegroup'
		},
		{
			name: 'Portfolio Register',
			entity: 'portfolio-register',
			key: 'portfolios.portfolioregister'
		},
		{
			name: 'Portfolio Register Record',
			entity: 'portfolio-register-record',
			key: 'portfolios.portfolioregisterrecord'
		},
		{
			name: 'Portfolio History',
			entity: 'portfolio-history',
			key: 'portfolios.portfoliohistory'
		},
		{
			name: 'Portfolio Reconcile History',
			entity: 'portfolio-reconcile-history',
			key: 'portfolios.portfolioreconcilehistory'
		},
		{
			name: 'Instrument Type',
			entity: 'instrument-type',
			key: 'instruments.instrumenttype'
		},
		{
			name: 'Transaction',
			entity: 'transaction',
			key: 'transactions.transaction'
		},
		{
			name: 'Transaction Type',
			entity: 'transaction-type',
			key: 'transactions.transactiontype'
		},
		{
			name: 'Transaction Type Group',
			entity: 'transaction-type-group',
			key: 'transactions.transactiontypegroup'
		},
		{
			name: 'Counterparty group',
			entity: 'counterparty-group',
			key: 'counterparties.counterpartygroup'
		},
		{
			name: 'Responsible group',
			entity: 'responsible-group',
			key: 'counterparties.responsiblegroup'
		},
		{
			name: 'Strategy 1',
			entity: 'strategy-1',
			key: 'strategies.strategy1'
		},
		{
			name: 'Strategy 2',
			entity: 'strategy-2',
			key: 'strategies.strategy2'
		},
		{
			name: 'Strategy 3',
			entity: 'strategy-3',
			key: 'strategies.strategy3'
		},
		{
			name: 'Strategy 1 group',
			entity: 'strategy-1-group',
			key: 'strategies.strategy1group'
		},
		{
			name: 'Strategy 2 group',
			entity: 'strategy-2-group',
			key: 'strategies.strategy2group'
		},
		{
			name: 'Strategy 3 group',
			entity: 'strategy-3-group',
			key: 'strategies.strategy3group'
		},
		{
			name: 'Strategy 1 subgroup',
			entity: 'strategy-1-subgroup',
			key: 'strategies.strategy1subgroup'
		},
		{
			name: 'Strategy 2 subgroup',
			entity: 'strategy-2-subgroup',
			key: 'strategies.strategy1subgroup'
		},
		{
			name: 'Strategy 3 subgroup',
			entity: 'strategy-3-subgroup',
			key: 'strategies.strategy1subgroup'
		},
		{
			name: 'Balance report',
			entity: 'balance-report',
			key: 'reports.balancereport'
		},
		{
			name: 'P&L report',
			entity: 'pl-report',
			key: 'reports.plreport'
		},
		{
			name: 'Transaction report',
			entity: 'transaction-report',
			key: 'reports.transactionreport'
		},
		{
			name: 'Cash flow projection report',
			entity: 'cash-flow-projection-report',
			key: 'reports.cashflowreport'
		},
		{
			name: 'Performance report',
			entity: 'performance-report',
			key: 'reports.performancereport'
		},
		{
			name: 'Transaction',
			entity: 'complex-transaction',
			key: 'transactions.complextransaction'
		},
		{
			name: 'Balance Report Custom Field',
			entity: 'balance-report-custom-field',
			key: 'reports.balancereportcustomfield'
		},
		{
			name: 'PL Report Custom Field',
			entity: 'pl-report-custom-field',
			key: 'reports.plreportcustomfield'
		},
		{
			name: 'Transaction Report Custom Field',
			entity: 'transaction-report-custom-field',
			key: 'reports.transactionreportcustomfield'
		},
		{
			name: 'Price History Error',
			entity: 'price-history-error',
			key: 'pricing.pricehistoryerror'
		},
		{
			name: 'Currency History Error',
			entity: 'currency-history-error',
			key: 'pricing.currencyhistoryerror'
		},
		{
			name: 'Audit transaction',
			entity: 'audit-transaction',
			key: 'audit.objecthistory4entry'
		},

		{
			name: 'Audit instrument',
			entity: 'audit-instrument',
			key: 'audit.objecthistory4entry'
		},
		{
			name: 'Complex Transaction Import Scheme',
			entity: 'complex-transaction-import-scheme',
			key: 'integrations.complextransactionimportscheme'
		},
		{
			name: 'Simple Import Scheme',
			entity: 'csv-import-scheme',
			key: 'csv_import.csvimportscheme'
		}
	];
}

export function findEntityByContentType(contentType, type) {
	const contentTypes = type === 'ui' ? getListForUi() : getList();
	const item = contentTypes.find((i) => i.key === contentType);
	return item ? item.entity : null;
}
