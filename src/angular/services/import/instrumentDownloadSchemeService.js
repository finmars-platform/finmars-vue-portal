/**
 * Created by szhitenev on 17.08.2016.
 */

import instrumentDownloadSchemeRepository from '../../repositories/import/instrumentDownloadSchemeRepository'

var getList = function (providerId) {
	return instrumentDownloadSchemeRepository.getList(providerId)
}

var getListLight = function (providerId) {
	return instrumentDownloadSchemeRepository.getListLight(providerId)
}

var create = function (scheme) {
	return instrumentDownloadSchemeRepository.create(scheme)
}

var getByKey = function (id) {
	return instrumentDownloadSchemeRepository.getByKey(id)
}

var update = function (id, scheme) {
	return instrumentDownloadSchemeRepository.update(id, scheme)
}

var deleteByKey = function (id) {
	return instrumentDownloadSchemeRepository.deleteByKey(id)
}

var modeOptions = [
	{ id: 'skip', name: 'Skip if exists' },
	{ id: 'overwrite', name: 'Overwrite' },
	{ id: 'overwrite_empty_values', name: 'Overwrite empty values' },
]

export default {
	getList: getList,
	getListLight: getListLight,
	create: create,
	getByKey: getByKey,
	update: update,
	deleteByKey: deleteByKey,

	modeOptions: modeOptions,
}
