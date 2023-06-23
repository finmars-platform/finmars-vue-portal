/**
 * Created by szhitenev on 19.08.2016.
 */

import instrumentMappingRepository from '@/angularpositories/import/mappings/instrumentMappingRepository'

var getList = function (options) {
	return instrumentMappingRepository.getList(options)
}

var getByKey = function (id) {
	return instrumentMappingRepository.getByKey(id)
}

var create = function (map) {
	return instrumentMappingRepository.create(map)
}

var update = function (id, map) {
	return instrumentMappingRepository.update(id, map)
}

var deleteByKey = function (id) {
	return instrumentMappingRepository.deleteByKey(id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
