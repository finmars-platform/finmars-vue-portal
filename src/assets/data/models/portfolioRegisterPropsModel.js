export const portfolioRegisterAttributes = [
	{
		key: 'id',
		name: 'ID',
		value_type: 20
	},
	{
		key: 'name',
		name: 'Name',
		value_type: 10
	},
	{
		key: 'short_name',
		name: 'Short name',
		value_type: 10
	},
	{
		key: 'notes',
		name: 'Notes',
		value_type: 10
	},
	{
		key: 'user_code',
		name: 'User code',
		value_type: 10
	},
	{
		key: 'public_name',
		name: 'Public name',
		value_type: 10,
		allow_null: true
	},
	{
		key: 'object_permissions',
		name: 'Object permissions',
		value_type: 'mc_field'
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
		key: 'valuation_currency',
		name: 'Valuation currency',
		value_content_type: 'currencies.currency',
		value_entity: 'currency',
		code: 'user_code',
		value_type: 'field'
	},
	{
		key: 'valuation_pricing_policy',
		name: 'Pricing policy',
		value_type: 'field',
		value_entity: 'pricing_policy',
		value_content_type: 'instruments.pricingpolicy',
		code: 'user_code'
	},
	{
		key: 'linked_instrument',
		name: 'Linked Instrument',
		value_content_type: 'instruments.instrument',
		value_entity: 'instrument',
		code: 'user_code',
		value_type: 'field'
	},
	{
		key: 'default_price',
		name: 'Default Price',
		value_type: 20
	}
];
