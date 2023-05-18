/**
 * Created by szhitenev on 18.03.2018.
 */

import importEntityRepository from '../../repositories/import/importEntityRepository'

var startImport = function (config) {
	return importEntityRepository.startImport(config)
}

var validateImport = function (config) {
	return importEntityRepository.validateImport(config)
}

export default {
	startImport: startImport,
	validateImport: validateImport,
}
