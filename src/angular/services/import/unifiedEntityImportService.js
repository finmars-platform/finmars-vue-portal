/**
 * Created by szhitenev on 11.08.2021.
 */

// DEPRECATED???

import unifiedEntityImportRepository from '../../repositories/import/unifiedEntityImportRepository'

var startImport = function (config) {
	return unifiedEntityImportRepository.startImport(config)
}

export default {
	startImport: startImport,
}
