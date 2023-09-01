/**
 * Created by szhitenev on 19.08.2016.
 */

import strategy1MappingRepository from '@/angularpositories/import/mappings/strategy1MappingRepository'

var getList = function (options) {
	return strategy1MappingRepository.getList(options)
}

var getByKey = function (id) {
	return strategy1MappingRepository.getByKey(id)
}

var create = function (map) {
	return strategy1MappingRepository.create(map)
}

var update = function (id, map) {
	return strategy1MappingRepository.update(id, map)
}

var deleteByKey = function (id) {
	return strategy1MappingRepository.deleteByKey(id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
