/**
 * Created by szhitenev on 03.04.2017.
 */

var getAttributes = function () {
    return [
        {
            key: 'portfolio',
            name: 'Portfolio',
            value_content_type: 'portfolios.portfolio',
            value_entity: 'portfolio',
            code: 'user_code',
            value_type: 'field',
        },
        {
            key: 'instrument',
            name: 'Instrument',
            value_content_type: 'instruments.instrument',
            value_entity: 'instrument',
            code: 'user_code',
            value_type: 'field',
        },

        {
            key: 'transaction_class',
            name: 'Transaction Class',
            value_type: 'field',
            value_entity: 'transaction-class',
            value_content_type: 'transactions.transactionclass',
            code: 'user_code',
            allow_null: false,
        },
        {
            key: 'transaction_code',
            name: 'Transaction code',
            value_type: 20,
        },
        {
            key: 'transaction_date',
            name: 'Transaction date',
            value_type: 40,
        },
        {
            key: 'cash_amount',
            name: 'Cash amount',
            value_type: 20,
        },
        {
            key: 'cash_currency',
            name: 'Cash currency',
            value_content_type: 'currencies.currency',
            value_entity: 'currency',
            code: 'user_code',
            value_type: 'field',
        },
        {
            key: 'fx_rate',
            name: 'FX rate',
            value_type: 20,
        },
        {
            key: 'cash_amount_valuation_currency',
            name: 'Cash Amount Valuation Currency',
            value_type: 20,
        },
        {
            key: 'valuation_currency',
            name: 'Valuation currency',
            value_content_type: 'currencies.currency',
            value_entity: 'currency',
            code: 'user_code',
            value_type: 'field',
        },
        {
            key: 'nav_previous_day_valuation_currency',
            name: 'Nav Previous day Valuation Currency',
            value_type: 20,
        },
        {
            key: 'n_shares_previous_day',
            name: 'N Shares previous day',
            value_type: 20,
        },
        {
            key: 'n_shares_added',
            name: 'N Shares Added',
            value_type: 20,
        },
        {
            key: 'dealing_price_valuation_currency',
            name: 'Dealing Price Valuation Currency',
            value_type: 20,
        },
        {
            key: 'rolling_shares_of_the_day',
            name: 'Rolling shares of the day',
            value_type: 20,
        },
        {
            key: 'portfolio_register',
            name: 'Portfolio Register',
            value_type: 'field',
            value_entity: 'portfolio-register',
            value_content_type: 'portfolios.portfolioregister',
            code: 'user_code',
            allow_null: false,
        },
        {
            key: 'created_at',
            name: 'Created',
            value_type: 40,
        },

        {
            key: 'modified_at',
            name: 'Modified',
            value_type: 40,
        },
    ]
}

export default {
    getAttributes: getAttributes,
}
