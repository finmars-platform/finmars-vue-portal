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
		id: 'DateControl',
		name: 'Date control',
		group: 'system',
		minColls: 2,
		minRows: 1,
		inputs: [
		],
		outputs: [
			{name: 'date', user_code: 'Date', type: 'date', direct: 'output', value: ''},
		],
		settings: []
	},
	{
		id: 'DebugComponent',
		name: 'Debug Component',
		group: 'system',
		minColls: 6,
		minRows: 4,
		inputs: [
		],
		outputs: [
		],
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
		id: 'ChartBalanceDate',
		name: 'Chart balance date',
		group: 'base',
		minColls: 4,
		minRows: 4,
		inputs: [
			{name: 'date', user_code: 'Date', type: 'date', value: '', direct: 'input', subscribedTo: []},
			{name: 'portfolio', user_code: 'Portfolio', type: 'id', value: '', direct: 'input', subscribedTo: []},
			{name: 'category_type', user_code: 'Category type', direct: 'input', type: 'string', value: '', subscribedTo: []},
		],
		outputs: []
	},
	{
		id: 'ChartPnlDate',
		name: 'Chart P&L date',
		group: 'base',
		minColls: 4,
		minRows: 4,
		inputs: [
			{name: 'date', user_code: 'Date', type: 'date', value: '', direct: 'input', subscribedTo: []},
			{name: 'portfolio', user_code: 'Portfolio', type: 'id', value: '', direct: 'input', subscribedTo: []},
			{name: 'category_type', user_code: 'Category type', direct: 'input', type: 'string', value: '', subscribedTo: []},
		],
		outputs: []
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
		id: 'PerformanceBundles',
		name: 'PerformanceBundles',
		group: 'base',
		minColls: 6,
		minRows: 4,
		inputs: [
			{name: 'begin_date', user_code: 'Date', type: 'date', value: '', direct: 'input', subscribedTo: []},
			{name: 'end_date', user_code: 'Date', type: 'date', value: '', direct: 'input', subscribedTo: []},
			{name: 'calculation_type', user_code: 'Date', type: 'calculation_type', value: '', direct: 'input', subscribedTo: []},
			{name: 'report_currency', user_code: 'Date', type: 'currency_id', value: '', direct: 'input', subscribedTo: []},
		],
		outputs: [
			{name: 'bundleId', user_code: 'Bundle id', type: 'bundle_id', direct: 'output', value: ''},
		],
		settings: []
	},
	{
		id: 'PerformanceDetail',
		name: 'PerformanceDetail',
		group: 'base',
		minColls: 6,
		minRows: 4,
		inputs: [
			{name: 'currentBundle', user_code: 'currentBundle', type: 'bundle_id', value: '', direct: 'input', subscribedTo: []},
			{name: 'begin_date', user_code: 'begin_date', type: 'date', value: '', direct: 'input', subscribedTo: []},
			{name: 'end_date', user_code: 'end_date', type: 'date', value: '', direct: 'input', subscribedTo: []},
			{name: 'calculation_type', user_code: 'calculation_type', type: 'calculation_type', value: '', direct: 'input', subscribedTo: []},
			{name: 'report_currency', user_code: 'report_currency', type: 'currency_id', value: '', direct: 'input', subscribedTo: []},
		],
		outputs: [
			{name: 'currentBundleYear', user_code: 'currentBundleYear', type: 'bundle_year', direct: 'output', value: ''},
		],
		settings: []
	},
	{
		id: 'PerformanceChart',
		name: 'Performance Chart',
		group: 'base',
		minColls: 6,
		minRows: 4,
		inputs: [
			{name: 'yearData', user_code: 'Year Data', type: 'bundle_year', direct: 'input', value: {}},
		],
		outputs: [],
		settings: []
	},
]
