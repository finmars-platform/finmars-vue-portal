/**
 * Created by szhitenev on 03.04.2017.
 */

var getAttributes = function () {
    return [
        //{
        //    "key": "account_cash",
        //    "name": "Account cash",
        //    "value_type": "field"
        //},
        //{
        //    "key": "account_interim",
        //    "name": "Account interim",
        //    "value_type": "field"
        //},
        //{
        //    "key": "account_position",
        //    "name": "Account position",
        //    "value_type": "field"
        //},
        //{
        //    "key": "allocation_balance",
        //    "name": "Allocation balance", // link to instrument
        //    "value_type": "field"
        //},
        //{
        //    "key": "allocation_pl",
        //    "name": "Allocation pl", // link to instrument
        //    "value_type": "field"
        //},
        //{
        //    "key": "carry_with_sign",
        //    "name": "Carry with sign",
        //    "value_type": 20
        //},
        {
            key: 'item_type_name',
            name: 'Item Type',
            value_type: 10,
        },
        {
            key: 'cash_consideration',
            name: 'Cash consideration',
            value_type: 20,
        },
        {
            key: 'cash_consideration_after',
            name: 'Cash consideration after',
            value_type: 20,
        },
        {
            key: 'cash_consideration_before',
            name: 'Cash consideration before',
            value_type: 20,
        },
        //{
        //    "key": "cash_date",
        //    "name": "Cash date",
        //    "value_type": 40
        //},
        //{
        //    "key": "complex-transaction",
        //    "name": "Complex transaction",
        //    "value_type": "field"
        //},
        //{
        //    "key": "counterparty",
        //    "name": "Counterparty",
        //    "value_type": "field"
        //},
        //{
        //    "key": "instrument",
        //    "name": "Instrument",
        //    "value_type": "field"
        //},
        //{
        //    "key": "linked_instrument",
        //    "name": "Linked Instrument",
        //    "value_type": "field"
        //},
        //{
        //    "key": "overheads_with_sign",
        //    "name": "Overheads with sign",
        //    "value_type": 20
        //},
        //{
        //    "key": "portfolio",
        //    "name": "Portfolio",
        //    "value_type": "field"
        //},
        //{
        //    "key": "reference_fx_rate",
        //    "name": "Reference fx rate",
        //    "value_type": 20
        //},
        //{
        //    "key": "responsible",
        //    "name": "Responsible",
        //    "value_type": "field"
        //},
        //{
        //    "key": "settlement_currency",
        //    "name": "Settlement currency",
        //    "value_type": "field"
        //},
        //{
        //    "key": "strategy1_cash",
        //    "name": "Strategy 1 cash",
        //    "value_type": "field"
        //},
        //{
        //    "key": "strategy1_position",
        //    "name": "Strategy 1 position",
        //    "value_type": "field"
        //},
        //{
        //    "key": "strategy2_cash",
        //    "name": "Strategy 2 cash",
        //    "value_type": "field"
        //},
        //{
        //    "key": "strategy2_position",
        //    "name": "Strategy 2 position",
        //    "value_type": "field"
        //},
        //{
        //    "key": "strategy3_cash",
        //    "name": "Strategy 3 cash",
        //    "value_type": "field"
        //},
        //{
        //    "key": "strategy3_position",
        //    "name": "Strategy 3 position",
        //    "value_type": "field"
        //},
        //{
        //    "key": "transaction_class",
        //    "name": "Transaction class",
        //    "value_type": "field"
        //},
        //{
        //    "key": "transaction_code",
        //    "name": "Transaction code",
        //    "value_type": 20
        //},
        //{
        //    "key": "transaction_currency",
        //    "name": "Transaction currency",
        //    "value_type": "field"
        //},
        //{
        //    "key": "transaction_date",
        //    "name": "Transaction date",
        //    "value_type": 40
        //}
    ]
}

export default {
    getAttributes: getAttributes,
}
