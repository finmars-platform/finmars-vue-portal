/**
 * Created by szhitenev on 19.08.2016.
 */

import accountMappingRepository from '@/angularpositories/import/mappings/accountMappingRepository'

var getList = function (options) {
	return accountMappingRepository.getList(options)
}

var getByKey = function (id) {
	return accountMappingRepository.getByKey(id)
}

var create = function (map) {
	return accountMappingRepository.create(map)
}

var update = function (id, map) {
	return accountMappingRepository.update(id, map)
}

var deleteByKey = function (id) {
	return accountMappingRepository.deleteByKey(id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
