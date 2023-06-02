/**
 * Created by szhitenev on 20.09.2016.
 */

import instrumentRecalculateAccruedPriceRepository from '../../repositories/instrument/instrumentRecalculateAccruedPriceRepository'

var recalculate = function (dateFrom, dateTo) {
	return instrumentRecalculateAccruedPriceRepository.recalculate(
		dateFrom,
		dateTo
	)
}

export default {
	recalculate: recalculate,
}
