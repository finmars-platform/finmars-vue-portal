<template>
	<div
		class="report-viewer-matrix rvMatrix"
		:class="{ 'matrix-with-fixed-totals': scope.matrixView === 'fixed-totals' }"
		ref="elem"
	>
		<div v-if="!processing" class="height-100 rvMatrixWrap">
			<div class="report-viewer-matrix-holder rvMatrixHolder" layout="column">
				<div
					v-if="scope.viewContext === 'dashboard'"
					class="axis-attr-selector-btns-holder axisAttrSelectorBtnsHolder"
				>
					<button
						v-if="scope.canChangeAbscissaAttr"
						custom-popup
						popup-template-url="'views/popups/selector-popup-view.html'"
						popup-data="abscissaSelectorData"
						position-relative-to="element"
						relative-popup-x="left"
						relative-popup-y="top"
						open-on="click"
						close-on-click-outside="true"
						class="flex-row flex-center axis-attr-selector-btn abscissa"
					>
						<span class="material-icons">chevron_right</span>
					</button>

					<button
						v-if="scope.canChangeOrdinateAttr"
						custom-popup
						popup-template-url="'views/popups/selector-popup-view.html'"
						popup-data="ordinateSelectorData"
						close-on-click-outside="true"
						class="flex-row flex-center axis-attr-selector-btn ordinate"
					>
						<span class="material-icons">expand_more</span>
					</button>
				</div>

				<div class="report-viewer-matrix-row rv-matrix-header">
					<!--<div class="report-viewer-matrix-column-header-cell report-viewer-empty-header-cell text-{{styles.cell.text_align}} rvMatrixCell"
							 title="{{getTopLeftTitle()}}">-->
					<div
						class="report-viewer-matrix-column-header-cell firstColumnCell rvMatrixCell"
						:class="[
							`report-viewer-empty-header-cell text-${scope.styles.cell.text_align}`,
						]"
					>
						<div v-if="scope.canChangeValueAttr" class="selector-button-popup">
							<button
								custom-popup
								popup-template-url="'views/popups/selector-popup-view.html'"
								popup-data="valueSelectorData"
								position-relative-to="element"
								open-on="click"
								close-on-click-outside="true"
								class="selector-button-popup-btn"
								title="{{matrixValueAttrName}}"
							>
								<!-- If .selected-option-name is not a block, text-overflow: ellipsis; clips text when it actually fits -->
								<div
									class="selected-option-name"
									v-bind="matrixValueAttrName"
								></div>
								<span class="arrow_downward-icon material-icons"
									>arrow_drop_down</span
								>
							</button>
						</div>

						<div
							v-if="!canChangeValueAttr"
							v-bind="matrixValueAttrName"
							class="report-viewer-matrix-value-name"
							title="{{matrixValueAttrName}}"
						></div>
					</div>

					<div class="rvm-header-row-holder">
						<div class="rv-matrix-part-to-scroll rvmHeaderScrollableRow">
							<div
								v-for="(column, $index) in scope.columns"
								class="report-viewer-matrix-column-header-cell rvMatrixCell"
								:class="{
									active: scope.activeItem == 'column_total:' + $index,
								}"
								title="{{column.key}}"
								@click="scope.singleColumnTotalClick($event, $index)"
							>
								{{ column.key }}
							</div>

							<div
								v-if="scope.matrixView !== 'fixed-totals'"
								class="report-viewer-matrix-column-header-cell report-viewer-cell-border-left rvMatrixCell"
								:class="[
									`text-${scope.styles.cell.text_align}`,
									{ active: scope.activeItem == 'columns_total' },
								]"
								title="TOTAL"
								@click="scope.columnsTotalClick($event)"
							>
								TOTAL
							</div>

							<!-- Blank cell that serves as placeholder for position absolute column with totals -->
							<!--                <div class="report-viewer-matrix-cell rvMatrixCell"></div>-->
						</div>
					</div>

					<div
						v-if="scope.matrixView === 'fixed-totals'"
						class="rv-matrix-header-total-cell rvMatrixCell"
						:class="[
							`text-${scope.styles.cell.text_align}`,
							{ active: scope.activeItem == 'columns_total' },
						]"
						title="TOTAL"
						@click="scope.columnsTotalClick($event)"
					>
						TOTAL
					</div>
				</div>

				<div
					class="rv-matrix-body flex"
					v-if="scope.matrixView !== 'fixed-totals'"
				>
					<div class="rv-matrix-fixed-bottom-row rvMatrixFixedBottomRow">
						<div class="rv-matrix-part-to-scroll rvmBottomRowScrollableElem">
							<div
								v-for="(item, $index) in scope.columns"
								class="report-viewer-matrix-cell report-viewer-matrix-cell-total rv-matrix-colored-cell rvMatrixCell"
								title="{{item.total}}"
								:class="[
									`text-${scope.styles.cell.text_align}`,
									{
										active: scope.activeItem == 'column_total:' + $index,
										'negative-red': scope.checkNegative(item.total),
									},
								]"
								@click="scope.singleColumnTotalClick($event, $index)"
							>
								{{ scope.formatValue(item.total) }}
							</div>
						</div>

						<div
							class="report-viewer-matrix-cell rv-matrix-lb-cell firstColumnCell rvMatrixCell"
							style="position: relative; z-index: 10"
							:class="[
								`text-${scope.styles.cell.text_align}`,
								{ active: scope.activeItem == 'rows_total' },
							]"
							@click="scope.rowsTotalClick($event)"
						>
							TOTAL
						</div>

						<div
							class="report-viewer-matrix-cell rv-matrix-rb-cell report-viewer-matrix-cell-total rvMatrixCell"
							:class="[
								`text-${scope.styles.cell.text_align}`,
								{
									active: scope.activeItem == 'total',
									'negative-red': scope.checkNegative(scope.grandtotal),
								},
							]"
							title="{{scope.grandtotal}}"
							@click="scope.totalClick($event)"
						>
							{{ scope.formatValue(scope.grandtotal) }}
						</div>
					</div>

					<div class="rv-matrix-left-col rvMatrixLeftCol">
						<div class="rvm-fixed-col-holder">
							<div class="rv-matrix-part-to-scroll scrollableMatrixBodyColumn">
								<div
									v-for="row in scope.matrix"
									class="report-viewer-matrix-cell rv-matrix-colored-cell firstColumnCell rvMatrixCell"
									:class="[
										`text-${scope.styles.cell.text_align}`,
										{ active: scope.activeItem == 'row_total:' + row.index },
									]"
									title="{{row.row_name}}"
									@click="scope.singleRowTotalClick($event, row.index)"
								>
									{{ row.row_name }}
								</div>
							</div>
						</div>
					</div>

					<div class="rv-matrix-value-cells-container rvMatrixBodyScrolls">
						<div class="position-relative rvMatrixValueRowsHolder">
							<div
								v-for="row in scope.matrix"
								class="report-viewer-matrix-row rvMatrixRow"
							>
								<div
									class="report-viewer-matrix-cell rvMatrixCell"
									v-for="item in row.items"
									title="{{item.data.value}}"
									@click="scope.cellClick($event, row.index, item.index)"
									:class="[
										`text-${scope.styles.cell.text_align}`,
										{
											active:
												scope.activeItem ==
												'cell:' + row.index + ':' + item.index,
											'negative-red': scope.checkNegative(item.data.value),
										},
									]"
								>
									{{ scope.formatValue(item.data.value) }}
								</div>

								<!-- Blank cell that serves as placeholder for position absolute row with totals -->
								<div class="report-viewer-matrix-cell rvMatrixCell">
									{{ scope.formatValue(scope.rows[row.index].total) }}
								</div>
							</div>
						</div>
					</div>

					<div class="rv-matrix-right-col rvMatrixRightCol">
						<div class="rv-matrix-part-to-scroll scrollableMatrixBodyColumn">
							<div
								v-for="row in scope.matrix"
								class="report-viewer-matrix-row rvMatrixRow"
							>
								<div
									class="report-viewer-matrix-cell report-viewer-matrix-cell-total report-viewer-cell-border-left rv-matrix-colored-cell rvMatrixCell"
									:title="scope.rows[row.index].total"
									@click="scope.singleRowTotalClick($event, row.index)"
									:class="[
										`text-${scope.styles.cell.text_align}`,
										{
											active: scope.activeItem == 'row_total:' + row.index,
											'negative-red': scope.checkNegative(
												scope.rows[row.index].total
											),
										},
									]"
								>
									{{ scope.formatValue(scope.rows[row.index].total) }}
								</div>
							</div>
						</div>
					</div>
				</div>

				<div
					class="rv-matrix-body flex"
					v-if="scope.matrixView === 'fixed-totals'"
				>
					<div class="rv-matrix-fixed-bottom-row rvMatrixFixedBottomRow">
						<div class="rv-matrix-part-to-scroll rvmBottomRowScrollableElem">
							<div
								v-for="(item, $index) in scope.columns"
								class="report-viewer-matrix-cell report-viewer-matrix-cell-total rv-matrix-colored-cell rvMatrixCell"
								title="{{item.total}}"
								@click="scope.singleColumnTotalClick($event, $index)"
								:class="[
									`text-${scope.styles.cell.text_align}`,
									{
										active: scope.activeItem == 'column_total:' + $index,
										'negative-red': scope.checkNegative(item.total),
									},
								]"
							>
								{{ scope.formatValue(item.total) }}
							</div>
						</div>

						<div
							class="report-viewer-matrix-cell rv-matrix-lb-cell firstColumnCell rvMatrixCell"
							title="TOTAL"
							@click="scope.rowsTotalClick($event)"
							:class="[
								`text-${scope.styles.cell.text_align}`,
								{ active: scope.activeItem == 'rows_total' },
							]"
						>
							TOTAL
						</div>

						<div
							class="report-viewer-matrix-cell rv-matrix-rb-cell report-viewer-matrix-cell-total rvMatrixCell"
							@click="scope.totalClick($event)"
							:class="[
								`text-${scope.styles.cell.text_align}`,
								{
									active: scope.activeItem == 'total',
									'negative-red': scope.checkNegative(scope.grandtotal),
								},
							]"
						>
							{{ scope.formatValue(scope.grandtotal) }}
						</div>
					</div>

					<div class="rv-matrix-left-col rvMatrixLeftCol">
						<div class="rvm-fixed-col-holder">
							<div class="rv-matrix-part-to-scroll scrollableMatrixBodyColumn">
								<div
									v-for="row in scope.matrix"
									class="report-viewer-matrix-cell rv-matrix-colored-cell firstColumnCell rvMatrixCell"
									title="{{row.row_name}}"
									@click="scope.singleRowTotalClick($event, row.index)"
									:class="[
										`text-${scope.styles.cell.text_align}`,
										{ active: scope.activeItem == 'row_total:' + row.index },
									]"
								>
									{{ row.row_name }}
								</div>
							</div>
						</div>
					</div>

					<div class="rv-matrix-value-cells-container rvMatrixBodyScrolls">
						<div class="position-relative rvMatrixValueRowsHolder">
							<div
								v-for="row in scope.matrix"
								class="report-viewer-matrix-row rvMatrixRow"
							>
								<div
									class="report-viewer-matrix-cell rvMatrixCell"
									v-for="item in row.items"
									title="{{item.data.value}}"
									@click="scope.cellClick($event, row.index, item.index)"
									:class="[
										`text-${scope.styles.cell.text_align}`,
										{
											active:
												scope.activeItem ==
												'cell:' + row.index + ':' + item.index,
											'negative-red': scope.checkNegative(item.data.value),
										},
									]"
								>
									{{ scope.formatValue(item.data.value) }}
								</div>

								<!-- Blank cell that serves as placeholder for position absolute row with totals -->
								<div class="report-viewer-matrix-cell rvMatrixCell"></div>
							</div>
						</div>
					</div>

					<div class="rv-matrix-right-col rvMatrixRightCol">
						<div class="rv-matrix-part-to-scroll scrollableMatrixBodyColumn">
							<div
								v-for="row in scope.matrix"
								class="report-viewer-matrix-row rvMatrixRow"
							>
								<!--<div class="report-viewer-matrix-cell report-viewer-cell-border-left rv-matrix-colored-cell text-{{styles.cell.text_align}} rvMatrixCell"
                 title="{{totals.rows[row.index].total}}"
                 data-ng-click="singleRowTotalClick($event, row.index)"
                 data-ng-class="{'active': scope.activeItem == 'row_total:' + row.index, 'negative-red': checkNegative(totals.rows[row.index].total)}">
                {{formatValue(totals.rows[row.index].total)}}
            </div>-->
								<div
									class="report-viewer-matrix-cell report-viewer-matrix-cell-total report-viewer-cell-border-left rv-matrix-colored-cell rvMatrixCell"
									@click="scope.singleRowTotalClick($event, row.index)"
									:class="[
										`text-${scope.styles.cell.text_align}`,
										{
											active: scope.activeItem == 'row_total:' + row.index,
											'negative-red': scope.checkNegative(
												scope.rows[row.index].total
											),
										},
									]"
								>
									{{ scope.formatValue(scope.rows[row.index].total) }}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
	import rvDataHelper from '@/angular/helpers/rv-data.helper'
	import renderHelper from '@/angular/helpers/render.helper'

	import reportViewerMatrixHelper from '@/angular/helpers/report-viewer-matrix.helper'

	import evEvents from '@/angular/services/entityViewerEvents'

	// export default function ($mdDialog) {
	const props = defineProps(['matrixSettings'])
	const { evEventService, evDataService } = inject('ngDependace')

	let scope = reactive({})
	// link: function (scope, elem, attr) {
	scope.activeItem = null

	// console.log('Report Viewer Matrix Component', scope);
	scope.processing = true
	scope.matrixCreationInProgress = false

	scope.viewContext = evDataService.getViewContext()
	scope.dashboardFilterCollapsed = true
	// scope.matrixView = props.matrixSettings.matrix_view
	scope.matrixView = 'fixed-totals'
	scope.emptyLinesHidingType = ''

	scope.availableAbscissaAttrs =
		props.matrixSettings.available_abscissa_keys || []
	if (scope.availableAbscissaAttrs.length)
		scope.availableAbscissaAttrs = JSON.parse(
			JSON.stringify(scope.availableAbscissaAttrs)
		)

	scope.availableOrdinateAttrs =
		props.matrixSettings.available_ordinate_keys || []
	if (scope.availableOrdinateAttrs.length)
		scope.availableOrdinateAttrs = JSON.parse(
			JSON.stringify(scope.availableOrdinateAttrs)
		)

	scope.availableValueAttrs = props.matrixSettings.available_value_keys || []
	if (scope.availableValueAttrs.length)
		scope.availableValueAttrs = JSON.parse(
			JSON.stringify(scope.availableValueAttrs)
		)

	if (props.matrixSettings.hide_empty_lines) {
		scope.emptyLinesHidingType = props.matrixSettings.hide_empty_lines
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

	let elem = ref(null)

	onMounted(async () => {
		await nextTick()
		init()
		setTimeout(() => {
			// scope.alignGrid()
		}, 1000)
	})

	var getElemsForScripts = function () {
		matrixElem = elem.value.querySelector('.rvMatrix')
		matrixWrap = elem.value.querySelector('.rvMatrixWrap')
		matrixHolder = elem.value.querySelector('.rvMatrixHolder')

		bodyScrollElem = elem.value.querySelector('.rvMatrixBodyScrolls')
		rvmHeaderScrollableRow = elem.value.querySelector('.rvmHeaderScrollableRow')
		rvmBottomRowScrollableElem = elem.value.querySelector(
			'.rvmBottomRowScrollableElem'
		)
		bodyScrollableElem = elem.value.querySelectorAll(
			'.scrollableMatrixBodyColumn'
		)

		rvMatrixValueRowsHolder = elem.value.querySelector(
			'.rvMatrixValueRowsHolder'
		)
		rvMatrixFixedBottomRow = elem.value.querySelector('.rvMatrixFixedBottomRow')

		rvMatrixLeftCol = elem.value.querySelector('.rvMatrixLeftCol')
		console.log('rvMatrixLeftCol:', rvMatrixLeftCol)
		rvMatrixRightCol = elem.value.querySelector('.rvMatrixRightCol')

		if (scope.viewContext === 'dashboard') {
			axisAttrsSelectorHolder = elem.value.querySelector(
				'.axisAttrSelectorBtnsHolder'
			)
		}
	}

	function getCellWidth(columnsCount) {
		var elemWidth = elem.value.getBoundingClientRect().width
		var cellWidth = 0
		var minWidth = props.matrixSettings.auto_scaling ? 46 : 100
		var maxWidth = 300
		var result = { cellWidth: 0, nameColWidth: 0 }

		var calcCellWidth = function (availableSpace) {
			cellWidth = Math.floor(availableSpace / columnsCount)
			cellWidth = Math.max(cellWidth, minWidth)
			cellWidth = Math.min(cellWidth, maxWidth)
		}

		calcCellWidth(elemWidth)

		result.nameColWidth = cellWidth

		if (props.matrixSettings.calculate_name_column_width) {
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

	scope.alignGrid = async function () {
		await nextTick()
		/*var elemWidth = elem.width();
					var elemHeight = elem.height();*/

		var rowsCount = scope.rows.length + 2 // add header and footer rows
		var columnsCount = scope.columns.length + 2 // add left and right fixed columns

		// var minHeight = 20;

		// var matrixHolderMinHeight = elem.value.querySelector('.report-viewer-matrix').clientHeight;

		// cellWidth = Math.floor(elemWidth / columnsCount);
		var cwResult = getCellWidth(columnsCount)
		var cellWidth = cwResult.cellWidth
		nameColWidth = cwResult.nameColWidth

		var cellHeight = 48

		// var minWidth = 100;
		// var maxWidth = 300;
		// var matrixHolderMinHeight = cellHeight * 3; // equal to 3 rows

		/* if (props.matrixSettings.auto_scaling) {

                        minWidth = 46;

                        var elemHeight = elem.height();
                        var cellHeight = Math.floor(elemHeight / rowsCount);

                        cellHeight = Math.max(cellHeight, 14);
                        cellHeight = Math.min(cellHeight, 48);

                    } */
		if (props.matrixSettings.auto_scaling) {
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

		if (props.matrixSettings.calculate_name_column_width) {
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

		var items = elem.value.querySelectorAll('.rvMatrixCell')

		for (var i = 0; i < items.length; i = i + 1) {
			var width = items[i].classList.contains('firstColumnCell')
				? nameColWidth
				: cellWidth

			items[i].style.width = width + 'px'
			items[i].style.height = cellHeight + 'px'
			items[i].style.paddingTop = Math.abs(cellHeight / 2 - fontSize / 2) + 'px'
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
		if (props.matrixSettings.number_format) {
			if (props.matrixSettings.number_format.negative_color_format_id === 1) {
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

		if (props.matrixSettings.number_format && (val || val === 0)) {
			result = renderHelper.formatValue(
				{
					value: val,
				},
				{
					key: 'value',
					report_settings: props.matrixSettings.number_format,
				}
			)
		}

		if (!result && result !== 0) {
			return ''
		}

		return result
	}

	scope.columnsTotalClick = function ($event) {
		console.log('columnsTotalClick')

		scope.activeItem = 'columns_total'

		// var activeObject = evDataService.getActiveObject();
		//
		// delete activeObject[props.matrixSettings.abscissa];
		//
		// console.log('activeObject', activeObject);

		var activeObject = {}

		evDataService.setActiveObject(activeObject)
		evEventService.dispatchEvent(evEvents.ACTIVE_OBJECT_CHANGE)
	}

	scope.rowsTotalClick = function ($event) {
		console.log('rowsTotalClick')

		scope.activeItem = 'rows_total'

		// var activeObject = evDataService.getActiveObject();
		//
		// delete activeObject[props.matrixSettings.ordinate];
		//
		// console.log('activeObject', activeObject);

		var activeObject = {}

		evDataService.setActiveObject(activeObject)
		evEventService.dispatchEvent(evEvents.ACTIVE_OBJECT_CHANGE)
	}

	scope.totalClick = function ($event) {
		console.log('totalClick')

		scope.activeItem = 'total'

		var activeObject = {}

		evDataService.setActiveObject(activeObject)
		evEventService.dispatchEvent(evEvents.ACTIVE_OBJECT_CHANGE)
	}

	scope.singleColumnTotalClick = function ($event, index) {
		scope.activeItem = 'column_total:' + index

		var activeObject = {}

		activeObject[props.matrixSettings.abscissa] = scope.columns[index].key

		console.log('activeObject', activeObject)

		evDataService.setActiveObject(activeObject)
		evEventService.dispatchEvent(evEvents.ACTIVE_OBJECT_CHANGE)
	}

	scope.singleRowTotalClick = function ($event, index) {
		console.log('singleRowTotalClick, index', index)

		scope.activeItem = 'row_total:' + index

		var activeObject = {}

		activeObject[props.matrixSettings.ordinate] = scope.rows[index].key

		console.log('activeObject', activeObject)

		evDataService.setActiveObject(activeObject)
		evEventService.dispatchEvent(evEvents.ACTIVE_OBJECT_CHANGE)
	}

	scope.cellClick = function ($event, rowIndex, columnIndex) {
		console.log(
			'singleRowTotalClick rowIndex, columnIndex',
			rowIndex,
			columnIndex
		)

		scope.activeItem = 'cell:' + rowIndex + ':' + columnIndex

		var activeObject = {}

		activeObject[props.matrixSettings.ordinate] = scope.rows[rowIndex].key
		activeObject[props.matrixSettings.abscissa] = scope.columns[columnIndex].key

		console.log('activeObject', activeObject)

		evDataService.setActiveObject(activeObject)
		evEventService.dispatchEvent(evEvents.ACTIVE_OBJECT_CHANGE)
	}

	var getValuesForMatrix = function () {
		var flatList = rvDataHelper.getPureFlatStructure(evDataService)
		itemList = flatList.filter((item) => item.___type === 'object')

		scope.columns = reportViewerMatrixHelper.getMatrixUniqueValues(
			itemList,
			props.matrixSettings.abscissa,
			props.matrixSettings.value_key
		)
		scope.rows = reportViewerMatrixHelper.getMatrixUniqueValues(
			itemList,
			props.matrixSettings.ordinate,
			props.matrixSettings.value_key
		)
	}

	var buildMatrix = function () {
		scope.matrix = reportViewerMatrixHelper.getMatrix(
			itemList,
			scope.rows,
			scope.columns,
			props.matrixSettings.ordinate,
			props.matrixSettings.abscissa,
			props.matrixSettings.value_key,
			props.matrixSettings.subtotal_formula_id
		)

		/*scope.totals = reportViewerMatrixHelper.getMatrixTotals(scope.matrix, itemList);*/
		scope.grandtotal = 0

		scope.columns.forEach(function (column) {
			scope.grandtotal += column.total
		})
	}

	scope.createMatrix = function () {
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

		initMatrixMethods()

		scope.matrixCreationInProgress = false
		window.addEventListener('resize', scope.alignGrid)
	}

	scope.setNumberFormatPreset = function (preset) {
		switch (preset) {
			case 'price':
				props.matrixSettings.number_format.zero_format_id = 1
				props.matrixSettings.number_format.negative_color_format_id = 0
				props.matrixSettings.number_format.negative_format_id = 0
				props.matrixSettings.number_format.round_format_id = 1
				props.matrixSettings.number_format.percentage_format_id = 0
				break
			case 'market_value':
				props.matrixSettings.number_format.zero_format_id = 1
				props.matrixSettings.number_format.negative_color_format_id = 1
				props.matrixSettings.number_format.negative_format_id = 1
				props.matrixSettings.number_format.thousands_separator_format_id = 2
				props.matrixSettings.number_format.round_format_id = 1
				props.matrixSettings.number_format.percentage_format_id = 0
				break
			case 'amount':
				props.matrixSettings.number_format.zero_format_id = 1
				props.matrixSettings.number_format.negative_color_format_id = 1
				props.matrixSettings.number_format.negative_format_id = 0
				props.matrixSettings.number_format.thousands_separator_format_id = 2
				props.matrixSettings.number_format.round_format_id = 3
				props.matrixSettings.number_format.percentage_format_id = 0
				break
			case 'exposure':
				props.matrixSettings.number_format.zero_format_id = 1
				props.matrixSettings.number_format.negative_color_format_id = 1
				props.matrixSettings.number_format.negative_format_id = 1
				props.matrixSettings.number_format.round_format_id = 0
				props.matrixSettings.number_format.percentage_format_id = 2
				break
			case 'return':
				props.matrixSettings.number_format.zero_format_id = 1
				props.matrixSettings.number_format.negative_color_format_id = 1
				props.matrixSettings.number_format.negative_format_id = 0
				props.matrixSettings.number_format.percentage_format_id = 3
				break
		}
	}

	scope.openNumberFormatSettings = function ($event) {
		$mdDialog
			.show({
				controller: 'NumberFormatSettingsDialogController as vm',
				templateUrl: 'views/dialogs/number-format-settings-dialog-view.html',
				targetEvent: $event,
				multiple: true,
				locals: {
					data: {
						settings: props.matrixSettings.number_format,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					props.matrixSettings.number_format = res.data
				}
			})
	}

	scope.setSubtotalType = function (subtotal_formula_id) {
		props.matrixSettings.subtotal_formula_id = subtotal_formula_id

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

		if (option.id !== props.matrixSettings[axisProp]) {
			props.matrixSettings[axisProp] = option.id
			if (axisProp === 'value_key') scope.matrixValueAttrName = option.name

			scope.createMatrix()

			var activeOption = optionsList.find((sOption) => sOption.isActive)
			if (activeOption) activeOption.isActive = false

			option.isActive = true

			evEventService.dispatchEvent(evEvents.DASHBOARD_COMPONENT_DATA_CHANGED)
		}
	}

	var formatAttrsForSelector = function (attrsList, selectedAttrKey) {
		return attrsList.map((attr) => {
			return {
				name: attr.layout_name || attr?.name,
				id: attr.key,
				isActive: attr.key === selectedAttrKey,
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
				props.matrixSettings.abscissa
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
				props.matrixSettings.ordinate
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
				props.matrixSettings.value_key
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
			return attr.attribute_data.key === props.matrixSettings.value_key
		})

		if (activeValueAttr) {
			scope.matrixValueAttrName =
				activeValueAttr.layout_name || activeValueAttr.attribute_data.name
		}
	}
	//</editor-fold desc="Popup-selector of attributes for axises">
	scope.styles = props.matrixSettings.styles

	function init() {
		evDataService.setActiveObject({})

		// scope.top_left_title = props.matrixSettings.top_left_title;

		initAxisAttrsSelectors()

		evEventService.addEventListener(evEvents.DATA_LOAD_END, function () {
			scope.processing = false
			scope.createMatrix()
			/*scope.$apply();

                        initMatrixMethods();*/
		})

		clearUseFromAboveFilterId = evEventService.addEventListener(
			evEvents.CLEAR_USE_FROM_ABOVE_FILTERS,
			function () {
				scope.alignGrid()
			}
		)

		//<editor-fold desc="If we already have data (e.g. viewType changed) start">
		var dataLoadEnded = evDataService.didDataLoadEnd()

		if (dataLoadEnded) {
			var flatList = rvDataHelper.getFlatStructure(evDataService)

			if (flatList.length > 1) {
				scope.processing = false
				scope.createMatrix()
			}
		}
		//</editor-fold>

		/* if (scope.availableAbscissaAttrs.length) {

						if (scope.availableAbscissaAttrs.length === 1 &&
							scope.availableAbscissaAttrs[0].attribute_data.key !== props.matrixSettings.abscissa) {

							scope.canChangeAbscissaAttr = true

						}

					} */
		scope.canChangeAbscissaAttr = canChangeAxisAttr(
			scope.availableAbscissaAttrs,
			props.matrixSettings.abscissa
		)
		scope.canChangeOrdinateAttr = canChangeAxisAttr(
			scope.availableOrdinateAttrs,
			props.matrixSettings.ordinate
		)
		scope.canChangeValueAttr = canChangeAxisAttr(
			scope.availableValueAttrs,
			props.matrixSettings.value_key
		)
		// window.addEventListener('resize', scope.alignGrid);
	}

	onUnmounted(() => {
		window.removeEventListener('resize', scope.alignGrid)

		evEventService.removeEventListener(
			evEvents.CLEAR_USE_FROM_ABOVE_FILTERS,
			clearUseFromAboveFilterId
		)
	})
</script>

<style lang="scss" scoped>
	.report-viewer-matrix .rv-matrix-left-col {
		height: auto;
	}
</style>
