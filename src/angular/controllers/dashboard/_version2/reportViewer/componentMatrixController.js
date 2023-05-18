import DashboardDataService from '@/angular/services/dashboard/dashboardDataService'
import DashboardEventService from '@/angular/services/eventService'

import dashboardEvents from '@/angular/services/dashboard/dashboardEvents'
import dashboardComponentStatuses from '@/angular/services/dashboard/dashboardComponentStatuses'

export default function ($scope, $uiRouterGlobals) {
	const vm = this

	vm.readyStatus = false

	const componentId = $uiRouterGlobals.params.componentId
	const reportLayoutId = $uiRouterGlobals.params.reportLayoutId
	const abscissa = $uiRouterGlobals.params.abscissa
	const ordinate = $uiRouterGlobals.params.ordinate
	const value_key = $uiRouterGlobals.params.value_key

	vm.dashboardDataService = null
	vm.dashboardEventService = null

	vm.itemData = { data: { id: componentId } }

	vm.tabNumber = 1
	vm.rowNumber = 1
	vm.colNumber = 1

	const componentDataTemplate = {
		id: '',
		name: '',
		settings: {
			abscissa: abscissa,
			auto_refresh: false,
			auto_scaling: false,
			calculate_name_column_width: false,
			content_type: 'reports.balancereport',
			entity_type: 'balance-report',
			filters: {
				show_filters_area: false,
				show_use_from_above_filters: false,
			},
			hide_empty_lines: '',
			layout: reportLayoutId, // 132
			layout_name: 'ME test matrix',
			linked_components: {},
			matrix_view: 'usual',
			ordinate: ordinate,
			styles: {
				cell: {
					text_align: 'center',
				},
			},
			subtotal_formula_id: 1,
			value_key: value_key,
		},
		type: 'report_viewer_matrix',
		user_settings: {
			available_abscissa_keys: [
				{
					attribute_data: {
						content_type: 'reports.balancereport',
						key: 'name',
						name: 'Balance. Name',
						value_type: 10,
					},
					is_default: true,
					layout_name: '',
				},
			],
			available_ordinate_keys: [
				{
					attribute_data: {
						content_type: 'currencies.currency',
						key: 'currency.name',
						name: 'Currency. Name',
						value_type: 10,
					},
					is_default: true,
					layout_name: '',
				},
			],
			available_value_keys: [
				{
					attribute_data: {
						content_type: 'reports.balancereport',
						key: 'market_value',
						name: 'Balance. Market value',
						value_type: 20,
					},
					is_default: true,
					layout_name: '',
				},
			],
		},
		inside_iframe: true,
	}

	componentDataTemplate.id = componentId

	const layoutMockup = {
		data: {
			components_types: [componentDataTemplate],
		},
	}

	const init = function () {
		vm.dashboardDataService = new DashboardDataService()
		vm.dashboardEventService = new DashboardEventService()

		vm.dashboardDataService.setData(layoutMockup)

		vm.dashboardEventService.addEventListener(
			dashboardEvents.COMPONENT_STATUS_CHANGE,
			function () {
				const status = vm.dashboardDataService.getComponentStatus(componentId)

				if (status === dashboardComponentStatuses.INIT) {
					vm.dashboardDataService.setComponentStatus(
						componentId,
						dashboardComponentStatuses.START
					)
					vm.dashboardEventService.dispatchEvent(
						dashboardEvents.COMPONENT_STATUS_CHANGE
					)
				}
			}
		)

		// uiService.getDashboard2LayoutByKey().then(
		// uiService.getDashboardLayoutByKey(layoutId)
	}

	init()
}
