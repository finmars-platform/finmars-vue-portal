/**
 * Created by szhitenev on 04.05.2016.
 */

import instrumentAttributeTypeRepository from '../../repositories/instrument/instrumentAttributeTypeRepository'

var getByKeyItems = {}

var getList = function (options) {
	return instrumentAttributeTypeRepository.getList(options)
}

var getListByAttributeType = function (value_types) {
	return instrumentAttributeTypeRepository.getListByAttributeType(value_types)
}

var getByKey = function (id) {
	return instrumentAttributeTypeRepository.getByKey(id)
}

var getByKeyAttr = function (id) {
	if (!getByKeyItems['id_' + id]) {
		return instrumentAttributeTypeRepository.getByKey(id)
	} else {
		return Promise(function (resolve, reject) {
			resolve(getByKeyItems['id_' + id])
		})
	}
}

var create = function (account) {
	return instrumentAttributeTypeRepository.create(account)
}

var update = function (id, account) {
	return instrumentAttributeTypeRepository.update(id, account)
}

var deleteByKey = function (id) {
	return instrumentAttributeTypeRepository.deleteByKey(id)
}

export default {
	getList: getList,
	getListByAttributeType: getListByAttributeType,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
	singleton: {
		getByKeyAttr: getByKeyAttr,
	},
}
