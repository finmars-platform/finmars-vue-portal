/**
 * Created by szhitenev on 19.08.2016.
 */

import scheduleRepository from '../../repositories/import/scheduleRepository'

var getAccrualScheduleDownloadMethodList = function () {
	return scheduleRepository.getAccrualScheduleDownloadMethodList()
}

var getFactorScheduleDownloadMethodList = function () {
	return scheduleRepository.getFactorScheduleDownloadMethodList()
}

export default {
	getAccrualScheduleDownloadMethodList: getAccrualScheduleDownloadMethodList,
	getFactorScheduleDownloadMethodList: getFactorScheduleDownloadMethodList,
}
