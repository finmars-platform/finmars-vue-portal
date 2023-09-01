/**
 * Created by szhitenev on 25.08.2016.
 */

import importPricingRepository from '../../repositories/import/importPricingRepository'

var create = function (price) {
	return importPricingRepository.create(price)
}

export default {
	create: create,
}
