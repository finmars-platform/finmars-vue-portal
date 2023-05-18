import dashboardEvents from '../../services/dashboard/dashboardEvents'
import dashboardComponentStatuses from '../../services/dashboard/dashboardComponentStatuses'

import DashboardComponentDataService from '../../services/dashboard/dashboardComponentDataService'
import DashboardComponentEventService from '../../services/eventService'

// DEPRECATED
export default function ($mdDialog) {
	return {
		restriction: 'E',
		templateUrl:
			'views/directives/dashboard/dashboard-report-viewer-split-panel-view.html',
		scope: {
			tabNumber: '=',
			rowNumber: '=',
			columnNumber: '=',
			item: '=',
			dashboardDataService: '=',
			dashboardEventService: '=',
			fillInModeData: '=?',
		},
		link: function (scope, elem, attr) {
			scope.readyStatus = {
				data: false,
			}

			scope.dashboardComponentDataService = new DashboardComponentDataService()
			scope.dashboardComponentEventService =
				new DashboardComponentEventService()

			var componentData

			if (scope.item && scope.item.data) {
				componentData = scope.dashboardDataService.getComponentById(
					scope.item.data.id
				)

				if (componentData.custom_component_name) {
					scope.customName = componentData.custom_component_name
				}
			}

			/*var columnsToManage = null;
                var attributesDataService = null;
                var viewerTableCols = null;

                if (scope.item.data.user_settings) {

                    if (scope.item.data.user_settings.manage_columns) {
                        columnsToManage = scope.item.data.user_settings.manage_columns;
                    }

                }*/

			scope.vm = {
				tabNumber: scope.tabNumber,
				rowNumber: scope.rowNumber,
				columnNumber: scope.columnNumber,
				componentData: componentData,
				entityType: componentData.settings.entity_type,
				dashboardDataService: scope.dashboardDataService,
				dashboardEventService: scope.dashboardEventService,
				dashboardComponentDataService: scope.dashboardComponentDataService,
				dashboardComponentEventService: scope.dashboardComponentEventService,
			}

			if (scope.fillInModeData) {
				scope.vm.entityViewerDataService =
					scope.fillInModeData.entityViewerDataService
				scope.vm.attributeDataService =
					scope.fillInModeData.attributeDataService
			}

			scope.enableFillInMode = function () {
				var entityViewerDataService =
					scope.vm.dashboardComponentDataService.getEntityViewerDataService()
				var attributeDataService =
					scope.vm.dashboardComponentDataService.getAttributeDataService()

				scope.fillInModeData = {
					tab_number: scope.vm.tabNumber,
					row_number: scope.vm.rowNumber,
					column_number: scope.vm.columnNumber,
					item: scope.item,
					entityViewerDataService: entityViewerDataService,
					attributeDataService: attributeDataService,
					dashboardComponentEventService: scope.dashboardComponentEventService, // needed to update component inside tabs
				}
			}

			scope.disableFillInMode = function () {
				scope.fillInModeData.dashboardComponentEventService.dispatchEvent(
					dashboardEvents.UPDATE_VIEWER_TABLE_COLUMNS
				)
				scope.fillInModeData = null
			}

			/*scope.saveReportLayout = function () {
                    scope.dashboardComponentEventService.dispatchEvent(dashboardEvents.SAVE_VIEWER_TABLE_CONFIGURATION);
                };*/

			scope.initEventListeners = function () {
				if (!scope.fillInModeData) {
					scope.dashboardEventService.addEventListener(
						dashboardEvents.COMPONENT_STATUS_CHANGE,
						function () {
							var status = scope.dashboardDataService.getComponentStatus(
								scope.item.data.id
							)

							if (status === dashboardComponentStatuses.START) {
								// Init calculation of a component

								scope.readyStatus.data = true

								setTimeout(function () {
									scope.$apply()
								}, 0)
							}
						}
					)
				}
			}

			scope.init = function () {
				scope.initEventListeners()

				if (!scope.fillInModeData) {
					scope.dashboardDataService.setComponentRefreshRestriction(
						scope.item.data.id,
						false
					)

					scope.dashboardDataService.setComponentStatus(
						scope.item.data.id,
						dashboardComponentStatuses.INIT
					)
					scope.dashboardEventService.dispatchEvent(
						dashboardEvents.COMPONENT_STATUS_CHANGE
					)
				} else {
					scope.readyStatus.data = true
				}
			}

			scope.init()
		},
	}
}
