var requiredAttrs = ['name', 'user_code']
var requiredAttrs2 = ['name', 'user_code', 'group']
var strategiesAttrs = ['name', 'user_code', 'subgroup']
var instrumentAttrs = ['name', 'pricing_currency']
var pricesAttrs = [
	'instrument',
	'accrued_price',
	'principal_price',
	'pricing_policy',
]
var currenciesAttrs = ['currency', 'user_code', 'pricing_policy', 'fx_rate']
var instrumentTypeAttrs = [
	'name',
	'user_code',
	'instrument_class',
	'accrued_currency',
	'accrued_multiplier',
	'payment_size_detail',
	'default_accrued',
]

export default {
	requiredAttrs: requiredAttrs,
	requiredAttrs2: requiredAttrs2,
	strategiesAttrs: strategiesAttrs,
	instrumentAttrs: instrumentAttrs,
	pricesAttrs: pricesAttrs,
	currenciesAttrs: currenciesAttrs,
	instrumentTypeAttrs: instrumentTypeAttrs,
}
