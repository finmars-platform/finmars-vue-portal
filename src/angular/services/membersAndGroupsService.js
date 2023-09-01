import membersAndGroupsRepository from '../repositories/membersAndGroupsRepository'

var getMembersList = function () {
	return membersAndGroupsRepository.getMembersList()
}

var getMemberByKey = function (id) {
	return membersAndGroupsRepository.getMemberByKey(id)
}

var updateMember = function (id, data) {
	return membersAndGroupsRepository.updateMember(id, data)
}

var deleteMemberByKey = function (id) {
	return membersAndGroupsRepository.deleteMemberByKey(id)
}

var getGroupsList = function () {
	return membersAndGroupsRepository.getGroupsList()
}

var getGroupByKey = function (id) {
	return membersAndGroupsRepository.getGroupByKey(id)
}

var createGroup = function (data) {
	return membersAndGroupsRepository.createGroup(data)
}

var updateGroup = function (id, data) {
	return membersAndGroupsRepository.updateGroup(id, data)
}

var deleteGroupByKey = function (id) {
	return membersAndGroupsRepository.deleteGroupByKey(id)
}

var inviteUser = function (data) {
	return membersAndGroupsRepository.inviteUser(data)
}

var getInvitesList = function (options) {
	return membersAndGroupsRepository.getInvitesList(options)
}

var deleteInviteByKey = function (id) {
	return membersAndGroupsRepository.deleteInviteByKey(id)
}

export default {
	getMembersList: getMembersList,
	getMemberByKey: getMemberByKey,
	updateMember: updateMember,
	deleteMemberByKey: deleteMemberByKey,

	getGroupsList: getGroupsList,
	getGroupByKey: getGroupByKey,
	createGroup: createGroup,
	updateGroup: updateGroup,
	deleteGroupByKey: deleteGroupByKey,

	inviteUser: inviteUser,
	getInvitesList: getInvitesList,
	deleteInviteByKey: deleteInviteByKey,
}
