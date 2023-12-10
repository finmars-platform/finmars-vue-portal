<template>
	<div
		class="g-filters width-100 gFilters"
		:class="{ 'open-filters': $scope.isFiltersOpened }"
	>
		<!-- IMPORTANT: for .gFiltersWrap padding should be set by styles, so that scripts can access it -->
		<div class="gFiltersWrap" style="padding: 0px">
<!--			<template v-if="ready">
				<AngularFmGridTableRvFilters v-if="$scope.isReport" />

				<AngularFmGridTableEvRvFilters
					v-else
					:vm="vm"
					:attributeDataService="attributeDataService"
				/>
			</template>-->
			<template v-if="ready && $scope.isReport">
				<FmTableFiltersRv
					@customFieldsMissing="updateMissingCustomFieldsList"
				/>

			</template>

<!--			<template v-if="ready && !$scope.isReport">
				<FmTableFiltersEv />
			</template>-->

			<div
				v-if="viewContext !== 'dashboard' && ready"
				class="drop-area-wrap column-to-filters-drop-area display-none gFiltersDropArea"
			>
				<div class="g-drop-area gDropArea"></div>

				<div class="drop-area-content">
					<span>Drop here to add filters</span>
				</div>
			</div>

			<div
				v-if="$scope.viewContext !== 'dashboard' && ready"
				class="drop-area-wrap remove-column-drop-area display-none gDeletionDropArea"
			>
				<div class="g-drop-area gDropArea"></div>

				<div class="drop-area-content">
					<span class="material-icons">delete</span>
				</div>
			</div>
		</div>

<!--		<AngularFmGridTableRowsBulkActions
			v-if="$scope.isRootEntityViewer && $scope.viewContext !== 'dashboard'"
			:contentWrapElement="$scope.contentWrapElement"
		/>-->

<!--		<g-rows-bulk-actions
			v-if="isRootEntityViewer && viewContext !== 'dashboard'"
			ev-data-service="evDataService"
			ev-event-service="evEventService"
			content-wrap-element="contentWrapElement"
		></g-rows-bulk-actions>-->
	</div>
</template>

<script setup>
	import evEvents from '@/angular/services/entityViewerEvents'
	import popupEvents from '@/angular/services/events/popupEvents'
	import metaService from '@/angular/services/metaService'

	import metaHelper from '@/angular/helpers/meta.helper'
	import evHelperService from '@/angular/services/entityViewerHelperService'

	import downloadFileHelper from '@/angular/helpers/downloadFileHelper'

	import convertReportHelper from '@/angular/helpers/converters/convertReportHelper'
	import reportCopyHelper from '@/angular/helpers/reportCopyHelper'

	import exportExcelService from '@/angular/services/exportExcelService'

	import EventService from '@/angular/services/eventService'
	// import gFiltersHelperInst from '~~/src/angular/helpers/gFiltersHelper'

	// const gFiltersHelper = new gFiltersHelperInst()

	// export default function (
	// 	uiService,
	// 	evRvLayoutsHelper,
	// ) {
	// scope: {
	// 		attributeDataService: '=',
	// 		contentWrapElement: '=',
	// 		dashboardComponentElement: '=',
	// 		hideFiltersBlock: '=',
	// 		hideUseFromAboveFilters: '=',
	// 	},
	const props = defineProps(['attributeDataService', 'contentWrapElement'])

	const { evEventService, evDataService } = inject('fmTableData')

	let $scope = reactive({ ...props })
	let vm = reactive({})

	provide('filterData', vm)

	let filters = []
	// let useFromAboveFilters = [];
	let attrsWithoutFilters = ['notes']
	let entityAttrs = []
	let dynamicAttrs = []
	let gFiltersElem = null
	let ready = ref(false)

	let gFiltersElemPadding

	onMounted(() => {
		// Use ref
		gFiltersElem = document.querySelector('.gFilters')

		/** Used when inside dashboard, and does not change with window resize. Can be less than actual width, when used outside dashboard. */

		const gFiltersElemWidth = gFiltersElem.clientWidth

		const gFiltersWrapElem = gFiltersElem.querySelector('.gFiltersWrap')
		gFiltersElemPadding = parseInt(gFiltersWrapElem.style.padding, 10)

		init()

		ready.value = true
	})

	vm.contentType = evDataService.getContentType()
	$scope.isReport = metaService.isReport(vm.contentType)
	$scope.contentType = evDataService.getContentType()
	// $scope.currentAdditions = evDataService.getAdditions();
	$scope.isRootEntityViewer = evDataService.isRootEntityViewer()
	$scope.viewContext = evDataService.getViewContext()

	$scope.isFiltersOpened = !$scope.hideFiltersBlock // when inside dashboard or split panel
	vm.hideUseFromAboveFilters = $scope.hideUseFromAboveFilters

	vm.popupPosX = { value: null }
	vm.popupPosY = { value: null }

	/* $scope.readyStatus = {
	                    filters: false
	                } */
	$scope.showFrontFilters = true

	let currentAdditions = evDataService.getAdditions()

	// let customFields = $scope.attributeDataService.getCustomFieldsByEntityType(vm.entityType);

	const getAttributes = () => {
		let allAttrsList

		if ($scope.viewContext === 'reconciliation_viewer') {
			allAttrsList = $scope.attributeDataService.getReconciliationAttributes()
		} else {
			switch (vm.contentType) {
				case 'reports.balancereport':
					allAttrsList =
						$scope.attributeDataService.getBalanceReportAttributes()
					break

				case 'reports.plreport':
					allAttrsList = $scope.attributeDataService.getPlReportAttributes()
					break

				case 'reports.transactionreport':
					allAttrsList =
						$scope.attributeDataService.getTransactionReportAttributes()
					break

				default:
					entityAttrs = []
					dynamicAttrs = []
					allAttrsList = []

					entityAttrs =
						$scope.attributeDataService.getEntityAttributesByEntityType(
							vm.entityType
						)

					entityAttrs.forEach(function (item) {
						if (
							item.key === 'subgroup' &&
							item.value_entity.indexOf('strategy') !== -1
						) {
							item.name = 'Group'
						}

						item.entity = vm.contentType
					})

					let instrumentUserFields =
						$scope.attributeDataService.getInstrumentUserFields()
					let transactionUserFields =
						$scope.attributeDataService.getTransactionUserFields()

					instrumentUserFields.forEach(function (field) {
						entityAttrs.forEach(function (entityAttr) {
							if (entityAttr.key === field.key) {
								entityAttr.name = field.name
							}
						})
					})

					transactionUserFields.forEach(function (field) {
						entityAttrs.forEach(function (entityAttr) {
							if (entityAttr.key === field.key) {
								entityAttr.name = field.name
							}
						})
					})

					dynamicAttrs =
						$scope.attributeDataService.getDynamicAttributesByEntityType(
							vm.entityType
						)

					dynamicAttrs = dynamicAttrs.map(function (attribute) {
						let result = {}

						result.attribute_type = Object.assign({}, attribute)
						result.value_type = attribute.value_type
						result.content_type = $scope.contentType
						result.key = 'attributes.' + attribute.user_code
						result.name = attribute.name

						return result
					})

					allAttrsList = allAttrsList.concat(entityAttrs, dynamicAttrs)

					break
			}
		}

		return allAttrsList
	}

	const getListLayoutByEntity = function (entityType) {
		var options = {
			pageSize: 1000,
			page: 1,
			sort: {
				key: 'content_type',
				direction: 'DSC',
			},
		}

		var layouts = []

		var getLayouts = function (resolve, reject) {
			uiService
				.getListLayout(entityType, options)
				.then(function (data) {
					layouts = layouts.concat(data.results)

					if (data.next) {
						options.page = options.page + 1
						getLayouts()
					} else {
						resolve(layouts)
					}
				})
				.catch(function (error) {
					reject(error)
				})
		}

		return new Promise(function (resolve, reject) {
			getLayouts(resolve, reject)
		})
	}

	vm.getChipTextElem = function (filterName, filterValues, filterType) {
		let filterVal = filterValues || ''

		switch (filterType) {
			case 'from_to':
				filterVal = `From ${filterValues.min_value} to ${filterValues.max_value}`
				break

			case 'out_of_range':
				filterVal = `Out of range from ${filterValues.min_value} to ${filterValues.max_value}`
				break

			case 'multiselector':
				filterVal = filterValues.join(', ')
				break

			case 'date_tree':
				const formattedDates = filterValues.map((date) =>
					moment(date).format('YYYY-MM-DD')
				)
				filterVal = formattedDates.join(', ')
				break
		}

		return `<span class="g-filter-chips-text">
							<span class="g-filter-chip-name">${filterName}:</span>
							<span class="g-filter-chip-value text-bold"> ${filterVal}</span>
						</span>`
	}

	vm.checkCustomFieldFilterForError = (filter, filterData, customFields) => {
		const customField = customFields.find(
			(field) => filter.key === `custom_fields.${field.user_code}`
		)

		if (!customField) {
			filter.options.enabled = false
			const description = `The ${
				filter.groups ? 'group' : 'column'
			} does not exist in the Configuration`

			filterData.error_data = {
				code: 10,
				description: description,
			}

			const error = {
				key: filter.key,
				description: description,
			}

			return [filter, filterData, error]
		}

		return [filter, filterData, null]
	}

	const updateMissingCustomFieldsList = function (errors) {
		const missingCustomFields = []

		errors.forEach((error) => {
			if (!missingCustomFields.find((field) => field.key === error.key)) {
				missingCustomFields.push(error)
			}
		})

		evDataService.setMissingCustomFields({
			forFilters: missingCustomFields,
		})
	}

	vm.toggleSplitPanel = function ($event, type) {
		if (currentAdditions.type === type) {
			evRvLayoutsHelper.clearSplitPanelAdditions(evDataService)

			evEventService.dispatchEvent(evEvents.ADDITIONS_CHANGE)
			evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)
		} else {
			var entityType = null

			switch (type) {
				case 'balance-report':
				case 'pl-report':
				case 'transaction-report':
					entityType = type
					break
			}

			if (entityType) {
				// in case of choosing entity viewer layout

				getListLayoutByEntity(entityType).then(function (layoutsList) {
					var layouts =
						evRvLayoutsHelper.getDataForLayoutSelectorWithFilters(layoutsList)

					$mdDialog
						.show({
							controller: 'ExpandableItemsSelectorDialogController as vm',
							templateUrl:
								'views/dialogs/expandable-items-selector-dialog-view.html',
							targetEvent: $event,
							multiple: true,
							locals: {
								data: {
									dialogTitle: 'Choose layout to open Split Panel with',
									items: layouts,
								},
							},
						})
						.then(function (res) {
							if (res.status === 'agree') {
								var additions = evDataService.getAdditions()

								additions.isOpen = true
								additions.type = type

								if (res.selected.id) {
									if (!additions.layoutData) {
										additions.layoutData = {}
									}

									additions.layoutData.user_code = res.selected.user_code
									additions.layoutData.layoutId = res.selected.id
									additions.layoutData.name = res.selected.name

									additions.layoutData.content_type = res.selected.content_type
								} else {
									delete additions.layoutData
								}

								evDataService.setSplitPanelStatus(true)
								evDataService.setAdditions(additions)
								evEventService.dispatchEvent(evEvents.ADDITIONS_CHANGE)
								currentAdditions = evDataService.getAdditions()
							}
						})
				})
			} else {
				var additions = evDataService.getAdditions()

				additions.isOpen = true
				additions.type = type

				delete additions.layoutData

				evDataService.setSplitPanelStatus(true)
				evDataService.setAdditions(additions)
				evEventService.dispatchEvent(evEvents.ADDITIONS_CHANGE)
				currentAdditions = evDataService.getAdditions()
			}
		}
	}

	vm.exportAsCSV = function () {
		var flatList = evDataService.getFlatList()
		var columns = evDataService.getColumns()
		var groups = evDataService.getGroups()

		var blobPart = convertReportHelper.convertFlatListToCSV(
			flatList,
			columns,
			$scope.isReport,
			groups.length
		)
		downloadFileHelper.downloadFile(blobPart, 'text/plain', 'report.csv')
	}

	vm.exportAsExcel = function () {
		var data = {
			entityType: vm.entityType,
			contentSettings: {
				columns: evDataService.getColumns(),
				groups: evDataService.getGroups(),
			},
			content: evDataService.getFlatList(),
		}

		exportExcelService.generateExcel(data).then(function (blob) {
			downloadFileHelper.downloadFile(
				blob,
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				'report.xlsx'
			)

			$mdDialog.hide()
		})
	}

	vm.copyReport = function () {
		reportCopyHelper.copy(evDataService, $scope.isReport)
	}

	vm.copySelectedToBuffer = function () {
		reportCopyHelper.copy(evDataService, $scope.isReport, 'selected')
	}

	vm.openViewConstructor = function (ev) {
		if ($scope.isReport) {
			let controllerName = ''
			let templateUrl = ''

			switch (vm.entityType) {
				case 'balance-report':
					controllerName = 'gModalReportController as vm'
					templateUrl = 'views/directives/groupTable/modal-report-view.html'
					break
				case 'pl-report':
					controllerName = 'gModalReportPnlController as vm'
					templateUrl = 'views/directives/groupTable/modal-report-view.html'
					break
				case 'performance-report':
					controllerName = 'gModalReportPerformanceController as vm'
					templateUrl =
						'views/directives/groupTable/modal-report-performance-view.html'
					break
				case 'cash-flow-projection-report':
					controllerName = 'gModalReportCashFlowProjectionController as vm'
					templateUrl =
						'views/directives/groupTable/modal-report-cash-flow-projection-view.html'
					break
				case 'transaction-report':
					controllerName = 'gModalReportTransactionController as vm'
					templateUrl =
						'views/directives/groupTable/modal-report-transaction-view.html'
					break
			}

			$mdDialog.show({
				controller: controllerName,
				templateUrl: templateUrl,
				targetEvent: ev,
				locals: {
					attributeDataService: $scope.attributeDataService,
					entityViewerDataService: evDataService,
					entityViewerEventService: evEventService,
					contentWrapElement: $scope.contentWrapElement,
				},
			})
		} else {
			$mdDialog.show({
				controller: 'gModalController as vm', // ../directives/gTable/gModalComponents
				templateUrl: 'views/directives/groupTable/g-modal-view.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				locals: {
					attributeDataService: $scope.attributeDataService,
					entityViewerDataService: evDataService,
					entityViewerEventService: evEventService,
					contentWrapElement: $scope.contentWrapElement,
				},
			})
		}
	}

	//region Chips filters

	const getAttrsForFilterAddition = (filtersList) => {
		const allAttrsList = getAttributes()

		let availableAttrs = allAttrsList.filter((attr) => {
			for (let i = 0; i < filtersList.length; i++) {
				if (filtersList[i].key === attr.key) {
					return false
				}
			}

			if (attrsWithoutFilters.includes(attr.key)) {
				return false
			}

			return true
		})

		if (!$scope.isReport) {
			availableAttrs = availableAttrs.filter((attr) => {
				return attr.value_type !== 'mc_field' && attr.key !== 'notes'
			})
		}

		return availableAttrs
	}

	vm.openAddFilterDialog = async (event, filters) => {
		try {
			let availableAttrs = getAttrsForFilterAddition(filters)
			const columns = evDataService.getColumns()
			const selectedAttrs = filters.map((col) => col.key)

			let res = await $mdDialog.show({
				controller: 'AttributesSelectorDialogController as vm',
				multiple: true,
				locals: {
					data: {
						title: 'Add filters',
						attributes: availableAttrs,
						layoutNames: evHelperService.getAttributesLayoutNames(columns),
						selectedAttributes: selectedAttrs,
						contentType: $scope.contentType,
						multiselector: true,
					},
				},
			})

			if (res && res.status === 'agree') {
				for (var i = 0; i < res.data.items.length; i = i + 1) {
					res.data.items[i] = useSetEvRvFilterDefaultOptions(
						res.data.items[i]
					)
				}

				console.log('openAddFilterDialog res.data.items', res.data.items)

				return { status: res.status, data: res.data }
			}

			return { status: res.status }
		} catch (error) {
			console.log('error:', error)
			return false
		}
	}

	/**
	 * Sets width for element with filter chips.
	 *
	 * @param leftPartWidth {number} - width of .gFiltersLeftPartWidth element
	 * @param rightPartWidth {number} - width of .gFiltersRightPartWidth element
	 * @param filtersChipsContainer {HTMLElement}
	 */
	vm.calculateFilterChipsContainerWidth = function (
		leftPartWidth,
		rightPartWidth,
		filtersChipsContainer
	) {
		// let filtersChipsContainerWidth = 800;

		let filterAreaWidth
		if ($scope.contentWrapElement) {
			filterAreaWidth = $scope.contentWrapElement.clientWidth
		} else if ($scope.viewContext === 'dashboard') {
			// For dashboard components without wrapElems e.g. matrix
			// filterAreaWidth = gFiltersElemWidth
		}

		const horizontalPaddings = gFiltersElemPadding * 2
		const availableSpace =
			filterAreaWidth - horizontalPaddings - leftPartWidth - rightPartWidth

		filtersChipsContainer.style.width = availableSpace + 'px'
	}

	vm.onFilterChipClick = function (chipsData) {
		vm.popupEventService.dispatchEvent(popupEvents.OPEN_POPUP, {
			doNotUpdateScope: true,
		})
	}

	vm.updateFilterAreaHeight = () => {
		let interfaceLayout = evDataService.getInterfaceLayout()
		const gFiltersHeight = gFiltersElem.clientHeight
		const originalHeight = interfaceLayout.filterArea.height

		interfaceLayout.filterArea.height = gFiltersHeight

		evDataService.setInterfaceLayout(interfaceLayout)

		return originalHeight !== gFiltersHeight
	}

	vm.onChipsFirstRender = function () {
		vm.updateFilterAreaHeight()
		evEventService.dispatchEvent(evEvents.FILTERS_RENDERED)
	}
	//endregion

	function initEventListeners() {
		evEventService.addEventListener(evEvents.TOGGLE_FILTER_BLOCK, function () {
			$scope.isFiltersOpened = !$scope.isFiltersOpened

			setTimeout(() => {
				const interfaceLayout = evDataService.getInterfaceLayout()
				const gFiltersHeight = gFiltersElem.clientHeight

				interfaceLayout.filterArea.height = gFiltersHeight
				evDataService.setInterfaceLayout(interfaceLayout)

				evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)
			}, 500) // Transition time for .g-filters
		})
	}

	vm.updateFilterAreaHeightOnInit = function () {
		/*
	                    TODO: Refactor this
	                    1 add on "resize" event listener for filter area height change
	                    2 calculate before render e.g width 1000px -> we got 2 rows - height 140px
	                                                 width 500px -> we got 3 row - heiht 210px
	                    */
		setTimeout(function () {
			vm.updateFilterAreaHeight() // important here
			evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)
		}, 1000)
	}

	function syncFiltersLayoutNamesWithColumns() {
		const columns = evDataService.getColumns()
		const filters = evDataService.getFilters()

		columns.forEach((column) => {
			if (column.layout_name) {
				if ($scope.isReport) {
					const matchingFilter = filters.find(
						(filter) => filter.key === column.key
					)
					if (matchingFilter) matchingFilter.layout_name = column.layout_name
				} else {
					const matchingFrontFilter = filters.frontend.find(
						(filter) => filter.key === column.key
					)
					if (matchingFrontFilter)
						matchingFrontFilter.layout_name = column.layout_name

					const matchingBackFilter = filters.backend.find(
						(filter) => filter.key === column.key
					)
					if (matchingBackFilter)
						matchingBackFilter.layout_name = column.layout_name
				}
			}
		})

		evDataService.setFilters(filters)
	}

	function init() {
		const filtersObj = evDataService.getFilters()

		vm.popupEventService = new EventService()
		vm.chipsListEventService = new EventService()

		vm.popupData = {
			evDataService: evDataService,
			evEventService: evEventService,
			attributeDataService: $scope.attributeDataService,
		}

		syncFiltersLayoutNamesWithColumns()

		initEventListeners()
	}
</script>

<style lang="scss" scoped></style>
