/**
 * Created by szhitenev on 04.05.2016.
 */

import shareConfigurationFileRepository from '../repositories/shareConfigurationFileRepository'

var getList = function (options) {
	return shareConfigurationFileRepository.getList(options)
}

var getByKey = function (id) {
	return shareConfigurationFileRepository.getByKey(id)
}

var create = function (item) {
	return shareConfigurationFileRepository.create(item)
}

var update = function (id, item, force) {
	return shareConfigurationFileRepository.update(id, item, force)
}

var deleteByKey = function (id) {
	return shareConfigurationFileRepository.deleteByKey(id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
