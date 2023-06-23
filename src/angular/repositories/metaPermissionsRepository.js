/**
 * Created by szhitenev on 09.08.2016.
 */

var getEntitiesWithDisabledPermissions = function () {
	return [
		'transaction',
		'price-history',
		'currency-history',
		'complex-transaction',
		'counterparty-group',
		'responsible-group',
	]
}

export default {
	getEntitiesWithDisabledPermissions: getEntitiesWithDisabledPermissions,
}
