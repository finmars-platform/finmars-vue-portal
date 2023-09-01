/**
 * Created by szhitenev on 23.11.2021.
 */

import dataProcedureInstanceRepository from '../../repositories/procedures/dataProcedureInstanceRepository'

var getList = function (options) {
	return dataProcedureInstanceRepository.getList(options)
}

var getByKey = function (id) {
	return dataProcedureInstanceRepository.getByKey(id)
}

var create = function (account) {
	return dataProcedureInstanceRepository.create(account)
}

var update = function (id, account) {
	return dataProcedureInstanceRepository.update(id, account)
}

var deleteByKey = function (id) {
	return dataProcedureInstanceRepository.deleteByKey(id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
