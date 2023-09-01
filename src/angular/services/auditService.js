/**
 * Created by szhitenev on 04.05.2016.
 */

import auditRepository from '../repositories/auditRepository'

var getList = function (options) {
	return auditRepository.getList(options)
}

var getByKey = function (id) {
	return auditRepository.getByKey(id)
}

var create = function (account) {
	return auditRepository.create(account)
}

var update = function (id, account) {
	return auditRepository.update(id, account)
}

var deleteByKey = function (id) {
	return auditRepository.deleteByKey(id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
