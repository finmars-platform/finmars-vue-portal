/**
 * Created by szhitenev on 30.05.2016.
 */

import logService from '@/angular/core/services/logService'
// import usersService from '../../services/usersService';
// import usersGroupService from '../../services/usersGroupService';

import metaService from '../../services/metaService'

import attributeTypeService from '../../services/attributeTypeService'

export default function (
	$scope,
	$mdDialog,
	usersService,
	usersGroupService,
	data
) {
	logService.controller('AttributesAddDialogManagerController', 'initialized')

	var vm = this

	vm.readyStatus = { attribute: false, permissions: false }

	vm.entityType = data.entityType
	vm.attributeId = data.attributeId

	vm.userCodeError = false

	vm.originalUserCode = null

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

	//attributeTypeService.getByKey("generic", vm.attributeId).then(function (data) {
	attributeTypeService
		.getByKey(vm.entityType, vm.attributeId)
		.then(function (data) {
			vm.attribute = data

			vm.originalUserCode = vm.attribute.user_code.slice()

			vm.readyStatus.attribute = true
			vm.loadPermissions()
			$scope.$apply()
		})

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
			//;

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
			//;

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
				vm.attribute.granted_permissions &&
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

	vm.onAttrNameBlur = function () {
		if (!vm.attribute.user_code && vm.attribute.name) {
			var attrName = vm.attribute.name.toLowerCase()
			attrName = attrName.replace(/[^0-9a-zA-Z_]/g, '_')

			vm.attribute.user_code = attrName
		}
	}

	vm.editRestriction = true



	// vm.valueTypes = metaService.getDynamicAttrsValueTypesCaptions();

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

		if (vm.originalUserCode !== vm.attribute.user_code) {
			$mdDialog
				.show({
					controller: 'WarningDialogController as vm',
					templateUrl: 'views/dialogs/warning-dialog-view.html',
					parent: angular.element(document.body),
					targetEvent: $event,
					clickOutsideToClose: false,
					locals: {
						warning: {
							title: 'Warning',
							description:
								'Changing the Reference Name may affect the Custom Columns and the Layouts which are linked﻿ to this User Attribute.<br/> Please type the new Reference Name should you wish to proceed (use programming language naming rules)',
							actionsButtons: [
								{
									name: 'CANCEL',
									response: {},
								},
								{
									name: 'OK, RENAME',
									response: { status: 'agree' },
								},
							],
						},
					},
					preserveScope: true,
					autoWrap: true,
					skipHide: true,
					multiple: true,
				})
				.then(function (res) {
					if (res.status === 'agree') {
						attributeTypeService
							.update(vm.entityType, vm.attribute.id, vm.attribute)
							.then(function (value) {
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
				})
		} else {
			attributeTypeService
				.update(vm.entityType, vm.attribute.id, vm.attribute)
				.then(function (value) {
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
