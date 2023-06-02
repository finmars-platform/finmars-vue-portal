/**
 * Created by szhitenev on 03.04.2017.
 */

var getAttributes = function () {
	return [
		{
			key: 'name',
			name: 'Name',
			value_type: 10,
		},
		{
			key: 'short_name',
			name: 'Short name',
			value_type: 10,
		},
		{
			key: 'user_code',
			name: 'User code',
			value_type: 10,
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
		},
		{
			key: 'accounts',
			name: 'Accounts',
			value_content_type: 'accounts.account',
			value_entity: 'account',
			code: 'user_code',
			value_type: 'mc_field',
		},
		{
			key: 'responsibles',
			name: 'Responsibles',
			value_content_type: 'counterparties.responsible',
			value_entity: 'responsible',
			code: 'user_code',
			value_type: 'mc_field',
		},
		{
			key: 'counterparties',
			name: 'Counterparties',
			value_content_type: 'counterparties.counterparty',
			value_entity: 'counterparty',
			code: 'user_code',
			value_type: 'mc_field',
		},
		{
			key: 'transaction_types',
			name: 'Transaction types',
			value_content_type: 'transactions.transactiontype',
			value_entity: 'transaction-type',
			code: 'user_code',
			value_type: 'mc_field',
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
