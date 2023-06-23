/**
 * Created by szhitenev on 30.05.2016.
 */

// import usersService from '../../services/usersService';
// import usersGroupService from '../../services/usersGroupService';

// import metaService from '../../services/metaService';

import attributeTypeService from '../../services/attributeTypeService'
export default function (
	$scope,
	$mdDialog,
	usersService,
	usersGroupService,
	data
) {
	var vm = this

	vm.entityType = data.entityType

	vm.attribute = { name: '', value_type: '' }
	vm.readyStatus = { attribute: true, permissions: false }

	// vm.entityType = data.entityType;

	vm.editRestriction = false
	vm.setUserCode = true

	vm.userCodeError = false

	console.log('vm.attribute', vm.attribute)

	vm.valueTypes = [
		{
			name: 'Number',
			value: 20,
		},
		{
			name: 'Text',
			value: 10,
		},
		{
			name: 'Date',
			value: 40,
		},
		{
			name: 'Classification',
			value: 30,
		},
	]

	vm.validateUserCode = function () {
		var expression = /^\w+$/

		if (expression.test(vm.attribute.user_code)) {
			vm.userCodeError = false
		} else {
			vm.userCodeError = true
		}
	}

	vm.loadPermissions = function () {
		var promises = []

		promises.push(vm.getMemberList())
		promises.push(vm.getGroupList())

		Promise.all(promises).then(function (data) {
			vm.readyStatus.permissions = true
			$scope.$apply()
		})
	}

	vm.getGroupList = function () {
		return usersGroupService.getList().then(function (data) {
			//console.log('data MEMBERS', data);

			vm.groups = data.results

			vm.groups.forEach(function (group) {
				if (vm.attribute['group_object_permissions']) {
					vm.attribute['group_object_permissions'].forEach(function (
						permission
					) {
						if (permission.group == group.id) {
							if (!group.hasOwnProperty('objectPermissions')) {
								group.objectPermissions = {}
							}
							if (
								permission.permission ===
								'manage_' + 'generic' + 'attributetype'
							) {
								group.objectPermissions.manage = true
							}
							if (
								permission.permission ===
								'change_' + 'generic' + 'attributetype'
							) {
								group.objectPermissions.change = true
							}
						}
					})
				}
			})
		})
	}

	vm.getMemberList = function () {
		return usersService.getMemberList().then(function (data) {
			//console.log('data MEMBERS', data);

			vm.members = data.results

			vm.members.forEach(function (member) {
				if (vm.attribute['user_object_permissions']) {
					vm.attribute['user_object_permissions'].forEach(function (
						permission
					) {
						if (permission.member == member.id) {
							if (!member.hasOwnProperty('objectPermissions')) {
								member.objectPermissions = {}
							}
							if (
								permission.permission ===
								'manage_' + 'generic' + 'attributetype'
							) {
								member.objectPermissions.manage = true
							}
							if (
								permission.permission ===
								'change_' + 'generic' + 'attributetype'
							) {
								member.objectPermissions.change = true
							}
						}
					})
				}
			})
		})
	}

	vm.checkPermissions = function () {
		if (vm.attributeId) {
			var haveAccess = false

			if (
				vm.attribute.granted_permissions.indexOf(
					'manage_' + 'generic' + 'attributetype'
				) !== -1
			) {
				haveAccess = true
			}

			return haveAccess
		} else {
			return true
		}
	}

	vm.loadPermissions()

	vm.onAttrNameBlur = function () {
		if (!vm.attribute.user_code && vm.attribute.name) {
			var attrName = vm.attribute.name.toLowerCase()
			attrName = attrName.replace(/[^0-9a-zA-Z_]/g, '_')

			vm.attribute.user_code = attrName
		}
	}

	// vm.valueTypes = metaService.getDynamicAttrsValueTypesCaptions();
	console.log('Value type is ', vm.valueTypes)

	vm.agree = function ($event) {
		vm.attribute['user_object_permissions'] = []

		vm.members.forEach(function (member) {
			if (member.objectPermissions && member.objectPermissions.manage == true) {
				vm.attribute['user_object_permissions'].push({
					member: member.id,
					permission: 'manage_' + 'generic' + 'attributetype',
				})
			}

			if (member.objectPermissions && member.objectPermissions.change == true) {
				vm.attribute['user_object_permissions'].push({
					member: member.id,
					permission: 'change_' + 'generic' + 'attributetype',
				})
			}
		})

		vm.attribute['group_object_permissions'] = []

		vm.groups.forEach(function (group) {
			if (group.objectPermissions && group.objectPermissions.manage == true) {
				vm.attribute['group_object_permissions'].push({
					group: group.id,
					permission: 'manage_' + 'generic' + 'attributetype',
				})
			}

			if (group.objectPermissions && group.objectPermissions.change == true) {
				vm.attribute['group_object_permissions'].push({
					group: group.id,
					permission: 'change_' + 'generic' + 'attributetype',
				})
			}
		})

		console.log('vm.attr', vm.attribute)
		if (vm.attribute['value_type'] == 'float') {
			vm.attribute['value_type'] = 20
		}

		attributeTypeService
			.create(vm.entityType, vm.attribute)
			.then(function () {
				$mdDialog.hide({ status: 'agree' })
			})
			.catch(function (reason) {
				$mdDialog.show({
					controller: 'InfoDialogController as vm',
					templateUrl: 'views/info-dialog-view.html',
					parent: angular.element(document.body),
					targetEvent: $event,
					clickOutsideToClose: true,
					locals: {
						info: {
							title: 'Warning',
							description:
								'Attribute with <b>' +
								vm.attribute.user_code +
								'</b> already exist.',
						},
					},
					preserveScope: true,
					autoWrap: true,
					skipHide: true,
					multiple: true,
				})
			})
	}

	var init = function () {
		setTimeout(function () {
			vm.dialogElemToResize = document.querySelector('.attrManagerElemToResize')
		}, 100)
	}

	init()

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}
}
