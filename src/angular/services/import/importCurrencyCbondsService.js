/**
 * Created by szhitenev on 16.05.2022.
 */

import importCurrencyCbondsRepository from '../../repositories/import/importCurrencyCbondsRepository'

var download = function (config) {
	return importCurrencyCbondsRepository.download(config)
}

export default {
	download: download,
}
