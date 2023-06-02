/**
 * Created by szhitenev on 25.09.2020.
 */

import dataProcedureRepository from '../../repositories/procedures/dataProcedureRepository'

var getList = function (options) {
	return dataProcedureRepository.getList(options)
}

var getByKey = function (id) {
	return dataProcedureRepository.getByKey(id)
}

var create = function (account) {
	return dataProcedureRepository.create(account)
}

var update = function (id, account) {
	return dataProcedureRepository.update(id, account)
}

var deleteByKey = function (id) {
	return dataProcedureRepository.deleteByKey(id)
}

var runProcedure = function (id, data) {
	return dataProcedureRepository.runProcedure(id, data)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,

	runProcedure: runProcedure,
}
