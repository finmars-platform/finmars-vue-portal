/**
 * Created by szhitenev on 26.08.2016.
 */

import accrualCalculationModelRepository from '../repositories/accrualCalculationModelRepository'

var getList = function (options) {
	return accrualCalculationModelRepository.getList(options)
}

export default {
	getList: getList,
}
