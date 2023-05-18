/**
 * Created by szhitenev on 19.08.2016.
 */

import pricingPolicyMappingRepository from '@/angularpositories/import/mappings/pricingPolicyMappingRepository'

var getList = function (options) {
	return pricingPolicyMappingRepository.getList(options)
}

var getByKey = function (id) {
	return pricingPolicyMappingRepository.getByKey(id)
}

var create = function (map) {
	return pricingPolicyMappingRepository.create(map)
}

var update = function (id, map) {
	return pricingPolicyMappingRepository.update(id, map)
}

var deleteByKey = function (id) {
	return pricingPolicyMappingRepository.deleteByKey(id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
