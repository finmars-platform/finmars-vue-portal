import gtEvents from '../../services/gridTableEvents'
;('use strict')

export default function ($compile) {
	return {
		restrict: 'E',
		scope: {
			row: '=',
			column: '=',
			gtDataService: '=',
			gtEventService: '=',
		},
		templateUrl: 'views/directives/gridTable/grid-table-cell-view.html',
		link: function (scope, elem, attrs) {
			// scope.cellValue = '';

			var cellMethods
			var cellsWithPopup = [
				'text',
				'number',
				'date',
				'expression',
				'customPopup',
				'multitypeField',
			]
			var sortingSettingsChangedIndex

			scope.onCellValueChange = function () {
				var rowData = {
					key: scope.row.key,
					order: scope.row.order,
				}

				var colData = {
					key: scope.column.key,
					order: scope.column.order,
				}

				if (cellMethods.onChange) {
					cellMethods.onChange(
						rowData,
						colData,
						scope.gtDataService,
						scope.gtEventService
					)
				}

				/*var changedCellData = {
                        row: {
                            key: scope.row.key,
                            order: scope.row.order
                        },
                        column: {
                            key: scope.column.key,
                            order: scope.column.order
                        }
                    };*/

				scope.gtEventService.dispatchEvent(gtEvents.CELL_VALUE_CHANGED, {
					row: rowData,
					column: colData,
				})
			}

			scope.onSelOpen = function () {
				if (cellMethods.onOpen) {
					cellMethods.onOpen(
						scope.row.order,
						scope.column.order,
						scope.gtDataService,
						scope.gtEventService
					)
				}
			}

			scope.unselectOptions = function () {
				scope.column.settings.value = null
				scope.onCellValueChange()
			}

			scope.cellWithPopup = function () {
				return cellsWithPopup.includes(scope.column.cellType)
			}

			var setCellCustomStyles = function () {
				var classNames = Object.keys(scope.column.styles)

				classNames.forEach(function (cName) {
					var customStyles = scope.column.styles[cName]

					if (elem[0].classList.contains(cName)) {
						var elemWithStyles = elem[0]
					} else {
						var elemWithStyles = elem[0].querySelector('.' + cName)
					}

					if (elemWithStyles) {
						var styleNames = Object.keys(customStyles)

						styleNames.forEach(function (styleName) {
							var styleVal = customStyles[styleName]
							elemWithStyles.style[styleName] = styleVal
						})
					}
				})
			}

			var setCellCustomClasses = function () {
				var cellElem = elem[0].querySelector('.grid-table-cell')
				var cellClasses = scope.column.classes

				if (cellElem) {
					if (typeof cellClasses === 'string') {
						cellClasses = cellClasses.split(' ')
					}

					cellElem.classList.add(...cellClasses)
				}
			}

			scope.onChildrenLoadEnd = function () {
				if (scope.column.styles) setCellCustomStyles()
				if (scope.column.classes) setCellCustomClasses()

				if (scope.column.classes) {
					setCellCustomClasses()
				}

				if (cellMethods.onInit) {
					var rowData = { key: scope.row.key, order: scope.row.order }
					var colData = { key: scope.column.key, order: scope.column.order }

					cellMethods.onInit(
						rowData,
						colData,
						scope.gtDataService,
						scope.gtEventService
					)
				}
			}

			scope.multiselectorEditClick = function () {
				var multiselectorElem = elem[0].querySelector(
					'two-fields-multiselect.grid-table-cell-multiselector'
				)
				multiselectorElem.click()
			}

			scope.onButtonClick = function ($event) {
				if (
					scope.column.methods &&
					typeof scope.column.methods.onClick === 'function'
				) {
					var rowData = { key: scope.row.key, order: scope.row.order }
					var colData = { key: scope.column.key, order: scope.column.order }

					scope.column.methods.onClick(
						$event,
						rowData,
						colData,
						scope.gtDataService,
						scope.gtEventService
					)
				}
			}

			/*var removeEventListeners = function () {

				};*/

			var init = function () {
				cellMethods = scope.column.methods || {}

				if (scope.row.order !== 'header' && !scope.cellWithPopup()) {
					// if no child directive initialized
					scope.onChildrenLoadEnd()
				}

				/* if (scope.column.settings && scope.column.settings.value) {
                        scope.cellValue = scope.column.settings.value;
                    }

					scope.gtEventService.addEventListener(gtEvents.UPDATE_CELLS_CONTENT, function () {

						if (scope.row && scope.column && scope.row.order !== 'header') {

							scope.row = scope.gtDataService.getRow(scope.row.order);
							scope.column = scope.gtDataService.getCell(scope.row.order, scope.column.order);

						}

					}); */

				if (scope.row.order === 'header') {
					sortingSettingsChangedIndex = scope.gtEventService.addEventListener(
						gtEvents.SORTING_SETTINGS_CHANGED,
						function () {
							scope.sortingOn = false
							scope.sortRowsReverse = false

							var sortSettings = scope.gtDataService.getSortingSettings()

							if (sortSettings.column === scope.column.order) {
								scope.sortingOn = true
								scope.sortRowsReverse = sortSettings.reverse
							}
						}
					)
				}
			}

			if (scope.row.order !== 'header') {
				scope.gtEventService.addEventListener(
					gtEvents.REDRAW_TABLE,
					function () {
						var row = scope.gtDataService.getRowByKey(scope.row.key)
						if (row)
							var cell = row.columns.find(
								(cell) => cell.key === scope.column.key
							)

						if (row && cell) {
							scope.row = row
							scope.column = cell

							scope.gtEventService.removeEventListener(
								gtEvents.SORTING_SETTINGS_CHANGED,
								sortingSettingsChangedIndex
							)
							init()
						}
					}
				)
			}

			init()
		},
	}
}
