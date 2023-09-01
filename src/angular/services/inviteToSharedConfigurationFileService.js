/**
 * Created by szhitenev on 04.05.2016.
 */

import inviteToSharedConfiguationFileRepository from '../repositories/inviteToSharedConfiguationFileRepository'

var getListOfMyInvites = function (options) {
	return inviteToSharedConfiguationFileRepository.getListOfMyInvites(options)
}

var getByKeyMyInvite = function (id) {
	return inviteToSharedConfiguationFileRepository.getByKeyMyInvite(id)
}

var updateMyInvite = function (id, item) {
	return inviteToSharedConfiguationFileRepository.updateMyInvite(id, item)
}

var deleteByKeyMyInvite = function (id) {
	return inviteToSharedConfiguationFileRepository.deleteByKeyMyInvite(id)
}

var getList = function (options) {
	return inviteToSharedConfiguationFileRepository.getList(options)
}

var getByKey = function (id) {
	return inviteToSharedConfiguationFileRepository.getByKey(id)
}

var create = function (item) {
	return inviteToSharedConfiguationFileRepository.create(item)
}

var deleteByKey = function (id) {
	return inviteToSharedConfiguationFileRepository.deleteByKey(id)
}

export default {
	getListOfMyInvites: getListOfMyInvites,
	getByKeyMyInvite: getByKeyMyInvite,
	updateMyInvite: updateMyInvite,
	deleteByKeyMyInvite: deleteByKeyMyInvite,

	getList: getList,
	getByKey: getByKey,
	create: create,
	deleteByKey: deleteByKey,
}
