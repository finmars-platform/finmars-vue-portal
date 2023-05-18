/**
 * Created by szhitenev on 19.08.2016.
 */

import counterpartyMappingRepository from '@/angularpositories/import/mappings/counterpartyMappingRepository'

var getList = function (options) {
	return counterpartyMappingRepository.getList(options)
}

var getByKey = function (id) {
	return counterpartyMappingRepository.getByKey(id)
}

var create = function (map) {
	return counterpartyMappingRepository.create(map)
}

var update = function (id, map) {
	return counterpartyMappingRepository.update(id, map)
}

var deleteByKey = function (id) {
	return counterpartyMappingRepository.deleteByKey(id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
