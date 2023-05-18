/**
 * Created by szhitenev on 22.08.2016.
 */

import importInstrumentCbondsRepository from '../../repositories/import/importInstrumentCbondsRepository'

var download = function (config) {
	return importInstrumentCbondsRepository.download(config)
}

export default {
	download: download,
}
