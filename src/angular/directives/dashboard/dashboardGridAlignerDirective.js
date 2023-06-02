/**
 * Created by szhitenev on 30.05.2016.
 */

import dashboardEvents from '../../services/dashboard/dashboardEvents'

export default function () {
	return {
		restrict: 'AE',
		scope: {
			dashboardDataService: '=',
			dashboardEventService: '=',
			tabNumber: '=',
		},
		link: function (scope, elem, attr) {
			scope.columnsTotal = 1
			scope.rowsTotal = 1

			scope.cellWidth = 0
			scope.cellHeight = 0

			scope.tabPaddingLeft = 8
			scope.tabPaddingTop = 8

			scope.calculateSingleCellWidth = function () {
				var tabWidth = elem.parent().parent().parent().width()

				console.log('tabWidth', tabWidth)

				scope.cellWidth = Math.floor(tabWidth / scope.columnsTotal)
			}

			scope.calculateSingleCellHeight = function () {
				// var tabHeight = elem.height();
				// scope.cellHeight = Math.floor(tabHeight / scope.columnsTotal)

				scope.cellHeight = 64 // var it be fixed value
			}

			scope.resizeGridCells = function () {
				var layout = scope.dashboardDataService.getData()
				var projection = scope.dashboardDataService.getProjection()

				console.log('resizeGridCells.projection', projection)

				var tab

				if (scope.tabNumber === 'fixed_area') {
					tab = layout.data.fixed_area
				} else {
					tab = layout.data.tabs[scope.tabNumber]
				}

				var elements = elem.find('.dashboardCell')
				// var emptySpace = elem.find('.dashboardEmptySpace')[0];
				var domElem
				var layoutElem

				var rowNumber
				var columnNumber

				var heightOffset
				var accordionsBefore = 0
				var hiddenRowsBefore = 0
				var domElemOffsetTop
				var domElemOffsetLeft
				var domElemHorizontalPaddings = 8 // if changed also change @dashboardCellPaddingRight inside dashboard.less

				var rowsToFold = []
				var foldedAccordionsRows = []
				var accordionsRows = []

				var totalRowsCount = tab.layout.rows_count

				var accordions = elem.querySelectorAll('.dashboard-accordion-component')

				console.log('accordions', accordions)

				for (var i = 0; i < accordions.length; i = i + 1) {
					var accordion = accordions[i]

					accordionsRows.push(parseInt(accordion.dataset.rowNumber, 10))

					if (accordion.classList.contains('dashboard-accordion-folded')) {
						foldedAccordionsRows.push(parseInt(accordion.dataset.rowNumber, 10))
					}
				}

				console.log('tab', tab)
				console.log('foldedAccordionsRows', foldedAccordionsRows)
				console.log('accordionsRows', accordionsRows)

				accordionsRows.forEach(function (accordionRow, index) {
					if (foldedAccordionsRows.indexOf(accordionRow) !== -1) {
						var to

						if (index !== accordionsRows.length - 1) {
							to = accordionsRows[index + 1]
						} else {
							to = totalRowsCount
						}

						for (var i = accordionRow + 1; i < to; i = i + 1) {
							rowsToFold.push(i)
						}
					}
				})

				console.log('rowsToFold', rowsToFold)

				for (var i = 0; i < elements.length; i = i + 1) {
					accordionsBefore = 0
					hiddenRowsBefore = 0

					domElem = elements[i]

					rowNumber = parseInt(domElem.dataset.row, 10)
					columnNumber = parseInt(domElem.dataset.column, 10)

					layoutElem = tab.layout.rows[rowNumber].columns[columnNumber]

					if (layoutElem.cell_type === 'empty') {
						if (layoutElem.is_hidden) {
							domElem.style.display = 'none'
						} else {
							domElem.style.display = 'block'
						}
					}

					var offset = 0

					for (var x = 0; x < rowsToFold.length; x = x + 1) {
						if (rowsToFold[x] < rowNumber) {
							offset = offset + 1
						}
					}

					var domElemWidth = layoutElem.colspan * scope.cellWidth
					var domElemHeight = layoutElem.rowspan * scope.cellHeight

					domElem.style.width = domElemWidth + 'px'
					domElem.style.height = domElemHeight + 'px'

					domElem.style.position = 'absolute'

					domElemOffsetTop =
						rowNumber * scope.cellHeight +
						scope.tabPaddingTop -
						offset * scope.cellHeight
					domElemOffsetLeft =
						columnNumber * scope.cellWidth + scope.tabPaddingLeft

					domElem.style.top = domElemOffsetTop + 'px'
					domElem.style.left = domElemOffsetLeft + 'px'

					if (layoutElem.cell_type === 'component') {
						var componentUIData =
							scope.dashboardDataService.getComponentUIData(
								layoutElem.data.id
							) || {}

						componentUIData.width =
							domElemWidth - domElemHorizontalPaddings + 'px'
						componentUIData.height = domElemHeight + 'px'
						componentUIData.colspan = layoutElem.colspan
						componentUIData.rowspan = layoutElem.rowspan

						scope.dashboardDataService.setComponentUIData(
							layoutElem.data.id,
							componentUIData
						)

						if (rowsToFold.indexOf(rowNumber) !== -1) {
							domElem.style.display = 'none'
						} else {
							domElem.style.display = 'block'
						}
					}
				}

				scope.dashboardEventService.dispatchEvent(
					dashboardEvents.COMPONENTS_SIZES_CHANGED
				)

				/* if (emptySpace) {
                        emptySpace.style.position = 'absolute';
                        emptySpace.style.top = scope.rowsTotal * (scope.cellHeight + scope.tabPaddingTop) + 'px';
                        emptySpace.style.left = 0;
                        emptySpace.style.height = '200px';
                        emptySpace.style.width = '100%';
                    } */
			}

			scope.resize = function () {
				var layout = scope.dashboardDataService.getData()
				var tab

				if (scope.tabNumber === 'fixed_area') {
					tab = layout.data.fixed_area
				} else {
					tab = layout.data.tabs[scope.tabNumber]
				}

				scope.rowsTotal = tab.layout.rows_count
				scope.columnsTotal = tab.layout.columns_count

				scope.calculateSingleCellHeight()
				scope.calculateSingleCellWidth()

				scope.resizeGridCells()
			}

			scope.init = function () {
				setTimeout(function () {
					scope.resize()
				}, 0)

				scope.dashboardEventService.addEventListener(
					dashboardEvents.RESIZE,
					function () {
						scope.resize()
					}
				)

				window.addEventListener('resize', function () {
					scope.resize()
				})
			}

			scope.init()
		},
	}
}
