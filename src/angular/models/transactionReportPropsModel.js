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
			value_type: 'field',
			value_entity: 'transaction-class',
			code: 'user_code',
			value_content_type: 'transactions.transactionclass',
			allow_null: false,
		},
		{
			key: 'position_size_with_sign',
			name: 'Position Size with sign',
			value_type: 20,
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
		// {
		//     "key": "principal_amount",
		//     "name": "Principal amount",
		//     "value_type": 20
		// },
		// {
		//     "key": "carry_amount",
		//     "name": "Carry amount",
		//     "value_type": 20
		// },
		// {
		//     "key": "overheads",
		//     "name": "overheads",
		//     "value_type": 20
		// },
		{
			key: 'trade_price',
			name: 'Trade price',
			value_type: 20,
		},

		// Entry Part

		{
			key: 'entry_account',
			name: 'Entry Account',
			value_content_type: 'accounts.account',
			value_entity: 'account',
			code: 'user_code',
			value_type: 'field',
		},

		{
			key: 'entry_strategy',
			name: 'Entry Strategy',
			value_content_type: 'strategies.strategy1',
			value_entity: 'strategy-1',
			code: 'user_code',
			value_type: 'field',
		},

		{
			key: 'entry_currency',
			name: 'Entry Currency',
			value_type: 'field',
			value_entity: 'currency',
			value_content_type: 'currencies.currency',
			code: 'user_code',
		},

		{
			key: 'entry_instrument',
			name: 'Entry Instrument',
			value_content_type: 'instruments.instrument',
			value_entity: 'instrument',
			code: 'user_code',
			value_type: 'field',
		},

		{
			key: 'entry_item_short_name',
			name: 'Entry Item Short Name',
			value_type: 10,
		},

		{
			key: 'entry_item_name',
			name: 'Entry Item Name',
			value_type: 10,
		},

		{
			key: 'entry_item_user_code',
			name: 'Entry Item User Code',
			value_type: 10,
		},

		{
			key: 'entry_item_public_name',
			name: 'Entry Item Public Name',
			value_type: 10,
		},

		{
			key: 'entry_amount',
			name: 'Entry Amount',
			value_type: 20,
		},
		{
			key: 'entry_item_type_name',
			name: 'Entry Item Type',
			value_type: 10,
		},
	]
}

export default {
	getAttributes: getAttributes,
}
