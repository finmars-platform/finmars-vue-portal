/**
 * Created by szhitenev on 26.08.2016.
 */

import instrumentPeriodicityRepository from '../repositories/instrumentPeriodicityRepository'

var getList = function (options) {
	return instrumentPeriodicityRepository.getList(options)
}

export default {
	getList: getList,
}
