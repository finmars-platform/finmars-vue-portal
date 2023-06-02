/**
 * Created by szhitenev on 09.08.2016.
 */

import strategySubgroupRepository from '../repositories/strategySubgroupRepository'

var getList = function (strategyNumber, options) {
	return strategySubgroupRepository.getList(strategyNumber, options)
}

var getByKey = function (strategyNumber, id) {
	return strategySubgroupRepository.getByKey(strategyNumber, id)
}

var create = function (strategyNumber, strategy) {
	return strategySubgroupRepository.create(strategyNumber, strategy)
}

var update = function (strategyNumber, id, strategy) {
	return strategySubgroupRepository.update(strategyNumber, id, strategy)
}

var deleteByKey = function (strategyNumber, id) {
	return strategySubgroupRepository.deleteByKey(strategyNumber, id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
