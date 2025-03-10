export const portfolioHistoryAttributes = [
	{
		key: 'id',
		name: 'ID',
		value_type: 20
	},
	{
		key: 'user_code',
		name: 'User code',
		value_type: 10
	},
	{
		key: 'error_message',
		name: 'Error Message',
		value_type: 10
	},
	{
		key: 'status',
		name: 'Status',
		value_type: 10
	},
	{
		key: 'portfolio',
		name: 'Portfolio',
		value_content_type: 'portfolios.portfolio',
		value_entity: 'portfolio',
		code: 'user_code',
		value_type: 'field'
	},
	{
		key: 'currency',
		name: 'Currency',
		value_content_type: 'currencies.currency',
		value_entity: 'currency',
		code: 'user_code',
		value_type: 'field'
	},
	{
		key: 'pricing_policy',
		name: 'Pricing policy',
		value_type: 'field',
		value_entity: 'pricing_policy',
		value_content_type: 'instruments.pricingpolicy',
		code: 'user_code'
	},

	{
		key: 'date',
		name: 'Date',
		value_type: 40
	},

	{
		key: 'date_from',
		name: 'Date From',
		value_type: 40
	},

	{
		key: 'period_type',
		name: 'Period Type',
		value_type: 10
	},

	{
		key: 'nav',
		name: 'NAV',
		value_type: 20
	},
	{
		key: 'gav',
		name: 'GAV',
		value_type: 20
	},
	{
		key: 'total',
		name: 'Total',
		value_type: 20
	},
	{
		key: 'cost_method',
		name: 'Cost Method',
		value_type: 20
	},
	{
		key: 'performance_method',
		name: 'Performance Method',
		value_type: 10
	},
	{
		key: 'benchmark',
		name: 'Benchmark',
		value_type: 10
	},

	{
		key: 'cash_flow',
		name: 'Cash Flow',
		value_type: 20
	},
	{
		key: 'cash_inflow',
		name: 'Cash Inflow',
		value_type: 20
	},

	{
		key: 'cash_outflow',
		name: 'Cash Outflow',
		value_type: 20
	},

	{
		key: 'cumulative_return',
		name: 'Cumulative Return',
		value_type: 20
	},

	{
		key: 'annualized_return',
		name: 'Annualized Return',
		value_type: 20
	},

	{
		key: 'portfolio_volatility',
		name: 'Portfolio Volatility',
		value_type: 20
	},

	{
		key: 'annualized_portfolio_volatility',
		name: 'Annualized Portfolio Volatility',
		value_type: 20
	},

	{
		key: 'sharpe_ratio',
		name: 'Sharpe Ratio',
		value_type: 20
	},

	{
		key: 'max_annualized_drawdown',
		name: 'Max Annualized Drawdown',
		value_type: 20
	},

	{
		key: 'betta',
		name: 'Betta',
		value_type: 20
	},
	{
		key: 'alpha',
		name: 'Alpha',
		value_type: 20
	},
	{
		key: 'correlation',
		name: 'Correlation',
		value_type: 20
	}
];
