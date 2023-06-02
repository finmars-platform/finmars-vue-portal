/**
 * Created by szhitenev on 09.01.2017.
 */

// import usersGroupService from '../../services/usersGroupService';
import entityResolverService from '../../services/entityResolverService'
import complexTransactionService from '../../services/transaction/complexTransactionService'
import evEvents from '../../services/entityViewerEvents'
// import usersService from '../../services/usersService';

export default function entityViewerPermissionEditorController(
	$scope,
	$mdDialog,
	$transitions,
	parentEntityViewerDataService,
	parentEntityViewerEventService,
	usersService,
	usersGroupService
) {
	var vm = this

	vm.readyStatus = { content: false }

	vm.processing = false
	vm.activeGroup = null
	vm.isSaved = false

	vm.selectedRows = []

	vm.getGroups = function () {
		vm.readyStatus.content = false

		usersGroupService.getList().then(function (data) {
			vm.groups = data.results.filter(function (item) {
				return item.role === 2
			})

			vm.groups = vm.groups.map(function (group) {
				if (group.members.indexOf(vm.member.id) !== -1) {
					group.current_member_in_group = true
				}

				return group
			})

			vm.readyStatus.content = true

			$scope.$apply()
		})
	}

	vm.getSelectedRows = function () {
		var list = parentEntityViewerDataService.getFlatList()

		return list.filter(function (item) {
			return item.___is_activated
		})
	}

	vm.updatePermissions = function ($event, items) {
		vm.processing = true

		return new Promise(function (resolve, reject) {
			entityResolverService.updateBulk(vm.entityType, items).then(function () {
				vm.processing = false

				$mdDialog.show({
					controller: 'InfoDialogController as vm',
					templateUrl: 'views/info-dialog-view.html',
					parent: angular.element(document.body),
					targetEvent: $event,
					clickOutsideToClose: false,
					preserveScope: true,
					autoWrap: true,
					skipHide: true,
					multiple: true,
					locals: {
						info: {
							title: 'Success',
							description: 'Permissions successfully updated',
						},
					},
				})

				resolve()
			})
		})
	}

	vm.recalculateTransactionPermissions = function ($event) {
		vm.recalculating = true
		vm.isSaved = false

		console.log('Recalculate')

		var config = {
			// content_type: 'portfolios.portfolio'
		}

		// TODO make it recursive like transaction import

		complexTransactionService
			.recalculatePermissionTransaction(config)
			.then(function (value) {
				vm.recalculating = false

				$mdDialog.show({
					controller: 'InfoDialogController as vm',
					templateUrl: 'views/info-dialog-view.html',
					parent: angular.element(document.body),
					targetEvent: $event,
					clickOutsideToClose: false,
					preserveScope: true,
					autoWrap: true,
					skipHide: true,
					multiple: true,
					locals: {
						info: {
							title: 'Success',
							description: 'Transaction Permissions successfully recalculated',
						},
					},
				})

				$scope.$apply()

				console.log('Recalculate done')
			})
	}

	vm.recalculateInstrumentPermissions = function ($event) {
		vm.recalculating = true
		vm.isSaved = false

		entityResolverService
			.getList('instrument', { pageSize: 1000 })
			.then(function (data) {
				console.log('data', data)

				var instrumentsWithPermissions = data.results.map(function (item) {
					return {
						id: item.id,
						object_permissions:
							item.instrument_type_object.object_permissions.map(function (
								item
							) {
								item.permission = item.permission.split('_')[0] + '_instrument'

								return item
							}),
					}
				})

				entityResolverService
					.updateBulk('instrument', instrumentsWithPermissions)
					.then(function () {
						$mdDialog.show({
							controller: 'InfoDialogController as vm',
							templateUrl: 'views/info-dialog-view.html',
							parent: angular.element(document.body),
							targetEvent: $event,
							clickOutsideToClose: false,
							preserveScope: true,
							autoWrap: true,
							skipHide: true,
							multiple: true,
							locals: {
								info: {
									title: 'Success',
									description: 'Instrument Permissions successfully updated',
								},
							},
						})

						vm.recalculating = false
						$scope.$apply()
					})
			})
	}

	vm.recalculateAccountPermissions = function ($event) {
		vm.recalculating = true
		vm.isSaved = false

		entityResolverService
			.getList('account', { pageSize: 1000 })
			.then(function (data) {
				console.log('data', data)

				var accountsWithPermissions = data.results.map(function (item) {
					return {
						id: item.id,
						object_permissions: item.type_object.object_permissions.map(
							function (item) {
								item.permission = item.permission.split('_')[0] + '_account'

								return item
							}
						),
					}
				})

				entityResolverService
					.updateBulk('account', accountsWithPermissions)
					.then(function () {
						$mdDialog.show({
							controller: 'InfoDialogController as vm',
							templateUrl: 'views/info-dialog-view.html',
							parent: angular.element(document.body),
							targetEvent: $event,
							clickOutsideToClose: false,
							preserveScope: true,
							autoWrap: true,
							skipHide: true,
							multiple: true,
							locals: {
								info: {
									title: 'Success',
									description: 'Accounts Permissions successfully updated',
								},
							},
						})

						vm.recalculating = false
						$scope.$apply()
					})
			})
	}

	vm.recalculateAccountAndTransactionsPermissions = function ($event) {
		vm.recalculating = true
		vm.isSaved = false

		entityResolverService
			.getList('account', { pageSize: 1000 })
			.then(function (data) {
				console.log('data', data)

				var accountsWithPermissions = data.results.map(function (item) {
					return {
						id: item.id,
						object_permissions: item.type_object.object_permissions.map(
							function (item) {
								item.permission = item.permission.split('_')[0] + '_account'

								return item
							}
						),
					}
				})

				entityResolverService
					.updateBulk('account', accountsWithPermissions)
					.then(function () {
						complexTransactionService
							.recalculatePermissionTransaction()
							.then(function (value) {
								$mdDialog.show({
									controller: 'InfoDialogController as vm',
									templateUrl: 'views/info-dialog-view.html',
									parent: angular.element(document.body),
									targetEvent: $event,
									clickOutsideToClose: false,
									preserveScope: true,
									autoWrap: true,
									skipHide: true,
									multiple: true,
									locals: {
										info: {
											title: 'Success',
											description:
												'Accounts Permissions and Transaction Permissions successfully updated',
										},
									},
								})

								vm.recalculating = false
								$scope.$apply()
							})
					})
			})
	}

	vm.getPermissionsFromState = function () {
		var result = []
		var obj

		var manage_code =
			'manage_' + vm.entityType.split('-').join('').toLowerCase()
		var change_code =
			'change_' + vm.entityType.split('-').join('').toLowerCase()
		var view_code = 'view_' + vm.entityType.split('-').join('').toLowerCase()

		vm.selectedRows.forEach(function (item) {
			obj = { id: item.id, object_permissions: [] }

			vm.groups.forEach(function (group) {
				item.object_permissions.forEach(function (perm) {
					if (perm.group === group.id) {
						if (
							perm.permission.indexOf('manage') !== -1 &&
							group.isManageIndeterminate
						) {
							obj.object_permissions.push(perm)
						}

						if (
							perm.permission.indexOf('change') !== -1 &&
							group.isChangeIndeterminate
						) {
							obj.object_permissions.push(perm)
						}

						if (
							perm.permission.indexOf('view') !== -1 &&
							group.isViewIndeterminate
						) {
							obj.object_permissions.push(perm)
						}
					}
				})

				if (group.isManageChecked) {
					obj.object_permissions.push({
						group: group.id,
						member: null,
						permission: manage_code,
					})
				}

				if (group.isChangeChecked) {
					obj.object_permissions.push({
						group: group.id,
						member: null,
						permission: change_code,
					})
				}

				if (group.isViewChecked) {
					obj.object_permissions.push({
						group: group.id,
						member: null,
						permission: view_code,
					})
				}
			})

			result.push(obj)
		})

		return result
	}

	vm.save = function ($event) {
		var permissions = vm.getPermissionsFromState()

		console.log('permissions', permissions)

		vm.updatePermissions($event, permissions).then(function (value) {
			parentEntityViewerDataService.resetData()
			parentEntityViewerDataService.resetRequestParameters()

			var rootGroup = parentEntityViewerDataService.getRootGroupData()

			parentEntityViewerDataService.setActiveRequestParametersId(
				rootGroup.___id
			)

			parentEntityViewerEventService.dispatchEvent(evEvents.UPDATE_TABLE)

			vm.isSaved = true

			console.log('isSaved', vm.isSaved)

			$scope.$apply()
		})
	}

	vm.toggleManage = function ($event, group) {
		if (group.members.indexOf(vm.member.id) !== -1) {
			if (group.isManageChecked) {
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
									'Are you sure you want to proceed with limiting the Manage access rights? In this case you will lose ability to assign access right for this object.',
							},
						},
						preserveScope: true,
						autoWrap: true,
						skipHide: true,
						multiple: true,
					})
					.then(function (res) {
						console.log('res', res)
						if (res.status === 'agree') {
							group.isManageChecked = !group.isManageChecked
							group.isManageIndeterminate = false
							vm.isSaved = false
						}
					})
			} else {
				group.isManageChecked = !group.isManageChecked
				group.isManageIndeterminate = false
				vm.isSaved = false
			}
		} else {
			group.isManageChecked = !group.isManageChecked
			group.isManageIndeterminate = false
			vm.isSaved = false
		}
	}

	vm.toggleChange = function ($event, group) {
		group.isChangeChecked = !group.isChangeChecked
		group.isChangeIndeterminate = false
		vm.isSaved = false
	}

	vm.toggleView = function ($event, group) {
		group.isViewChecked = !group.isViewChecked
		group.isViewIndeterminate = false
		vm.isSaved = false
	}

	vm.updateStates = function () {
		console.time('Update States')

		var permCounter = {}

		vm.groups.forEach(function (group) {
			group.isManageIndeterminate = false
			group.isChangeIndeterminate = false
			group.isViewIndeterminate = false

			group.isManageChecked = false
			group.isChangeChecked = false
			group.isViewChecked = false

			permCounter[group.id] = {
				manage: 0,
				change: 0,
				view: 0,
			}
		})

		vm.selectedRows.forEach(function (item) {
			vm.groups.forEach(function (group) {
				if (!permCounter.hasOwnProperty(group.id)) {
					permCounter[group.id] = {
						manage: 0,
						change: 0,
						view: 0,
					}
				}

				item.object_permissions.forEach(function (perm) {
					if (group.id === perm.group) {
						if (perm.permission.indexOf('manage_') !== -1) {
							group.isManageIndeterminate = true

							permCounter[group.id].manage = permCounter[group.id].manage + 1
						}

						if (perm.permission.indexOf('change_') !== -1) {
							group.isChangeIndeterminate = true

							permCounter[group.id].change = permCounter[group.id].change + 1
						}

						if (perm.permission.indexOf('view_') !== -1) {
							group.isViewIndeterminate = true

							permCounter[group.id].view = permCounter[group.id].view + 1
						}
					}
				})
			})
		})

		vm.groups.forEach(function (group) {
			if (
				permCounter[group.id].manage === vm.selectedRows.length &&
				vm.selectedRows.length !== 0
			) {
				group.isManageChecked = true
				group.isManageIndeterminate = false
			}

			if (
				permCounter[group.id].change === vm.selectedRows.length &&
				vm.selectedRows.length !== 0
			) {
				group.isChangeChecked = true
				group.isChangeIndeterminate = false
			}

			if (
				permCounter[group.id].view === vm.selectedRows.length &&
				vm.selectedRows.length !== 0
			) {
				group.isViewChecked = true
				group.isViewIndeterminate = false
			}
		})

		console.timeEnd('Update States')

		setTimeout(function () {
			$scope.$apply()
		}, 0)
	}

	parentEntityViewerEventService.addEventListener(
		evEvents.FINISH_RENDER,
		function () {
			vm.selectedRows = vm.getSelectedRows()

			vm.updateStates()
		}
	)

	vm.getMember = function () {
		usersService.getMyCurrentMember().then(function (data) {
			vm.member = data

			vm.getGroups()
		})
	}

	vm.init = function () {
		vm.entityType = parentEntityViewerDataService.getEntityType()

		vm.getMember()
	}

	vm.init()
}
