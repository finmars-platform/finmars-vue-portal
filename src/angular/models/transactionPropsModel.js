/**
 * Created by szhitenev on 03.04.2017.
 */

var getAttributes = function () {
	return [
		{
			key: 'notes',
			name: 'Notes',
			value_type: 10,
		},
		{
			key: 'transaction_code',
			name: 'Transaction Code',
			value_type: 20,
		},
		{
			key: 'transaction_class',
			name: 'Transaction class',
			value_content_type: 'transactions.transactionclass',
			value_entity: 'transaction_class',
			code: 'user_code',
			value_type: 'field',
		},
		{
			key: 'portfolio',
			name: 'Portfolio',
			value_content_type: 'portfolios.portfolio',
			value_entity: 'portfolio',
			code: 'user_code',
			value_type: 'field',
		},
		{
			key: 'transaction_currency',
			name: 'Transaction currency',
			value_type: 'field',
		},
		{
			key: 'instrument',
			name: 'Instrument',
			value_content_type: 'instruments.instrument',
			value_entity: 'instrument',
			code: 'user_code',
			value_type: 'field',
		},
		{
			key: 'position_size_with_sign',
			name: 'Position Size with sign',
			value_type: 20,
		},
		{
			key: 'settlement_currency',
			name: 'Settlement currency',
			value_type: 'field',
		},
		{
			key: 'cash_consideration',
			name: 'Cash consideration',
			value_type: 20,
		},
		{
			key: 'principal_with_sign',
			name: 'Principal with sign',
			value_type: 20,
		},
		{
			key: 'carry_with_sign',
			name: 'Carry with sign',
			value_type: 20,
		},
		{
			key: 'overheads_with_sign',
			name: 'Overheads with sign',
			value_type: 20,
		},
		{
			key: 'accounting_date',
			name: 'Accounting date',
			value_type: 40,
		},
		{
			key: 'cash_date',
			name: 'Cash date',
			value_type: 40,
		},
		//{
		//    "key": "transaction_date",
		//    "name": "Transaction date",
		//    "value_type": 40
		//},
		{
			key: 'account_cash',
			name: 'Account cash',
			value_type: 'field',
		},
		{
			key: 'account_position',
			name: 'Account position',
			value_type: 'field',
		},
		{
			key: 'account_interim',
			name: 'Account interim',
			value_type: 'field',
		},
		{
			key: 'strategy1_position',
			name: 'Strategy1 position',
			value_type: 'field',
		},
		{
			key: 'strategy1_cash',
			name: 'Strategy1 cash',
			value_type: 'field',
		},
		{
			key: 'strategy2_position',
			name: 'Strategy2 position',
			value_type: 'field',
		},
		{
			key: 'strategy2_cash',
			name: 'Strategy2 cash',
			value_type: 'field',
		},
		{
			key: 'strategy3_position',
			name: 'Strategy3 position',
			value_type: 'field',
		},
		{
			key: 'strategy3_cash',
			name: 'Strategy3 cash',
			value_type: 'field',
		},
		{
			key: 'reference_fx_rate',
			name: 'Reference fx rate',
			value_type: 20,
		},
		{
			key: 'is_locked',
			name: 'Is locked',
			value_type: 50,
		},
		{
			key: 'is_canceled',
			name: 'Is canceled',
			value_type: 50,
		},
		{
			key: 'factor',
			name: 'Factor',
			value_type: 20,
		},
		{
			key: 'principal_amount',
			name: 'Principal amount',
			value_type: 20,
		},
		{
			key: 'carry_amount',
			name: 'Carry amount',
			value_type: 20,
		},
		{
			key: 'overheads',
			name: 'overheads',
			value_type: 20,
		},
		{
			key: 'responsible',
			name: 'Responsible',
			value_content_type: 'counterparties.responsible',
			value_entity: 'responsible',
			code: 'user_code',
			value_type: 'field',
		},
		{
			key: 'counterparty',
			name: 'Counterparty',
			value_content_type: 'counterparties.counterparty',
			value_entity: 'counterparty',
			code: 'user_code',
			value_type: 'field',
		},
		{
			key: 'trade_price',
			name: 'Trade price',
			value_type: 20,
		},
		{
			key: 'object_permissions_user',
			name: 'Users permissions',
			value_type: 'mc_field',
		},
		{
			key: 'object_permissions_group',
			name: 'Groups permissions',
			value_type: 'mc_field',
		},
		{
			key: 'allocation_balance',
			name: 'Allocation Balance',
			value_content_type: 'instruments.instrument',
			value_entity: 'instrument',
			code: 'user_code',
			value_type: 'field',
		},
		{
			key: 'allocation_pl',
			name: 'Allocation P&L',
			value_content_type: 'instruments.instrument',
			value_entity: 'instrument',
			code: 'user_code',
			value_type: 'field',
		},
		{
			key: 'linked_instrument',
			name: 'Linked instrument',
			value_content_type: 'instruments.instrument',
			value_entity: 'instrument',
			code: 'user_code',
			value_type: 'field',
		},
	]
}

export default {
	getAttributes: getAttributes,
}
