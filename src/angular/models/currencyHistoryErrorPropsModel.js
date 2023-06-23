/**
 * Created by szhitenev on 03.04.2017.
 */

var getAttributes = function () {
	return [
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
			key: 'pricing_scheme',
			name: 'Pricing Scheme',
			value_content_type: 'pricing.currencypricingscheme',
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
			key: 'error_text',
			name: 'Error Text',
			value_type: 10,
		},
		{
			key: 'status',
			name: 'Status',
			value_type: 10,
		},

		{
			key: 'created',
			name: 'Created',
			value_type: 40,
		},

		{
			key: 'modified',
			name: 'Modified',
			value_type: 40,
		},
	]
}

export default {
	getAttributes: getAttributes,
}
