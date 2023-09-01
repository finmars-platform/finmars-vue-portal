/**
 * Created by szhitenev on 05.05.2016.
 */

// import {embedDashboard} from '@/angular/core/superset/index'
// import supersetService from "../services/supersetService";

import uiService from '../services/uiService'

import DashboardDataService from '../services/dashboard/dashboardDataService'
import DashboardEventService from '../services/eventService'
import supersetService from '../services/supersetService'

import dashboardEvents from '../services/dashboard/dashboardEvents'
import dashboardComponentStatuses from '../services/dashboard/dashboardComponentStatuses'
import metaHelper from '../helpers/meta.helper'

import toastNotificationService from '@/angular/core/services/toastNotificationService'

export default function ($scope, $stateParams, $mdDialog) {
	var vm = this

	vm.readyStatus = { data: false }
	vm.layout = null

	vm.componentFillInModeData = null

	vm.dashboardDataService = null
	vm.dashboardEventService = null

	vm.popupData = {
		dashboardDataService: vm.dashboardDataService,
		dashboardEventService: vm.dashboardEventService,
	}

	vm.processing = false

	vm.generateProjection = function (layout) {
		var result = []



		var data = JSON.parse(JSON.stringify(layout.data))

		data.tabs.forEach(function (tab) {
			tab.accordion_layout = []

			if (tab.accordions) {
				var rowsUsedInAccordions = []

				tab.accordions.forEach(function (accordionItem) {
					if (accordionItem.from === accordionItem.to) {
						rowsUsedInAccordions.push(accordionItem.from)
					} else {
						for (var i = accordionItem.from; i <= accordionItem.to; i = i + 1) {
							rowsUsedInAccordions.push(i)
						}
					}
				})



				tab.layout.rows.forEach(function (item, index) {
					if (rowsUsedInAccordions.indexOf(index) === -1) {
						var accordion = {
							name: '',
							from: index,
							to: index,
							type: 'proxy_accordion',
							items: [item],
						}

						tab.accordion_layout.push(accordion)
					}
				})

				tab.accordions.forEach(function (accordionItem) {
					var accordion = {
						name: accordionItem.name,
						from: accordionItem.from,
						to: accordionItem.to,
						type: 'accordion',
						items: [],
					}

					tab.layout.rows.forEach(function (row, index) {
						if (index >= accordionItem.from && index <= accordionItem.to) {
							accordion.items.push(row)
						}
					})

					tab.accordion_layout.push(accordion)
				})
			} else {
				var accordion = {
					name: '',
					type: 'proxy_accordion',
					items: [],
					from: 0,
					to: tab.layout.rows.length - 1,
				}

				tab.layout.rows.forEach(function (row) {
					accordion.items.push(row)
				})

				tab.accordion_layout.push(accordion)
			}

			tab.accordion_layout = tab.accordion_layout.sort(function (a, b) {
				if (a.from < b.from) {
					return -1
				}

				if (a.from > b.from) {
					return 1
				}

				return 0
			})

			result.push(tab)
		})



		return result
	}

	vm.getLayout = function (layoutId) {
		vm.readyStatus.data = false

		uiService.getDashboardLayoutByKey(layoutId).then(function (data) {
			vm.dashboardDataService = new DashboardDataService()
			vm.dashboardEventService = new DashboardEventService()

			vm.popupData = {
				dashboardDataService: vm.dashboardDataService,
				dashboardEventService: vm.dashboardEventService,
			}

			vm.layout = data




			vm.initEventListeners()

			vm.dashboardDataService.setData(vm.layout)
			vm.dashboardDataService.setListLayout(JSON.parse(angular.toJson(data)))

			vm.readyStatus.data = true

			vm.projection = vm.generateProjection(vm.layout)

			if (vm.projection && vm.projection.length) {
				vm.projection[0].active = true
			}

			vm.dashboardDataService.setProjection(vm.projection)

			vm.initDashboardComponents()

			$scope.$apply()
		})
	}

	vm.getDefaultLayout = function () {
		vm.readyStatus.data = false

		uiService.getDefaultDashboardLayout().then(function (data) {
			if (data.results.length) {
				vm.layout = data.results[0]
			}

			if (vm.layout) {
				vm.projection = vm.generateProjection(vm.layout)

				if (vm.projection && vm.projection.length) {
					vm.projection[0].active = true
				}

				vm.dashboardDataService.setProjection(vm.projection)

				vm.dashboardDataService.setData(vm.layout)
				vm.dashboardDataService.setListLayout(
					JSON.parse(angular.toJson(vm.layout))
				)

				vm.readyStatus.data = true

				vm.initDashboardComponents()

				$scope.$apply()
			} else {
				vm.readyStatus.data = true
				$scope.$apply()
			}
		})
	}

	vm.openDashboardLayout = function () {
		vm.readyStatus.data = false
		var activeLayoutUserCode = $stateParams.layoutUserCode



		if (activeLayoutUserCode) {
			uiService
				.getDashboardLayoutList()
				.then(function (data) {
					if (data.results.length) {
						var layouts = data.results

						for (var i = 0; i < layouts.length; i++) {
							if (layouts[i].user_code === activeLayoutUserCode) {
								vm.layout = layouts[i]
								break
							}
						}
					}



					vm.dashboardDataService.setData(vm.layout)
					vm.dashboardDataService.setListLayout(
						JSON.parse(angular.toJson(vm.layout))
					)

					vm.projection = vm.generateProjection(vm.layout)

					if (vm.projection && vm.projection.length) {
						vm.projection[0].active = true
					}

					vm.dashboardDataService.setProjection(vm.projection)

					vm.readyStatus.data = true

					vm.initDashboardComponents()

					$scope.$apply()
				})
				.catch(function (error) {
					vm.getDefaultLayout()
				})
		} else {
			vm.getDefaultLayout()
		}
	}

	// Deprecated
	vm.openLayoutList = function ($event) {
		$mdDialog
			.show({
				controller: 'DashboardLayoutListDialogController as vm',
				templateUrl: 'views/dialogs/dashboard/layout-list-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				preserveScope: false,
				locals: {
					data: {
						dashboardDataService: vm.dashboardDataService,
						dashboardEventService: vm.dashboardEventService,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.getLayout(res.data.layout.id)
				}
			})
	}

	vm.saveDashboardLayout = function ($event) {
		uiService
			.updateDashboardLayout(vm.layout.id, vm.layout)
			.then(function (data) {
				vm.layout = data

				vm.dashboardDataService.setListLayout(JSON.parse(JSON.stringify(data)))

				toastNotificationService.success('Dashboard Layout is Saved')

				$scope.$apply()
			})
	}

	// Deprecated
	vm.makeCopyDashboardLayout = function ($event) {
		var layout = JSON.parse(JSON.stringify(vm.layout))

		layout.name = layout.name + '_copy'
		layout.user_code = layout.user_code + '_copy'

		layout.is_default = false
		layout.origin_for_global_layout = null
		layout.sourced_from_global_layout = null

		uiService.createDashboardLayout(layout).then(function (data) {
			vm.layout = data

			toastNotificationService.success('Dashboard Layout is Duplicated')

			$scope.$apply()
		})
	}

	// Deprecated
	vm.exportDashboardLayout = function ($event) {
		$mdDialog.show({
			controller: 'DashboardLayoutExportDialogController as vm',
			templateUrl:
				'views/dialogs/dashboard/dashboard-layout-export-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			locals: {
				data: { layout: vm.layout },
			},
		})
	}

	vm.clearActiveTabUfaFilters = function () {
		vm.dashboardEventService.dispatchEvent(
			dashboardEvents.CLEAR_ACTIVE_TAB_USE_FROM_ABOVE_FILTERS
		)
	}

	var componentsFinishedLoading = function () {
		var statusesObject = vm.dashboardDataService.getComponentStatusesAll()
		var componentsIds = Object.keys(statusesObject)

		var processing = false

		for (var i = 0; i < componentsIds.length; i++) {
			if (
				statusesObject[componentsIds[i]] !==
					dashboardComponentStatuses.ACTIVE &&
				statusesObject[componentsIds[i]] !== dashboardComponentStatuses.ERROR
			) {
				processing = true
				break
			}
		}

		return processing
	}

	vm.refreshActiveTab = function () {
		vm.dashboardEventService.dispatchEvent(dashboardEvents.REFRESH_ACTIVE_TAB)

		var statusesObject = vm.dashboardDataService.getComponentStatusesAll()

		if (!Object.keys(statusesObject).length) {
			vm.processing = false
		} else {
			setTimeout(function () {
				// enable refresh buttons if no components uses active object
				vm.processing = componentsFinishedLoading()
			}, 100)
		}
	}

	vm.refreshAll = function () {
		vm.dashboardEventService.dispatchEvent(dashboardEvents.REFRESH_ALL)

		var statusesObject = vm.dashboardDataService.getComponentStatusesAll()

		if (!Object.keys(statusesObject).length) {
			vm.processing = false
		} else {
			setTimeout(function () {
				// enable refresh buttons if no components uses active object
				vm.processing = componentsFinishedLoading()
			}, 100)
		}
	}

	vm.setActiveTab = function (tab) {
		vm.projection.forEach(function (item) {
			item.active = false
		})

		tab.active = true

		vm.dashboardDataService.setActiveTab(tab)

		// vm.dashboardEventService.dispatchEvent(dashboardEvents.RESIZE)
		setTimeout(function () {
			vm.dashboardEventService.dispatchEvent(dashboardEvents.RESIZE)
			window.dispatchEvent(new Event('resize'))
		}, 0)
	}

	vm.updateLayoutOnComponentChange = function (
		tabNumber,
		rowNumber,
		socketData
	) {
		var colNumber = socketData.column_number

		if (tabNumber === 'fixed_area') {
			vm.layout.data.fixed_area.layout.rows[rowNumber].columns[colNumber] =
				socketData
		} else {
			vm.layout.data.tabs[tabNumber].layout.rows[rowNumber].columns[colNumber] =
				socketData
		}
	}

	vm.initEventListeners = function () {
		vm.dashboardEventService.addEventListener(
			dashboardEvents.COMPONENT_STATUS_CHANGE,
			function () {
				/* var statusesObject = vm.dashboardDataService.getComponentStatusesAll();

                var processed = false;

                Object.keys(statusesObject).forEach(function (componentId) {

                    if (statusesObject[componentId] !== dashboardComponentStatuses.ACTIVE &&
                        statusesObject[componentId] !== dashboardComponentStatuses.ERROR) {

                        processed = true;
                    }

                }); */

				var processed = componentsFinishedLoading()

				if (processed) {
					vm.processing = true
				} else if (vm.processing) {
					vm.processing = false
					$scope.$apply()
				}
			}
		)

		vm.dashboardEventService.addEventListener(
			dashboardEvents.DASHBOARD_LAYOUT_CHANGE,
			function () {
				var layoutToOpen = vm.dashboardDataService.getLayoutToOpen()

				vm.getLayout(layoutToOpen.id)
			}
		)
	}

	var componentBuildingTimeTimeout = {}
	var onComponentBuildingForTooLong = function (compId) {
		componentBuildingTimeTimeout[compId] = setTimeout(function () {
			var statusesObject = metaHelper.recursiveDeepCopy(
				vm.dashboardDataService.getComponentStatusesAll()
			)

			if (
				statusesObject[compId] === dashboardComponentStatuses.PROCESSING ||
				statusesObject[compId] === dashboardComponentStatuses.START
			) {
				vm.dashboardDataService.setComponentStatus(
					compId,
					dashboardComponentStatuses.ERROR
				)
				vm.dashboardEventService.dispatchEvent(
					dashboardEvents.COMPONENT_STATUS_CHANGE
				)
				// throw "id of defective dashboard component " + compId;
			}
		}, 60000)
	}

	var areAllDependenciesCompleted = function (
		compId,
		statusesObject,
		waitingComponents
	) {
		var componentData = vm.dashboardDataService.getComponentById(compId)

		if (
			!componentData ||
			!componentData.settings ||
			!componentData.settings.linked_components ||
			!componentData.settings.linked_components.report_settings
		) {
			return true
		}

		var reportSettings =
			componentData.settings.linked_components.report_settings

		var dependencies = Object.values(reportSettings).filter(function (id) {
			// prevent loop
			const isComponentExist = vm.dashboardDataService.getComponentById(id) // is component exist
			const isComponentUsedInDashboard = !!statusesObject[id] // is component used in dashboard

			return (
				isComponentExist &&
				isComponentUsedInDashboard &&
				!waitingComponents.includes(id)
			)
		})

		return dependencies.every(function (id) {
			return (
				statusesObject[id] === dashboardComponentStatuses.ACTIVE ||
				statusesObject[id] === dashboardComponentStatuses.ERROR
			)
		})
	}

	vm.initDashboardComponents = function () {
		var LIMIT = 2
		var waitingComponents = []

		vm.dashboardEventService.addEventListener(
			dashboardEvents.COMPONENT_STATUS_CHANGE,
			function () {
				var statusesObject = JSON.parse(
					JSON.stringify(vm.dashboardDataService.getComponentStatusesAll())
				)
				var nextComponentToStart = null

				var keys = Object.keys(statusesObject)
				var key

				var activeProcessingComponents = 0

				for (var i = 0; i < keys.length; i = i + 1) {
					key = keys[i]

					if (
						statusesObject[key] === dashboardComponentStatuses.ACTIVE ||
						statusesObject[key] === dashboardComponentStatuses.ERROR
					) {
						if (componentBuildingTimeTimeout.hasOwnProperty(key)) {
							clearTimeout(componentBuildingTimeTimeout[key])
							delete componentBuildingTimeTimeout[key]
						}
					}

					if (
						statusesObject[key] === dashboardComponentStatuses.PROCESSING ||
						statusesObject[key] === dashboardComponentStatuses.START
					) {
						activeProcessingComponents = activeProcessingComponents + 1
					}
				}

				if (activeProcessingComponents < LIMIT) {
					for (var i = 0; i < keys.length; i = i + 1) {
						key = keys[i]

						if (statusesObject[key] === dashboardComponentStatuses.INIT) {
							if (
								areAllDependenciesCompleted(
									key,
									statusesObject,
									waitingComponents
								)
							) {
								waitingComponents = waitingComponents.filter((id) => id !== key)

								vm.dashboardDataService.setComponentStatus(
									key,
									dashboardComponentStatuses.START
								)
								vm.dashboardEventService.dispatchEvent(
									dashboardEvents.COMPONENT_STATUS_CHANGE
								)

								onComponentBuildingForTooLong(key)
								break
							} else {
								if (!waitingComponents.includes(key)) {
									waitingComponents.push(key)
								}
							}
						}
					}
				}
			}
		)
	}

	vm.init = function () {
		vm.dashboardDataService = new DashboardDataService()
		vm.dashboardEventService = new DashboardEventService()

		vm.popupData = {
			dashboardDataService: vm.dashboardDataService,
			dashboardEventService: vm.dashboardEventService,
		}

		vm.openDashboardLayout()
		vm.initEventListeners()
	}

	vm.init()
}
