export default [
	{
		id: 'GroupComponent',
		name: 'Group component',
		group: 'system',
		minColls: 4,
		minRows: 4,
		props: {
		}
	},
	{
		id: 'controls',
		name: 'Controls component',
		group: 'system',
		minColls: 4,
		minRows: 4,
		props: {
		}
	},
	{
		id: 'CardsIndicators',
		name: 'Cards indicators',
		group: 'base',
		minColls: 6,
		minRows: 2,
		props: {
			date_to:   {name: 'Date', type: 'string', value: ''},
			portfolio: {name: 'Portfolio', type: 'string', value: ''},
		}
	},
	{
		id: 'ChartBalancePeriod',
		name: 'Chart balance period',
		group: 'base',
		minColls: 6,
		minRows: 3,
		props: {
			benchmark: {name: 'Benchmark', type: 'string', value: ''},
			date_to:   {name: 'Date to', type: 'string', value: ''},
			date_from: {name: 'Date from', type: 'string', value: ''},
			portfolio: {name: 'Portfolio', type: 'string', value: ''}
		},
		settings: [
			{
				name: 'Type',
				propName: '_cbp_type',
				opts: [
					{id: 'nav', name: 'nav'},
					{id: 'pl', name: 'pl'},
				]
			}
		]
	},
	{
		id: 'ChartBalanceDate',
		name: 'Chart balance date',
		group: 'base',
		minColls: 4,
		minRows: 4,
		props: {
			date_to:   {name: 'Date', type: 'string', value: ''},
			portfolio: {name: 'Portfolio', type: 'string', value: ''}
		}
	},
	{
		id: 'ChartPnlDate',
		name: 'Chart P&L date',
		group: 'base',
		minColls: 4,
		minRows: 4,
		props: {
			date_to:   {name: 'Date', type: 'string', value: ''},
			portfolio: {name: 'Portfolio', type: 'string', value: ''}
		}
	},
	{
		id: 'Matrix',
		name: 'Matrix',
		group: 'base',
		minColls: 6,
		minRows: 4,
		props: {
			date_to:   {name: 'Date', type: 'string', value: ''},
			portfolio: {name: 'Portfolio', type: 'string', value: ''}
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
				{name: 'begin_date', type: 'string', value: '', id: 'PerformanceBundles', parents: []},
				{name: 'end_date', type: 'string', value: '', id: 'PerformanceBundles', parents: []},
				{name: 'calculation_type', type: 'string', value: '', id: 'PerformanceBundles', parents: []},
				{name: 'report_currency', type: 'string', value: '', id: 'PerformanceBundles', parents: []},
			],
			outputs: [
				{name: 'bundleId', type: 'number', value: '', id: 'PerformanceBundles', parents: []},
			]
		},
		settings: [

		]
	},
]
