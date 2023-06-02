/**
 * Created by szhitenev on 04.05.2016.
 */

import instrumentDailyPricingModelRepository from '../../repositories/instrument/instrumentDailyPricingModelRepository'

var getList = function (options) {
	return instrumentDailyPricingModelRepository.getList(options)
}

var getByKey = function (id) {
	return instrumentDailyPricingModelRepository.getByKey(id)
}

export default {
	getList: getList,
	getByKey: getByKey,
}
