export default {
	widgetsStats(data) {
		const STATS = {
			"nav": 'NAV',
			"total": 'Total P&L',
			"cumulative_return": 'Cumulative return',
			"annualized_return": 'Annualized return',
			"portfolio_volatility": 'Ann. Volatility',
			"annualized_portfolio_volatility": 'Annualized portfolio volatility',
			"sharpe_ratio": 'Sharpe ratio (rf=0%)',
			"max_annualized_drawdown": 'Max annualized drawdown',
			"betta": 'Beta',
			"alpha": 'Alpha vs Index, ann.',
			"correlation": 'Correlation (vs. Index)',
		}
		const STATS_FORMAT = {
			"nav": 'currency',
			"total": 'currency',
			"cumulative_return": 'percent',
			"annualized_return": 'percent',
			"portfolio_volatility": 'percent',
			"annualized_portfolio_volatility": 'percent',
			"sharpe_ratio": 'ratio',
			"max_annualized_drawdown": 'percent',
			"betta": 'ratio',
			"alpha": 'percent',
			"correlation": 'ratio'
		}

		delete data.date
		delete data.portfolio
		delete data.benchmark

		let collection = []

		for ( let prop in data ) {
			collection.push({
				id: prop,
				name: STATS[prop],
				type: STATS_FORMAT[prop],
				value: data[prop]
			})
		}

		return collection
	}
}
