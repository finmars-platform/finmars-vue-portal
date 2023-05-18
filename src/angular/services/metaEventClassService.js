/**
 * Created by szhitenev on 09.08.2016.
 */

import metaEventClassRepository from '../repositories/metaEventClassRepository'

var getList = function (options) {
	return metaEventClassRepository.getList(options)
}

export default {
	getList: getList,
}
