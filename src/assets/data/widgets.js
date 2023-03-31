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
		id: 'CardsIndicators',
		name: 'Cards indicators',
		group: 'base',
		minColls: 6,
		minRows: 2,
		inputs: [
			{name: 'date', user_code: 'Date', type: 'date', value: '', direct: 'input', parents: []},
			{name: 'portfolio', user_code: 'Portfolio', type: 'id', direct: 'input', value: '', parents: []},
		],
		outputs: [
			{name: 'type', user_code: 'Period type', type: 'string', direct: 'output', value: ''},
		],
		settings: []
	},
	{
		id: 'ChartBalancePeriod',
		name: 'Chart balance period',
		group: 'base',
		minColls: 6,
		minRows: 3,
		inputs: [
			{name: 'type', user_code: 'Period type', type: 'string', direct: 'input', parents: []},
			{name: 'benchmark', user_code: 'Benchmark', type: 'string', direct: 'input', parents: []},
			{name: 'data_source', user_code: 'Data Source URL', type: 'string', direct: 'input', parents: []},
			{name: 'date_to', user_code: 'Date to', type: 'date', value: '', direct: 'input', parents: []},
			{name: 'date_from', user_code: 'Date from', type: 'date', value: '', direct: 'input', parents: []},
			{name: 'portfolio', user_code: 'Portfolio', type: 'id', value: '', direct: 'input', parents: []},
		],
		outputs: [
			{name: 'category_type', user_code: 'Category type', direct: 'output', type: 'string', value: ''},
			{name: 'detail_date', user_code: 'detail_date', type: 'date', direct: 'output', value: ''},
		],
		settings: []
	},
	{
		id: 'ChartBalanceDate',
		name: 'Chart balance date',
		group: 'base',
		minColls: 4,
		minRows: 4,
		inputs: [
			{name: 'date', user_code: 'Date', type: 'date', value: '', direct: 'input', parents: []},
			{name: 'portfolio', user_code: 'Portfolio', type: 'id', value: '', direct: 'input', parents: []},
			{name: 'category_type', user_code: 'Category type', direct: 'input', type: 'string', value: '', parents: []},
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
			{name: 'date', user_code: 'Date', type: 'date', value: '', direct: 'input', parents: []},
			{name: 'portfolio', user_code: 'Portfolio', type: 'id', value: '', direct: 'input', parents: []},
			{name: 'category_type', user_code: 'Category type', direct: 'input', type: 'string', value: '', parents: []},
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
	// 		{name: 'date', user_code: 'Date', type: 'date', value: '', direct: 'input', parents: []},
	// 		{name: 'portfolio', user_code: 'Portfolio', type: 'id', value: '', direct: 'input', parents: []},
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
			{name: 'begin_date', user_code: 'Date', type: 'date', value: '', direct: 'input', parents: []},
			{name: 'end_date', user_code: 'Date', type: 'date', value: '', direct: 'input', parents: []},
			{name: 'calculation_type', user_code: 'Date', type: 'calculation_type', value: '', direct: 'input', parents: []},
			{name: 'report_currency', user_code: 'Date', type: 'currency_id', value: '', direct: 'input', parents: []},
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
			{name: 'currentBundle', user_code: 'currentBundle', type: 'bundle_id', value: '', direct: 'input', parents: []},
			{name: 'begin_date', user_code: 'begin_date', type: 'date', value: '', direct: 'input', parents: []},
			{name: 'end_date', user_code: 'end_date', type: 'date', value: '', direct: 'input', parents: []},
			{name: 'calculation_type', user_code: 'calculation_type', type: 'calculation_type', value: '', direct: 'input', parents: []},
			{name: 'report_currency', user_code: 'report_currency', type: 'currency_id', value: '', direct: 'input', parents: []},
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
