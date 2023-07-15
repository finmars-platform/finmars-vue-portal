/**
 * Created by szhitenev on 04.11.16.
 */
import AutosaveLayoutService from '@/angular/services/autosaveLayoutService'
import evEvents from '@/angular/services/entityViewerEvents'
import uiService from '@/angular/services/uiService'

import evEvents from '@/angular/services/entityViewerEvents'

import inviteToSharedConfigurationFileService from '@/angular/services/inviteToSharedConfigurationFileService'
import shareConfigurationFileService from '@/angular/services/shareConfigurationFileService'
// import backendConfigurationImportService from '@/angular/services/backendConfigurationImportService';

export default function (
	$scope,
	$mdDialog,
	metaContentTypesService,
	uiService,
	backendConfigurationImportService,
	reportHelper,
	options
) {
	var vm = this

	vm.readyStatus = { items: false }
	var layoutsList = [] // list of layouts without properties added for rendering
	vm.selectedLayout = null

	var entityViewerDataService = options.entityViewerDataService
	var entityViewerEventService = options.entityViewerEventService

	var isRootEntityViewer = entityViewerDataService.isRootEntityViewer()
	var contentType = metaContentTypesService.findContentTypeByEntity(
		options.entityType
	)
	var splitPanelLayoutId = null

	var autosaveLayoutService = new AutosaveLayoutService(
		metaContentTypesService,
		uiService,
		reportHelper
	)

	if (!isRootEntityViewer) {
		var spDefaultLayoutData =
			entityViewerDataService.getSplitPanelDefaultLayout()
		splitPanelLayoutId = spDefaultLayoutData.layoutId
	}

	vm.invites = []
	vm.autosaveLayout = {}

	//var contentType = metaContentTypesService.getContentTypeUIByEntity(options.entityType);

	//;

	vm.getList = function () {
		return new Promise(function (resolve, reject) {
			uiService
				.getListLayout(options.entityType, { pageSize: 1000 })
				.then(function (data) {
					vm.items = data.results
					layoutsList = data.results

					const autosaveLayoutUserCode =
						autosaveLayoutService.getAutosaveLayoutUserCode(contentType)
					const autosaveLayoutIndex = vm.items.findIndex(
						(layout) => layout.user_code === autosaveLayoutUserCode
					)

					if (autosaveLayoutIndex > -1) {
						vm.autosaveLayout = vm.items.splice(autosaveLayoutIndex, 1)[0]
						layoutsList.splice(autosaveLayoutIndex, 1)
					}

					vm.items.forEach(function (item) {
						if (Array.isArray(item.data.filters)) {
							var f
							for (f = 0; f < item.data.filters.length; f++) {
								var filter = item.data.filters[f]

								if (filter.options.hasOwnProperty('use_from_above')) {
									item.hasUseFromAboveFilter = true
									break
								}
							}
						}
					})

					resolve()

					vm.readyStatus.items = true
					$scope.$apply()
				})
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

					uiService
						.updateListLayout(layoutData.id, layoutData)
						.then(function (data) {
							var listLayout = entityViewerDataService.getListLayout()

							if (listLayout.id && listLayout.id === data.id) {
								listLayout.name = data.name
								listLayout.modified = data.name
								entityViewerDataService.setListLayout(listLayout)

								/* if (isRootEntityViewer) {
								middlewareService.setNewEntityViewerLayoutName(layoutData.name); // Give signal to update active layout name in the toolbar
							} else {
								middlewareService.setNewSplitPanelLayoutName(layoutData.name); // Give signal to update active layout name in the toolbar
							} */

								entityViewerEventService.dispatchEvent(
									evEvents.LAYOUT_NAME_CHANGE
								)
							}
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
					uiService.deleteListLayoutByKey(item.id).then(async (data) => {
						if (item.is_default && vm.items.length > 1) {
							// If default layout was deleted and other layouts exist. Make another layout default.

							let nextDefaultLayout =
								vm.items[0].id === item.id ? vm.items[1] : vm.items[0]
							nextDefaultLayout.is_default = true

							await uiService.updateListLayout(
								nextDefaultLayout.id,
								nextDefaultLayout
							)
						}

						vm.getList()
					})
				}
			})
	}

	vm.selectLayout = function (layout, $event) {
		$event.stopPropagation()

		if (!vm.selectedLayout || layout.id !== vm.selectedLayout.id) {
			var selectedElem = $event.currentTarget
			var layoutsItemsList = document.querySelectorAll('.ll-layout-item')

			layoutsItemsList.forEach(function (layoutItem) {
				if (layoutItem.classList.contains('active')) {
					layoutItem.classList.remove('active')
				}
			})

			selectedElem.classList.add('active')
			vm.selectedLayout = layout
		}
	}

	vm.openLayout = function (layout, $event) {
		$event.stopPropagation()

		vm.selectedLayout = layout

		vm.agree()
	}

	var setLayoutAsDefault = function (item, layoutData) {
		var defaultLayoutIndex = vm.items.findIndex(function (layout) {
			return layout.is_default
		})

		if (defaultLayoutIndex > -1) {
			vm.items[defaultLayoutIndex].is_default = false
			layoutsList[defaultLayoutIndex].is_default = false
		}

		if (vm.autosaveLayout.id !== layoutData.id) {
			vm.autosaveLayout.is_default = false
		}
		/*for (var i = 0; i < vm.items.length; i++) {

                var layout = vm.items[i];

                if (layout.is_default) {

                    layout.is_default = false;
                    layoutsList[i].is_default = false;
                    break;
                }

            }*/

		item.is_default = true
		layoutData.is_default = true

		uiService.updateListLayout(layoutData.id, layoutData).then(function (data) {
			// needed to update is_default on front-end
			var listLayout = entityViewerDataService.getListLayout()
			var activeLayoutConfig =
				entityViewerDataService.getActiveLayoutConfiguration()

			if (listLayout.id === layoutData.id) {
				// if active layout made default

				listLayout.is_default = true
				listLayout.modified = data.modified
				activeLayoutConfig.is_default = true
				activeLayoutConfig.modified = data.modified

				entityViewerDataService.setListLayout(listLayout)
				entityViewerDataService.setActiveLayoutConfiguration({
					layoutConfig: activeLayoutConfig,
				})
			} else if (listLayout.is_default) {
				// Active layout is default right now. Mark it as not default

				listLayout.is_default = false
				activeLayoutConfig.is_default = false

				entityViewerDataService.setListLayout(listLayout)
				entityViewerDataService.setActiveLayoutConfiguration({
					layoutConfig: activeLayoutConfig,
				})
			}

			entityViewerEventService.dispatchEvent(evEvents.DEFAULT_LAYOUT_CHANGE)
		})
	}

	var setSpLayoutAsDefault = function (layoutData) {
		var defaultLayoutData = {
			layoutId: layoutData.id,
			name: layoutData.name,
			content_type: layoutData.content_type,
		}

		entityViewerDataService.setSplitPanelDefaultLayout(defaultLayoutData)
		entityViewerEventService.dispatchEvent(
			evEvents.SPLIT_PANEL_DEFAULT_LIST_LAYOUT_CHANGED
		)
		splitPanelLayoutId = layoutData.id
	}

	vm.setAsDefault = function ($event, item, index) {
		$event.stopPropagation()

		var layoutData =
			item.id === vm.autosaveLayout.id ? vm.autosaveLayout : layoutsList[index]

		if (isRootEntityViewer) {
			if (!layoutData.is_default) {
				setLayoutAsDefault(item, layoutData)
			}
		} else if (layoutData.id !== splitPanelLayoutId) {
			setSpLayoutAsDefault(layoutData)
		}
	}

	vm.setAutosaveAsDefault = function ($event, item, index) {
		$event.stopPropagation()

		var layoutData = layoutsList[index]

		if (isRootEntityViewer) {
			if (!layoutData.is_default) {
				setLayoutAsDefault(item, layoutData)
			}
		} else if (layoutData.id !== splitPanelLayoutId) {
			setSpLayoutAsDefault(layoutData)
		}
	}

	vm.isDefaultLayout = function (layout) {
		if (isRootEntityViewer) {
			return layout.is_default
		} else {
			if (splitPanelLayoutId) {
				return splitPanelLayoutId === layout.id
			} else {
				// if there is no specific layout for split panel, show default entity layout
				return layout.is_default
			}
		}
	}

	vm.shareLayout = function ($event, item) {
		var type = 'entity_viewer'

		if (entityViewerDataService.getEntityType().indexOf('report') !== -1) {
			type = 'report_viewer'
		}

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

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		if (vm.selectedLayout) {
			$mdDialog.hide({
				status: 'agree',
				data: {
					layoutName: vm.selectedLayout.name,
					layoutId: vm.selectedLayout.id,
					layoutUserCode: vm.selectedLayout.user_code,
				},
			})
		} else {
			$mdDialog.hide({ status: 'disagree' })
		}
	}

	vm.acceptInvite = function ($event, invite) {


		invite.status = 1

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


					vm.getInvites()

					vm.getList().then(function (data) {
						vm.items.forEach(function (item) {
							if (
								item.name === sharedFile.shared_configuration_file_object.name
							) {
								item.sourced_from_global_layout =
									sharedFile.shared_configuration_file

								uiService
									.updateListLayout(item.id, item)
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


		invite.status = 2

		inviteToSharedConfigurationFileService
			.updateMyInvite(invite.id, invite)
			.then(function (value) {
				vm.getInvites()
			})
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


		shareConfigurationFileService
			.getByKey(item.sourced_from_global_layout)
			.then(function (data) {
				var sharedFile = data

				vm.importConfig = { data: sharedFile.data, mode: 'overwrite' }

				new Promise(function (resolve, reject) {
					vm.importConfiguration(resolve)
				}).then(function (data) {


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

	vm.getInvites = function () {
		inviteToSharedConfigurationFileService
			.getListOfMyInvites({
				filters: {
					status: '0',
				},
			})
			.then(function (data) {
				vm.invites = data.results



				$scope.$apply()
			})
	}

	vm.init = function () {
		vm.getInvites()
		vm.getList()
	}

	vm.init()
}
