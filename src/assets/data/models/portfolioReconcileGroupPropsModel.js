export const portfolioReconcileGroupAttributes = [
	{
		key: 'id',
		name: 'ID',
		value_type: 20
	},
	{
		key: 'name',
		name: 'Name',
		value_type: 10,
		allow_null: false
	},
	{
		key: 'short_name',
		name: 'Short name',
		value_type: 10,
		allow_null: true
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
		key: 'notes',
		name: 'Notes',
		value_type: 10,
		allow_null: true
	},
	{
		key: 'is_active',
		name: 'Is active',
		value_type: 50,
		allow_null: true
	},
	{
		key: 'portfolios',
		name: 'Portfolios',
		value_type: 'mc_field',
		value_content_type: 'portfolios.portfolio',
		value_entity: 'portfolio',
		code: 'user_code',
		allow_null: false
	}
];
