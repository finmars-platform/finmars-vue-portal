/**
 * Created by szhitenev on 04.05.2016.
 */

import accountTypeRepository from '../repositories/accountTypeRepository'

var getList = function (options) {
	return accountTypeRepository.getList(options)
}

var getByKey = function (id) {
	return accountTypeRepository.getByKey(id)
}

var create = function (account) {
	return accountTypeRepository.create(account)
}

var update = function (id, account) {
	return accountTypeRepository.update(id, account)
}

var deleteByKey = function (id) {
	return accountTypeRepository.deleteByKey(id)
}

var updateBulk = function (accountTypes) {
	return accountTypeRepository.updateBulk(accountTypes)
}

var deleteBulk = function (data) {
	return accountTypeRepository.deleteBulk(data)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,

	updateBulk: updateBulk,
	deleteBulk: deleteBulk,
}
