/**
 * Created by szhitenev on 04.08.2016.
 */

import importInstrumentRepository from '../repositories/importInstrumentRepository'

var getInstrumentMappingList = function () {
	return importInstrumentRepository.getInstrumentMappingList()
}

export default {
	getInstrumentMappingList: getInstrumentMappingList,
}
