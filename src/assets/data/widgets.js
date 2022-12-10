export default [
	{
		id: 'GroupComponent',
		name: 'Group component',
		group: 'system',
		minColls: 4,
		minRows: 4
	},
	{
		id: 'controls',
		name: 'Controls component',
		group: 'system',
		minColls: 4,
		minRows: 4
	},
	{
		id: 'CardsIndicators',
		name: 'Cards indicators',
		group: 'base',
		minColls: 6,
		minRows: 2,
		props: {
			date_to:   {name: 'Date', type: 'string', value: ''},
			portfolio: {name: 'Portfolio', type: 'string', value: ''}
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
		}
	},
	{
		id: 'ChartBalanceDate',
		name: 'Chart balance date',
		group: 'base',
		minColls: 4,
		minRows: 4
	},
	{
		id: 'ChartPnlDate',
		name: 'Chart P&L date',
		group: 'base',
		minColls: 4,
		minRows: 4
	},
]
