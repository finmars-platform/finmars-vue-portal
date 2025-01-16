export const instrumentAttributes = [
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
		key: 'user_code',
		name: 'User code',
		value_type: 10
	},
	{
		key: 'public_name',
		name: 'Public name',
		value_type: 10
	},
	{
		key: 'notes',
		name: 'Notes',
		value_type: 10
	},
	{
		key: 'instrument_type',
		name: 'Instrument type',
		value_type: 'field',
		value_content_type: 'instruments.instrumenttype',
		value_entity: 'instrument-type',
		code: 'user_code'
	},
	{
		key: 'is_active',
		name: 'Is active',
		value_type: 50
	},
	{
		key: 'has_linked_with_portfolio',
		name: 'Has linked with portfolio',
		value_type: 50
	},
	{
		key: 'reference_for_pricing',
		name: 'Reference for pricing',
		value_type: 10
	},
	{
		key: 'pricing_currency',
		name: 'Pricing currency',
		value_content_type: 'currencies.currency',
		value_entity: 'currency',
		code: 'user_code',
		value_type: 'field'
	},
	{
		key: 'price_multiplier',
		name: 'Price multiplier',
		value_type: 20
	},
	{
		key: 'position_reporting',
		name: 'Position reporting',
		value_content_type: 'instruments.positionreporting',
		value_entity: 'position-reporting',
		value_type: 'field'
	},
	{
		key: 'accrued_currency',
		name: 'Accrued currency',
		value_content_type: 'currencies.currency',
		value_entity: 'currency',
		code: 'user_code',
		value_type: 'field'
	},
	{
		key: 'maturity_date',
		name: 'Maturity date',
		value_type: 40
	},
	{
		key: 'maturity_price',
		name: 'Maturity price',
		value_type: 20
	},
	{
		key: 'accrued_multiplier',
		name: 'Accrued multiplier',
		value_type: 20
	},
	{
		key: 'pricing_condition',
		name: 'Pricing Condition',
		value_content_type: 'instruments.pricingcondition',
		value_entity: 'pricing-condition',
		code: 'user_code',
		value_type: 'field'
	},
	{
		key: 'payment_size_detail',
		name: 'Accrual Size Clarification',
		value_content_type: 'instruments.paymentsizedetail',
		value_entity: 'payment-size-detail',
		code: 'user_code',
		value_type: 'field'
	},
	{
		key: 'default_price',
		name: 'Default price',
		value_type: 20
	},
	{
		key: 'default_accrued',
		name: 'Default accrued',
		value_type: 20
	},
	{
		key: 'user_text_1',
		name: 'User text 1',
		value_type: 10
	},
	{
		key: 'user_text_2',
		name: 'User text 2',
		value_type: 10
	},
	{
		key: 'user_text_3',
		name: 'User text 3',
		value_type: 10
	},
	{
		key: 'object_permissions',
		name: 'Object permissions',
		value_type: 'mc_field'
	},

	{
		key: 'underlying_long_multiplier',
		name: 'Underlying long multiplier',
		value_type: 20
	},
	{
		key: 'underlying_short_multiplier',
		name: 'Underlying short multiplier',
		value_type: 20
	},

	{
		key: 'co_directional_exposure_currency',
		name: 'Exposure Co-Directional Currency',
		value_content_type: 'currencies.currency',
		value_entity: 'currency',
		code: 'user_code',
		value_type: 'field'
	},
	{
		key: 'counter_directional_exposure_currency',
		name: 'Exposure Counter-Directional Currency',
		value_content_type: 'currencies.currency',
		value_entity: 'currency',
		code: 'user_code',
		value_type: 'field'
	},
	{
		key: 'long_underlying_exposure',
		name: 'Long Underlying Exposure',
		value_content_type: 'instruments.longunderlyingexposure',
		value_entity: 'long-underlying-exposure',
		value_type: 'field'
	},
	{
		key: 'short_underlying_exposure',
		name: 'Short Underlying Exposure',
		value_content_type: 'instruments.shortunderlyingexposure',
		value_entity: 'short-underlying-exposure',
		value_type: 'field'
	},
	{
		key: 'exposure_calculation_model',
		name: 'Exposure Calculation Model',
		value_content_type: 'instruments.exposurecalculationmodel',
		value_entity: 'exposure-calculation-model',
		value_type: 'field'
	},

	{
		key: 'long_underlying_instrument',
		name: 'Long Underlying Instrument',
		value_content_type: 'instruments.instrument',
		value_entity: 'instrument',
		value_type: 'field'
	},
	{
		key: 'short_underlying_instrument',
		name: 'Short Underlying Instrument',
		value_content_type: 'instruments.instrument',
		value_entity: 'instrument',
		value_type: 'field'
	},
	{
		key: 'country',
		name: 'Country',
		value_content_type: 'instruments.country',
		value_entity: 'country',
		code: 'user_code',
		value_type: 'field'
	},
	{
		key: 'identifier',
		name: 'Identifier',
		value_type: 'json'
	},
	{
		key: 'first_transaction_date',
		name: 'First Transaction Date',
		value_type: 40,
		readonly: true,
		allow_null: true
	},
	{
		key: 'created_at',
		name: 'Created At',
		value_type: 80,
		readonly: true
	},
	{
		key: 'modified_at',
		name: 'Modified At',
		value_type: 80,
		readonly: true
	},
	{
		key: 'deleted_at',
		name: 'Delete At',
		value_type: 40,
		readonly: true
	},
	{
		key: 'resource_groups',
		name: 'Resource Groups',
		value_type: 'mc_field',
		value_content_type: 'iam.resourcegroup',
		value_entity: 'resource-group',
		code: 'user_code'
	}
];
