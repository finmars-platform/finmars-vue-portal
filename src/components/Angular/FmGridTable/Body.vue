<template>
	<div
		class="g-table-body position-relative"
		:ref="(el) => (elem = jquery(el))"
	>
		<div class="ev-viewport">
			<!--			<div class="ev-content" v-show="scope.dataLoadStatus"></div>

			<div v-if="!scope.dataLoadStatus" class="ev-content-loader">
				<div
					class="e-data-loader"
					layout="row"
					layout-sm="column"
					layout-align="space-around"
				>
          <FmLoader :size="100" />
				</div>
			</div>-->
			<div class="ev-content"></div>
			<FmLoader
				v-show="!scope.firstRender"
				:size="100"
				positionCenter
			/>
		</div>

		<div
			v-if="scope.isReport"
			class="drop-area-wrap left-side-groups-drop-area display-none gLeftSideGroupsHolder"
		>
			<div class="g-drop-area gDropArea"></div>

			<div class="drop-area-content">
				<span>Drop here to add grouping</span>
			</div>
		</div>

		<div
			class="drop-area-wrap right-side-columns-drop-area display-none gRightSideColumnsHolder"
		>
			<div class="g-drop-area gDropArea"></div>

			<div class="drop-area-content">
				<span>Drop here to add column</span>
			</div>
		</div>
	</div>
</template>

<script setup>
	/**
	 * Created by szhitenev on 05.05.2016.
	 */
	import RvDomManager from '@/angular/services/rv-dom-manager/rv-dom.manager'
	import toastNotificationService from '@/angular/shell/scripts/app/services/toastNotificationService'

	import evEvents from '@/angular/services/entityViewerEvents'
	import evRenderer from '@/angular/services/ev-renderer/ev.renderer'
	import rvRenderer from '@/angular/services/rv-renderer/rv.renderer'
	import evDomManager from '@/angular/services/ev-dom-manager/ev-dom.manager'
	import evDataHelper from '@/angular/helpers/ev-data.helper'
	import rvDataHelper from '@/angular/helpers/rv-data.helper'
	import evRvCommonHelper from '@/angular/helpers/ev-rv-common.helper'

	import evFilterService from '@/angular/services/ev-data-provider/filter.service'

	import metaService from '@/angular/services/metaService'
	import EvScrollManager from '@/angular/services/ev-dom-manager/ev-scroll.manager'
	import jquery from 'jquery'
	import transactionTypeService from '@/angular/services/transactionTypeService'
	import priceHistoryServiceInst from '~~/src/angular/services/priceHistoryService'
	import uiService from '@/angular/services/uiService'
	import evRvDomManagerServiceInst from '~~/src/angular/services/evRvDomManagerService'
	import usersServiceInst from '~~/src/angular/shell/scripts/app/services/usersService'

	let evRvDomManagerService = new evRvDomManagerServiceInst()
	let priceHistoryService = new priceHistoryServiceInst()
	let usersService = new usersServiceInst()

	const props = defineProps([
		'workareaWrapElement',
		'contentWrapElement',
		'rootWrapElement',
	])

	const { evEventService, evDataService } = inject('ngDependace')

	let scope = reactive({
		rootWrapElement: props.rootWrapElement,
		contentWrapElement: props.contentWrapElement,
		workareaWrapElement: props.workareaWrapElement,
	})

	/** Changed to 'true' after table fully loaded first time on webpage start */
	scope.firstRender = false;
	// function (
	// 	toastNotificationService,
	//
	// ) {
	let elem = ref(null)

	onMounted(() => {

		var contentElem = elem.value[0].querySelector('.ev-content')
		var viewportElem = elem.value[0].querySelector('.ev-viewport')
		// var progressBar = elem[0].querySelector('.ev-progressbar');

		var toggleBookmarksBtn = document.querySelector(
			'.toggle-bookmarks-panel-btn'
		)

		var elements = {
			viewportElem: viewportElem,
			contentElem: contentElem,
			workareaWrapElem: scope.workareaWrapElement,
			contentWrapElem: scope.contentWrapElement,
			rootWrapElem: scope.rootWrapElement, // 'null' when rv / ev is inside split panel that is inside iframe
		}

		var projection
		var entityType = evDataService.getEntityType()
		var viewContext = evDataService.getViewContext()

		scope.isReport = evDataService.isEntityReport()
		var isRootEntityViewer = evDataService.isRootEntityViewer()

		var rvDomManager = new RvDomManager(
			toastNotificationService,
			transactionTypeService,
			priceHistoryService,
			uiService,
			evRvDomManagerService,
			window.rvDataProviderService,
		)

		var activeLayoutConfigIsSet = false

		if (!scope.isReport) {
			elements.leftPanelElem = scope.workareaWrapElement.querySelector(
				'.gEvLeftPanelHolder'
			)
		}

		const setColorsForSubtotals = function (flatList, coloredSubtotals) {
			return flatList.map((item) => {
				if (coloredSubtotals.hasOwnProperty(item.___id)) {
					item.___backgrond_color = coloredSubtotals[item.___id]
				}

				return item
			})
		}

		function renderReportViewer() {
			var begin = Date.now()

			evDataService.setDataLoadStatus(true)

			const coloredSubtotals = evDataService.getMarkedSubtotals()

			rvDataHelper.syncLevelFold(evDataService)

			var flatList = rvDataHelper.getFlatStructure(
				evDataService,
				globalDataService
			)
			flatList.shift() // remove root group

			flatList = flatList.filter(function (item) {
				return item.___type !== 'group'
			})

			var index = 0
			flatList = flatList.map(function (item, i) {
				item.___flat_list_index = i

				if (item.___type === 'object' || item.___type === 'blankline') {
					item.___flat_list_offset_top_index = index
					index = index + 1
				}

				if (item.___type === 'subtotal') {
					if (item.___subtotal_type !== 'proxyline') {
						item.___flat_list_offset_top_index = index
						index = index + 1
					}
				}

				return item
			})

			flatList = setColorsForSubtotals(flatList, coloredSubtotals)

			evDataService.setFlatList(flatList)

			projection = rvDataHelper.calculateProjection(flatList, evDataService)

			evDataService.setProjection(projection)

			// console.log('projection', projection);

			// rvDomManager.calculateScroll(elements, evDataService)

			rvRenderer.render(
				contentElem,
				projection,
				globalDataService,
				evDataService,
				evEventService
			)
			cellContentOverflow()

			var end = Date.now()

			var timeSpent = (end - begin) / 1000 // secs;

			evDataService.setRenderTime(timeSpent)

			evEventService.dispatchEvent(evEvents.FINISH_RENDER)
		}

		function renderEntityViewer() {
			// var flatList = evDataHelper.getFlatStructure(evDataService);
			var flatList = evDataHelper.getObjectsFromSelectedGroups(
				evDataService,
				globalDataService
			)

			var filters = evDataService.getFilters()
			var regularFilters = evFilterService.convertIntoRegularFilters(
				filters.frontend
			)

			if (regularFilters.length) {
				var groups = evDataService.getGroups()
				flatList = evFilterService.filterTableRows(
					flatList,
					regularFilters,
					groups
				)
			}

			var selGroupsList = evDataService.getSelectedGroups()

			if (selGroupsList.length) {
				var lastSelGroup = selGroupsList[selGroupsList.length - 1]

				var controlObj = {
					___parentId: lastSelGroup.___id,
					___type: 'control',
					___level: lastSelGroup.___level + 1,
				}

				controlObj.___id = evRvCommonHelper.getId(controlObj)

				flatList.push(controlObj)
			} else {
				if (flatList.length) {
					var controlObj = {
						___parentId: flatList[0].___parentId,
						___type: 'control',
						___level: 1,
					}

					controlObj.___id = evRvCommonHelper.getId(controlObj)

					flatList.push(controlObj)
				}
			}

			var index = 0
			flatList = flatList.map(function (item, i) {
				item.___flat_list_index = i

				if (
					item.___type === 'object' ||
					item.___type === 'control' ||
					item.___type === 'placeholder_group' ||
					item.___type === 'placeholder_object' ||
					item.___type === 'group'
				) {
					item.___flat_list_offset_top_index = index
					index = index + 1
				}

				return item
			})

			evDataService.setFlatList(flatList)

			projection = evDataHelper.calculateProjection(flatList, evDataService)

			evDataService.setProjection(projection)

			// evDomManager.calculateScroll(elements, evDataService, scope.scrollManager)

			evRenderer.render(
				contentElem,
				projection,
				globalDataService,
				evDataService,
				evEventService
			)

			evEventService.dispatchEvent(evEvents.FINISH_RENDER)
		}

		function cellContentOverflow() {
			var rows = contentElem.querySelectorAll('.g-row')
			rows = Array.from(rows)

			var subtotalRows = rows.filter(function (row) {
				return row.dataset.type === 'subtotal'
			})

			var r, w
			for (r = 0; r < subtotalRows.length; r++) {
				var cellWraps = subtotalRows[r].querySelectorAll('.g-cell-wrap')
				var cells = subtotalRows[r].querySelectorAll('.g-cell')

				for (w = 0; w < cellWraps.length; w++) {
					var cellWrap = cellWraps[w],
						cellWrapWidth = cellWrap.clientWidth
					var cell = cells[w]
					var cellContentWrap = cell.querySelector('.g-cell-content-wrap')
					var groupFoldingBtn = cellContentWrap.querySelector(
						'.g-group-fold-button'
					)

					var rowIsGrandTotal = false
					var parentGroups = evRvCommonHelper.getParents(
						subtotalRows[r].dataset.parentGroupHashId,
						evDataService
					)

					if (parentGroups[0].___level === 0 && w === 0) {
						rowIsGrandTotal = true
					}

					if (
						cellContentWrap.textContent !== undefined &&
						cellContentWrap.textContent !== '' &&
						(groupFoldingBtn || rowIsGrandTotal)
					) {
						var cellContentHolder =
							cellContentWrap.querySelector('.g-cell-content')
						var cellSpaceForText = cellContentWrap.clientWidth

						if (!rowIsGrandTotal) {
							cellSpaceForText =
								cellContentWrap.clientWidth - groupFoldingBtn.clientWidth
						}

						if (cellContentHolder.offsetWidth > cellSpaceForText) {
							var cellStretchWidth = cellWrapWidth
							var nextCellIndex = w
							var overflowedCells = []

							// Looping through next cells in the row, until encounter not empty cell or overflowing cell have enough width
							while (
								cellContentHolder.offsetWidth > cellSpaceForText &&
								nextCellIndex + 1 < cellWraps.length
								) {
								var nextCellIndex = nextCellIndex + 1

								var nextCellWrap = cellWraps[nextCellIndex],
									nextCellWrapWidth = nextCellWrap.clientWidth
								var nextCellContentWrap = nextCellWrap.querySelector(
									'.g-cell-content-wrap'
								)
								var nexCellContentHolder =
									nextCellContentWrap.querySelector('.g-cell-content')

								var nextCellNotEmpty =
									nexCellContentHolder || nextCellContentWrap.contentText

								if (nextCellNotEmpty) {
									break
								}

								overflowedCells.push(nextCellWrap)

								cellSpaceForText = cellSpaceForText + nextCellWrapWidth
								cellStretchWidth = cellStretchWidth + nextCellWrapWidth
							}

							if (cellStretchWidth > cellWrapWidth) {
								// check if there are available cells to be overflowed

								overflowedCells.pop() // leaving right border of last overflowed cell

								overflowedCells.forEach(function (overflowedCell) {
									overflowedCell.classList.add('g-overflowed-cell')
								})

								cellWrap.classList.add('g-overflowing-cell')
								cell.style.width = cellStretchWidth + 'px'
							}
						}
					}
				}
			}
		}

		function updateTableContent() {

			scope.dataLoadStatus = true
			scope.firstRender = true // IF SOMETHING WENT WRONG AND SOMEHOW REPORT IS NOT RENDERER, WE HAVE 1 min timeoout to render

			if (scope.isReport) {
				renderReportViewer()
			} else {
				renderEntityViewer()
			}

		}

		function clearOverflowingCells() {
			var overflowingCells = contentElem.querySelectorAll('.g-overflowing-cell')
			var overflowedCells = contentElem.querySelectorAll('.g-overflowed-cell')

			overflowingCells.forEach(function (overflowingCell) {
				overflowingCell.classList.remove('g-overflowing-cell')
				var cell = overflowingCell.querySelector('.g-cell')
				cell.style.width = ''
			})

			overflowedCells.forEach(function (overflowedCell) {
				overflowedCell.classList.remove('g-overflowed-cell')
				var cell = overflowedCell.querySelector('.g-cell')
				cell.style.width = ''
			})
		}

		//# region Event listeners
		var calculateElemsWrapsSizes = function () {
			// evRvDomManagerService.calculateContentWrapHeight(
			// 	elements.rootWrapElem,
			// 	elements.contentWrapElem,
			// 	evDataService
			// )
			// for vertical split panel contentWrapElem width calculated by gWidthAlignerComponent.js
			// horizontal split panel contentWrapElem take all available width
			if (isRootEntityViewer) {
				// evRvDomManagerService.calculateContentWrapWidth(
				// 	elements.rootWrapElem,
				// 	elements.contentWrapElem,
				// 	evDataService
				// )
			}

			// evRvDomManagerService.calculateWorkareaWrapWidth(
			// 	elements.contentWrapElem,
			// 	elements.workareaWrapElem,
			// 	evDataService
			// )
		}

		evEventService.addEventListener(evEvents.UPDATE_PROJECTION, function () {

			var flatList = evDataService.getFlatList()

			if (scope.isReport) {
				projection = rvDataHelper.calculateProjection(flatList, evDataService)

				// rvDomManager.calculateScroll(elements, evDataService)
				rvRenderer.render(
					contentElem,
					projection,
					globalDataService,
					evDataService,
					evEventService
				)

				clearOverflowingCells()
				cellContentOverflow()

			} else {
				projection = evDataHelper.calculateProjection(flatList, evDataService)

				evRenderer.render(
					contentElem,
					projection,
					globalDataService,
					evDataService,
					evEventService
				)
			}
		})

		evEventService.addEventListener(evEvents.DATA_LOAD_START, function () {
			// progressBar.style.display = 'block';
			/* if (scope.isReport) {
	                       contentElem.style.opacity = '0.7';
	                   } */
			contentElem.style.opacity = '0.7'

			evDataService.setDataLoadStatus(false)

			scope.dataLoadStatus = false
		})

		evEventService.addEventListener(evEvents.DATA_LOAD_END, function () {
			// progressBar.style.display = 'none';

			contentElem.style.opacity = '1'

			updateTableContent()

			if (!activeLayoutConfigIsSet && viewContext !== 'reconciliation_viewer') {
				activeLayoutConfigIsSet = true
				evDataService.setActiveLayoutConfiguration({
					isReport: scope.isReport,
				}) // saving layout for checking for changes
				evEventService.dispatchEvent(
					evEvents.ACTIVE_LAYOUT_CONFIGURATION_CHANGED
				)
			}

			evDataService.setDataLoadStatus(true)

			scope.dataLoadStatus = true
		})

		evEventService.addEventListener(evEvents.REDRAW_TABLE, function () {
			calculateElemsWrapsSizes()

			updateTableContent()

			evEventService.dispatchEvent(evEvents.TABLE_SIZES_CALCULATED)
		})

		evEventService.addEventListener(evEvents.COLUMN_SORT_CHANGE, function () {
			viewportElem.scrollTop = 0
		})

		evEventService.addEventListener(
			evEvents.GROUP_TYPE_SORT_CHANGE,
			function () {
				viewportElem.scrollTop = 0
			}
		)

		evEventService.addEventListener(evEvents.GROUPS_CHANGE, function () {
			viewportElem.scrollTop = 0
		})

		function onWindowResize() {
			evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)

			if (scope.isReport) {
				// rvDomManager.calculateScroll(elements, evDataService);

				if (projection) {
					rvRenderer.render(
						contentElem,
						projection,
						globalDataService,
						evDataService,
						evEventService
					)
				}
			} else {
				// evDomManager.calculateScroll(elements, evDataService, scope.scrollManager);
				// evDomManager.calculateVirtualStep(elements, evDataService, scope.scrollManager);

				if (projection) {
					evRenderer.render(
						contentElem,
						projection,
						globalDataService,
						evDataService,
						evEventService
					)
				}
			}
		}

		//# endregion Event listeners

		var init = function () {

			if (viewContext == 'split_panel' && entityType == 'transaction-report') {

				scope.dataLoadStatus = true
				scope.firstRender = true

			} else {

				setTimeout(function () {

					if (!scope.firstRender) {
						// Force Table render if not rendered in first 60 second

						updateTableContent()
					}

				}, 60 * 1000)


				// window.addEventListener('resize', onWindowResize)

				if (!scope.isReport) {
					scope.scrollManager = new EvScrollManager()
				}

				setTimeout(function () {
					// prevents scroll from interfering with sizes of table parts calculation

					calculateElemsWrapsSizes()

					if (scope.isReport) {
						// rvDomManager.calculateScroll(elements, evDataService)

						rvDomManager.initEventDelegation(
							contentElem,
							evDataService,
							evEventService,
							usersService,
							globalDataService
						)
						// rvDomManager.initContextMenuEventDelegation(contentElem, evDataService, evEventService);

						// rvDomManager.addScrollListener(
						// 	elements,
						// 	evDataService,
						// 	evEventService
						// )

						evEventService.addEventListener(
							evEvents.RESIZE_COLUMNS_START,
							function () {
								clearOverflowingCells()
							}
						)

						evEventService.addEventListener(
							evEvents.RESIZE_COLUMNS_END,
							function () {
								cellContentOverflow()
							}
						)

						// If we already have data (e.g. viewType changed)
						var flatList = rvDataHelper.getFlatStructure(
							evDataService,
							globalDataService
						)

						if (flatList.length > 1) {
							// progressBar.style.display = 'none';

							if (scope.isReport) {
								contentElem.style.opacity = '1'
							}

							if (evDataService.didDataLoadEnd()) {
								updateTableContent()
							}
						}

						//  If we already have data (e.g. viewType changed) end

						/*evEventService.addEventListener(evEvents.START_CELLS_OVERFLOW, function () {
										   cellContentOverflow();
									   });*/
					} else {

						evDomManager.calculateScroll(
							elements,
							evDataService,
							scope.scrollManager
						)

						evDomManager.initEventDelegation(
							contentElem,
							evDataService,
							evEventService,
							usersService,
							globalDataService
						)
						evDomManager.initContextMenuEventDelegation(
							contentElem,
							evDataService,
							evEventService
						)

						evDomManager.addScrollListener(
							elements,
							evDataService,
							evEventService,
							scope.scrollManager
						)
					}

					evEventService.dispatchEvent(evEvents.TABLE_SIZES_CALCULATED)
				}, 500)

				if (!activeLayoutConfigIsSet && viewContext !== 'reconciliation_viewer') {

					activeLayoutConfigIsSet = true

					evDataService.setActiveLayoutConfiguration({
						isReport: scope.isReport,
					}) // saving layout for checking for changes
					evEventService.dispatchEvent(
						evEvents.ACTIVE_LAYOUT_CONFIGURATION_CHANGED
					)

				}

				if (toggleBookmarksBtn) {

					toggleBookmarksBtn.addEventListener('click', function () {

						var interfaceLayout = evDataService.getInterfaceLayout()

						var headerToolbar = document.querySelector('md-toolbar.header')

						interfaceLayout.headerToolbar.height = headerToolbar.clientHeight

						evDataService.setInterfaceLayout(interfaceLayout)

						/* delete var splitPanelIsActive = evDataService.isSplitPanelActive();

									if (isRootEntityViewer && splitPanelIsActive) {
									   evEventService.dispatchEvent(evEvents.UPDATE_ENTITY_VIEWER_CONTENT_WRAP_SIZE);
								   } */

						evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)

					})

				}

			}
		}

		init();

	});
		/*onBeforeUnmount(() => {
			window.removeEventListener('resize', onWindowResize)
		})*/

</script>

<style lang="scss" scoped>
	.g-table-body {
		height: calc(100% - 50px);
	}
	.report-viewer-holder .ev-viewport {
		height: 100%;
	}
</style>
