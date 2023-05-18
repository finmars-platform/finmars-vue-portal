/**
 * Created by szhitenev on 15.06.2016.
 */

import entityClassifierRepository from '../repositories/entityClassifierRepository'

var getList = function (entity) {
	return entityClassifierRepository.getList(entity)
}

var getByKey = function (entity, id) {
	return entityClassifierRepository.getByKey(entity, id)
}

var create = function (entity, attributeType) {
	return entityClassifierRepository.create(entity, attributeType)
}

var update = function (entity, id, attributeType) {
	return entityClassifierRepository.update(entity, id, attributeType)
}

var deleteByKey = function (entity, id) {
	return entityClassifierRepository.deleteByKey(entity, id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
