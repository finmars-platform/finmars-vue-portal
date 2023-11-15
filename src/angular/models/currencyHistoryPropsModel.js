/**
 * Created by szhitenev on 03.04.2017.
 */

var getAttributes = function () {
    return [
        //{
        //    "key": "name",
        //    "name": "Name",
        //    "value_type": 10
        //},
        //{
        //    "key": "short_name",
        //    "name": "Short name",
        //    "value_type": 10
        //},
        //{
        //    "key": "notes",
        //    "name": "Notes",
        //    "value_type": 10
        //},
        {
            key: 'currency',
            name: 'Currency',
            value_type: 'field',
            value_entity: 'currency',
            value_content_type: '',
            code: 'currencies.currency',
        },
        {
            key: 'date',
            name: 'Date',
            value_type: 40,
        },
        {
            key: 'fx_rate',
            name: 'Fx rate',
            value_type: 20,
        },
        {
            key: 'pricing_policy',
            name: 'Pricing policy',
            value_type: 'field',
            value_entity: 'pricing_policy',
            value_content_type: 'instruments.pricingpolicy',
            code: 'user_code',
        },

        {
            key: 'procedure_modified_datetime',
            name: 'Modified Date And Time',
            value_type: 40,
        },

        //{
        //    "key": "fx_rate_expr",
        //    "name": "fx_rate_expr",
        //    "value_type": 10
        //}
    ]
}

export default {
    getAttributes: getAttributes,
}
