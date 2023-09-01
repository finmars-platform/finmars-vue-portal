import membersAndGroupsService from '../../services/membersAndGroupsService'

// import usersService from '../../services/usersService';

export default function ($scope, $mdDialog, memberId, authorizerService) {
	var vm = this

	vm.groupsList = []
	vm.assignedGroupsList = []

	vm.member = null

	vm.master_user = null

	vm.readyStatus = { content: false }

	vm.isOwner = false

	vm.getData = function () {
		authorizerService.getCurrentMasterUser().then(function (data) {
			vm.master_user = data

			vm.isOwner = vm.master_user.is_owner

			membersAndGroupsService.getMemberByKey(memberId).then(function (data) {
				vm.member = data

				membersAndGroupsService.getGroupsList().then(function (data) {
					vm.groupsList = data.results

					var assignedGroupsIds = vm.member.groups

					if (assignedGroupsIds && assignedGroupsIds.length > 0) {
						assignedGroupsIds.map(function (assignedId) {
							vm.groupsList.map(function (group, groupIndex) {
								var groupId = group['id']
								if (groupId === assignedId) {
									vm.groupsList.splice(groupIndex, 1)
									vm.assignedGroupsList.push(group)
								}
							})
						})
					}

					vm.readyStatus.content = true

					$scope.$apply()
				})
			})
		})
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		vm.member.groups = vm.assignedGroupsList.map(function (group) {
			return group.id
		})

		membersAndGroupsService
			.updateMember(vm.member.id, vm.member)
			.then(function (data) {
				$mdDialog.hide({
					status: 'agree',
				})
			})
	}

	vm.init = function () {
		vm.getData()
	}

	vm.init()
}
