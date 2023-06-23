/**
 * Created by szhitenev on 09.08.2016.
 */

import strategyRepository from '../repositories/strategyRepository'

var getList = function (strategyNumber, options) {
	return strategyRepository.getList(strategyNumber, options)
}

var getListLight = function (strategyNumber, options) {
	return strategyRepository.getListLight(strategyNumber, options)
}

var getByKey = function (strategyNumber, id) {
	return strategyRepository.getByKey(strategyNumber, id)
}

var create = function (strategyNumber, strategy) {
	return strategyRepository.create(strategyNumber, strategy)
}

var update = function (strategyNumber, id, strategy) {
	return strategyRepository.update(strategyNumber, id, strategy)
}

var deleteByKey = function (strategyNumber, id) {
	return strategyRepository.deleteByKey(strategyNumber, id)
}

var updateBulk = function (strategyNumber, data) {
	return strategyRepository.updateBulk(strategyNumber, data)
}

var deleteBulk = function (strategyNumber, data) {
	return strategyRepository.deleteBulk(strategyNumber, data)
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
