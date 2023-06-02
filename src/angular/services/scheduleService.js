/**
 * Created by szhitenev on 25.08.2016.
 */

import scheduleRepository from '../repositories/scheduleRepository'

var getList = function (options) {
	return scheduleRepository.getList(options)
}

var getByKey = function (id) {
	return scheduleRepository.getByKey(id)
}

var create = function (schedule) {
	return scheduleRepository.create(schedule)
}

var update = function (id, schedule) {
	return scheduleRepository.update(id, schedule)
}

var deleteByKey = function (id) {
	return scheduleRepository.deleteByKey(id)
}

var runSchedule = function (id, schedule) {
	return scheduleRepository.runSchedule(id, schedule)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,

	runSchedule: runSchedule,
}
