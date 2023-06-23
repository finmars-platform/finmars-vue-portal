/**
 * Created by szhitenev on 20.07.2021.
 */

import portfolioRegisterRecordRepository from '../repositories/portfolioRegisterRecordRepository'

var getList = function (options) {
	return portfolioRegisterRecordRepository.getList(options)
}

var getListLight = function (options) {
	return portfolioRegisterRecordRepository.getListLight(options)
}

var getByKey = function (id) {
	return portfolioRegisterRecordRepository.getByKey(id)
}

var create = function (portfolio) {
	return portfolioRegisterRecordRepository.create(portfolio)
}

var update = function (id, portfolio) {
	return portfolioRegisterRecordRepository.update(id, portfolio)
}

var deleteByKey = function (id) {
	return portfolioRegisterRecordRepository.deleteByKey(id)
}

var updateBulk = function (portfolios) {
	return portfolioRegisterRecordRepository.updateBulk(portfolios)
}

var deleteBulk = function (data) {
	return portfolioRegisterRecordRepository.deleteBulk(data)
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
