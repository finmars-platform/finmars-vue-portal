import dashboardEvents from '../services/dashboard/dashboardEvents'

export default function (
	toastNotificationService,
	uiService,
	evRvLayoutsHelper
) {
	let componentsForLinking = [
		'report_viewer',
		'report_viewer_split_panel',
		'report_viewer_matrix',
		'report_viewer_bars_chart',
		'report_viewer_pie_chart',
		'report_viewer_grand_total',
		'report_viewer_table_chart',
	]

	const getDataForLayoutSelectorWithFilters = function (layouts) {
		var result = []

		layouts.forEach(function (layout) {
			if (!layout.data) console.error('Broken dashboard layout: ', layout)

			var layoutObj = {
				id: layout.id,
				user_code: layout.user_code,
				name: layout.name,
				content: [],
			}

			layoutObj.content = evRvLayoutsHelper.getLinkingToFilters(layout)

			result.push(layoutObj)
		})

		return result
	}

	const getComponentsForLinking = function () {
		return componentsForLinking
	}

	const saveComponentSettingsFromDashboard = function (
		dashboardDataService,
		uiService,
		componentData,
		showNotification
	) {
		var listLayout = dashboardDataService.getListLayout()

		if (listLayout) {
			var layoutData = listLayout.data

			for (var i = 0; i < layoutData.components_types.length; i++) {
				if (layoutData.components_types[i].id === componentData.id) {
					layoutData.components_types[i] = JSON.parse(
						JSON.stringify(componentData)
					)
					dashboardDataService.setListLayout(listLayout)

					uiService
						.updateDashboardLayout(listLayout.id, listLayout)
						.then(function (data) {
							/*listLayout.modified = data.modified;
                        dashboardDataService.setListLayout(listLayout);

                        var layout = dashboardDataService.getData();
                        layout.modified = data.modified;
                        dashboardDataService.setData(layout);*/
							dashboardDataService.updateModifiedDate(data.modified)

							if (showNotification) {
								toastNotificationService.success(
									'Dashboard component settings saved.'
								)
							}
						})
						.catch(function () {
							dashboardDataService.setListLayout(listLayout)
						})

					break
				}
			}
		}
	}

	const initEventListeners = function (scope) {
		scope.dashboardComponentEventService.addEventListener(
			dashboardEvents.COMPONENT_BLOCKAGE_ON,
			function () {
				scope.readyStatus.disabled = true

				setTimeout(function () {
					scope.$apply()
				}, 100)
			}
		)

		scope.dashboardComponentEventService.addEventListener(
			dashboardEvents.COMPONENT_BLOCKAGE_OFF,
			function () {
				scope.readyStatus.disabled = false

				setTimeout(function () {
					scope.$apply()
				}, 100)
			}
		)
	}

	const toggleFilterBlock = function (scope) {
		scope.showFiltersArea = !scope.showFiltersArea

		const id = scope.vm.componentData.id
		const components = scope.dashboardDataService.getComponents()
		const currentComponent = components.find((component) => component.id === id)

		if (currentComponent) {
			currentComponent.settings.filters.show_filters_area =
				scope.showFiltersArea
		}

		scope.dashboardDataService.setComponents(components)
		scope.dashboardComponentEventService.dispatchEvent(
			dashboardEvents.TOGGLE_FILTER_BLOCK
		)
	}

	return {
		// TODO: replace dashboard.helper with evRvLayoutsHelper in all parts that use getLinkingToFilters
		getLinkingToFilters: evRvLayoutsHelper.getLinkingToFilters,
		getDataForLayoutSelectorWithFilters: getDataForLayoutSelectorWithFilters,
		getComponentsForLinking: getComponentsForLinking,

		saveComponentSettingsFromDashboard: saveComponentSettingsFromDashboard,

		initEventListeners: initEventListeners,
		toggleFilterBlock: toggleFilterBlock,
	}
}
