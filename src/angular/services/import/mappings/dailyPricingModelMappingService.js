/**
 * Created by szhitenev on 19.08.2016.
 */

import dailyPricingModelMappingRepository from '@/angularpositories/import/mappings/dailyPricingModelMappingRepository'

var getList = function (options) {
	return dailyPricingModelMappingRepository.getList(options)
}

var getByKey = function (id) {
	return dailyPricingModelMappingRepository.getByKey(id)
}

var create = function (map) {
	return dailyPricingModelMappingRepository.create(map)
}

var update = function (id, map) {
	return dailyPricingModelMappingRepository.update(id, map)
}

var deleteByKey = function (id) {
	return dailyPricingModelMappingRepository.deleteByKey(id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
