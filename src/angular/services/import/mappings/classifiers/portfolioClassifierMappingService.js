/**
 * Created by szhitenev on 19.08.2016.
 */

import portfolioClassifierMappingRepository from '@/angular/repositories/import/mappings/classifiers/portfolioClassifierMappingRepository'

var getList = function (attribute_type_id) {
	return portfolioClassifierMappingRepository.getList(attribute_type_id)
}

var getByKey = function (id) {
	return portfolioClassifierMappingRepository.getByKey(id)
}

var create = function (map) {
	return portfolioClassifierMappingRepository.create(map)
}

var update = function (id, map) {
	return portfolioClassifierMappingRepository.update(id, map)
}

var deleteByKey = function (id) {
	return portfolioClassifierMappingRepository.deleteByKey(id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
