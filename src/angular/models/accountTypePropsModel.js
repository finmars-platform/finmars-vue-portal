/**
 * Created by szhitenev on 03.04.2017.
 */

var getAttributes = function () {
	return [
		{
			key: 'name',
			name: 'Name',
			value_type: 10,
			allow_null: false,
		},
		{
			key: 'short_name',
			name: 'Short name',
			value_type: 10,
			allow_null: true,
		},
		{
			key: 'user_code',
			name: 'User code',
			value_type: 10,
			allow_null: true,
		},
		{
			key: 'public_name',
			name: 'Public name',
			value_type: 10,
			allow_null: true,
		},
		{
			key: 'notes',
			name: 'Notes',
			value_type: 10,
			allow_null: true,
		},
		{
			key: 'show_transaction_details',
			name: 'Show transaction details',
			value_type: 50,
			allow_null: true,
		},
		{
			key: 'transaction_details_expr',
			name: 'Transaction details expr',
			value_type: 10,
			allow_null: true,
		},
		{
			key: 'object_permissions',
			name: 'Object permissions',
			value_type: 'mc_field',
		},
	]
}

export default {
	getAttributes: getAttributes,
}
