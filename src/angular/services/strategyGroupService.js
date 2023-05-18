/**
 * Created by szhitenev on 09.08.2016.
 */

import strategyGroupRepository from '../repositories/strategyGroupRepository'

var getList = function (strategyNumber, options) {
	return strategyGroupRepository.getList(strategyNumber, options)
}

var getByKey = function (strategyNumber, id) {
	return strategyGroupRepository.getByKey(strategyNumber, id)
}

var create = function (strategyNumber, strategy) {
	return strategyGroupRepository.create(strategyNumber, strategy)
}

var update = function (strategyNumber, id, strategy) {
	return strategyGroupRepository.update(strategyNumber, id, strategy)
}

var deleteByKey = function (strategyNumber, id) {
	return strategyGroupRepository.deleteByKey(strategyNumber, id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
