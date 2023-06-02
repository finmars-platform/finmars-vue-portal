/**
 * Created by szhitenev on 15.12.2022.
 */

import errorRecordRepository from '../repositories/errorRecordRepository'

var getList = function (options) {
	return errorRecordRepository.getList(options)
}

export default {
	getList: getList,
}
