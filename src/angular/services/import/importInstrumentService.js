/**
 * Created by szhitenev on 22.08.2016.
 */

import importInstrumentRepository from '../../repositories/import/importInstrumentRepository'

var startImport = function (config) {
	return importInstrumentRepository.startImport(config)
}

export default {
	startImport: startImport,
}
