/**
 * Created by szhitenev on 12.02.2023.
 */

import workflowRepository from '../repositories/workflowRepository'

var getList = function (options) {
	return workflowRepository.getList(options)
}

var getByKey = function (id) {
	return workflowRepository.getByKey(id)
}

export default {
	getList: getList,
	getByKey: getByKey,
}
