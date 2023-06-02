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
		//{
		//    "key": "last_notes",
		//    "name": "Last notes",
		//    "value_type": 10
		//},
		//{
		//    "key": "account",
		//    "name": "Account",
		//    "value_type": "field"
		//},
		//{
		//    "key": "instrument",
		//    "name": "Instrument",
		//    "value_type": "field"
		//},
		//{
		//    "key": "currency",
		//    "name": "Currency",
		//    "value_type": "field"
		//},
		//{
		//    "key": "portfolio",
		//    "name": "Portfolio",
		//    "value_type": "field"
		//},
		//{
		//    "key": "strategy-1",
		//    "name": "Strategy 1",
		//    "value_type": "field"
		//},
		//{
		//    "key": "strategy-2",
		//    "name": "Strategy 2",
		//    "value_type": "field"
		//},
		//{
		//    "key": "strategy-3",
		//    "name": "Strategy 3",
		//    "value_type": "field"
		//},
		{
			key: 'item_type_name',
			name: 'Item Type',
			value_type: 10,
		},
		{
			key: 'position_size',
			name: 'Position size',
			value_type: 20,
		},
		{
			key: 'pricing_currency',
			name: 'Pricing Currency',
			value_type: 'field',
			value_entity: 'currency',
			value_content_type: 'currencies.currency',
			code: 'user_code',
		},
		//{
		//    "key": "instrument_principal",
		//    "name": "Current Price",
		//    "value_type": 20
		//},
		//{
		//    "key": "instrument_accrued",
		//    "name": "Current Accrued",
		//    "value_type": 20
		//},
		{
			key: 'instrument_pricing_currency_fx_rate',
			name: 'Pricing currency fx rate',
			value_type: 20,
		},
		{
			key: 'instrument_accrued_currency_fx_rate',
			name: 'Accrued currency fx rate',
			value_type: 20,
		},

		{
			key: 'instrument_accrual_object_accrual_size',
			name: 'Current Payment Size',
			value_type: 20,
		},
		{
			key: 'instrument_accrual_object_periodicity_object_name',
			name: 'Current Payment Frequency',
			value_type: 20,
		},
		{
			key: 'instrument_accrual_object_periodicity_n',
			name: 'Current Payment Periodicity N',
			value_type: 20,
		},
		//{
		//    "key": "report_currency_fx_rate",
		//    "name": "Report currency fx rate",
		//    "value_type": 20
		//},
		//{
		//    "key": "instrument_price_history_principal_price",
		//    "name": "Instrument price history principal price",
		//    "value_type": 20
		//},
		//{
		//    "key": "instrument_price_history_accrued_price",
		//    "name": "Instrument price history accrued price",
		//    "value_type": 20
		//},
		//{
		//    "key": "instrument_pricing_currency_fx_rate",
		//    "name": "Instrument pricing currency fx rate",
		//    "value_type": 20
		//},
		//{
		//    "key": "instrument_accrued_currency_fx_rate",
		//    "name": "Instrument accrued currency fx rate",
		//    "value_type": 20
		//},
		//{
		//    "key": "currency_fx_rate",
		//    "name": "Currency fx rate",
		//    "value_type": 20
		//},

		{
			key: 'date',
			name: 'Date',
			value_type: 40,
		},
		{
			key: 'ytm',
			name: 'YTM',
			value_type: 20,
		},
		{
			key: 'modified_duration',
			name: 'Modified duration',
			value_type: 20,
		},

		{
			key: 'last_notes',
			name: 'Last notes',
			value_type: 10,
		},
		//{
		//    "key": "gross_cost_price",
		//    "name": "Gross cost price",
		//    "value_type": 20
		//},
		{
			key: 'gross_cost_price_loc',
			name: 'Gross cost price (Pricing Currency)',
			value_type: 20,
		},
		{
			key: 'ytm_at_cost',
			name: 'YTM at cost',
			value_type: 20,
		},
		{
			key: 'time_invested',
			name: 'Time invested',
			value_type: 20,
		},

		{
			key: 'return_annually',
			name: 'Return annually',
			value_type: 20,
		},
		//{
		//    "key": "net_cost_price",
		//    "name": "Net cost price",
		//    "value_type": 20
		//},
		{
			key: 'net_cost_price_loc',
			name: 'Net cost price (Pricing Currency)',
			value_type: 20,
		},
		{
			key: 'currency',
			name: 'Currency',
			value_type: 'field',
			value_entity: 'currency',
			value_content_type: 'currencies.currency',
			code: 'user_code',
		},
		{
			key: 'exposure_currency',
			name: ' Exposure Currency',
			value_type: 'field',
			value_entity: 'currency',
			value_content_type: 'currencies.currency',
			code: 'user_code',
		},
		//{
		//    "key": "report_currency_history",
		//    "name": "Report currency history",
		//    "value_type": "field"
		//},
		//{
		//    "key": "instrument_price_history",
		//    "name": "Instrument price history",
		//    "value_type": "field"
		//},
		//{
		//    "key": "instrument_pricing_currency_history",
		//    "name": "Instrument pricing currency history",
		//    "value_type": "field"
		//},
		//{
		//    "key": "instrument_accrued_currency_history",
		//    "name": "Instrument accrued currency history",
		//    "value_type": "field"
		//},
		//{
		//    "key": "currency_history",
		//    "name": "Currency history",
		//    "value_type": "field"
		//},
		//{
		//    "key": "pricing_currency_history",
		//    "name": "Pricing currency history",
		//    "value_type": "field"
		//},
		//{
		//    "key": "instrument_accrual",
		//    "name": "Instrument accrual",
		//    "value_type": "field"
		//},
		//{
		//    "key": "instrument_accrual_accrued_price",
		//    "name": "Instrument accrual accrued price",
		//    "value_type": "field"
		//},

		{
			key: 'principal_invested',
			name: 'Principal invested',
			value_type: 20,
		},
		{
			key: 'principal_invested_loc',
			name: 'Principal invested (Pricing Currency)',
			value_type: 20,
		},
		{
			key: 'amount_invested',
			name: 'Amount invested',
			value_type: 20,
		},
		{
			key: 'amount_invested_loc',
			name: 'Amount invested (Pricing Currency)',
			value_type: 20,
		},

		{
			key: 'market_value',
			name: 'Market value',
			value_type: 20,
		},
		{
			key: 'market_value_loc',
			name: 'Market value (Pricing Currency)',
			value_type: 20,
		},
		{
			key: 'market_value_percent',
			name: 'Market value %',
			value_type: 20,
		},
		{
			key: 'exposure',
			name: 'Exposure',
			value_type: 20,
		},
		{
			key: 'exposure_percent',
			name: 'Exposure %',
			value_type: 20,
		},
		{
			key: 'exposure_loc',
			name: 'Exposure (Pricing Currency)',
			value_type: 20,
		},
		{
			key: 'instrument_principal_price',
			name: 'Current Price',
			value_type: 20,
		},
		{
			key: 'instrument_accrued_price',
			name: 'Current Accrued',
			value_type: 20,
		},
		{
			key: 'detail',
			name: 'Transaction Detail',
			value_type: 10,
		},
		//{
		//    "key": "allocation_balance",
		//    "name": "Allocation Balance",
		//    "value_type": "field"
		//}
	]
}

export default {
	getAttributes: getAttributes,
}
