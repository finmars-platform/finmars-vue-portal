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
			key: 'is_active',
			name: 'Is active',
			value_type: 50,
			allow_null: true,
		},
		{
			key: 'instrument_class',
			name: 'Instrument class',
			value_type: 'field',
			value_content_type: 'instruments.instrumentclass',
			value_entity: 'instrument-class',
			code: 'user_code',
			allow_null: false,
		},
		{
			key: 'one_off_event',
			name: 'One off event',
			value_type: 'field',
			value_entity: 'transaction-type',
			value_content_type: 'transactions.transactiontype',
			code: 'user_code',
			allow_null: false,
		},
		{
			key: 'regular_event',
			name: 'Regular event',
			value_type: 'field',
			value_entity: 'transaction-type',
			value_content_type: 'transactions.transactiontype',
			code: 'user_code',
			allow_null: false,
		},
		{
			key: 'factor_same',
			name: 'Factor same',
			value_type: 'field',
			value_entity: 'transaction-type',
			value_content_type: 'transactions.transactiontype',
			code: 'user_code',
			allow_null: false,
		},
		{
			key: 'factor_up',
			name: 'Factor up',
			value_type: 'field',
			value_entity: 'transaction-type',
			value_content_type: 'transactions.transactiontype',
			code: 'user_code',
			allow_null: false,
		},
		{
			key: 'factor_down',
			name: 'Factor down',
			value_type: 'field',
			value_entity: 'transaction-type',
			value_content_type: 'transactions.transactiontype',
			code: 'user_code',
			allow_null: false,
		},
		{
			key: 'has_second_exposure_currency',
			name: 'Has second exposure currency',
			value_type: 50,
		},
		{
			key: 'object_permissions',
			name: 'Object permissions',
			value_type: 'mc_field',
		},

		//# region Exposure
		{
			key: 'underlying_long_multiplier',
			name: 'Underlying long multiplier',
			value_type: 20,
		},
		{
			key: 'underlying_short_multiplier',
			name: 'Underlying short multiplier',
			value_type: 20,
		},

		{
			key: 'co_directional_exposure_currency',
			name: 'Exposure Co-Directional Currency',
			value_content_type: 'currencies.currency',
			value_entity: 'currency',
			code: 'user_code',
			value_type: 'field',
		},
		{
			key: 'counter_directional_exposure_currency',
			name: 'Exposure Counter-Directional Currency',
			value_content_type: 'currencies.currency',
			value_entity: 'currency',
			code: 'user_code',
			value_type: 'field',
		},
		{
			key: 'long_underlying_exposure',
			name: 'Long Underlying Exposure',
			value_content_type: 'instruments.longunderlyingexposure',
			value_entity: 'long-underlying-exposure',
			value_type: 'field',
		},
		{
			key: 'short_underlying_exposure',
			name: 'Short Underlying Exposure',
			value_content_type: 'instruments.shortunderlyingexposure',
			value_entity: 'short-underlying-exposure',
			value_type: 'field',
		},
		{
			key: 'exposure_calculation_model',
			name: 'Exposure Calculation Model',
			value_content_type: 'instruments.exposurecalculationmodel',
			value_entity: 'exposure-calculation-model',
			value_type: 'field',
		},

		{
			key: 'long_underlying_instrument',
			name: 'Long Underlying Instrument',
			value_content_type: 'instruments.instrument',
			value_entity: 'instrument',
			value_type: 'field',
		},
		{
			key: 'short_underlying_instrument',
			name: 'Short Underlying Instrument',
			value_content_type: 'instruments.instrument',
			value_entity: 'instrument',
			value_type: 'field',
		},
		//# endregion

		{
			key: 'accrued_currency',
			name: 'Accrued currency',
			value_content_type: 'currencies.currency',
			value_entity: 'currency',
			code: 'user_code',
			value_type: 'field',
		},
		{
			key: 'accrued_multiplier',
			name: 'Accrued multiplier',
			value_type: 20,
		},
		{
			key: 'payment_size_detail',
			name: 'Payment size detail',
			value_content_type: 'instruments.paymentsizedetail',
			value_entity: 'payment-size-detail',
			code: 'user_code',
			value_type: 'field',
		},
		{
			key: 'default_accrued',
			name: 'Default accrued',
			value_type: 20,
		},

		{
			key: 'default_price',
			name: 'Default price',
			value_type: 20,
		},
		{
			key: 'maturity_date',
			name: 'Maturity date',
			value_type: 40,
		},
		{
			key: 'maturity_price',
			name: 'Maturity price',
			value_type: 20,
		},
	]
}

export default {
	getAttributes: getAttributes,
}
