/**
 * Created by szhitenev on 22.04.2022.
 */

import currencyDatabaseSearchRepository from '../../repositories/currency/currencyDatabaseSearchRepository'

var getList = function (name, page, instrument_type) {
	return currencyDatabaseSearchRepository.getList(name, page, instrument_type)
}

export default {
	getList: getList,
}
