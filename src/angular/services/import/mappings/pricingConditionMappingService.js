/**
 * Created by szhitenev on 26.05.2020.
 */

import pricingConditionMappingRepository from '@/angularpositories/import/mappings/pricingConditionMappingRepository'

var getList = function (options) {
	return pricingConditionMappingRepository.getList(options)
}

var getByKey = function (id) {
	return pricingConditionMappingRepository.getByKey(id)
}

var create = function (map) {
	return pricingConditionMappingRepository.create(map)
}

var update = function (id, map) {
	return pricingConditionMappingRepository.update(id, map)
}

var deleteByKey = function (id) {
	return pricingConditionMappingRepository.deleteByKey(id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
