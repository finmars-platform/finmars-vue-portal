export default [

	{ title: 'Dashboard', link: 'dashboard', icon: 'mdi-view-dashboard', old: true },
	{ title: 'Homepage',  link: '/', icon: 'mdi-home' },
	{
		title: 'Reports',
		icon: 'mdi-chart-bar',
		pages: [
			{ title: 'Balance', link: 'reports/balance', old: true },
			{ title: 'P&L', link: 'reports/profit-and-lost', old: true },
			{ title: 'Transaction', link: 'reports/transaction', old: true },
			{ title: 'Performance', link: '/reports/performance' },
			{ title: 'Cash flow', link: 'reports/cash-flow-projection', old: true },
			{ title: 'Events', link: 'reports/check-for-events', old: true },
		]
	},
	{
		title: 'Data',
		icon: 'mdi-database',
		pages: [
			{ title: 'Portfolios', link: 'data/portfolios', old: true },
			{ title: 'Registers', link: 'data/portfolio-registers', old: true },
			{ title: 'Accounts', link: 'data/accounts', old: true },
			{ title: 'Instruments', link: 'data/instruments', old: true },
			{ title: 'Counterparties', link: 'data/counterparties', old: true },
			{ title: 'Responsibles', link: 'data/responsibles', old: true },
			{ title: 'Currencies', link: 'data/currency', old: true },
			{ title: 'Strategies 1', link: 'data/strategy/1', old: true },
			{ title: 'Strategies 2', link: 'data/strategy/2', old: true },
			{ title: 'Strategies 3', link: 'data/strategy/3', old: true },
			{ title: 'Events', link: 'data/generated-events', old: true },

		]
	},
	{
		title: 'Transactions',
		icon: 'mdi-history',
		pages: [
			{ title: 'Transactions', link: 'data/complex-transactions', old: true },
			{ title: 'Base transactions', link: 'data/transactions', old: true },
			{ title: 'Register records', link: 'data/portfolio-register-records', old: true },
		]
	},
	{
		title: 'Valuations',
		icon: 'mdi-layers',
		pages: [
			{ title: 'Prices', link: 'data/pricing', old: true},
			{ title: 'Prices journal', link: 'data/pricing-errors', old: true},
			{ title: 'FX rates', link: 'data/currencies', old: true},
			{ title: 'FX rates journal', link: 'data/currencies-errors', old: true},
			{ title: 'Run pricing', link: '/valuations/run-pricing' }
		]
	},
	{
		title: 'Import',
		icon: 'mdi-download',
		pages: [
			{ title: 'Data (from file)', link: 'import/simple-entity-import', old: true},
			{ title: 'Instrument (from file)', link: 'import/unified-entity-import', old: true},
			{ title: 'Transactions (from file)', link: 'import/transaction-import', old: true},
			{ title: 'Data and transactions (from file)', link: 'import/complex-import', old: true},
			{ title: 'Instrument (from provider)', link: 'import/instrument-import', old: true},
			{ title: 'Instrument (from finmars database)', link: 'import/instrument-import-cbonds', old: true},
			{ title: 'Prices/FX (from provider)', link: 'import/prices-import', old: true},
			{ title: 'Import from bank', link: '/import/bank'},

		]
	},
	{
		title: 'Journal',
		icon: 'mdi-book',
		pages: [
			{ title: 'Instruments audit', link: 'data/audit/instruments', old: true},
			{ title: 'Transactions audit', link: 'data/audit/transactions', old: true},
			{ title: 'Activity log', link: ''},
			{ title: 'System files', link: 'system/file-reports', old: true},
		]
	},
	{
		title: 'Settings',
		icon: 'mdi-settings',
		submenu: [
			{
				title: 'Interface',
				pages: [
					{
						title: 'Layouts',
						link: 'data/audit/transactions',
						old: true,
						pages: [
							{ title: 'Entity viewer layouts', link: 'settings/layouts', old: true},
							{ title: 'Dashboard layouts', link: 'dashboard-layouts', old: true},
							{ title: 'Input form layouts', link: 'settings/input-form-layouts', old: true},
							{ title: 'Context menu layouts', link: 'context-menu-layouts', old: true},
							{ title: 'Manual sorting', link: 'manual-sorting-layouts', old: true},

						]
					},
					{ title: 'Notifications', link: 'settings/notifications', old: true},
					{ title: 'Interface complexity', link: 'settings/interface', old: true},
				]
			},
			{
				title: 'Configuration',
				pages: [
					{
						title: 'Data settings',
						link: 'data/audit/transactions',
						old: true,
						pages: [
							{ title: 'Account types', link: 'settings/account-types', old: true},
							{ title: 'Instument types', link: 'settings/instument-types', old: true},
							{ title: 'Transaction types', link: 'settings/transaction-types', old: true},
							{ title: 'User attributes', link: 'settings/entites-custom-attributes', old: true},
							{ title: 'Reference tables', link: 'import/reference-tables', old: true},
							{ title: 'Mapping tables', link: 'import/mapping-tables-import', old: true},
							{ title: 'Templates', link: 'template-layouts', old: true},

						]
					},
					{
						title: 'Data settings',
						link: 'data/audit/transactions',
						old: true,
						pages: [
							{ title: 'Account types', link: 'settings/account-types', old: true},
							{ title: 'Instument types', link: 'settings/instument-types', old: true}
						]
					},
				]
			},
		]
	}

]
