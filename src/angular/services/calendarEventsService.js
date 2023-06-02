/**
 * Created by szhitenev on 19.10.2022.
 */

import calendarEventsRepository from '../repositories/calendarEventsRepository'

var getList = function (date_from, date_to, filter_query) {
	return calendarEventsRepository.getList(date_from, date_to, filter_query)
}

export default {
	getList: getList,
}
