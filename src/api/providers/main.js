export default {
    widgetsStats(data) {
        const STATS = {
            "nav": 'NAV',
            "total": 'Total P&L',
            "cumulative_return": 'Cumulative return',
            "annualized_return": 'Annualized return',
            "portfolio_volatility": 'Portfolio Volatility',
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
    },
    widgetsHistory(data) {
        let dates = new Map()
        let categories = new Set()
        let instrumentsByCategory = {}
        let instruments = new Set()
        let values = {}
        let totals = {}

        data.items.forEach(date => {
            dates.set(date.date, date.nav || date.total)

            date.categories.forEach(category => {
                categories.add(category.name)

                category.items.forEach(instrument => {
                    if ( !instrumentsByCategory[category.name] )
                        instrumentsByCategory[category.name] = new Set()

                    instrumentsByCategory[category.name].add(instrument.name)

                    if ( !totals[category.name+instrument.name] )
                        totals[category.name+instrument.name] = 0

                    values[category.name+date.date+instrument.name] = instrument.value
                    totals[category.name+instrument.name] += instrument.value
                })
            })
        })

        let newData = {}

        for ( let category in instrumentsByCategory ) {
            let instruments = instrumentsByCategory[category]

            newData[category] = {}

            dates.forEach((total, date) => {
                newData[category][date] = {
                    items: {},
                    total: null
                }

                instruments.forEach(instr => {
                    if ( !totals[category+instr] ) return false

                    newData[category][date].items[instr] = values[category+date+instr] !== undefined
                        ? values[category+date+instr]
                        : null

                    newData[category][date].total = total
                })
            })
        }

        return newData
    }
}
