/**
 * Created by szhitenev on 15.06.2016.
 */

import entityClassifierService from './entityClassifierService'

var entitiesByKey = {}

var getList = function (entity) {
	return entityClassifierService.getList(entity)
}

var getByKey = function (entity, id) {
	return new Promise(function (resolve) {
		//console.log@/angular entity + '_' + id);

		if (!entitiesByKey[entity + '_' + id]) {
			entitiesByKey[entity + '_' + id] = {}
			entityClassifierService.getByKey(entity, id).then(function (data) {
				entitiesByKey[entity + '_' + id] = data
				resolve({
					key: entity + '_' + id,
					data: entitiesByKey[entity + '_' + id],
				})
			})
		} else {
			resolve({
				key: entity + '_' + id,
				data: entitiesByKey[entity + '_' + id],
			})
		}
	})
}

var create = function (entity, attributeType) {
	return entityClassifierService.create(entity, attributeType)
}

var update = function (entity, id, attributeType) {
	return entityClassifierService.update(entity, id, attributeType)
}

var deleteByKey = function (entity, id) {
	return entityClassifierService.deleteByKey(entity, id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
