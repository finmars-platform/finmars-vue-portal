/**
 * Created by szhitenev on 20.07.2021.
 */

import portfolioRegisterRepository from '../repositories/portfolioRegisterRepository'

var getList = function (options) {
	return portfolioRegisterRepository.getList(options)
}

var getByKey = function (id) {
	return portfolioRegisterRepository.getByKey(id)
}

var create = function (portfolio) {
	return portfolioRegisterRepository.create(portfolio)
}

var update = function (id, portfolio) {
	return portfolioRegisterRepository.update(id, portfolio)
}

var deleteByKey = function (id) {
	return portfolioRegisterRepository.deleteByKey(id)
}

var updateBulk = function (portfolios) {
	return portfolioRegisterRepository.updateBulk(portfolios)
}

var deleteBulk = function (data) {
	return portfolioRegisterRepository.deleteBulk(data)
}

var calculateRecords = function (data) {
	return portfolioRegisterRepository.calculateRecords(data)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,

	updateBulk: updateBulk,
	deleteBulk: deleteBulk,

	calculateRecords: calculateRecords,
}
