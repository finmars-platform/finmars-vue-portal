/**
 * Created by szhitenev on 25.08.2016.
 */

import pricingScheduleRepository from '../../repositories/schedules/pricingScheduleRepository'

var getList = function (options) {
	return pricingScheduleRepository.getList(options)
}

var getByKey = function (id) {
	return pricingScheduleRepository.getByKey(id)
}

var create = function (account) {
	return pricingScheduleRepository.create(account)
}

var update = function (id, account) {
	return pricingScheduleRepository.update(id, account)
}

var deleteByKey = function (id) {
	return pricingScheduleRepository.deleteByKey(id)
}

// DEPRECATED SINCE 01.2020
var updateSchedule = function (schedule) {
	return pricingScheduleRepository.updateSchedule(schedule)
}

// DEPRECATED SINCE 01.2020
var getSchedule = function () {
	return pricingScheduleRepository.getSchedule()
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,

	getSchedule: getSchedule,
	updateSchedule: updateSchedule,
}
