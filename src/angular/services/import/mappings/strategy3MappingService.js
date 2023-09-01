/**
 * Created by szhitenev on 19.08.2016.
 */

import strategy3MappingRepository from '@/angularpositories/import/mappings/strategy3MappingRepository'

var getList = function (options) {
	return strategy3MappingRepository.getList(options)
}

var getByKey = function (id) {
	return strategy3MappingRepository.getByKey(id)
}

var create = function (map) {
	return strategy3MappingRepository.create(map)
}

var update = function (id, map) {
	return strategy3MappingRepository.update(id, map)
}

var deleteByKey = function (id) {
	return strategy3MappingRepository.deleteByKey(id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
