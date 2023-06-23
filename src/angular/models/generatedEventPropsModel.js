/**
 * Created by szhitenev on 18.11.2021.
 */

var getAttributes = function () {
	return [
		{
			key: 'effective_date',
			name: 'Effective Date',
			value_type: 40,
		},
		{
			key: 'effective_date_notified',
			name: 'Effective Date Notified',
			value_type: 40,
		},
		{
			key: 'notification_date',
			name: 'Notification Date',
			value_type: 40,
		},
		{
			key: 'notification_date_notified',
			name: 'Notification Date Notified',
			value_type: 40,
		},
		{
			key: 'status_date',
			name: 'Status Date',
			value_type: 40,
		},
		{
			key: 'status',
			name: 'Status',
			value_type: 20,
		},
		{
			key: 'transaction_type',
			name: 'Transaction Type',
			value_type: 'field',
			value_entity: 'transaction-type',
			code: 'user_code',
			value_content_type: 'transactions.transactiontype',
			allow_null: false,
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
			key: 'instrument',
			name: 'Instrument',
			value_content_type: 'instruments.instrument',
			value_entity: 'instrument',
			code: 'user_code',
			value_type: 'field',
		},
		{
			key: 'account',
			name: 'Account',
			value_content_type: 'accounts.account',
			value_entity: 'account',
			code: 'user_code',
			value_type: 'field',
		},

		{
			key: 'strategy1',
			name: 'Strategy1',
			value_content_type: 'strategies.strategy1',
			value_entity: 'strategy-1',
			code: 'user_code',
			value_type: 'field',
		},
		{
			key: 'strategy2',
			name: 'Strategy2',
			value_content_type: 'strategies.strategy2',
			value_entity: 'strategy-2',
			code: 'user_code',
			value_type: 'field',
		},
		{
			key: 'strategy3',
			name: 'Strategy3',
			value_content_type: 'strategies.strategy3',
			value_entity: 'strategy-3',
			code: 'user_code',
			value_type: 'field',
		},
		{
			key: 'event_schedule',
			name: 'Event schedule',
			value_type: 'field',
		},
	]
}

export default {
	getAttributes: getAttributes,
}
