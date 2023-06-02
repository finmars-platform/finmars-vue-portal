/**
 * Created by szhitenev on 04.05.2016.
 */

import complexTransactionRepository from '../../repositories/transaction/complexTransactionRepository'

var getList = function (options) {
	return complexTransactionRepository.getList(options)
}

var getByKey = function (id) {
	return complexTransactionRepository.getByKey(id)
}

var create = function (transaction) {
	return complexTransactionRepository.create(transaction)
}

var update = function (id, transaction) {
	return complexTransactionRepository.update(id, transaction)
}

var updateProperties = function (id, transaction) {
	return complexTransactionRepository.updateProperties(id, transaction)
}

var updatePropertiesBulk = function (transactions) {
	return complexTransactionRepository.updatePropertiesBulk(transactions)
}

var deleteByKey = function (id) {
	return complexTransactionRepository.deleteByKey(id)
}

var initRebookComplexTransaction = function (id) {
	return complexTransactionRepository.initRebookComplexTransaction(id)
}

var rebookComplexTransaction = function (id, transaction) {
	return complexTransactionRepository.rebookComplexTransaction(id, transaction)
}

var recalculateComplexTransaction = function (id, transaction) {
	return complexTransactionRepository.recalculateComplexTransaction(
		id,
		transaction
	)
}

var initRebookPendingComplexTransaction = function (id) {
	return complexTransactionRepository.initRebookPendingComplexTransaction(id)
}

var rebookPendingComplexTransaction = function (id, transaction) {
	return complexTransactionRepository.rebookPendingComplexTransaction(
		id,
		transaction
	)
}

var deleteBulk = function (data) {
	return complexTransactionRepository.deleteBulk(data)
}
var restoreBulk = function (data) {
	return complexTransactionRepository.restoreBulk(data)
}

var recalculatePermissionTransaction = function (data) {
	return complexTransactionRepository.recalculatePermissionTransaction(data)
}

var recalculatePermissionComplexTransaction = function (data) {
	return complexTransactionRepository.recalculatePermissionComplexTransaction(
		data
	)
}

var viewComplexTransaction = function (id) {
	return complexTransactionRepository.viewComplexTransaction(id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,

	updateProperties: updateProperties,
	updatePropertiesBulk: updatePropertiesBulk,

	initRebookComplexTransaction: initRebookComplexTransaction,
	rebookComplexTransaction: rebookComplexTransaction,
	recalculateComplexTransaction: recalculateComplexTransaction,

	initRebookPendingComplexTransaction: initRebookPendingComplexTransaction,
	rebookPendingComplexTransaction: rebookPendingComplexTransaction,

	deleteBulk: deleteBulk,
	restoreBulk: restoreBulk,

	recalculatePermissionTransaction: recalculatePermissionTransaction,
	recalculatePermissionComplexTransaction:
		recalculatePermissionComplexTransaction,

	viewComplexTransaction: viewComplexTransaction,
}
