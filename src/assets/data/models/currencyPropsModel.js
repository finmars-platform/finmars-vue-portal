export const currencyAttributes = [
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
		key: 'reference_for_pricing',
		name: 'Reference for pricing',
		value_type: 10
	},
	{
		key: 'default_fx_rate',
		name: 'Default FX rate',
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
		key: 'country',
		name: 'Country',
		value_content_type: 'instruments.country',
		value_entity: 'country',
		code: 'user_code',
		value_type: 'field'
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
