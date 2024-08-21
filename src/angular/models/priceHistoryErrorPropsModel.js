/**
 * Created by szhitenev on 03.04.2017.
 */

var getAttributes = function () {
    return [
        {
            key: 'instrument',
            name: 'Instrument',
            value_content_type: 'instruments.instrument',
            value_entity: 'instrument',
            code: 'user_code',
            value_type: 'field',
        },
        {
            key: 'date',
            name: 'Date',
            value_type: 40,
        },
        {
            key: 'pricing_policy',
            name: 'Pricing policy',
            value_content_type: 'instruments.pricingpolicy',
            value_entity: 'pricing_policy',
            code: 'user_code',
            value_type: 'field',
        },
        {
            key: 'principal_price',
            name: 'Principal price',
            value_type: 20,
        },
        {
            key: 'accrued_price',
            name: 'Accrued price',
            value_type: 20,
        },
        {
            key: 'error_text',
            name: 'Error Text',
            value_type: 10,
        },
        {
            key: 'accrual_error_text',
            name: 'Accrual Error Text',
            value_type: 10,
        },
        {
            key: 'price_error_text',
            name: 'Price Error Text',
            value_type: 10,
        },
        {
            key: 'pricing_scheme',
            name: 'Pricing Scheme',
            value_content_type: 'pricing.instrumentpricingscheme',
            value_entity: 'pricing_scheme',
            code: 'user_code',
            value_type: 'field',
        },
        {
            key: 'procedure_instance',
            name: 'Procedure',
            value_content_type: 'pricing.procedureinstance',
            value_entity: 'procedure_instance',
            code: 'name',
            value_type: 'field',
        },
        {
            key: 'status',
            name: 'Status',
            value_type: 10,
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
