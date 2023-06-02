/**
 * Created by szhitenev on 19.08.2016.
 */

import instrumentPeriodicityMappingRepository from '@/angularpositories/import/mappings/instrumentPeriodicityMappingRepository'

var getList = function (options) {
	return instrumentPeriodicityMappingRepository.getList(options)
}

var getByKey = function (id) {
	return instrumentPeriodicityMappingRepository.getByKey(id)
}

var create = function (map) {
	return instrumentPeriodicityMappingRepository.create(map)
}

var update = function (id, map) {
	return instrumentPeriodicityMappingRepository.update(id, map)
}

var deleteByKey = function (id) {
	return instrumentPeriodicityMappingRepository.deleteByKey(id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
