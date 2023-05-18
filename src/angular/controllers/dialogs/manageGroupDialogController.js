import membersAndGroupsService from '../../services/membersAndGroupsService'
import entityResolverService from '../../services/entityResolverService'

export default function ($scope, $mdDialog, metaContentTypesService, groupId) {
	var vm = this

	vm.membersList = []
	vm.assignedMembersList = []

	vm.group = null

	vm.readyStatus = { content: false }

	vm.isSaved = true

	vm.permissionTable = {
		data: [
			{
				name: 'Portfolios',
				content_type: 'portfolios.portfolio',
				data: {
					create_objects: false,
					inherit_rights: false,
					manage_attributes: false,
					creator_manage: false,
					creator_change: false,
					creator_view: false,
					other_manage: false,
					other_change: false,
					other_view: false,
				},
			},
			{
				name: 'Accounts',
				content_type: 'accounts.account',
				data: {
					create_objects: false,
					inherit_rights: false,
					manage_attributes: false,
					creator_manage: false,
					creator_change: false,
					creator_view: false,
					other_manage: false,
					other_change: false,
					other_view: false,
				},
			},
			{
				name: 'Instruments',
				content_type: 'instruments.instrument',
				data: {
					create_objects: false,
					inherit_rights: false,
					manage_attributes: false,
					creator_manage: false,
					creator_change: false,
					creator_view: false,
					other_manage: false,
					other_change: false,
					other_view: false,
				},
			},
			{
				name: 'Counterparties',
				content_type: 'counterparties.counterparty',
				data: {
					create_objects: false,
					inherit_rights: false,
					manage_attributes: false,
					creator_manage: false,
					creator_change: false,
					creator_view: false,
					other_manage: false,
					other_change: false,
					other_view: false,
				},
			},
			{
				name: 'Responsibles',
				content_type: 'counterparties.responsible',
				data: {
					create_objects: false,
					inherit_rights: false,
					manage_attributes: false,
					creator_manage: false,
					creator_change: false,
					creator_view: false,
					other_manage: false,
					other_change: false,
					other_view: false,
				},
			},
			{
				name: 'Currency',
				content_type: 'currencies.currency',
				data: {
					create_objects: false,
					inherit_rights: false,
					manage_attributes: false,
					creator_manage: false,
					creator_change: false,
					creator_view: false,
					other_manage: false,
					other_change: false,
					other_view: false,
				},
			},
			{
				name: 'Strategy 1',
				content_type: 'strategies.strategy1',
				data: {
					create_objects: false,
					inherit_rights: false,
					manage_attributes: false,
					creator_manage: false,
					creator_change: false,
					creator_view: false,
					other_manage: false,
					other_change: false,
					other_view: false,
				},
			},
			{
				name: 'Strategy 2',
				content_type: 'strategies.strategy2',
				data: {
					create_objects: false,
					inherit_rights: false,
					manage_attributes: false,
					creator_manage: false,
					creator_change: false,
					creator_view: false,
					other_manage: false,
					other_change: false,
					other_view: false,
				},
			},
			{
				name: 'Strategy 3',
				content_type: 'strategies.strategy3',
				data: {
					create_objects: false,
					inherit_rights: false,
					manage_attributes: false,
					creator_manage: false,
					creator_change: false,
					creator_view: false,
					other_manage: false,
					other_change: false,
					other_view: false,
				},
			},
			{
				name: 'Account Type',
				content_type: 'accounts.accounttype',
				data: {
					create_objects: false,
					inherit_rights: false,
					manage_attributes: false,
					creator_manage: false,
					creator_change: false,
					creator_view: false,
					other_manage: false,
					other_change: false,
					other_view: false,
				},
			},
			{
				name: 'Instrument Type',
				content_type: 'instruments.instrumenttype',
				data: {
					create_objects: false,
					inherit_rights: false,
					manage_attributes: false,
					creator_manage: false,
					creator_change: false,
					creator_view: false,
					other_manage: false,
					other_change: false,
					other_view: false,
				},
			},
			{
				name: 'Transaction Type',
				content_type: 'transactions.transactiontype',
				data: {
					create_objects: false,
					inherit_rights: false,
					manage_attributes: false,
					creator_manage: false,
					creator_change: false,
					creator_view: false,
					other_manage: false,
					other_change: false,
					other_view: false,
				},
			},
		],
		configuration: [
			{
				name: 'User Attributes',
				content_type: 'obj_attrs.attributetype',
				data: {
					creator_change: false,
					creator_view: false,
				},
			},
			{
				name: 'Reference Tables',
				content_type: 'reference_tables.referencetable',
				data: {
					creator_change: false,
					creator_view: false,
				},
			},
			{
				name: 'Templates',
				content_type: 'ui.templatelayout',
				data: {
					creator_change: false,
					creator_view: false,
				},
			},
			{
				name: 'Mapping Tables',
				content_type: 'integrations.mappingtable',
				data: {
					creator_change: false,
					creator_view: false,
				},
			},
			{
				name: 'Price Schemes',
				content_type: 'integrations.pricedownloadscheme',
				data: {
					creator_change: false,
					creator_view: false,
				},
			},
			{
				name: 'Instrument Schemes',
				content_type: 'integrations.instrumentdownloadscheme',
				data: {
					creator_change: false,
					creator_view: false,
				},
			},
			{
				name: 'Data Import',
				content_type: 'csv_import.csvimportscheme',
				data: {
					creator_change: false,
					creator_view: false,
				},
			},
			{
				name: 'Transaction Import',
				content_type: 'integrations.complextransactionimportscheme',
				data: {
					creator_change: false,
					creator_view: false,
				},
			},
			{
				name: 'Complex Import',
				content_type: 'complex_import.compleximportscheme',
				data: {
					creator_change: false,
					creator_view: false,
				},
			},
			{
				name: 'Aliases',
				content_type: 'ui.userfield',
				data: {
					creator_change: false,
					creator_view: false,
				},
			},
		],
		function: [
			{
				name: 'Import Data',
				content_type: 'function.import_data',
				data: {
					creator_view: false,
				},
			},
			{
				name: 'Import Transactions',
				content_type: 'function.import_transactions',
				data: {
					creator_view: false,
				},
			},
			{
				name: 'Import Complex',
				content_type: 'function.import_complex',
				data: {
					creator_view: false,
				},
			},
			{
				name: 'Import From Provider - Instrument',
				content_type: 'function.provider_download_instrument',
				data: {
					creator_view: false,
				},
			},
			{
				name: 'Import From Provider - Prices',
				content_type: 'function.provider_download_price',
				data: {
					creator_view: false,
				},
			},
		],
	}

	vm.checkConfigurationSection = function () {
		var result = true

		vm.permissionTable.configuration.forEach(function (item) {
			Object.keys(item.data).forEach(function (key) {
				if (!item.data[key]) {
					result = false
				}
			})
		})

		return result
	}

	vm.toggleConfigurationSection = function () {
		var toggleTo = !vm.checkConfigurationSection()
		console.log('permissions toggleConfigurationSection ', toggleTo)
		vm.permissionTable.configuration.forEach(function (item) {
			Object.keys(item.data).forEach(function (key) {
				item.data[key] = toggleTo
			})
		})
	}

	vm.presetChange = function ($event) {
		console.log('activePreset', vm.activePresetId)

		var preset

		vm.presets.forEach(function (item) {
			if (item.id === vm.activePresetId) {
				preset = item
			}
		})

		console.log('preset', preset)

		vm.permissionTable = vm.permissionTable.map(function (item) {
			Object.keys(preset.data).forEach(function (key) {
				item.data[key] = preset.data[key]
			})

			return item
		})

		setTimeout(function () {
			$scope.$apply()
		}, 0)

		console.log('vm.permissionTable', vm.permissionTable)
	}

	vm.updateCheckbox = function (item, prop) {
		item.data[prop] = !item.data[prop]

		if (!item.data[prop]) {
			switch (prop) {
				case 'other_view':
					item.data['other_change'] = false
					break
				case 'creator_view':
					item.data['creator_change'] = false
					break
			}
		}

		vm.isSaved = false

		if (prop === 'create_objects' && item.data[prop] === false) {
			Object.keys(item.data).forEach(function (key) {
				if (
					['other_manage', 'other_change', 'other_view'].indexOf(key) === -1
				) {
					item.data[key] = false
				}
			})
		}

		if (prop === 'inherit_rights' && item.data[prop] === true) {
			Object.keys(item.data).forEach(function (key) {
				if (key !== 'create_objects' && key !== 'inherit_rights') {
					item.data[key] = false
				}
			})
		}

		if (prop === 'manage_attributes' && item.data[prop] === false) {
			vm.permissionTable.configuration.forEach(function (tableItem) {
				if (tableItem.content_type === 'obj_attrs.attributetype') {
					tableItem.data.creator_view = false
					tableItem.data.creator_change = false
				}
			})
		}

		if (item.content_type === 'obj_attrs.attributetype') {
			if (prop === 'creator_view') {
				item.data['creator_change'] = item.data[prop]
			}

			if (prop === 'creator_change') {
				item.data['creator_view'] = item.data[prop]
			}

			console.log('prop', prop)

			vm.permissionTable.data.forEach(function (tableItem) {
				tableItem.data.manage_attributes = item.data['creator_view']
			})
		}

		if (item.content_type === 'ui.userfield') {
			if (prop === 'creator_view') {
				item.data['creator_change'] = item.data[prop]
			}

			if (prop === 'creator_change') {
				item.data['creator_view'] = item.data[prop]
			}
		}
	}

	vm.canInheritRight = function (contentType) {
		return (
			['accounts.account', 'instruments.instrument'].indexOf(contentType) !== -1
		)
	}

	vm.overwritePermissions = function ($event, permissionTableRow, hideDialog) {
		vm.processing = true

		return new Promise(function (resolve, reject) {
			var entityType = metaContentTypesService.findEntityByContentType(
				permissionTableRow.content_type
			)

			if (entityType === 'currency') {
				if (!hideDialog) {
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

					vm.processing = false

					vm.isSaved = false
				}

				resolve()
			} else {
				entityResolverService
					.getList(entityType, { pageSize: 1000 })
					.then(function (data) {
						console.log('data', data)

						var itemsWithPermissions = data.results.map(function (item) {
							return {
								id: item.id,
								object_permissions: item.object_permissions.filter(function (
									item
								) {
									return item.group !== vm.group.id
								}),
							}
						})

						var manage_code =
							'manage_' + entityType.split('-').join('').toLowerCase()
						var change_code =
							'change_' + entityType.split('-').join('').toLowerCase()
						var view_code =
							'view_' + entityType.split('-').join('').toLowerCase()

						itemsWithPermissions.forEach(function (itemWithPermission) {
							if (permissionTableRow.data.other_manage) {
								itemWithPermission.object_permissions.push({
									group: vm.group.id,
									member: null,
									permission: manage_code,
								})
							}

							if (permissionTableRow.data.other_change) {
								itemWithPermission.object_permissions.push({
									group: vm.group.id,
									member: null,
									permission: change_code,
								})
							}

							if (permissionTableRow.data.other_view) {
								itemWithPermission.object_permissions.push({
									group: vm.group.id,
									member: null,
									permission: view_code,
								})
							}
						})

						console.log('entityType', entityType)

						entityResolverService
							.updateBulk(entityType, itemsWithPermissions)
							.then(function () {
								if (!hideDialog) {
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

									vm.processing = false
									$scope.$apply()
								}

								vm.isSaved = false

								resolve()
							})
					})
			}
		})
	}

	vm.overwritePermissionAll = function ($event) {
		var promises = []

		vm.processing = true

		vm.permissionTable.data.forEach(function (permissionTableRow) {
			promises.push(vm.overwritePermissions($event, permissionTableRow, true))
		})

		console.log('promises', promises)

		Promise.all(promises).then(function () {
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
						description: 'All Permissions successfully updated',
					},
				},
			})

			vm.processing = false
			vm.isSaved = false

			$scope.$apply()
		})
	}

	vm.getData = function () {
		membersAndGroupsService.getGroupByKey(groupId).then(function (data) {
			vm.group = data

			if (vm.group.permission_table) {
				vm.permissionTable = Object.assign(
					{},
					vm.permissionTable,
					vm.group.permission_table
				)
			}

			membersAndGroupsService.getMembersList().then(function (data) {
				vm.membersList = data.results

				var assignedMembersIds = vm.group.members

				if (assignedMembersIds && assignedMembersIds.length > 0) {
					assignedMembersIds.map(function (assignedId) {
						vm.membersList.map(function (member, memberIndex) {
							var memberId = member['id']

							if (memberId === assignedId) {
								vm.membersList.splice(memberIndex, 1)
								vm.assignedMembersList.push(member)
							}
						})
					})
				}

				console.log('vm.membersList', vm.membersList)
				console.log('vm.assignedMembersList', vm.assignedMembersList)

				vm.readyStatus.content = true

				$scope.$apply()
			})
		})
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		vm.group.members = vm.assignedMembersList.map(function (group) {
			return group.id
		})

		vm.group.permission_table = vm.permissionTable

		membersAndGroupsService
			.updateGroup(vm.group.id, vm.group)
			.then(function () {
				$mdDialog.hide({ status: 'agree' })
			})
	}

	vm.save = function ($event) {
		vm.group.members = vm.assignedMembersList.map(function (group) {
			return group.id
		})

		vm.group.permission_table = vm.permissionTable

		membersAndGroupsService
			.updateGroup(vm.group.id, vm.group)
			.then(function () {
				vm.isSaved = true

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
							description: 'Group Settings successfully updated',
						},
					},
				})

				$scope.$apply()
			})
	}

	vm.init = function () {
		setTimeout(function () {
			vm.dialogElemToResize = document.querySelector(
				'.permissionsGroupManagerDialogETD'
			)
		}, 100)

		vm.getData()
	}

	vm.init()
}
