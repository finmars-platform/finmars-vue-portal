export const accountTypeAttributes = [
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
		key: 'configuration_code',
		name: 'Configuration code',
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
		key: 'show_transaction_details',
		name: 'Show transaction details',
		value_type: 50,
		allow_null: true
	},
	{
		key: 'transaction_details_expr',
		name: 'Transaction details expr',
		value_type: 10,
		allow_null: true
	},
	{
		key: 'object_permissions',
		name: 'Object permissions',
		value_type: 'mc_field'
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
	}
];
