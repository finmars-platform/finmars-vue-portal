/**
 * Created by szhitenev on 10.11.2021.
 */

import instrumentDatabaseSearchRepository from '../../repositories/instrument/instrumentDatabaseSearchRepository'

var getList = function (name, page, instrument_type) {
	return instrumentDatabaseSearchRepository.getList(name, page, instrument_type)
}

export default {
	getList: getList,
}
