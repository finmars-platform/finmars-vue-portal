/**
 * Created by szhitenev on 15.10.2022.
 */

import dataStatsRepository from '../repositories/dataStatsRepository'

var getStats = function (period) {
	return dataStatsRepository.getStats(period)
}

export default {
	getStats: getStats,
}
