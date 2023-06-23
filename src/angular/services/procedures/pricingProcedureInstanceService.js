/**
 * Created by szhitenev on 19.10.2022.
 */

import pricingProcedureInstanceRepository from '../../repositories/procedures/pricingProcedureInstanceRepository'

var getList = function (options) {
	return pricingProcedureInstanceRepository.getList(options)
}

var getByKey = function (id) {
	return pricingProcedureInstanceRepository.getByKey(id)
}

var create = function (account) {
	return pricingProcedureInstanceRepository.create(account)
}

var update = function (id, account) {
	return pricingProcedureInstanceRepository.update(id, account)
}

var deleteByKey = function (id) {
	return pricingProcedureInstanceRepository.deleteByKey(id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
