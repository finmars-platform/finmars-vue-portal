/**
 * Created by szhitenev on 10.12.2019.
 */

import reconciliationComplexTransactionFieldRepository from '../../repositories/reconciliation/reconciliationComplexTransactionFieldRepository'

var getList = function (options) {
	return reconciliationComplexTransactionFieldRepository.getList(options)
}

var getByKey = function (id) {
	return reconciliationComplexTransactionFieldRepository.getByKey(id)
}

var create = function (account) {
	return reconciliationComplexTransactionFieldRepository.create(account)
}

var update = function (id, account) {
	return reconciliationComplexTransactionFieldRepository.update(id, account)
}

var deleteByKey = function (id) {
	return reconciliationComplexTransactionFieldRepository.deleteByKey(id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
