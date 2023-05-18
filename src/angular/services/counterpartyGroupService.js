/**
 * Created by szhitenev on 04.05.2016.
 */

import counterpartyGroupRepository from '../repositories/counterpartyGroupRepository'

var getList = function (options) {
	return counterpartyGroupRepository.getList(options)
}

var getByKey = function (id) {
	return counterpartyGroupRepository.getByKey(id)
}

var create = function (counterparty) {
	return counterpartyGroupRepository.create(counterparty)
}

var update = function (id, counterparty) {
	return counterpartyGroupRepository.update(id, counterparty)
}

var deleteByKey = function (id) {
	return counterpartyGroupRepository.deleteByKey(id)
}

var deleteBulk = function (data) {
	return counterpartyGroupRepository.deleteBulk(data)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,

	deleteBulk: deleteBulk,
}
