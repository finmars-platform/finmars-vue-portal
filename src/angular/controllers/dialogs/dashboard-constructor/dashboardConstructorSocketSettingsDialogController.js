/**
 * Created by mevstratov on 16.01.2020.
 */

import dashboardConstructorEvents from '@/angular/services/dashboard-constructor/dashboardConstructorEvents'

export default function (
	$scope,
	$mdDialog,
	dashboardConstructorDataService,
	dashboardConstructorEventService,
	attributeDataService,
	data
) {
	var vm = this

	vm.item = data.item
	vm.tabNumber = data.tabNumber
	vm.rowNumber = data.rowNumber
	vm.columnNumber = data.columnNumber

	vm.dashboardConstructorDataService = dashboardConstructorDataService
	vm.dashboardConstructorEventService = dashboardConstructorEventService
	vm.attributeDataService = attributeDataService

	vm.colspan = vm.item.colspan
	vm.rowspan = vm.item.rowspan
	vm.colspanList = [1]
	vm.rowspanList = [1]

	vm.component = vm.dashboardConstructorDataService.getComponentById(
		vm.item.data.id
	)
	var componentChanged = false
	var socketSettingsChanged = false

	vm.getVerboseType = function () {
		var verboseType = 'Unknown'

		switch (vm.component.type) {
			case 'report_viewer':
			case 'report_viewer_split_panel':
				verboseType = 'Report Viewer'
				break
			/*case 'report_viewer_split_panel':
                    verboseType = 'Report Viewer Split Panel';
                    break;*/
			case 'report_viewer_grand_total':
				verboseType = 'Report Viewer Grand Total'
				break
			case 'report_viewer_bars_chart':
			case 'report_viewer_pie_chart':
				verboseType = 'Report Viewer Charts'
				break
			case 'report_viewer_matrix':
				verboseType = 'Report Viewer Matrix'
				break
			case 'report_viewer_table_chart':
				verboseType = 'Report Viewer Table Chart'
				break
			case 'entity_viewer':
				verboseType = 'Entity Viewer'
				break
			case 'entity_viewer_split_panel':
				verboseType = 'Entity Viewer Split Panel'
				break
			case 'input_form':
				verboseType = 'Input Form'
				break
			case 'control':
				verboseType = 'Control'
				break
			case 'button_set':
				verboseType = 'Button Set'
				break
			case 'superset_dashboard':
				verboseType = 'Superset Dashboard'
				break
			case 'finmars_widget':
				verboseType = 'Finmars Widget'
				break
		}

		return verboseType
	}

	/*var calculateColspanList = function () {

            var result = [vm.columnNumber];

            var layout = vm.dashboardConstructorDataService.getData();
            var tab;
            var row;
            var item;

            if (vm.tabNumber === 'fixed_area') {
                row = layout.data.fixed_area.layout.rows[vm.rowNumber];
            } else {
                tab = layout.data.tabs[vm.tabNumber];
                row = tab.layout.rows[vm.rowNumber];
            }

            for (var c = vm.columnNumber + 1; c < row.columns.length; c = c + 1) {

                item = row.columns[c];

                if (item.cell_type === 'empty') {

                    if (item.is_hidden) {

                        if (item.hidden_by.row_number === vm.rowNumber &&
                            item.hidden_by.column_number === vm.columnNumber) {

                            result.push(item.column_number)

                        } else {
                            break;
                        }

                    } else {

                        result.push(item.column_number)
                    }

                } else {
                    break;
                }

            }

            vm.colspanList = result.map(function (item, index) {
                return index + 1
            });

        };*/

	var calculateColspanList = function () {
		var result = []

		var colspan = vm.item.colspan

		for (var i = vm.columnNumber; i < vm.columnNumber + colspan; i++) {
			result.push(i)
		}

		var layout = vm.dashboardConstructorDataService.getData()
		var tab
		var row
		var item

		if (vm.tabNumber === 'fixed_area') {
			row = layout.data.fixed_area.layout.rows[vm.rowNumber]
		} else {
			tab = layout.data.tabs[vm.tabNumber]
			row = tab.layout.rows[vm.rowNumber]
		}

		for (var c = vm.columnNumber + colspan; c < row.columns.length; c++) {
			item = row.columns[c]

			if (item.cell_type === 'empty' && !item.is_hidden) {
				result.push(item.column_number)
			} else {
				break
			}
		}

		vm.colspanList = result.map(function (item, index) {
			return index + 1
		})
	}

	/*var calculateRowspanList = function () {

            var result = [vm.rowNumber];

            var layout = vm.dashboardConstructorDataService.getData();
            var tab;
            var row;
            var item;

            if (vm.tabNumber === 'fixed_area') {
                tab = layout.data.fixed_area;
            } else {
                tab = layout.data.tabs[vm.tabNumber];
            }

            for (var r = vm.rowNumber + 1; r < tab.layout.rows.length; r = r + 1) {

                row = tab.layout.rows[r];
                item = row.columns[vm.columnNumber];

                if (item.cell_type === 'empty') {

                    if (item.is_hidden) {

                        if (item.hidden_by.row_number === vm.rowNumber &&
                            item.hidden_by.column_number === vm.columnNumber) {

                            result.push(item.row_number)

                        } else {
                            break;
                        }

                    } else {

                        result.push(row.row_number)
                    }

                } else {
                    break
                }

            }


            vm.rowspanList = result.map(function (item, index) {
                return index + 1
            });

        };*/

	var calculateRowspanList = function () {
		var result = []

		var rowspan = vm.item.rowspan
		var colspan = vm.item.colspan

		for (var i = vm.rowNumber; i < vm.rowNumber + rowspan; i++) {
			result.push(i)
		}

		var layout = vm.dashboardConstructorDataService.getData()
		var tab
		var row
		var item

		if (vm.tabNumber === 'fixed_area') {
			tab = layout.data.fixed_area
		} else {
			tab = layout.data.tabs[vm.tabNumber]
		}

		var r, c
		rowLoop: for (r = vm.rowNumber + rowspan; r < tab.layout.rows.length; r++) {
			row = tab.layout.rows[r]

			for (c = vm.columnNumber; c < vm.columnNumber + colspan; c++) {
				item = row.columns[c]

				if (item.cell_type !== 'empty' || item.is_hidden) {
					break rowLoop
				}
			}

			result.push(row.row_number)
		}

		vm.rowspanList = result.map(function (item, index) {
			return index + 1
		})
	}

	vm.onSpanChange = function () {
		socketSettingsChanged = true
		clearElemSpans()
		vm.item.colspan = vm.colspan
		vm.item.rowspan = vm.rowspan
		hideOverlaidSockets()
	}

	var clearElemSpans = function () {
		var layout = vm.dashboardConstructorDataService.getData()

		var tab
		var row
		var item

		if (vm.tabNumber === 'fixed_area') {
			tab = layout.data.fixed_area
		} else {
			tab = layout.data.tabs[vm.tabNumber]
		}

		var colspan = vm.item.colspan
		var rowspan = vm.item.rowspan

		/*for (var r = 0; r < tab.layout.rows.length; r = r + 1) {

                row = tab.layout.rows[r];

                for (var c = vm.columnNumber; c < row.columns.length; c = c + 1) {

                    item = row.columns[c];

                    if (item.is_hidden) {

                        if (item.hidden_by.row_number === vm.rowNumber &&
                            item.hidden_by.column_number === vm.columnNumber) {

                            delete item.is_hidden;
                            delete item.hidden_by;

                        }


                    }

                }

            }*/

		for (var r = vm.rowNumber; r < vm.rowNumber + rowspan; r++) {
			row = tab.layout.rows[r]

			for (var c = vm.columnNumber; c < vm.columnNumber + colspan; c++) {
				item = row.columns[c]

				if (item.is_hidden) {
					delete row.columns[c].is_hidden
					delete row.columns[c].hidden_by
				}
			}
		}

		vm.dashboardConstructorDataService.setData(layout)
	}

	var hideOverlaidSockets = function () {
		//vm.clearElemSpans();

		var layout = vm.dashboardConstructorDataService.getData()

		var tab
		var row
		var item

		if (vm.tabNumber === 'fixed_area') {
			tab = layout.data.fixed_area
		} else {
			tab = layout.data.tabs[vm.tabNumber]
		}

		for (var r = vm.rowNumber; r < vm.rowNumber + vm.item.rowspan; r = r + 1) {
			row = tab.layout.rows[r]

			for (
				var c = vm.columnNumber;
				c < vm.columnNumber + vm.item.colspan;
				c = c + 1
			) {
				if (r !== vm.rowNumber || c !== vm.columnNumber) {
					// prevent from hiding spanning socket itself

					item = row.columns[c]
					item.is_hidden = true
					/*item.hidden_by = {
                            row_number: vm.rowNumber,
                            column_number: vm.columnNumber
                        }*/
				}
			}
		}

		vm.dashboardConstructorDataService.setData(layout)
	}

	vm.editComponentType = function ($event) {
		var contrName = ''
		var templateUrl = ''

		var locals = {
			item: JSON.parse(JSON.stringify(vm.component)),
			dataService: vm.dashboardConstructorDataService,
			eventService: vm.dashboardConstructorEventService,
			attributeDataService: vm.attributeDataService,
			data: {},
		}

		switch (vm.component.type) {
			case 'control':
				contrName = 'DashboardConstructorControlComponentDialogController as vm'
				templateUrl =
					'views/dialogs/dashboard-constructor/dashboard-constructor-control-component-dialog-view.html'
				break
			case 'report_viewer':
			case 'report_viewer_split_panel':
				contrName =
					'DashboardConstructorReportViewerComponentDialogController as vm'
				templateUrl =
					'views/dialogs/dashboard-constructor/dashboard-constructor-report-viewer-component-dialog-view.html'
				break
			/*case 'report_viewer_split_panel':
                    contrName = 'DashboardConstructorReportViewerSplitPanelComponentDialogController as vm';
                    templateUrl = 'views/dialogs/dashboard-constructor/dashboard-constructor-report-viewer-split-panel-component-dialog-view.html';
                    break;*/
			case 'report_viewer_grand_total':
				contrName =
					'DashboardConstructorReportViewerGrandTotalComponentDialogController as vm'
				templateUrl =
					'views/dialogs/dashboard-constructor/dashboard-constructor-report-viewer-grand-total-component-dialog-view.html'
				break
			case 'report_viewer_bars_chart':
			case 'report_viewer_pie_chart':
				contrName =
					'DashboardConstructorReportViewerChartsComponentDialogController as vm'
				templateUrl =
					'views/dialogs/dashboard-constructor/dashboard-constructor-report-viewer-charts-component-dialog-view.html'
				break
			case 'report_viewer_matrix':
				contrName =
					'DashboardConstructorReportViewerMatrixComponentDialogController as vm'
				templateUrl =
					'views/dialogs/dashboard-constructor/dashboard-constructor-report-viewer-matrix-component-dialog-view.html'
				break
			case 'report_viewer_table_chart':
				contrName =
					'DashboardConstructorReportViewerTableChartComponentDialogController as vm'
				templateUrl =
					'views/dialogs/dashboard-constructor/dashboard-constructor-report-viewer-table-chart-component-dialog-view.html'
				break
			case 'entity_viewer':
				contrName =
					'DashboardConstructorEntityViewerComponentDialogController as vm'
				templateUrl =
					'views/dialogs/dashboard-constructor/dashboard-constructor-entity-viewer-component-dialog-view.html'
				break
			case 'entity_viewer_split_panel':
				contrName =
					'DashboardConstructorEntityViewerSplitPanelComponentDialogController as vm'
				templateUrl =
					'views/dialogs/dashboard-constructor/dashboard-constructor-entity-viewer-split-panel-component-dialog-view.html'
				break
			case 'button_set':
				contrName =
					'DashboardConstructorButtonSetComponentDialogController as vm'
				templateUrl =
					'views/dialogs/dashboard-constructor/dashboard-constructor-button-set-component-dialog-view.html'
				break
			case 'input_form':
				contrName =
					'DashboardConstructorInputFormComponentDialogController as vm'
				templateUrl =
					'views/dialogs/dashboard-constructor/dashboard-constructor-input-form-component-dialog-view.html'
				break
			case 'superset_dashboard':
				contrName =
					'DashboardConstructorSupersetDashboardComponentDialogController as vm'
				templateUrl =
					'views/dialogs/dashboard-constructor/dashboard-constructor-superset-dashboard-component-dialog-view.html'
				break
			case 'finmars_widget':
				contrName =
					'DashboardConstructorFinmarsWidgetComponentDialogController as vm'
				templateUrl =
					'views/dialogs/dashboard-constructor/dashboard-constructor-finmars-widget-component-dialog-view.html'
				break
		}

		if (contrName && templateUrl) {
			$mdDialog
				.show({
					controller: contrName,
					templateUrl: templateUrl,
					targetEvent: $event,
					multiple: true,
					preserveScope: true,
					autoWrap: true,
					skipHide: true,
					locals: locals,
				})
				.then(function (res) {
					if (res && res.status === 'agree') {
						vm.component = vm.dashboardConstructorDataService.getComponentById(
							vm.item.data.id
						)
						componentChanged = true
					}
				})
		}
	}

	/*vm.cancel = function () {
            $mdDialog.hide({status: 'disagree'});
        };*/

	var init = function () {
		calculateColspanList()
		calculateRowspanList()
	}

	vm.agree = function () {
		var response = {}
		response.status = 'disagree'

		if (componentChanged || socketSettingsChanged) {
			response.status = 'agree'
		}

		$mdDialog.hide(response)
	}

	init()
}
