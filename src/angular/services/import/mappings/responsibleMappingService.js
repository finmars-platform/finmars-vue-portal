/**
 * Created by szhitenev on 19.08.2016.
 */

import responsibleMappingRepository from '@/angularpositories/import/mappings/responsibleMappingRepository'

var getList = function (options) {
	return responsibleMappingRepository.getList(options)
}

var getByKey = function (id) {
	return responsibleMappingRepository.getByKey(id)
}

var create = function (map) {
	return responsibleMappingRepository.create(map)
}

var update = function (id, map) {
	return responsibleMappingRepository.update(id, map)
}

var deleteByKey = function (id) {
	return responsibleMappingRepository.deleteByKey(id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
