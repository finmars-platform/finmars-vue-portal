/**
 * Created by szhitenev on 15.03.2018.
 */

import csvImportSchemeRepository from '../../repositories/import/csvImportSchemeRepository'

var getList = function (options) {
	return csvImportSchemeRepository.getList(options)
}

var getListLight = function (options) {
	return csvImportSchemeRepository.getListLight(options)
}

var create = function (scheme) {
	return csvImportSchemeRepository.create(scheme)
}

var getByKey = function (id) {
	return csvImportSchemeRepository.getByKey(id)
}

var update = function (id, scheme) {
	return csvImportSchemeRepository.update(id, scheme)
}

var deleteByKey = function (id) {
	return csvImportSchemeRepository.deleteByKey(id)
}

export default {
	getList: getList,
	getListLight: getListLight,
	create: create,
	getByKey: getByKey,
	update: update,
	deleteByKey: deleteByKey,
}
