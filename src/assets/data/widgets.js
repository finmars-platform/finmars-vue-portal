export default [
	// {
	// 	id: 'GroupComponent',
	// 	name: 'Group component',
	// 	group: 'system',
	// 	minColls: 4,
	// 	minRows: 4,
	// 	props: {
	// 	}
	// },
	{
		uid: null,
		user_code: null,
		name: 'Date control',
		componentName: 'DateControl',
		tab: null,
		scopes: [],

		inputs: [],
		outputs: [
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'date',
				name: 'Date',
				type: 'date',
				view: {
					type: 'date',
				},
				default_value: 'null',
				__val: null,
				_children: [],
			},
		],
		settings: [],
		_group: 'system',
		minColls: 2,
		minRows: 1,
	},
	{
		uid: null,
		user_code: null,
		name: 'Portfolio control',
		componentName: 'PortfolioControl',
		tab: null,
		scopes: [],

		inputs: [],
		outputs: [
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'portfolio',
				name: 'Portfolio',
				type: 'portfolio',
				view: {
					type: 'portfolio',
				},
				default_value: null,
				__val: null,
				_children: [],
			},
		],
		settings: [],
		_group: 'system',
		minColls: 2,
		minRows: 1,
	},
	{
		uid: null,
		user_code: null,
		name: 'Bundle control',
		componentName: 'BundleControl',
		tab: null,
		scopes: [],

		inputs: [],
		outputs: [
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'bundleId',
				name: 'Bundle',
				type: 'bundle',
				view: {
					type: 'bundle',
				},
				default_value: null,
				__val: null,
				_children: [],
			},
		],
		settings: [],
		_group: 'system',
		minColls: 2,
		minRows: 1,
	},
	{
		uid: null,
		user_code: null,
		name: 'Currency control',
		componentName: 'CurrencyControl',
		tab: null,
		scopes: [],

		inputs: [],
		outputs: [
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'currency',
				name: 'Currency',
				type: 'currency',
				view: {
					type: 'currency',
				},
				default_value: null,
				__val: null,
				_children: [],
			},
		],
		settings: [],
		_group: 'system',
		minColls: 2,
		minRows: 1,
	},
	{
		uid: null,
		user_code: null,
		name: 'Debug Component',
		componentName: 'DebugComponent',
		tab: null,
		_group: 'system',
		minColls: 12,
		minRows: 4,
		inputs: [],
		outputs: [],
		settings: []
	},
	{
		uid: null,
		user_code: null,
		name: 'Cards indicators',
		componentName: 'CardsIndicators',
		tab: null,
		scopes: [],

		inputs: [
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'date',
				name: 'Date',
				type: 'date',
				view: {
					type: 'date'
				},
				subscribedTo: [],
				default_value: null,
				__val: null
			},
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'portfolio',
				name: 'Portfolio',
				type: 'portfolio',
				view: {
					type: 'portfolio'
				},
				subscribedTo: [],
				default_value: null,
				__val: null
			}
		],
		outputs: [
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'type',
				name: 'Period type',
				type: 'type_nav_or_pnl',
				default_value: 'nav',
				__val: null,
				_children: [],
			},
		],
		settings: [],

		minColls: 6,
		minRows: 2,
		_group: 'base',
	},
	{
		uid: null,
		user_code: null,
		name: 'Chart balance period',
		componentName: 'ChartBalancePeriod',
		tab: null,
		scopes: [], // Array UID
		settings: [
			{
				name: 'Benchmark',
				view: 'input',
			},
			{
				name: 'Data Source URL',
				view: 'input',
			},
		],
		inputs: [
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'type',
				name: 'NAV or PNL',
				type: 'type_nav_or_pnl',
				view: {
					type: 'select',
					items: [
						{id: 'nav', name: 'NAV'},
						{id: 'pl', name: 'P&L'},
					]
				},
				subscribedTo: [],
				default_value: null,
				__val: null
			},
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'date_from',
				name: 'Date from',
				type: 'date',
				view: {
					type: 'date'
				},
				subscribedTo: [],
				default_value: null,
				__val: null
			},
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'date_to',
				name: 'Date to',
				type: 'date',
				view: {
					type: 'date'
				},
				subscribedTo: [],
				default_value: null,
				__val: null
			},
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'portfolio',
				name: 'Portfolio',
				type: 'portfolio',
				view: {
					type: 'portfolio'
				},
				subscribedTo: [],
				default_value: null,
				__val: null
			}
		],
		outputs: [
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'choosed_category',
				name: 'Choosed category',
				type: 'period_category',
				default_value: null,
				__val: null,
				_children: [],
			},
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'choosed_date',
				name: 'Choosed date',
				type: 'date',
				default_value: null,
				__val: null,
				_children: [],
			}
		],
		minColls: 6,
		minRows: 3,
		_group: 'base'
	},
	{
		uid: null,
		user_code: null,
		name: 'Chart balance date',
		componentName: 'ChartBalanceDate',
		tab: null,
		inputs: [
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'portfolio',
				name: 'Portfolio',
				type: 'portfolio',
				view: {
					type: 'portfolio'
				},
				subscribedTo: [],
				default_value: null,
				__val: null
			},
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'date',
				name: 'Date',
				type: 'date',
				view: {
					type: 'date'
				},
				subscribedTo: [],
				default_value: null,
				__val: null
			},
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'category_type',
				name: 'Category type',
				type: 'period_category',
				view: {
					type: 'input'
				},
				subscribedTo: [],
				default_value: null,
				__val: null
			},
		],
		outputs: [],
		scopes: [],
		settings: [],

		minColls: 4,
		minRows: 4,
		_group: 'base',
	},
	{
		uid: null,
		user_code: null,
		name: 'Chart P&L date',
		componentName: 'ChartPnlDate',

		inputs: [
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'date',
				name: 'Date',
				type: 'date',
				view: {
					type: 'date'
				},
				subscribedTo: [],
				default_value: null,
				__val: null
			},
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'portfolio',
				name: 'Portfolio',
				type: 'portfolio',
				view: {
					type: 'portfolio'
				},
				subscribedTo: [],
				default_value: null,
				__val: null
			},
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'category_type',
				name: 'Category type',
				type: 'period_category',
				view: {
					type: 'input'
				},
				subscribedTo: [],
				default_value: null,
				__val: null
			}
		],
		outputs: [],
		settings: [],
		scopes: [],

		minColls: 4,
		minRows: 4,
		_group: 'base',
	},
	// {
	// 	id: 'Matrix',
	// 	name: 'Matrix',
	// 	group: 'base',
	// 	minColls: 6,
	// 	minRows: 4,
	// 	inputs: [
	// 		{name: 'date', user_code: 'Date', type: 'date', value: '', direct: 'input', subscribedTo: []},
	// 		{name: 'portfolio', user_code: 'Portfolio', type: 'id', value: '', direct: 'input', subscribedTo: []},
	// 	],
	// 	settings: [
	// 		{
	// 			name: 'Absciss',
	// 			propName: '',
	// 			opts: [
	// 				{id: 'nav', name: 'nav'},
	// 				{id: 'pl', name: 'pl'},
	// 			]
	// 		},
	// 		{
	// 			name: 'Ordinate',
	// 			propName: '',
	// 			opts: [
	// 				{id: 'nav', name: 'nav'},
	// 				{id: 'pl', name: 'pl'},
	// 			]
	// 		}
	// 	]
	// },
	{
		uid: null,
		user_code: null,
		name: 'Matrix',
		componentName: 'Matrix',

		inputs: [],
		outputs: [],
		settings: [
			{
				name: 'Absciss',
				propName: '',
			},
			{
				name: 'Ordinate',
				propName: '',
			}
		],

		_group: 'base',
		minColls: 6,
		minRows: 4,
	},
	{
		uid: null,
		user_code: null,
		name: 'Performance Bundles',
		componentName: 'PerformanceBundles',
		tab: null,

		inputs: [
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'begin_date',
				name: 'Date from',
				type: 'date',
				view: {
					type: 'date'
				},
				subscribedTo: [],
				default_value: null,
				__val: null
			},
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'end_date',
				name: 'Date to',
				type: 'date',
				view: {
					type: 'date'
				},
				subscribedTo: [],
				default_value: null,
				__val: null
			},
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'report_currency',
				name: 'Currency',
				type: 'currency',
				view: {
					type: 'currency'
				},
				subscribedTo: [],
				default_value: null,
				__val: null
			}
		],
		outputs: [
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'bundleId',
				name: 'Bundle',
				type: 'bundle',
				view: {
					type: 'bundle'
				},
				default_value: null,
				__val: null,
				_children: [],
			}
		],
		settings: [
			{
				key: 'calculation_type',
				name: 'Calculation type',
				view: {
					type: 'select',
					items: [
						{id: 'time_weighted', name: 'Time-weighted return'},
						{id: 'money_weighted', name: 'Money weighted return'},
					]
				},
				default_value: null
			},
		],

		_group: 'base',
		minColls: 6,
		minRows: 4,
	},
	{
		uid: null,
		user_code: null,
		name: 'Performance Detail',
		componentName: 'PerformanceDetail',
		tab: null,

		inputs: [
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'bundleId',
				name: 'Bundle',
				type: 'bundle',
				view: {
					type: 'bundle'
				},
				subscribedTo: [],
				default_value: null,
				__val: null
			},
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'begin_date',
				name: 'Date from',
				type: 'date',
				view: {
					type: 'date'
				},
				subscribedTo: [],
				default_value: null,
				__val: null
			},
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'end_date',
				name: 'Date to',
				type: 'date',
				view: {
					type: 'date'
				},
				subscribedTo: [],
				default_value: null,
				__val: null
			},
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'report_currency',
				name: 'Currency',
				type: 'currency',
				view: {
					type: 'currency'
				},
				subscribedTo: [],
				default_value: null,
				__val: null
			}
		],
		outputs: [
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'currentBundleYear',
				name: 'Сurrent Bundle Year',
				type: 'bundle_year',
				default_value: null,
				__val: null,
				_children: [],
			}
		],
		settings: [
			{
				key: 'calculation_type',
				name: 'Calculation type',
				view: {
					type: 'select',
					items: [
						{id: 'time_weighted', name: 'Time-weighted return'},
						{id: 'money_weighted', name: 'Money weighted return'},
					]
				},
				default_value: null
			},
		],
		scopes: [],

		minColls: 6,
		minRows: 4,
		_group: 'base',
	},
	{
		uid: null,
		user_code: null,
		name: 'Performance Chart',
		componentName: 'PerformanceChart',
		tab: null,

		inputs: [
			{
				uid: null,
				component_id: null,
				user_code: null,
				key: 'yearData',
				name: 'Year Data',
				type: 'bundle_year',
				subscribedTo: [],
				default_value: null,
				__val: null
			}
		],
		outputs: [],
		settings: [],

		_group: 'base',
		minColls: 6,
		minRows: 4,
	},
]
