/**
 * Created by szhitenev on 04.05.2016.
 */

import responsibleRepository from '../repositories/responsibleRepository'

var getList = function (options) {
	return responsibleRepository.getList(options)
}

var getListLight = function (options) {
	return responsibleRepository.getListLight(options)
}

var getByKey = function (id) {
	return responsibleRepository.getByKey(id)
}

var create = function (responsible) {
	return responsibleRepository.create(responsible)
}

var update = function (id, responsible) {
	return responsibleRepository.update(id, responsible)
}

var deleteByKey = function (id) {
	return responsibleRepository.deleteByKey(id)
}

var updateBulk = function (responsibles) {
	return responsibleRepository.updateBulk(responsibles)
}

var deleteBulk = function (data) {
	return responsibleRepository.deleteBulk(data)
}

export default {
	getList: getList,
	getListLight: getListLight,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,

	updateBulk: updateBulk,
	deleteBulk: deleteBulk,
}
