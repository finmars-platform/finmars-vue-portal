/**
 * Created by szhitenev on 04.05.2016.
 */

import fileReportsRepository from '../repositories/fileReportsRepository'

var getList = function (options) {
	return fileReportsRepository.getList(options)
}

var getByKey = function (id) {
	return fileReportsRepository.getByKey(id)
}

var deleteByKey = function (id) {
	return fileReportsRepository.deleteByKey(id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	deleteByKey: deleteByKey,
}
