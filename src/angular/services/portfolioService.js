/**
 * Created by szhitenev on 04.05.2016.
 */

import portfolioRepository from '../repositories/portfolioRepository'

var getClassifierNodeList = function () {
	return portfolioRepository.getClassifierNodeList()
}

var getClassifierNodeByKey = function (id) {
	return portfolioRepository.getClassifierNodeByKey(id)
}

var getClassifierList = function () {
	return portfolioRepository.getClassifierList()
}

var getClassifierByKey = function (id) {
	return portfolioRepository.getClassifierByKey(id)
}

var getList = function (options) {
	return portfolioRepository.getList(options)
}

var getListLight = function (options) {
	return portfolioRepository.getListLight(options)
}

var getByKey = function (id) {
	return portfolioRepository.getByKey(id)
}

var create = function (portfolio) {
	return portfolioRepository.create(portfolio)
}

var update = function (id, portfolio) {
	return portfolioRepository.update(id, portfolio)
}

var deleteByKey = function (id) {
	return portfolioRepository.deleteByKey(id)
}

var updateBulk = function (portfolios) {
	return portfolioRepository.updateBulk(portfolios)
}

var deleteBulk = function (data) {
	return portfolioRepository.deleteBulk(data)
}

export default {
	getClassifierNodeList: getClassifierNodeList,
	getClassifierNodeByKey: getClassifierNodeByKey,

	getClassifierList: getClassifierList,
	getClassifierByKey: getClassifierByKey,

	getList: getList,
	getListLight: getListLight,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,

	updateBulk: updateBulk,
	deleteBulk: deleteBulk,
}
