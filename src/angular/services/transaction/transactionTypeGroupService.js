/**
 * Created by szhitenev on 04.05.2016.
 */

import transactionTypeGroupRepository from '../../repositories/transaction/transactionTypeGroupRepository'

var getList = function (options) {
	return transactionTypeGroupRepository.getList(options)
}

var getByKey = function (id) {
	return transactionTypeGroupRepository.getByKey(id)
}

var create = function (account) {
	return transactionTypeGroupRepository.create(account)
}

var update = function (id, account) {
	return transactionTypeGroupRepository.update(id, account)
}

var deleteByKey = function (id) {
	return transactionTypeGroupRepository.deleteByKey(id)
}

var deleteBulk = function (data) {
	return transactionTypeGroupRepository.deleteBulk(data)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,

	deleteBulk: deleteBulk,
}
