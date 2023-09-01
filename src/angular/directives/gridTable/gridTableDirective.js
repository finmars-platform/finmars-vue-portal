import gtEvents from '../../services/gridTableEvents'
import metaHelper from '../../helpers/meta.helper'
;('use strict')

export default function () {
	return {
		restrict: 'E',
		scope: {
			gtDataService: '=',
			gtEventService: '=',
		},
		templateUrl: 'views/directives/gridTable/grid-table-view.html',
		link: function (scope, elem, attrs) {
			scope.allRowsAreActive = false
			scope.gridTableData = scope.gtDataService.getTableData()

			scope.sortByCol = false
			scope.sortRowsReverse = false

			/* scope.setSortByCol = function (colOrder) {

                    if (colOrder === scope.sortByCol) {
                        scope.sortRowsReverse = !scope.sortRowsReverse;

                    } else {
                        scope.sortByCol = colOrder;
                        scope.sortRowsReverse = false;
                    }

                } */

			scope.sortRowsByCol = function (row) {
				if (scope.sortByCol) {
					if (scope.sortValueOrder || scope.sortValueOrder === 0) {
						// for sorting by column with multiple values
						return row.columns[scope.sortByCol].settings.value[
							scope.sortValueOrder
						]
					} else {
						return row.columns[scope.sortByCol].settings.value
					}
				}
			}

			scope.toggleAllRows = function () {
				scope.allRowsAreActive = !scope.allRowsAreActive

				scope.gridTableData.body.forEach(function (row) {
					row.isActive = scope.allRowsAreActive
				})

				scope.gtEventService.dispatchEvent(gtEvents.ROW_SELECTION_TOGGLED)
			}

			scope.toggleRowSelection = function (row) {
				row.isActive = !row.isActive

				var selectedRows = scope.gtDataService.getSelectedRows()

				if (selectedRows.length === scope.gridTableData.body.length) {
					scope.allRowsAreActive = true
				} else {
					scope.allRowsAreActive = false
				}

				scope.gtEventService.dispatchEvent(gtEvents.ROW_SELECTION_TOGGLED)
			}

			scope.changeRowOrder = function (rowOrder, changeDirection) {
				let anotherRowOrder = rowOrder - 1

				if (changeDirection === 'down') anotherRowOrder = rowOrder + 1

				const anotherRow = scope.gtDataService.getRow(anotherRowOrder)

				if (anotherRow) {
					const row = scope.gtDataService.getRow(rowOrder)

					scope.gridTableData.body[rowOrder] = metaHelper.recursiveDeepCopy(
						anotherRow,
						true
					) // save functions need to save methods
					scope.gridTableData.body[rowOrder].order = rowOrder

					scope.gridTableData.body[anotherRowOrder] =
						metaHelper.recursiveDeepCopy(row, true)
					scope.gridTableData.body[anotherRowOrder].order = anotherRowOrder

					if (row.methods && row.methods.onOrderChange) {
						var rowData = {
							key: row.key,
							order: row.order,
						}

						row.methods.onOrderChange(
							rowData,
							scope.gtDataService,
							scope.gtEventService
						)
					}
				}
			}

			/*scope.acceptNewRow = function (rowKey) {

                    var newRow = scope.getRowByKey(rowKey);
                    delete newRow.isNewRow;
                    scope.gridTableData.body.unshift(newRow);

                    scope.gtEventService.dispatchEvent(gtEvents.ROW_ADDED);

                }

                scope.cancelNewRow = function () {

                }*/

			scope.onRowClick = function ($event, row) {
				if ($event.target.closest('.grid-table-row-checkbox')) {
					// User click on checkbox to select row
					return
				}

				if (!row.methods || !row.methods.onClick) {
					return
				}

				var rowData = {
					key: row.key,
					order: row.order,
				}

				row.methods.onClick(rowData, scope.gtDataService, scope.gtEventService)
			}

			scope.gtEventService.addEventListener(
				gtEvents.SORTING_SETTINGS_CHANGED,
				function () {
					var sortSettings = scope.gtDataService.getSortingSettings()

					scope.sortByCol = sortSettings.column
					scope.sortRowsReverse = sortSettings.reverse
					scope.sortValueOrder = sortSettings.valueOrder
				}
			)

			scope.gtEventService.addEventListener(gtEvents.REDRAW_TABLE, function () {
				scope.gridTableData = scope.gtDataService.getTableData()
			})
		},
	}
}
