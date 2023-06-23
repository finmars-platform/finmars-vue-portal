/**
 * Created by szhitenev on 04.05.2016.
 */

import bookmarkRepository from '../repositories/bookmarkRepository'

var getList = function (options) {
	return bookmarkRepository.getList(options)
}

var getByKey = function (id) {
	return bookmarkRepository.getByKey(id)
}

var create = function (bookmark) {
	return bookmarkRepository.create(bookmark)
}

var update = function (id, bookmark) {
	return bookmarkRepository.update(id, bookmark)
}

var deleteByKey = function (id) {
	return bookmarkRepository.deleteByKey(id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
