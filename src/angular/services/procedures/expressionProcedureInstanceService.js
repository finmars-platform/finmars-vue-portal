/**
 * Created by szhitenev on 23.06.2022.
 */

import expressionProcedureInstanceRepository from '../../repositories/procedures/expressionProcedureInstanceRepository'

var getList = function (options) {
	return expressionProcedureInstanceRepository.getList(options)
}

var getByKey = function (id) {
	return expressionProcedureInstanceRepository.getByKey(id)
}

var create = function (account) {
	return expressionProcedureInstanceRepository.create(account)
}

var update = function (id, account) {
	return expressionProcedureInstanceRepository.update(id, account)
}

var deleteByKey = function (id) {
	return expressionProcedureInstanceRepository.deleteByKey(id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
