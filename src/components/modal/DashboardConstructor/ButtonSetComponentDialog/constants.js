export const ACTIONS = [
	{
		name: 'Book Transaction',
		value: 'book_transaction'
	},
	{
		name: 'Create New Record',
		value: 'create_new_record'
	},
	{
		name: 'Open Report',
		value: 'open_report'
	},
	{
		name: 'Open Data Viewer',
		value: 'open_data_viewer'
	},
	{
		name: 'Open Dashboard',
		value: 'open_dashboard'
	},
	{
		name: 'Run Valuation Procedure',
		value: 'run_valuation_procedure'
	},

	{
		name: 'Import Data From File',
		value: 'import_data_from_file'
	},
	{
		name: 'Import Transactions From File',
		value: 'import_transactions_from_file'
	},
	{
		name: 'Complex Import From File',
		value: 'complex_import_from_file'
	},
	{
		name: 'Download Instrument',
		value: 'download_instrument'
	},
	{
		name: 'Go To',
		value: 'go_to'
	}
];

export const TARGETS = {
	book_transaction: [],
	create_new_record: [
		{
			value: 'portfolio',
			name: 'Portfolio'
		},
		{
			value: 'account',
			name: 'Account'
		},
		{
			value: 'instrument',
			name: 'Instrument'
		},
		{
			value: 'currency',
			name: 'Currency'
		},
		{
			value: 'currency-history',
			name: 'FX Rate'
		},
		{
			value: 'price-history',
			name: 'Price'
		},

		{
			value: 'responsible',
			name: 'Responsible'
		},
		{
			value: 'counterparty',
			name: 'Counterparty'
		},

		{
			value: 'strategy-1',
			name: 'Strategy 1'
		},

		{
			value: 'strategy-2',
			name: 'Strategy 2'
		},

		{
			value: 'strategy-3',
			name: 'Strategy 3'
		},

		{
			value: 'transaction-type',
			name: 'Transaction Type'
		},
		{
			value: 'account-type',
			name: 'Account Type'
		},
		{
			value: 'instrument-type',
			name: 'Instrument Type'
		},
		{
			value: 'pricing-policy',
			name: 'Pricing Policy'
		}
	],
	open_report: [
		{
			value: 'reports.balancereport',
			name: 'Balance Report'
		},
		{
			value: 'reports.plreport',
			name: 'P&L Report'
		},
		{
			value: 'reports.transactionreport',
			name: 'Transaction Report'
		}
	],
	open_data_viewer: [],
	open_dashboard: [],
	run_valuation_procedure: [],
	import_data_from_file: [],
	import_transactions_from_file: [],
	complex_import_from_file: [],
	download_instrument: [],
	go_to: [
		{
			value: '/',
			name: 'Homepage'
		},
		{
			value: '/dashboard',
			name: 'Dashboard'
		},
		{
			value: '/reports/balance',
			name: 'Balance Report'
		},
		{
			value: '/reports/profit-and-lost',
			name: 'P&L Report'
		},
		{
			value: '/reports/transaction',
			name: 'Transaction Report'
		},
		{
			value: '/reports/check-for-events',
			name: 'Events'
		},
		{
			value: '/data/portfolios',
			name: 'Portfolios'
		},
		{
			value: '/data/accounts',
			name: 'Accounts'
		},
		{
			value: '/data/instruments',
			name: 'Instruments'
		},
		{
			value: '/data/counterparties',
			name: 'Counterparties'
		},
		{
			value: '/data/responsibles',
			name: 'Responsibles'
		},
		{
			value: '/data/currency',
			name: 'Currencies'
		},
		{
			value: '/data/strategy/1',
			name: 'Strategy 1'
		},
		{
			value: '/data/strategy/2',
			name: 'Strategy 2'
		},
		{
			value: '/data/strategy/3',
			name: 'Strategy 3'
		},
		{
			value: '/data/complex-transactions',
			name: 'Transactions'
		},
		{
			value: '/data/transactions',
			name: 'Base Transactions'
		},
		{
			value: '/data/pricing',
			name: 'Prices'
		},
		{
			value: '/data/pricing-errors',
			name: 'Prices Errors'
		},
		{
			value: '/data/currencies',
			name: 'FX Rates'
		},
		{
			value: '/data/currencies-errors',
			name: 'FX Rates Errors'
		},
		{
			value: '/run-pricing-procedures',
			name: 'Run Pricing'
		},
		{
			value: '/import/simple-entity-import',
			name: 'Import Data (From File)'
		},
		{
			value: '/import/transaction-import',
			name: 'Import Transactions (From File)'
		},
		{
			value: '/import/complex-import',
			name: 'Import Data and Transactions (From File)'
		},
		{
			value: '/import/instrument-import',
			name: 'Import Instrument (From Provider)'
		},
		{
			value: '/import/prices-import',
			name: 'Import Prices/FX (From Provider)'
		},
		{
			value: '/import/mapping-tables-import',
			name: 'Mapping Tables'
		},
		{
			value: '/forum',
			name: 'Forum'
		}
	]
};
