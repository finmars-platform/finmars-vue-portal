/**
 * Created by szhitenev on 13.03.2020.
 */

import pricingParentProcedureRepository from '../../repositories/procedures/pricingParentProcedureRepository'

var getList = function (options) {
	return pricingParentProcedureRepository.getList(options)
}

var getByKey = function (id) {
	return pricingParentProcedureRepository.getByKey(id)
}

var deleteByKey = function (id) {
	return pricingParentProcedureRepository.deleteByKey(id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	deleteByKey: deleteByKey,
}
