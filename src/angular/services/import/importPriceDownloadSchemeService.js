/**
 * Created by szhitenev on 04.05.2016.
 */

import importPriceDownloadSchemeRepository from '../../repositories/import/importPriceDownloadSchemeRepository'

var getList = function (options) {
	return importPriceDownloadSchemeRepository.getList(options)
}

var getByKey = function (id) {
	return importPriceDownloadSchemeRepository.getByKey(id)
}

var create = function (account) {
	return importPriceDownloadSchemeRepository.create(account)
}

var update = function (id, account) {
	return importPriceDownloadSchemeRepository.update(id, account)
}

var deleteByKey = function (id) {
	return importPriceDownloadSchemeRepository.deleteByKey(id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
