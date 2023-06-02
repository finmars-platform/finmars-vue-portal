import gtEvents from '../../services/gridTableEvents'
import metaHelper from '../../helpers/meta.helper'
;('use strict')

export default function (gridTableHelperService) {
	return {
		restrict: 'E',
		scope: {
			gtDataService: '=',
			gtEventService: '=',
		},
		templateUrl: 'views/directives/gridTable/grid-table-top-panel-view.html',
		link: function (scope, elem, attr) {
			scope.gridTableData = scope.gtDataService.getTableData()
			scope.mode = false
			scope.gtComponents = scope.gridTableData.components
			scope.topPanelComponents = scope.gridTableData.components.topPanel || {}

			// var gridTableSettings = scope.gridTableData.settings || {};
			var tableMethods = scope.gridTableData.tableMethods || {}

			var assembleNewRow = function () {
				var newRow = metaHelper.recursiveDeepCopy(
					scope.gridTableData.templateRow,
					true
				)
				var newRowKey = metaHelper.generateUniqueId('newGridTableRow')

				newRow.key = newRowKey
				newRow.newRow = true

				/* var lowestOrder = 0;
                    scope.gridTableData.body.forEach(function (bRow) {
                        lowestOrder = Math.min(lowestOrder, bRow.order)
                    })

                    newRow.order = lowestOrder - 1 */

				return newRow
			}

			var addRow = function () {
				var newRow = assembleNewRow()
				scope.gridTableData.body.unshift(newRow)

				scope.gtEventService.dispatchEvent(gtEvents.ROW_ADDED)
			}

			scope.deleteRows = function () {
				if (tableMethods && tableMethods.deleteRows) {
					tableMethods.deleteRows(scope.gtDataService, scope.gtEventService)
				} else {
					scope.gtDataService.deleteRows(scope.activeRows)

					var delRowsKeys = scope.activeRows.map(function (aRow) {
						return aRow.key
					})

					scope.gtEventService.dispatchEvent(gtEvents.ROW_DELETED, {
						deletedRowsKeys: delRowsKeys,
					})
					scope.gtEventService.dispatchEvent(gtEvents.ROW_SELECTION_TOGGLED)
				}
			}

			scope.gtEventService.addEventListener(
				gtEvents.ROW_SELECTION_TOGGLED,
				function () {
					scope.activeRows = []

					scope.activeRows = scope.gridTableData.body.filter(
						(row) => row.isActive
					)

					if (scope.activeRows.length) {
						scope.mode = 'rows_deletion'
					} else {
						scope.mode = false
					}
				}
			)

			/*var initEventListeners = function () {

					scope.gtEventService.addEventListener(gtEvents.ROW_SELECTION_TOGGLED, function () {

						scope.activeRows = [];

						scope.activeRows = scope.gridTableData.body.filter(row => row.isActive);

						if (scope.activeRows.length) {
							scope.mode = 'rows_deletion';

						} else {
							scope.mode = false;
						}

					});

					scope.gtEventService.addEventListener(gtEvents.REDRAW_TABLE, function () {

					});

				};*/

			var init = function () {
				if (tableMethods.addRow) {
					scope.addRow = function ($event) {
						tableMethods.addRow(
							scope.gtDataService,
							scope.gtEventService,
							$event
						)
					}
				} else {
					/* TODO delete later
                        else if (gridTableSettings.addRowMode) { // default for cases when row changes after addition

                        scope.addRow = function () {

                            var newRow = assembleNewRow()
                            newRow.isNewRow = true

                            scope.gridTableData.body.unshift(newRow);

                        }

                    }*/
					scope.addRow = addRow
				}
			}

			init()
		},
	}
}
