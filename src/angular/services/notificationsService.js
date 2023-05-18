/**
 * Created by szhitenev on 14.06.2016.
 */

import notificationsRepository from '../repositories/notificationsRepository'

var getList = function (page, type) {
	return notificationsRepository.getList(page, type)
}

var markAsReaded = function (url, data) {
	return notificationsRepository.markAsReaded(url, data)
}

var markAllAsReaded = function () {
	return notificationsRepository.markAllAsReaded()
}

export default {
	getList: getList,
	markAsReaded: markAsReaded,
	markAllAsReaded: markAllAsReaded,
}
