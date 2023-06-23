/**
 * Created by szhitenev on 04.05.2016.
 */

import instrumentEventScheduleConfigRepository from '../../repositories/instrument/instrumentEventScheduleConfigRepository'

var getList = function (options) {
	return instrumentEventScheduleConfigRepository.getList(options)
}

var getByKey = function (id) {
	return instrumentEventScheduleConfigRepository.getByKey(id)
}

var create = function (account) {
	return instrumentEventScheduleConfigRepository.create(account)
}

var update = function (id, account) {
	return instrumentEventScheduleConfigRepository.update(id, account)
}

var deleteByKey = function (id) {
	return instrumentEventScheduleConfigRepository.deleteByKey(id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
