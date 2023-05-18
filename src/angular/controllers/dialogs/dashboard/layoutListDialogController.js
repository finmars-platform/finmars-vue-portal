/**
 * Created by sergey on 04.11.16.
 */

import uiService from '@/angular/services/uiService'

import shareConfigurationFileService from '@/angular/services/shareConfigurationFileService'
// import backendConfigurationImportService from '@/angular/services/backendConfigurationImportService';
import inviteToSharedConfigurationFileService from '@/angular/services/inviteToSharedConfigurationFileService'

export default function (
	$scope,
	$mdDialog,
	backendConfigurationImportService,
	data
) {
	var vm = this

	vm.readyStatus = { items: false }
	var dashboardDataService = data.dashboardDataService
	var layoutsList = [] // list of layouts without properties added for rendering
	var selectedLayout = null

	vm.getList = function () {
		return new Promise(function (resolve, reject) {
			uiService.getDashboardLayoutList().then(function (data) {
				vm.items = data.results
				layoutsList = data.results

				vm.readyStatus.items = true
				$scope.$apply()
				resolve(data)
			})
		})
	}

	vm.shareLayout = function ($event, item) {
		var type = 'dashboard_viewer'

		$mdDialog
			.show({
				controller: 'UiShareLayoutDialogController as vm',
				templateUrl: 'views/dialogs/ui/ui-share-layout-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				multiple: true,
				clickOutsideToClose: false,
				locals: {
					options: {
						layout: item,
						type: type,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.getList()
				}
			})
	}

	vm.renameLayout = function ($event, layout, index) {
		$event.stopPropagation()

		var layoutData = layoutsList[index]

		$mdDialog
			.show({
				controller: 'UiLayoutSaveAsDialogController as vm',
				templateUrl: 'views/dialogs/ui/ui-layout-save-as-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				multiple: true,
				clickOutsideToClose: false,
				locals: {
					options: {
						layoutName: layoutData.name,
						layoutUserCode: layoutData.user_code,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					layoutData.name = res.data.name
					layout.name = res.data.name
					layoutData.user_code = res.data.user_code
					layout.user_code = res.data.user_code
					/*
                    uiService.updateDashboardLayout(layoutData.id, layoutData).then(function (data) {
                        $scope.$apply()
                    });
                     */
					uiService
						.updateDashboardLayout(layoutData.id, layoutData)
						.then(function (data) {
							var listLayout = dashboardDataService.getListLayout()

							if (listLayout.id === data.id) {
								var activeLayoutData = dashboardDataService.getData()

								listLayout.name = res.data.name
								activeLayoutData.name = res.data.name
								listLayout.user_code = res.data.user_code
								activeLayoutData.user_code = res.data.user_code
								listLayout.modified = data.modified
								activeLayoutData.modified = data.modified

								dashboardDataService.setListLayout(listLayout)
								dashboardDataService.setData(activeLayoutData)
							}

							$scope.$apply()
						})
				}
			})
	}

	vm.deleteItem = function (ev, item) {
		ev.stopPropagation()

		$mdDialog
			.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose: false,
				locals: {
					warning: {
						title: 'Warning',
						description: 'Are you sure want to delete this layout?',
					},
				},
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
			})
			.then(function (res) {
				if (res.status === 'agree') {
					uiService.deleteDashboardLayoutByKey(item.id).then(function (data) {
						vm.getList()
					})
				}
			})
	}

	vm.selectLayout = function (layout, $event) {
		$event.stopPropagation()

		if (!selectedLayout || layout.id !== selectedLayout.id) {
			var selectedElem = $event.currentTarget
			var layoutsItemsList = document.querySelectorAll('.ll-layout-item')

			layoutsItemsList.forEach(function (layoutItem) {
				if (layoutItem.classList.contains('active')) {
					layoutItem.classList.remove('active')
				}
			})

			selectedElem.classList.add('active')
			selectedLayout = layout
		}
	}

	vm.setAsDefault = function ($event, item, index) {
		$event.stopPropagation()

		var listLayout = dashboardDataService.getListLayout()
		var activeLayoutData
		var layoutData = layoutsList[index]

		if (!layoutData.is_default) {
			for (var i = 0; i < vm.items.length; i++) {
				var layout = vm.items[i]

				if (layout.is_default) {
					layout.is_default = false
					layoutsList[i].is_default = false

					// uiService.updateDashboardLayout(layoutsList[i].id, layoutsList[i]);
					if (listLayout.id === layout.id) {
						activeLayoutData = dashboardDataService.getData()

						listLayout.is_default = false
						activeLayoutData.is_default = false

						dashboardDataService.setListLayout(listLayout)
						dashboardDataService.setData(activeLayoutData)
					}

					break
				}
			}

			layoutData.is_default = true
			item.is_default = true

			uiService
				.updateDashboardLayout(layoutData.id, layoutData)
				.then(function (updatedData) {
					if (listLayout.id === item.id) {
						activeLayoutData = dashboardDataService.getData()

						listLayout.is_default = true
						activeLayoutData.is_default = true
						listLayout.modified = updatedData.modified
						activeLayoutData.modified = updatedData.modified

						dashboardDataService.setListLayout(listLayout)
						dashboardDataService.setData(activeLayoutData)
					}
				})
		}
	}

	vm.isDefaultLayout = function (layout) {
		return layout.is_default
	}

	vm.importConfiguration = function (resolve) {
		backendConfigurationImportService
			.importConfigurationAsJson(vm.importConfig)
			.then(function (data) {
				vm.importConfig = data

				$scope.$apply()

				if (vm.importConfig.task_status === 'SUCCESS') {
					resolve()
				} else {
					setTimeout(function () {
						vm.importConfiguration(resolve)
					}, 1000)
				}
			})
	}

	vm.pullUpdate = function ($event, item, $index) {
		console.log('Pull Update for Layout:', item)

		shareConfigurationFileService
			.getByKey(item.sourced_from_global_layout)
			.then(function (data) {
				var sharedFile = data

				vm.importConfig = { data: sharedFile.data, mode: 'overwrite' }

				new Promise(function (resolve, reject) {
					vm.importConfiguration(resolve)
				}).then(function (data) {
					console.log('Import Finished')

					vm.getList().then(function (value) {
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
									description: 'Layout is updated',
								},
							},
						})
					})
				})
			})
	}

	vm.acceptInvite = function ($event, invite) {
		console.log('Accept invite: ', $event, invite)

		invite.status = 1

		// TODO import configuration and create new layout with sourced_from_global_layout

		inviteToSharedConfigurationFileService
			.updateMyInvite(invite.id, invite)
			.then(function (data) {
				var sharedFile = data

				vm.importConfig = {
					data: sharedFile.shared_configuration_file_object.data,
					mode: 'overwrite',
				}

				new Promise(function (resolve, reject) {
					vm.importConfiguration(resolve)
				}).then(function (data) {
					console.log('Import Finished')

					vm.getInvites()
					vm.getList().then(function (data) {
						var listLayout = dashboardDataService.getListLayout()

						vm.items.forEach(function (item) {
							if (
								item.name === sharedFile.shared_configuration_file_object.name
							) {
								item.sourced_from_global_layout =
									sharedFile.shared_configuration_file

								uiService
									.updateDashboardLayout(item.id, item)
									.then(function (value) {
										vm.getList().then(function (value1) {
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
														description: 'Layout is installed',
													},
												},
											})
										})
									})
							}
						})
					})
				})
			})
	}

	vm.declineInvite = function ($event, invite) {
		console.log('Decline invite: ', $event, invite)

		invite.status = 2

		inviteToSharedConfigurationFileService
			.updateMyInvite(invite.id, invite)
			.then(function (value) {
				vm.getInvites()
			})
	}

	vm.getInvites = function () {
		inviteToSharedConfigurationFileService
			.getListOfMyInvites({
				filters: {
					status: '0',
				},
			})
			.then(function (data) {
				vm.invites = data.results

				console.log('vm.invites', vm.invites)

				$scope.$apply()
			})
	}

	vm.openLayout = function (layout, $event) {
		$event.stopPropagation()

		selectedLayout = layout

		vm.agree()
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		if (selectedLayout) {
			selectedLayout.is_active = true

			uiService
				.updateDashboardLayout(selectedLayout.id, selectedLayout)
				.then(function () {
					$mdDialog.hide({
						status: 'agree',
						data: { layout: selectedLayout },
					})
				})
		} else {
			$mdDialog.hide({ status: 'disagree' })
		}
	}

	vm.init = function () {
		vm.getInvites()
		vm.getList()
	}

	vm.init()
}
