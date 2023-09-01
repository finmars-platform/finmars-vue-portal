import rvDataHelper from '../helpers/rv-data.helper'
import renderHelper from '../helpers/render.helper'

import reportViewerMatrixHelper from '../helpers/report-viewer-matrix.helper'

import evEvents from '../services/entityViewerEvents'

export default function ($mdDialog) {
	return {
		restriction: 'E',
		scope: {
			matrixSettings: '=',
			evDataService: '=',
			evEventService: '=',
		},
		templateUrl: 'views/directives/report-viewer-matrix-view.html',
		link: function (scope, elem, attr) {
			scope.activeItem = null

			// ;
			scope.processing = true
			scope.matrixCreationInProgress = false

			scope.viewContext = scope.evDataService.getViewContext()
			scope.dashboardFilterCollapsed = true
			scope.matrixView = scope.matrixSettings.matrix_view
			scope.emptyLinesHidingType = ''

			scope.availableAbscissaAttrs =
				scope.matrixSettings.available_abscissa_keys || []
			if (scope.availableAbscissaAttrs.length)
				scope.availableAbscissaAttrs = JSON.parse(
					angular.toJson(scope.availableAbscissaAttrs)
				)

			scope.availableOrdinateAttrs =
				scope.matrixSettings.available_ordinate_keys || []
			if (scope.availableOrdinateAttrs.length)
				scope.availableOrdinateAttrs = JSON.parse(
					angular.toJson(scope.availableOrdinateAttrs)
				)

			scope.availableValueAttrs =
				scope.matrixSettings.available_value_keys || []
			if (scope.availableValueAttrs.length)
				scope.availableValueAttrs = JSON.parse(
					angular.toJson(scope.availableValueAttrs)
				)

			if (scope.matrixSettings.hide_empty_lines) {
				scope.emptyLinesHidingType = scope.matrixSettings.hide_empty_lines
			}

			scope.canChangeAbscissaAttr = false
			scope.canChangeOrdinateAttr = false
			scope.canChangeValueAttr = false

			// var cellWidth = 0;
			var nameColWidth = 0
			var measuringCanvas
			var cellHorPaddings = 16 // based on paddings inside .rv-matrix-cell-mixin() inside report-viewer-matrix.less

			var matrixElem
			var matrixWrap, matrixHolder
			var bodyScrollElem
			var rvmHeaderScrollableRow
			var rvmBottomRowScrollableElem
			var bodyScrollableElem
			var axisAttrsSelectorHolder
			var rvMatrixValueRowsHolder
			var rvMatrixFixedBottomRow
			var rvMatrixLeftCol
			var rvMatrixRightCol

			var clearUseFromAboveFilterId
			var itemList

			var getElemsForScripts = function () {
				matrixElem = elem[0].querySelector('.rvMatrix')
				matrixWrap = elem[0].querySelector('.rvMatrixWrap')
				matrixHolder = elem[0].querySelector('.rvMatrixHolder')

				bodyScrollElem = elem[0].querySelector('.rvMatrixBodyScrolls')
				rvmHeaderScrollableRow = elem[0].querySelector(
					'.rvmHeaderScrollableRow'
				)
				rvmBottomRowScrollableElem = elem[0].querySelector(
					'.rvmBottomRowScrollableElem'
				)
				bodyScrollableElem = elem[0].querySelectorAll(
					'.scrollableMatrixBodyColumn'
				)

				rvMatrixValueRowsHolder = elem[0].querySelector(
					'.rvMatrixValueRowsHolder'
				)
				rvMatrixFixedBottomRow = elem[0].querySelector(
					'.rvMatrixFixedBottomRow'
				)

				rvMatrixLeftCol = elem[0].querySelector('.rvMatrixLeftCol')
				rvMatrixRightCol = elem[0].querySelector('.rvMatrixRightCol')

				if (scope.viewContext === 'dashboard') {
					axisAttrsSelectorHolder = elem[0].querySelector(
						'.axisAttrSelectorBtnsHolder'
					)
				}
			}

			var getCellWidth = function (columnsCount) {
				var elemWidth = elem.width()
				var cellWidth = 0
				var minWidth = scope.matrixSettings.auto_scaling ? 46 : 100
				var maxWidth = 300
				var result = { cellWidth: 0, nameColWidth: 0 }

				var calcCellWidth = function (availableSpace) {
					cellWidth = Math.floor(availableSpace / columnsCount)
					cellWidth = Math.max(cellWidth, minWidth)
					cellWidth = Math.min(cellWidth, maxWidth)
				}

				calcCellWidth(elemWidth)

				result.nameColWidth = cellWidth

				if (scope.matrixSettings.calculate_name_column_width) {
					/* const rowNamesList = scope.matrix.map(function (row) {return row.row_name});

						measuringCanvas = measuringCanvas || document.createElement("canvas");
						var context = measuringCanvas.getContext("2d");
						var nameColWidth = 0;
						context.font = "14px 'Roboto'";

						rowNamesList.forEach(function (rowName) {
							var metrics = context.measureText(rowName);
							nameColWidth = Math.max(nameColWidth, metrics.width);
						});

						nameColWidth = Math.floor(nameColWidth) + cellHorPaddings; */
					var nameColWidth = 0
					var rowNamesList = scope.matrix.map(function (row) {
						return row.row_name
					})
					rowNamesList.push('TOTAL') // TOTAL cell at the bottom

					var dummyCellElem = document.createElement('div')
					dummyCellElem.classList.add('position-absolute', 'visibility-hidden')

					var textHolderElem = document.createElement('div')
					textHolderElem.classList.add('report-viewer-matrix-cell')

					dummyCellElem.appendChild(textHolderElem)
					matrixElem.appendChild(dummyCellElem)

					var valueAttr = scope.valueSelectorData.options.find(
						(valOption) => valOption.isActive
					)

					var getNameColWidth = function (name) {
						textHolderElem.innerText = name
						var dummyCellWidth = Math.ceil(dummyCellElem.clientWidth)

						nameColWidth = Math.max(nameColWidth, dummyCellWidth)
					}

					if (valueAttr) {
						textHolderElem.innerText = valueAttr.name
						var valueSelectorBtnPadding = 24 // if changing this also change left-padding for .selector-button-popup-btn inside main.less

						nameColWidth =
							Math.ceil(dummyCellElem.clientWidth) + valueSelectorBtnPadding
					}

					rowNamesList.forEach(getNameColWidth)

					matrixElem.removeChild(dummyCellElem)

					nameColWidth = Math.min(nameColWidth, maxWidth)

					if (cellWidth < nameColWidth) {
						// column with names will be stretched

						var availableSpace = elemWidth - nameColWidth

						calcCellWidth(availableSpace)
					} else {
						nameColWidth = cellWidth
					}

					result.nameColWidth = nameColWidth
				}

				result.cellWidth = cellWidth

				return result
			}

			scope.alignGrid = function () {
				/*var elemWidth = elem.width();
					var elemHeight = elem.height();*/

				var rowsCount = scope.rows.length + 2 // add header and footer rows
				var columnsCount = scope.columns.length + 2 // add left and right fixed columns

				// var minHeight = 20;

				// var matrixHolderMinHeight = elem[0].querySelector('.report-viewer-matrix').clientHeight;

				// cellWidth = Math.floor(elemWidth / columnsCount);
				var cwResult = getCellWidth(columnsCount)
				var cellWidth = cwResult.cellWidth
				nameColWidth = cwResult.nameColWidth

				var cellHeight = 48

				// var minWidth = 100;
				// var maxWidth = 300;
				// var matrixHolderMinHeight = cellHeight * 3; // equal to 3 rows

				/* if (scope.matrixSettings.auto_scaling) {

                        minWidth = 46;

                        var elemHeight = elem.height();
                        var cellHeight = Math.floor(elemHeight / rowsCount);

                        cellHeight = Math.max(cellHeight, 14);
                        cellHeight = Math.min(cellHeight, 48);

                    } */
				if (scope.matrixSettings.auto_scaling) {
					var elemHeight = elem.height()
					var cellHeight = Math.floor(elemHeight / rowsCount)

					cellHeight = Math.max(cellHeight, 14)
					cellHeight = Math.min(cellHeight, 48)
				}

				var fontSize = 16

				// cellWidth = Math.max(cellWidth, minWidth);
				// cellWidth = Math.min(cellWidth, maxWidth);
				/* if (cellWidth < minWidth) {
                        cellWidth = minWidth;
                    } */

				if (scope.matrixView === 'fixed-totals') {
					rvmBottomRowScrollableElem.style.left = nameColWidth + 'px'
					rvMatrixRightCol.style.width = cellWidth + 'px'
					rvMatrixFixedBottomRow.style.height = cellHeight + 'px'
				}

				// because of children with absolute positioning, elem below requires manual width setting
				rvMatrixLeftCol.style.width = nameColWidth + 'px'

				var matrixWrapHeight = matrixWrap.clientHeight
				var matrixMaxWidth = columnsCount * cellWidth

				if (scope.matrixSettings.calculate_name_column_width) {
					matrixMaxWidth = (columnsCount - 1) * cellWidth + nameColWidth
				}

				var matrixMaxHeight = rowsCount * cellHeight

				if (scope.matrixView === 'fixed-totals') {
					rvmBottomRowScrollableElem.style.width = matrixMaxWidth + 'px'
				}

				// size of .rv-matrix-value-cells-container element
				var matrixVCContainerWidth = matrixMaxWidth - nameColWidth // subtract width of column with names
				var matrixVCContainerHeight = matrixMaxHeight - cellHeight // subtract height of matrix header

				var matrixProbableHeight = rowsCount * cellHeight

				var matrixVCAvailableWidth = matrixWrap.clientWidth - nameColWidth
				var matrixVCAvailableHeight = matrixWrapHeight - cellHeight

				// whether matrix has scrolls
				if (matrixVCAvailableWidth < matrixVCContainerWidth) {
					matrixHolder.classList.add('has-x-scroll')
					matrixProbableHeight = matrixProbableHeight + 14 // add space for scroll
					matrixVCAvailableHeight = matrixVCAvailableHeight - 14
				} else {
					matrixHolder.classList.remove('has-x-scroll')
				}

				if (matrixVCAvailableHeight < matrixVCContainerHeight) {
					matrixHolder.classList.add('has-y-scroll')
				} else {
					matrixHolder.classList.remove('has-y-scroll')
				}

				if (matrixProbableHeight < matrixWrapHeight) {
					matrixHolder.style.height = matrixProbableHeight + 'px'
				} else {
					/*var canFitRowsNumber = matrixWrapHeight / cellHeight;
                    	var matrixHolderHeight = canFitRowsNumber * cellHeight;*/

					matrixHolder.style.height = matrixWrapHeight + 'px'
				}

				rvMatrixValueRowsHolder.style.width = matrixVCContainerWidth + 'px'
				rvMatrixValueRowsHolder.style.height = matrixVCContainerHeight + 'px'

				for (var i = 0; i < bodyScrollableElem.length; i++) {
					bodyScrollableElem[i].style.height = matrixVCContainerHeight + 'px'
				}

				rvmHeaderScrollableRow.style.width = matrixMaxWidth + 'px'

				if (scope.viewContext === 'dashboard') {
					axisAttrsSelectorHolder.style.width = nameColWidth + 'px'
					axisAttrsSelectorHolder.style.height = cellHeight + 'px'
				}

				var items = elem[0].querySelectorAll('.rvMatrixCell')

				for (var i = 0; i < items.length; i = i + 1) {
					var width = items[i].classList.contains('firstColumnCell')
						? nameColWidth
						: cellWidth

					items[i].style.width = width + 'px'
					items[i].style.height = cellHeight + 'px'
					items[i].style.paddingTop =
						Math.abs(cellHeight / 2 - fontSize / 2) + 'px'
				}
			}

			var scrollHeaderAndColumn = function () {
				rvmHeaderScrollableRow.style.left = -bodyScrollElem.scrollLeft + 'px'
				if (rvmBottomRowScrollableElem) {
					rvmBottomRowScrollableElem.style.left =
						nameColWidth - bodyScrollElem.scrollLeft + 'px'
				}

				for (var c = 0; c < bodyScrollableElem.length; c++) {
					bodyScrollableElem[c].style.top = -bodyScrollElem.scrollTop + 'px'
				}
			}

			var initMatrixMethods = function () {
				getElemsForScripts()
				scope.alignGrid()

				bodyScrollElem.addEventListener('scroll', scrollHeaderAndColumn)
			}

			scope.checkNegative = function (val) {
				if (scope.matrixSettings.number_format) {
					if (
						scope.matrixSettings.number_format.negative_color_format_id === 1
					) {
						if (val % 1 === 0) {
							// check whether number is float or integer
							if (parseInt(val) < 0) {
								return true
							}
						} else {
							if (parseFloat(val) < 0) {
								return true
							}
						}
					}
				}

				return false
			}

			scope.formatValue = function (val) {
				var result = val

				if (scope.matrixSettings.number_format && (val || val === 0)) {
					result = renderHelper.formatValue(
						{
							value: val,
						},
						{
							key: 'value',
							report_settings: scope.matrixSettings.number_format,
						}
					)
				}

				if (!result && result !== 0) {
					return ''
				}

				return result
			}

			scope.columnsTotalClick = function ($event) {


				scope.activeItem = 'columns_total'

				// var activeObject = scope.evDataService.getActiveObject();
				//
				// delete activeObject[scope.matrixSettings.abscissa];
				//
				// ;

				var activeObject = {}

				scope.evDataService.setActiveObject(activeObject)
				scope.evEventService.dispatchEvent(evEvents.ACTIVE_OBJECT_CHANGE)
			}

			scope.rowsTotalClick = function ($event) {


				scope.activeItem = 'rows_total'

				// var activeObject = scope.evDataService.getActiveObject();
				//
				// delete activeObject[scope.matrixSettings.ordinate];
				//
				// ;

				var activeObject = {}

				scope.evDataService.setActiveObject(activeObject)
				scope.evEventService.dispatchEvent(evEvents.ACTIVE_OBJECT_CHANGE)
			}

			scope.totalClick = function ($event) {


				scope.activeItem = 'total'

				var activeObject = {}

				scope.evDataService.setActiveObject(activeObject)
				scope.evEventService.dispatchEvent(evEvents.ACTIVE_OBJECT_CHANGE)
			}

			scope.singleColumnTotalClick = function ($event, index) {
				scope.activeItem = 'column_total:' + index

				var activeObject = {}

				activeObject[scope.matrixSettings.abscissa] = scope.columns[index].key



				scope.evDataService.setActiveObject(activeObject)
				scope.evEventService.dispatchEvent(evEvents.ACTIVE_OBJECT_CHANGE)
			}

			scope.singleRowTotalClick = function ($event, index) {


				scope.activeItem = 'row_total:' + index

				var activeObject = {}

				activeObject[scope.matrixSettings.ordinate] = scope.rows[index].key



				scope.evDataService.setActiveObject(activeObject)
				scope.evEventService.dispatchEvent(evEvents.ACTIVE_OBJECT_CHANGE)
			}

			scope.cellClick = function ($event, rowIndex, columnIndex) {
				console.log(
					'singleRowTotalClick rowIndex, columnIndex',
					rowIndex,
					columnIndex
				)

				scope.activeItem = 'cell:' + rowIndex + ':' + columnIndex

				var activeObject = {}

				activeObject[scope.matrixSettings.ordinate] = scope.rows[rowIndex].key
				activeObject[scope.matrixSettings.abscissa] =
					scope.columns[columnIndex].key



				scope.evDataService.setActiveObject(activeObject)
				scope.evEventService.dispatchEvent(evEvents.ACTIVE_OBJECT_CHANGE)
			}

			var getValuesForMatrix = function () {
				var flatList = rvDataHelper.getPureFlatStructure(scope.evDataService)
				itemList = flatList.filter((item) => item.___type === 'object')

				scope.columns = reportViewerMatrixHelper.getMatrixUniqueValues(
					itemList,
					scope.matrixSettings.abscissa,
					scope.matrixSettings.value_key
				)
				scope.rows = reportViewerMatrixHelper.getMatrixUniqueValues(
					itemList,
					scope.matrixSettings.ordinate,
					scope.matrixSettings.value_key
				)
			}

			var buildMatrix = function () {
				scope.matrix = reportViewerMatrixHelper.getMatrix(
					itemList,
					scope.rows,
					scope.columns,
					scope.matrixSettings.ordinate,
					scope.matrixSettings.abscissa,
					scope.matrixSettings.value_key,
					scope.matrixSettings.subtotal_formula_id
				)

				/*scope.totals = reportViewerMatrixHelper.getMatrixTotals(scope.matrix, itemList);*/
				scope.grandtotal = 0

				scope.columns.forEach(function (column) {
					scope.grandtotal += column.total
				})
			}

			scope.createMatrix = function () {
				/*var flatList = rvDataHelper.getFlatStructure(scope.evDataService);
                    var itemList = flatList.filter(function (item) {
                        return item.___type === 'object'
                    });

                    scope.columns = reportViewerMatrixHelper.getMatrixUniqueValues(itemList, scope.matrixSettings.abscissa);
                    scope.rows = reportViewerMatrixHelper.getMatrixUniqueValues(itemList, scope.matrixSettings.ordinate);

                    scope.matrix = reportViewerMatrixHelper.getMatrix(itemList,
                        scope.rows,
                        scope.columns,
                        scope.matrixSettings.ordinate,
                        scope.matrixSettings.abscissa,
                        scope.matrixSettings.value_key,
                        scope.matrixSettings.subtotal_formula_id);

                    if (scope.emptyLinesHidingType) {

                        switch (scope.emptyLinesHidingType) {
                            case 1:
                                reportViewerMatrixHelper.hideEmptyCols(scope.matrix, scope.columns);
                                break;

                            case 2:
                                reportViewerMatrixHelper.hideEmptyRows(scope.matrix);
                                break;

                            case 3:
                                reportViewerMatrixHelper.hideEmptyRows(scope.matrix);
                                reportViewerMatrixHelper.hideEmptyCols(scope.matrix, scope.columns);
                                break;
                        }

                    }

                    scope.totals = reportViewerMatrixHelper.getMatrixTotals(scope.matrix, itemList);*/
				scope.matrixCreationInProgress = true
				window.removeEventListener('resize', scope.alignGrid)

				getValuesForMatrix()

				if (scope.emptyLinesHidingType) {
					switch (scope.emptyLinesHidingType) {
						case 'columns':
							scope.columns = scope.columns.filter(function (column) {
								return column.total
							})

							break

						case 'rows':
							scope.rows = scope.rows.filter(function (row) {
								return row.total
							})

							break

						case 'columns_rows':
							scope.columns = scope.columns.filter(function (column) {
								return column.total
							})

							scope.rows = scope.rows.filter(function (row) {
								return row.total
							})

							break
					}
				}

				buildMatrix()

				setTimeout(function () {
					scope.$apply()

					initMatrixMethods()

					scope.matrixCreationInProgress = false
					window.addEventListener('resize', scope.alignGrid)
				}, 100)
			}

			scope.setNumberFormatPreset = function (preset) {
				switch (preset) {
					case 'price':
						scope.matrixSettings.number_format.zero_format_id = 1
						scope.matrixSettings.number_format.negative_color_format_id = 0
						scope.matrixSettings.number_format.negative_format_id = 0
						scope.matrixSettings.number_format.round_format_id = 1
						scope.matrixSettings.number_format.percentage_format_id = 0
						break
					case 'market_value':
						scope.matrixSettings.number_format.zero_format_id = 1
						scope.matrixSettings.number_format.negative_color_format_id = 1
						scope.matrixSettings.number_format.negative_format_id = 1
						scope.matrixSettings.number_format.thousands_separator_format_id = 2
						scope.matrixSettings.number_format.round_format_id = 1
						scope.matrixSettings.number_format.percentage_format_id = 0
						break
					case 'amount':
						scope.matrixSettings.number_format.zero_format_id = 1
						scope.matrixSettings.number_format.negative_color_format_id = 1
						scope.matrixSettings.number_format.negative_format_id = 0
						scope.matrixSettings.number_format.thousands_separator_format_id = 2
						scope.matrixSettings.number_format.round_format_id = 3
						scope.matrixSettings.number_format.percentage_format_id = 0
						break
					case 'exposure':
						scope.matrixSettings.number_format.zero_format_id = 1
						scope.matrixSettings.number_format.negative_color_format_id = 1
						scope.matrixSettings.number_format.negative_format_id = 1
						scope.matrixSettings.number_format.round_format_id = 0
						scope.matrixSettings.number_format.percentage_format_id = 2
						break
					case 'return':
						scope.matrixSettings.number_format.zero_format_id = 1
						scope.matrixSettings.number_format.negative_color_format_id = 1
						scope.matrixSettings.number_format.negative_format_id = 0
						scope.matrixSettings.number_format.percentage_format_id = 3
						break
				}
			}

			scope.openNumberFormatSettings = function ($event) {
				$mdDialog
					.show({
						controller: 'NumberFormatSettingsDialogController as vm',
						templateUrl:
							'views/dialogs/number-format-settings-dialog-view.html',
						targetEvent: $event,
						multiple: true,
						locals: {
							data: {
								settings: scope.matrixSettings.number_format,
							},
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							scope.matrixSettings.number_format = res.data
						}
					})
			}

			scope.setSubtotalType = function (subtotal_formula_id) {
				scope.matrixSettings.subtotal_formula_id = subtotal_formula_id

				scope.createMatrix()

				/*setTimeout(function () {

                        scope.$apply();

                        initMatrixMethods();
                    }, 0)*/
			}

			scope.getTopLeftTitle = function () {
				return scope.top_left_title || '-'
			}

			scope.hideEmptyLines = function (hideType) {
				if (scope.emptyLinesHidingType === hideType) {
					scope.emptyLinesHidingType = ''
				} else {
					scope.emptyLinesHidingType = hideType
				}

				scope.processing = false

				scope.createMatrix()
			}

			//<editor-fold desc="Popup-selector of attributes for axises">
			/**
			 *
			 * @param option {{id: string, name: string, isActive: boolean}}
			 * @param optionsList {Array.<Object>}
			 * @param axisProp {String} - can be 'abscissa' or 'ordinate'
			 * @param _$popup {Object} - data from popup
			 */
			var onAxisAttrsOptionSelect = function (
				option,
				optionsList,
				axisProp,
				_$popup
			) {
				_$popup.cancel()

				if (option.id !== scope.matrixSettings[axisProp]) {
					scope.matrixSettings[axisProp] = option.id
					if (axisProp === 'value_key') scope.matrixValueAttrName = option.name

					scope.createMatrix()

					var activeOption = optionsList.find((sOption) => sOption.isActive)
					if (activeOption) activeOption.isActive = false

					option.isActive = true

					scope.evEventService.dispatchEvent(
						evEvents.DASHBOARD_COMPONENT_DATA_CHANGED
					)
				}
			}

			var formatAttrsForSelector = function (attrsList, selectedAttrKey) {
				return attrsList.map((attr) => {
					return {
						name: attr.layout_name || attr.attribute_data.name,
						id: attr.attribute_data.key,
						isActive: attr.attribute_data.key === selectedAttrKey,
					}
				})
			}

			var canChangeAxisAttr = function (availableAttrsList, axisAttrKey) {
				if (availableAttrsList.length) {
					if (availableAttrsList.length === 1) {
						// One different attribute is available for axis
						return availableAttrsList[0].attribute_data.key !== axisAttrKey
					} else {
						return true
					}
				}

				return false
			}

			var initAxisAttrsSelectors = function () {
				scope.abscissaSelectorData = {
					options: formatAttrsForSelector(
						scope.availableAbscissaAttrs,
						scope.matrixSettings.abscissa
					),
					selectOption: function (option, _$popup) {
						onAxisAttrsOptionSelect(
							option,
							scope.abscissaSelectorData.options,
							'abscissa',
							_$popup
						)
					},
				}

				scope.ordinateSelectorData = {
					options: formatAttrsForSelector(
						scope.availableOrdinateAttrs,
						scope.matrixSettings.ordinate
					),
					selectOption: function (option, _$popup) {
						onAxisAttrsOptionSelect(
							option,
							scope.ordinateSelectorData.options,
							'ordinate',
							_$popup
						)
					},
				}

				scope.valueSelectorData = {
					options: formatAttrsForSelector(
						scope.availableValueAttrs,
						scope.matrixSettings.value_key
					),
					selectOption: function (option, _$popup) {
						onAxisAttrsOptionSelect(
							option,
							scope.valueSelectorData.options,
							'value_key',
							_$popup
						)
					},
				}

				var activeValueAttr = scope.availableValueAttrs.find((attr) => {
					return attr.attribute_data.key === scope.matrixSettings.value_key
				})

				if (activeValueAttr) {
					scope.matrixValueAttrName =
						activeValueAttr.layout_name || activeValueAttr.attribute_data.name
				}
			}
			//</editor-fold desc="Popup-selector of attributes for axises">

			scope.init = function () {
				scope.evDataService.setActiveObject({})

				// scope.top_left_title = scope.matrixSettings.top_left_title;
				scope.styles = scope.matrixSettings.styles

				initAxisAttrsSelectors()

				scope.evEventService.addEventListener(
					evEvents.DATA_LOAD_END,
					function () {
						scope.processing = false
						scope.createMatrix()
						/*scope.$apply();

                        initMatrixMethods();*/
					}
				)

				clearUseFromAboveFilterId = scope.evEventService.addEventListener(
					evEvents.CLEAR_USE_FROM_ABOVE_FILTERS,
					function () {
						scope.alignGrid()
					}
				)

				//<editor-fold desc="If we already have data (e.g. viewType changed) start">
				var dataLoadEnded = scope.evDataService.didDataLoadEnd()

				if (dataLoadEnded) {
					var flatList = rvDataHelper.getFlatStructure(scope.evDataService)

					if (flatList.length > 1) {
						scope.processing = false
						scope.createMatrix()
					}
				}
				//</editor-fold>

				/* if (scope.availableAbscissaAttrs.length) {

						if (scope.availableAbscissaAttrs.length === 1 &&
							scope.availableAbscissaAttrs[0].attribute_data.key !== scope.matrixSettings.abscissa) {

							scope.canChangeAbscissaAttr = true

						}

					} */
				scope.canChangeAbscissaAttr = canChangeAxisAttr(
					scope.availableAbscissaAttrs,
					scope.matrixSettings.abscissa
				)
				scope.canChangeOrdinateAttr = canChangeAxisAttr(
					scope.availableOrdinateAttrs,
					scope.matrixSettings.ordinate
				)
				scope.canChangeValueAttr = canChangeAxisAttr(
					scope.availableValueAttrs,
					scope.matrixSettings.value_key
				)
				// window.addEventListener('resize', scope.alignGrid);
			}

			scope.init()

			scope.$on('$destroy', function () {
				window.removeEventListener('resize', scope.alignGrid)

				scope.evEventService.removeEventListener(
					evEvents.CLEAR_USE_FROM_ABOVE_FILTERS,
					clearUseFromAboveFilterId
				)
			})
		},
	}
}
