/**
 * Created by szhitenev on 04.05.2016.
 */

import instrumentCostMethodRepository from '../../repositories/instrument/instrumentCostMethodRepository'

var getList = function (options) {
	return instrumentCostMethodRepository.getList(options)
}

export default {
	getList: getList,
}
