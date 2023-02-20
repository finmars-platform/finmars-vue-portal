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
	// {
	// 	id: 'controls',
	// 	name: 'Controls component',
	// 	group: 'system',
	// 	minColls: 4,
	// 	minRows: 4,
	// 	props: {
	// 	}
	// },
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
			{name: 'type', user_code: 'Period type', type: 'string', direct: 'output', children: [], value: ''},
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
			{name: 'date_to', user_code: 'Date to', type: 'date', value: '', direct: 'input', parents: []},
			{name: 'date_from', user_code: 'Date from', type: 'date', value: '', direct: 'input', parents: []},
			{name: 'portfolio', user_code: 'Portfolio', type: 'id', value: '', direct: 'input', parents: []},
		],
		outputs: [
			{name: 'category_type', user_code: 'Category type', direct: 'output', type: 'string', value: '', children: []},
			{name: 'detail_date', user_code: 'detail_date', type: 'date', direct: 'output', value: '', children: []},
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
			{name: 'category_type', user_code: 'Category type', direct: 'input', type: 'string', value: '', children: []},
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
		],
	},
	{
		id: 'Matrix',
		name: 'Matrix',
		group: 'base',
		minColls: 6,
		minRows: 4,
		props: {
			inputs: [
				{name: 'Date', type: 'date', value: '', id: 'PerformanceBundles', parents: []},
				{name: 'Portfolio', type: 'id', value: '', id: 'PerformanceBundles', parents: []},
			],
		},
		settings: [
			{
				name: 'Absciss',
				propName: '',
				opts: [
					{id: 'nav', name: 'nav'},
					{id: 'pl', name: 'pl'},
				]
			},
			{
				name: 'Ordinate',
				propName: '',
				opts: [
					{id: 'nav', name: 'nav'},
					{id: 'pl', name: 'pl'},
				]
			}
		]
	},
	{
		id: 'PerformanceBundles',
		name: 'PerformanceBundles',
		group: 'base',
		minColls: 6,
		minRows: 4,
		props: {
			inputs: [
				{name: 'begin_date', type: 'date', value: '', id: 'PerformanceBundles', parents: []},
				{name: 'end_date', type: 'date', value: '', id: 'PerformanceBundles', parents: []},
				{name: 'calculation_type', type: 'string', value: '', id: 'PerformanceBundles', parents: []},
				{name: 'report_currency', type: 'number', value: '', id: 'PerformanceBundles', parents: []},
			],
			outputs: [
				{name: 'bundleId', type: 'number', value: '', id: 'PerformanceBundles', parents: []},
			]
		},
		settings: [

		]
	},
]
