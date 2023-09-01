/**
 * Created by szhitenev on 09.08.2016.
 */

import metaNotificationClassRepository from '../repositories/metaNotificationClassRepository'

var getList = function (options) {
	return metaNotificationClassRepository.getList(options)
}

export default {
	getList: getList,
}
