/**
 * Created by szhitenev on 19.08.2016.
 */

import strategy2MappingRepository from '@/angularpositories/import/mappings/strategy2MappingRepository'

var getList = function (options) {
	return strategy2MappingRepository.getList(options)
}

var getByKey = function (id) {
	return strategy2MappingRepository.getByKey(id)
}

var create = function (map) {
	return strategy2MappingRepository.create(map)
}

var update = function (id, map) {
	return strategy2MappingRepository.update(id, map)
}

var deleteByKey = function (id) {
	return strategy2MappingRepository.deleteByKey(id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
