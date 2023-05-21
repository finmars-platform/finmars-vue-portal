<template>
	<div class="g-scrollable-area">
		<div class="g-column-bottom-row g-table-header flex-row">
			<div class="g-cell g-cell-select-all">
				<FmCheckbox :size="18" v-model="isAllSelected" />
			</div>

			<div class="g-cell-rows-settings">
				<div class="g-row-settings height-100">
					<div class="context-menu-btn-wrapper"></div>

					<button
						v-if="!isReport"
						class="g-row-settings-btn visibility-hidden"
						data-click-action-type="open_row_status_picker"
					>
						<span v-html="rowStatusFilterIcon" style="height: 24px"></span>
						<span class="material-icons arrow-icon">arrow_drop_down</span>
					</button>

					<FmMenu class="header_item header_icon_btn">
						<template #btn="{ isOpen }">
							<md-button
								class="g-cell-button g-row-settings-btn g-row-color-picker-btn"
								:class="rowFilterColor"
								@click="$mdOpenMenu($event)"
							>
								<span
									class="material-icons label-icon"
									v-if="rowFilterColor === 'none'"
									>label_outline</span
								>
								<span class="material-icons" v-if="rowFilterColor !== 'none'"
									>label</span
								>
								<span class="material-icons arrow-icon">arrow_drop_down</span>
							</md-button>
						</template>

						<div class="fm_list">
							<md-menu-item>
								<md-button
									class="g-cell-button g-row-color-picker-option"
									@click="changeRowFilterColor('none')"
								>
									<span class="material-icons">label_outline</span>
								</md-button>
							</md-menu-item>

							<md-menu-item>
								<md-button
									class="g-cell-button g-row-color-picker-option red"
									@click="changeRowFilterColor('red')"
								>
									<span class="material-icons">label</span>
								</md-button>
							</md-menu-item>

							<md-menu-item>
								<md-button
									class="g-cell-button g-row-color-picker-option yellow"
									@click="changeRowFilterColor('yellow')"
								>
									<span class="material-icons">label</span>
								</md-button>
							</md-menu-item>

							<md-menu-item>
								<md-button
									class="g-cell-button g-row-color-picker-option green"
									@click="changeRowFilterColor('green')"
								>
									<span class="material-icons">label</span>
								</md-button>
							</md-menu-item>

							<md-menu-item>
								<md-button
									class="g-cell-button g-row-color-picker-option divider"
									@click="removeColorMarkFromAllRows($event)"
								>
									<span class="material-icons">label_off</span>
								</md-button>
							</md-menu-item>
						</div>
					</FmMenu>
				</div>

				<md-button class="g-row-settings-toggle" @click="rowFiltersToggle()">
					<div class="center aic height-100">
						<span v-show="!hideRowSettings" class="material-icons f-s-16"
							>keyboard_arrow_left</span
						>
						<span v-show="hideRowSettings" class="material-icons f-s-16"
							>keyboard_arrow_right</span
						>
					</div>
				</md-button>
			</div>

			<div
				v-if="isReport"
				class="flex-row g-groups-holder gGroupsHolder gcAreaDnD"
			>
				<div
					class="g-table-header-cell-wrapper gGroupElem gColumnElem gDraggableHead gcAreaDnD"
					v-for="column in groups"
					:class="{
						'last-dragged':
							column.frontOptions && column.frontOptions.lastDragged,
						error: column.error_data,
					}"
					:key="column.key"
					:style="column.style"
					:data-column-id="column.___group_type_id"
					:data-attr-key="column.key"
					:draggable="groupsAreaDraggable"
					custom-popup
					popup-id="{{column.key}}"
					popup-template-url="{{getPopupMenuTemplate(column)}}"
					position-relative-to="mouse"
					open-on="right_click"
					close-on-click-outside="true"
					prevent-default="'true'"
					on-save-callback=""
					:popup-data="columnsPopupsData[column.key]"
					offset-x="-10"
					offset-y="-10"
					popup-classes="{{getPopupMenuClasses(column)}}"
					backdrop-classes="'low-z-index-backdrop'"
					on-cancel="onSubtotalTypeSelectCancel()"
					popup-event-service="evEventService"
				>
					<md-tooltip
						md-direction="top"
						data-ng-class="{'custom-field-error': column.error_data}"
					>
						<span>{{ column.name }}</span>
						<span v-if="column.status == 'missing'">(Deleted)</span>
						<span v-if="column?.error_data">{{
							column?.error_data.description
						}}</span>
					</md-tooltip>

					<div
						class="g-cell g-table-header-cell g-table-header-group-cell position-relative"
					>
						<div
							custom-popup
							popup-id="{{column.key}}"
							popup-template-url="'views/popups/entity-viewer/g-report-viewer-column-sort-popup-menu.html'"
							popup-data="{column: column, changeSortMode: changeSortMode}"
							position-relative-to="element"
							relative-popup-x="left"
							open-on="click"
							close-on-click-outside="true"
							popup-classes="column-sort-popup"
							popup-event-service="evEventService"
							class="g-column-sort-settings-opener"
						></div>

						<div
							v-if="column.report_settings.is_level_folded"
							class="g-cell-button"
							@click="unfoldLevel(column, $index)"
						>
							<span class="material-icons">add</span>
						</div>

						<div
							v-if="!column.report_settings.is_level_folded"
							class="g-cell-button"
							@click="foldLevel(column, $index)"
						>
							<span class="material-icons">remove</span>
						</div>

						<span v-if="column?.error_data" class="material-icons error"
							>error</span
						>

						<div class="g-table-header-button">
							<div class="column-name-wrapper">
								<div class="flex-row flex-i-center name-block">
									<div v-if="!column.layout_name">
										<span>{{ column.name }}</span>
										<span v-if="column.status == 'missing'">(Deleted)</span>
									</div>

									<div v-if="column.layout_name">
										<span>{{ column.layout_name }}</span>
										<span v-if="column.status == 'missing'">(Deleted)</span>
									</div>

									<!--                                <span class="material-icons arrow-down">arrow_drop_down</span>-->

									<span
										v-if="
											column?.options?.sort_settings &&
											column?.options.sort_settings.mode === 'manual'
										"
										class="column-manual-sort-icon"
									>
										m
										<md-tooltip md-direction="top">
											Manual Sorting Activated
										</md-tooltip>
									</span>
								</div>

								<div
									class="sort"
									@click="
										changeSortDirection(
											column,
											column?.options.sort === 'DESC' ? 'ASC' : 'DESC'
										)
									"
								>
									<span
										v-show="
											column?.options.sort === 'DESC' || !column?.options.sort
										"
										class="material-icons gt-sorting-icon"
										>arrow_upward</span
									>
									<span
										v-show="column?.options.sort === 'ASC'"
										class="material-icons gt-sorting-icon"
										>arrow_downward</span
									>
								</div>
							</div>
						</div>
					</div>

					<AngularFmGridTableColumnResizer />
					<!-- gDraggableHeadArea used to prevent call of event "dragleave" by children of gcAreaDnD -->
					<div
						class="g-table-header-drop gDraggableHeadArea"
						:data-attr-key="column.key"
					></div>
				</div>
			</div>

			<div class="flex-row width-100 g-cols-holder gColumnsHolder gcAreaDnD">
				<AngularFmGridTableColumnCell
					v-for="(column, index) in columnsToShow"
					:column="column"
					:style="{ ...column.style }"
					:key="index + '_' + column.___column_id"
					:isReport="isReport"
					:popup-template-url="getPopupMenuTemplate(column)"
					:popup-data="columnsPopupsData[column.key]"
					popup-classes="{{getPopupMenuClasses(column)}}"
					on-cancel="onSubtotalTypeSelectCancel()"
					popup-event-service="evEventService"
				/>

				<button class="g-cell g-add-column-button" @click="addColumn($event)">
					<FmIcon v-fm-tooltip="'Add new column'" icon="add_circle" />
				</button>
			</div>
		</div>

		<ModalAttributesSelector
			v-if="$mdDialog.modals['AttributesSelectorDialogController']"
			:payload="$mdDialog.modals['AttributesSelectorDialogController']"
			:modelValue="true"
		></ModalAttributesSelector>
	</div>
</template>

<script setup>
	import evEvents from '@/angular/services/entityViewerEvents'
	import popupEvents from '@/angular/services/events/popupEvents'
	import evDataHelper from '@/angular/helpers/ev-data.helper'

	// import metaService from '@/angular/services/metaService';
	import evHelperService from '@/angular/services/entityViewerHelperService'
	import rvDataHelper from '@/angular/helpers/rv-data.helper'

	import localStorageService from '@/angular/shell/scripts/app/services/localStorageService'

	const props = defineProps([
		'vm',
		'evEventService',
		'evDataService',
		'attributeDataService',
		'contentWrapElement',
	])
	const $mdDialog = inject('$mdDialog')
	/**
	 * Created by szhitenev on 05.05.2016.
	 */

	// export default function (
	// 	$mdDialog,
	// 	toastNotificationService,
	// 	usersService,
	// 	globalDataService,
	// 	uiService,
	// 	evRvDomManagerService
	// ) {
	const {
		evDataService,
		evEventService,
		attributeDataService,
		contentWrapElement,
	} = props

	const isOpenAttrsSelector = ref(false)

	let columns = evDataService.getColumns()

	let groups = ref(null)
	groups.value = evDataService.getGroups()
	console.log('groups.value:', groups.value)
	let columnsToShow = ref([])

	let viewContext = evDataService.getViewContext()
	// let isReport = metaService.isReport(entityType);
	let isReport = evDataService.isEntityReport()

	let entityType = evDataService.getEntityType()
	let rowStatusFilterIcon = `<span class="material-icons">star_outline</span>`

	let filters = evDataService.getFilters()
	/**
	 * What filters (front or back) are shown now in filter area of entity viewer
	 * @type {Boolean}
	 */
	let showFrontEvFilters = !isReport && filters.frontend.length > 0

	let isSubtotalWeightedShouldBeExcluded = function (column) {
		return [
			'market_value',
			'market_value_percent',
			'exposure',
			'exposure_percent',
		].some((excludedKey) => column.key === excludedKey)
	}
	const getColumnsToShow = function () {
		if (isReport) {
			return evDataHelper.separateNotGroupingColumns(columns, groups)
		} else {
			return columns
		}
	}

	// Victor 2021.03.29 #88 fix bug with deleted custom fields
	let customFields =
		attributeDataService.getCustomFieldsByEntityType(entityType)

	/**
	 * Collects errors from columns.
	 */
	function collectMissingCustomFieldsErrors() {
		const columnsErrorsList = []
		const groupsErrorsList = []

		const markItemUsingMissingCustomField = function (
			item,
			itemType,
			errorsList
		) {
			if (item.key.startsWith('custom_fields')) {
				const customField = customFields.find(
					(field) => item.key === `custom_fields.${field.user_code}`
				)

				if (customField) {
					item.error_data = null
				} else {
					const description = `The ${itemType} does not exist in the Configuration`

					item.error_data = {
						code: 10,
						description: description,
					}

					const error = {
						key: item.key,
						description: description,
					}

					errorsList.push(error)
				}
			}
		}

		if (isReport) {
			groups.value = evDataService.getGroups()

			groups.value.forEach((group) => {
				markItemUsingMissingCustomField(group, 'group', groupsErrorsList)
			})
		}

		let columns = evDataService.getColumns()

		columns.forEach((column) => {
			markItemUsingMissingCustomField(column, 'column', columnsErrorsList)
		})

		evDataService.setMissingCustomFields({
			forColumns: columnsErrorsList,
			forGroups: groupsErrorsList,
		})
	}

	let components = evDataService.getComponents()
	let downloadedItemsCount = null
	let contentType = evDataService.getContentType()
	let columnAreaCollapsed = false

	let isAllSelected = ref(evDataService.getSelectAllRowsState())
	let isAllStarsSelected = false
	let hideRowSettings = ref(!!evDataService.getRowSettings().folded)
	let groupsAreaDraggable = viewContext !== 'dashboard'

	let entityAttrs = []
	let dynamicAttrs = []

	// var keysOfColsToHide = [];
	let popupData
	function onSubtotalSumClick(column) {
		popupData = columnsPopupsData[column.key].data

		if (popupData) {
			popupData.isSubtotalAvgWeighted = false
			popupData.isSubtotalWeighted = false
			popupData.isTemporaryWeighted = false
			popupData.isSubtotalSum = !popupData.isSubtotalSum
		}

		selectSubtotalType(column, 1)
	}

	function onSubtotalWeightedClick(column) {
		popupData = columnsPopupsData[column.key].data

		if (popupData) {
			popupData.isSubtotalSum = false
			popupData.isSubtotalAvgWeighted = false
			popupData.isTemporaryWeighted = true
			popupData.isSubtotalWeighted = !popupData.isSubtotalWeighted
		}
	}

	function onSubtotalAvgWeightedClick(column) {
		popupData = columnsPopupsData[column.key].data

		if (popupData) {
			popupData.isSubtotalSum = false
			popupData.isSubtotalWeighted = false
			popupData.isTemporaryWeighted = true
			popupData.isSubtotalAvgWeighted = !popupData.isSubtotalAvgWeighted
		}
	}

	function openNumberFormatDialog(column) {
		evEventService.dispatchEvent(popupEvents.CLOSE_POPUP)

		let dialogData = {
			settings: {},
		}
		// column.options.number_format
		if (column.options) {
			dialogData.settings = column.options.numberFormat
		}

		if (!column.options) {
			dialogData.settings = column.report_settings
		}
		// for old layouts
		if (
			isReport &&
			column.options &&
			!column.options.hasOwnProperty('numberFormat')
		) {
			dialogData.settings = column.report_settings
		}

		$mdDialog
			.show({
				controller: 'NumberFormatSettingsDialogController as vm',
				templateUrl: 'views/dialogs/number-format-settings-dialog-view.html',
				parent: angular.element(document.body),
				locals: {
					data: dialogData,
				},
			})
			.then((res) => {
				if (res.status === 'agree') {
					// column.report_settings = res.data;

					if (!column.options) column.options = {}

					column.options.numberFormat = res.data

					evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
					evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED)
				}
			})
	}

	// Victor 2020.12.14 #69 New report viewer design
	let rowFilterColor = 'none'

	let columnsPopupsData = null

	function makePopupDataForColumns(columns) {
		columnsPopupsData = {}

		columns.forEach((column, index) => {
			var matchingGroup = groups.value.find((group) => group.key === column.key)
			var item = matchingGroup || column

			columnsPopupsData[column.key] = {
				data: getPopupData(item, index, !!matchingGroup),
			}
		})
	}

	let onSubtotalTypeSelectCancel = function () {
		makePopupDataForColumns(columns)
	}
	let checkForFilteringBySameAttr

	let getPopupMenuTemplate = function (column) {
		if (isReport && column.value_type == 20) {
			return "'views/popups/groupTable/columnSettings/g-numeric-column-settings-popup-menu.html'" // Victor 2020.12.14 #69 string in string must returned for template binding
		}

		return "'views/popups/groupTable/columnSettings/g-column-settings-popup-menu.html'"
	}

	let getPopupMenuClasses = function (column) {
		if (isReport && column.value_type == 20) {
			return 'rounded-border g-column-number-context-menu-popup'
		}

		return 'rounded-border g-column-context-menu-popup'
	}

	let rowFiltersToggle = function () {
		hideRowSettings.value = !hideRowSettings.value
		/* var rowColorsColumnCollapsed = evDataService.getRowColorsColumnData();

	                   rowColorsColumnCollapsed = !rowColorsColumnCollapsed; */

		var rowSettings = evDataService.getRowSettings(hideRowSettings.value)

		rowSettings.folded = hideRowSettings.value

		evDataService.setRowSettings(rowSettings)

		if (hideRowSettings.value) {
			contentWrapElement.classList.add('g-row-settings-collapsed')
		} else {
			contentWrapElement.classList.remove('g-row-settings-collapsed')
		}
	}

	let changeRowFilterColor = function (color) {
		let rowTypeFiltersData = evDataService.getRowTypeFilters()

		let rowFilterColor = color
		rowTypeFiltersData.markedRowFilters = color

		evDataService.setRowTypeFilters(rowTypeFiltersData)

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
	}

	// let rowFilterColor = localStorageService.getRowTypeFilter(isReport, entityType);

	let removeColorMarkFromAllRows = function ($event) {
		$mdDialog
			.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				multiple: true,
				locals: {
					warning: {
						title: 'Warning',
						description:
							'Color marks will be removed for all rows in this table. Proceed?',
						actionsButtons: [
							{
								name: 'OK',
								response: { status: 'agree' },
							},
							{
								name: 'CANCEL',
								response: { status: 'disagree' },
							},
						],
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					evRvDomManagerService.removeColorMarkFromAllRows(
						evDataService,
						evEventService,
						usersService,
						globalDataService
					)
				}
			})
	}

	// <Victor 2020.12.14 #69 New report viewer design>

	// Victor 2021.04.07 #90 sort setting for column

	// let activeNameBlockElement = null;
	let columnWithOpenSortMenuElem = null

	let showArrowDown = ($event) => {
		/* activeNameBlockElement = $event.target.closest('.name-block');
	                   activeNameBlockElement.classList.add('active'); */
		columnWithOpenSortMenuElem = $event.target.closest('.gColumnElem')
		columnWithOpenSortMenuElem.classList.add('sort-menu-opened')
	}

	let hideArrowDown = () => {
		/* if (activeNameBlockElement) {
	                       activeNameBlockElement.classList.remove('active');
	                       activeNameBlockElement = null;
	                   } */
		if (columnWithOpenSortMenuElem) {
			columnWithOpenSortMenuElem.classList.remove('sort-menu-opened')
			columnWithOpenSortMenuElem = null
		}
	}

	const clearAllSortOptions = function (columns) {
		columns.forEach((column) => {
			if (!column.options) {
				column.options = {}
			}

			column.options.sort = null
		})
	}

	let changeSortMode = function (column, sortMode) {
		// hideArrowDown();
		evEventService.dispatchEvent(popupEvents.CLOSE_POPUP)

		column.options.sort_settings.mode = sortMode
		// column.options.sort = direction;
		if (!column.options) column.options = {}
		if (!column.options.sort) column.options.sort = 'ASC'

		sort(column)
	}

	let changeSortDirection = function (columnOrGroup, direction) {
		evEventService.dispatchEvent(popupEvents.CLOSE_POPUP)

		/*if (columnHasCorrespondingGroup(column.key)) {

	                       clearAllSortOptions(groups);

	                   } else {

	                       clearAllSortOptions(columns);

	                   }*/
		if (!columnOrGroup.options) columnOrGroup.options = {}

		columnOrGroup.options.sort = direction
		sort(columnOrGroup)
	}

	const signalSortChange = function (columnOrGroup) {
		if (columnHasCorrespondingGroup(columnOrGroup.key)) {
			const placeholder1 = groups.value.find(
				(group) => group.key === columnOrGroup.key
			)
			placeholder1.options.sort = columnOrGroup.options.sort
			placeholder1.options.sort_settings = columnOrGroup.options.sort_settings

			evDataService.setGroups(groups)

			evDataService.setActiveGroupTypeSort(columnOrGroup)
			evEventService.dispatchEvent(evEvents.GROUP_TYPE_SORT_CHANGE)
		} else {
			evDataService.setActiveColumnSort(columnOrGroup)
			evEventService.dispatchEvent(evEvents.COLUMN_SORT_CHANGE)
		}
	}

	const sort = function (columnOrGroup) {
		if (columnOrGroup.options.sort_settings.mode === 'manual') {
			// manual sort handler

			uiService
				.getColumnSortDataList({
					filters: {
						user_code: columnOrGroup.options.sort_settings.layout_user_code,
					},
				})
				.then(function (data) {
					if (data.results.length) {
						var layout = data.results[0]

						evDataService.setColumnSortData(columnOrGroup.key, layout.data)

						signalSortChange(columnOrGroup)
					} else {
						toastNotificationService.error('Manual Sort is not configured')
						columnOrGroup.options.sort_settings.layout_user_code = null
					}
				})
		} else {
			signalSortChange(columnOrGroup)
		}
	}

	// <Victor 2021.04.07 #90 sort setting for column>

	const getAttributes = function () {
		var allAttrsList = []

		if (viewContext === 'reconciliation_viewer') {
			allAttrsList = attributeDataService.getReconciliationAttributes()
		} else {
			switch (entityType) {
				case 'balance-report':
					allAttrsList = attributeDataService.getBalanceReportAttributes()
					break

				case 'pl-report':
					allAttrsList = attributeDataService.getPlReportAttributes()
					break

				case 'transaction-report':
					allAttrsList = attributeDataService.getTransactionReportAttributes()
					break

				default:
					entityAttrs = []
					dynamicAttrs = []
					allAttrsList = []

					entityAttrs =
						attributeDataService.getEntityAttributesByEntityType(entityType)

					entityAttrs.forEach(function (item) {
						if (
							item.key === 'subgroup' &&
							item.value_entity.indexOf('strategy') !== -1
						) {
							item.name = 'Group'
						}
						item.entity = entityType
					})

					var instrumentUserFields =
						attributeDataService.getInstrumentUserFields()
					var transactionUserFields =
						attributeDataService.getTransactionUserFields()

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
						attributeDataService.getDynamicAttributesByEntityType(entityType)

					dynamicAttrs = dynamicAttrs.map(function (attribute) {
						var result = {}

						result.attribute_type = Object.assign({}, attribute)
						result.value_type = attribute.value_type
						result.content_type = contentType
						result.key = 'attributes.' + attribute.user_code
						result.name = attribute.name

						return result
					})

					allAttrsList = allAttrsList.concat(entityAttrs)
					allAttrsList = allAttrsList.concat(dynamicAttrs)
			}
		}

		return allAttrsList
	}

	let reportSetSubtotalType = function (group, type) {
		if (
			!group.hasOwnProperty('report_settings') ||
			group.report_settings === undefined
		) {
			group.report_settings = {}
		}

		if (group.report_settings.subtotal_type === type) {
			group.report_settings.subtotal_type = false
		} else {
			group.report_settings.subtotal_type = type
		}

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
		evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED)
	}

	let columnHasCorrespondingGroup = function (columnKey) {
		var groupIndex = groups.value.findIndex((group) => group.key === columnKey)

		return groupIndex > -1
	}

	let checkReportSortButton = function (column, index) {
		if (isReport && index < groups.value.length) {
			if (column.key === groups[index].key) {
				return false
			}

			return true
		}

		return true
	}

	/**
	 * @param dataList {Array<Object>} - For rv list of all groups' data. For ev list of selected groups' data.
	 */
	var selectRowsInsideData = function (dataList) {
		dataList.forEach(function (dataListItem) {
			if (isReport && dataListItem.___type === 'group') {
				dataListItem.___is_area_subtotal_activated = isAllSelected.value
				dataListItem.___is_line_subtotal_activated = isAllSelected.value
			} else if (dataListItem.___type === 'object') {
				dataListItem.___is_activated = isAllSelected.value
			}

			if (dataListItem.results && dataListItem.results.length) {
				dataListItem.results.forEach(function (child) {
					if (child.___type === 'object') {
						child.___is_activated = isAllSelected.value
					}
				})
			}

			evDataService.setData(dataListItem)
		})

		var data = evDataService.getData()
	}

	watch(isAllSelected, selectAllRows)

	function selectAllRows() {
		var flatList
		var dataList = []
		// var activateItems;

		if (isReport) {
			flatList = rvDataHelper.getFlatStructure(evDataService)
		} else {
			flatList = evDataHelper.getObjectsFromSelectedGroups(
				evDataService,
				globalDataService
			)
		}

		flatList.forEach(function (item) {
			if (item.___type === 'object') {
				item.___is_activated = isAllSelected.value
			}
		})

		if (isReport) {
			/* dataList.forEach(function (dataListItem) {

	                           if (dataListItem.results && dataListItem.results.length) {

	                               dataListItem.results.forEach(function (childItem) {

	                                   childItem.___is_activated = false;

	                                   flatList.forEach(function (item) {

	                                       if (childItem.___id === item.___id) {

	                                           childItem.___is_activated = item.___is_activated

	                                       }

	                                   })


	                               });

	                           }


	                       }); */
			dataList = evDataService.getDataAsList()
		} else {
			var selGroups = evDataService.getSelectedGroups()

			if (selGroups.length) {
				selGroups.forEach(function (sGroup) {
					var rawData = evDataService.getData(sGroup.___id)
					dataList.push(rawData)
				})
			} else {
				var rawData = evDataService.getRootGroupData()

				dataList.push(rawData)
			}
		}

		selectRowsInsideData(dataList)

		evDataService.setSelectAllRowsState(isAllSelected.value)

		evDataService.setFlatList(flatList)

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
		evEventService.dispatchEvent(evEvents.ROW_ACTIVATION_CHANGE)

		console.timeEnd('Selecting all rows')
	}

	let isColumnFloat = function (column) {
		return column.value_type == 20
	}

	let sortHandler = function (column, sort) {
		if (!column.options) column.options = {}
		if (!column.options.sort_settings) column.options.sort_settings = {}

		if (column.options.sort_settings.layout_user_code) {
			// manual sort handler

			uiService
				.getColumnSortDataList({
					filters: {
						user_code: column.options.sort_settings.layout_user_code,
					},
				})
				.then(function (data) {
					if (data.results.length) {
						var layout = data.results[0]

						evDataService.setColumnSortData(column.key, layout.data)

						var i
						for (i = 0; i < columns.length; i = i + 1) {
							if (!columns[i].options) {
								columns[i].options = {}
							}
							columns[i].options.sort = null
						}

						column.options.sort = sort
						column.options.sort_settings.mode = 'manual'

						console.log('sortHandler.column', column)

						evDataService.setActiveColumnSort(column)

						if (isReport) {
							columnsToShow.value = getColumnsToShow()
						}

						collectMissingCustomFieldsErrors()
						evEventService.dispatchEvent(evEvents.COLUMN_SORT_CHANGE)
					} else {
						toastNotificationService.error('Manual Sort is not configured')

						column.options.sort_settings.layout_user_code = null
					}
				})
		} else {
			// default sort handler

			var i
			for (i = 0; i < columns.length; i = i + 1) {
				if (!columns[i].options) {
					columns[i].options = {}
				}
				columns[i].options.sort = null
			}

			column.options.sort = sort
			column.options.sort_settings.mode = 'default'

			console.log('sortHandler.column', column)

			var columns = evDataService.getColumns()

			columns.forEach(function (item) {
				if (column.key === item.key) {
					item = column
				}
			})

			evDataService.setActiveColumnSort(column)

			evDataService.setColumns(columns)

			columnsToShow.value = getColumnsToShow()

			collectMissingCustomFieldsErrors()

			evEventService.dispatchEvent(evEvents.COLUMN_SORT_CHANGE)
		}
	}

	let groupsSortHandler = function (groupIndex, sort) {
		// reset sorting for other groups
		var i
		for (i = 0; i < groups.value.length; i = i + 1) {
			if (!groups[i].options) {
				groups[i].options = {}
			}
		}

		var group = groups[groupIndex]
		console.log('groups sorting group', group)
		group.options.sort = sort

		var groups = evDataService.getGroups()

		groups.value.forEach(function (item) {
			if (group.key === item.key || group.id === item.id) {
				item = group
			}
		})

		evDataService.setGroups(groups)
		evDataService.setActiveGroupTypeSort(group)

		evEventService.dispatchEvent(evEvents.GROUP_TYPE_SORT_CHANGE)
	}

	let selectSubtotalType = function (column, type) {
		evEventService.dispatchEvent(popupEvents.CLOSE_POPUP)

		if (!column.hasOwnProperty('report_settings')) {
			column.report_settings = {}
		}

		if (column.report_settings.subtotal_formula_id == type) {
			column.report_settings.subtotal_formula_id = null
		} else {
			column.report_settings.subtotal_formula_id = type
		}

		makePopupDataForColumns(columns)

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
		evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED)
	}

	function getSubtotalFormula(column) {
		if (column.hasOwnProperty('report_settings')) {
			return column.report_settings.subtotal_formula_id
		}

		return null
	}

	function isSubtotalSum(column) {
		const subtotalFormula = getSubtotalFormula(column)
		return subtotalFormula === 1
	}

	function isSubtotalWeighted(column) {
		const subtotalFormula = getSubtotalFormula(column)
		return subtotalFormula >= 2 && subtotalFormula <= 5
	}

	function isSubtotalAvgWeighted(column) {
		const subtotalFormula = getSubtotalFormula(column)
		return subtotalFormula >= 6 && subtotalFormula <= 9
	}

	let checkSubtotalFormula = function (column, type) {
		if (column.hasOwnProperty('report_settings') && column.report_settings) {
			if (column.report_settings.subtotal_formula_id === type) {
				return true
			}
		}

		return false
	}

	/**
	 * Can be called by a group.
	 *
	 * @param itemKey {string} - key of column or group
	 * @param $mdMenu {Object} - object with data of $mdMenu
	 * @param $event {Object} event object
	 * @param _$popup
	 */
	let renameColumn = function (itemKey, $mdMenu, $event, _$popup) {
		// TODO after reworking entity viewer, remove $mdMenu argument

		if ($mdMenu) {
			$mdMenu.close()
		} else {
			_$popup.cancel()
		}

		var column = columns.find((column) => column.key === itemKey)

		$mdDialog
			.show({
				controller: 'RenameFieldDialogController as vm',
				templateUrl: 'views/dialogs/rename-field-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				locals: {
					data: column,
				},
			})
			.then((res) => {
				if (res.status === 'agree') {
					column.layout_name = res.data.layout_name
					evDataService.setColumns(columns)

					if (columnHasCorrespondingGroup(column.key)) {
						var group = groups.value.find((group) => group.key === itemKey)
						group.layout_name = res.data.layout_name

						evDataService.setGroups(groups)
					}

					const filters = evDataService.getFilters()

					if (isReport) {
						const filter = filters.find((filter) => filter.key === res.data.key)

						if (filter) {
							filter.layout_name = res.data.layout_name

							evDataService.setFilters(filters)

							evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)
						}
					} else {
						let filterLayoutNameChanged = false

						for (var filtersProp in filters) {
							// search among front and back filters

							const filter = filters[filtersProp].find(
								(filter) => filter.key === res.data.key
							)

							if (filter) {
								filter.layout_name = res.data.layout_name
								filterLayoutNameChanged = true
							}
						}

						if (filterLayoutNameChanged) {
							evDataService.setFilters(filters)
							evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)
						}
					}
				}
			})
	}

	let resizeColumn = function (column, $mdMenu, $event) {
		if ($mdMenu) {
			$mdMenu.close()
		} else {
			evEventService.dispatchEvent(popupEvents.CLOSE_POPUP)
		}

		$mdDialog
			.show({
				controller: 'ResizeFieldDialogController as vm',
				templateUrl: 'views/dialogs/resize-field-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				locals: {
					data: column,
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
					evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
				}
			})
	}

	let checkColTextAlign = function (column, type) {
		if (column.hasOwnProperty('style') && column.style) {
			if (column.style.text_align === type) {
				return true
			}
		}

		return false
	}

	let changeColumnTextAlign = function (column, type) {
		evEventService.dispatchEvent(popupEvents.CLOSE_POPUP)

		if (!column.hasOwnProperty('style')) {
			column.style = {}
		}

		if (column.style.text_align === type) {
			delete column.style.text_align
		} else {
			column.style.text_align = type
		}

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
	}

	let selectRoundFormat = function (column, type) {
		if (!column.hasOwnProperty('report_settings')) {
			column.report_settings = {}
		}

		if (column.report_settings.round_format_id == type) {
			column.report_settings.round_format_id = null
		} else {
			column.report_settings.round_format_id = type
		}

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
		evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED)
	}

	let checkRoundFormatFormula = function (column, type) {
		if (column.hasOwnProperty('report_settings') && column.report_settings) {
			if (column.report_settings.round_format_id == type) {
				return true
			}
		}

		return false
	}

	let selectThousandsSeparatorFormat = function (column, type) {
		if (!column.hasOwnProperty('report_settings')) {
			column.report_settings = {}
		}

		if (column.report_settings.thousands_separator_format_id === type) {
			column.report_settings.thousands_separator_format_id = null
		} else {
			column.report_settings.thousands_separator_format_id = type
		}

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
		evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED)
	}

	let checkThousandsSeparatorFormat = function (column, type) {
		if (column.hasOwnProperty('report_settings') && column.report_settings) {
			if (column.report_settings.thousands_separator_format_id === type) {
				return true
			}
		}
		return false
	}

	let selectNegativeColor = function (column, type) {
		if (!column.hasOwnProperty('report_settings')) {
			column.report_settings = {}
		}

		if (column.report_settings.negative_color_format_id === type) {
			column.report_settings.negative_color_format_id = null
		} else {
			column.report_settings.negative_color_format_id = type
		}

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
		evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED)
	}

	let checkNegativeColor = function (column, type) {
		if (column.hasOwnProperty('report_settings') && column.report_settings) {
			if (column.report_settings.negative_color_format_id === type) {
				return true
			}
		}
		return false
	}

	let selectNegativeFormat = function (column, type) {
		if (!column.hasOwnProperty('report_settings')) {
			column.report_settings = {}
		}

		if (column.report_settings.negative_format_id == type) {
			column.report_settings.netgative_format_id = null
		} else {
			column.report_settings.negative_format_id = type
		}

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
		evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED)
	}

	let checkNegativeFormatFormula = function (column, type) {
		if (column.hasOwnProperty('report_settings') && column.report_settings) {
			if (column.report_settings.negative_format_id == type) {
				return true
			}
		}
		return false
	}

	let selectZeroFormat = function (column, type) {
		if (!column.hasOwnProperty('report_settings')) {
			column.report_settings = {}
		}

		if (column.report_settings.zero_format_id == type) {
			column.report_settings.zero_format_id = null
		} else {
			column.report_settings.zero_format_id = type
		}

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
		evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED)
	}

	let checkZeroFormatFormula = function (column, type) {
		if (column.hasOwnProperty('report_settings') && column.report_settings) {
			if (column.report_settings.zero_format_id == type) {
				return true
			}
		}

		return false
	}

	let isSortable = function (column) {
		if (column.hasOwnProperty('key')) {
			if (
				[
					'accounts',
					'counterparties',
					'responsibles',
					'transaction_types',
					'portfolios',
				].indexOf(column.key) !== -1
			) {
				return false
			}
		}

		return true
	}

	let activateColumnNumberRenderingPreset = function (column, rendPreset) {
		evEventService.dispatchEvent(popupEvents.CLOSE_POPUP)

		if (!column.report_settings) {
			column.report_settings = {}
		}

		switch (rendPreset) {
			case 'price':
				column.report_settings.zero_format_id = 1
				column.report_settings.negative_color_format_id = 0
				column.report_settings.negative_format_id = 0
				column.report_settings.round_format_id = 1
				column.report_settings.percentage_format_id = 0
				break
			case 'market_value':
				column.report_settings.zero_format_id = 1
				column.report_settings.negative_color_format_id = 1
				column.report_settings.negative_format_id = 1
				column.report_settings.thousands_separator_format_id = 2
				column.report_settings.round_format_id = 1
				column.report_settings.percentage_format_id = 0
				break
			case 'amount':
				column.report_settings.zero_format_id = 1
				column.report_settings.negative_color_format_id = 1
				column.report_settings.negative_format_id = 0
				column.report_settings.thousands_separator_format_id = 2
				column.report_settings.round_format_id = 3
				column.report_settings.percentage_format_id = 0
				break
			case 'exposure':
				column.report_settings.zero_format_id = 1
				column.report_settings.negative_color_format_id = 1
				column.report_settings.negative_format_id = 1
				column.report_settings.round_format_id = 0
				column.report_settings.percentage_format_id = 2
				break
			case 'return':
				column.report_settings.zero_format_id = 1
				column.report_settings.negative_color_format_id = 1
				column.report_settings.negative_format_id = 0
				column.report_settings.percentage_format_id = 3
				break
		}

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
		evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED)
	}

	let addColumnEntityToGrouping = function (column) {
		evEventService.dispatchEvent(popupEvents.CLOSE_POPUP)

		var groups = evDataService.getGroups()
		var groupToAdd = evHelperService.getTableAttrInFormOf('group', column)

		groups.value.push(groupToAdd)
		evDataService.setGroups(groups)

		evEventService.dispatchEvent(evEvents.GROUPS_CHANGE)
		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
	}

	let editManualSorting = function ($event, column) {
		evEventService.dispatchEvent(popupEvents.CLOSE_POPUP)

		console.log('editManualSorting', column)

		$mdDialog
			.show({
				controller: 'ManualSortingLayoutManagerDialogController as vm',
				templateUrl:
					'views/dialogs/manual-sorting-layout-manager-dialog-view.html',
				targetEvent: $event,
				multiple: true,
				locals: {
					data: {
						column: column,
					},
					entityViewerDataService: evDataService,
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					/* evEventService.dispatchEvent(evEvents.REDRAW_TABLE);
	                           evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED); */

					column.options.sort_settings = {
						...column.options.sort_settings,
						...res.data.sort_settings,
					}

					if (!column.options.sort) column.options.sort = 'ASC'

					sort(column)
				}
			})
	}

	let addFiltersWithColAttr = function (column) {
		evEventService.dispatchEvent(popupEvents.CLOSE_POPUP)

		var filters = evDataService.getFilters()
		var filterToAdd = evHelperService.getTableAttrInFormOf('filter', column)
		filterToAdd.options.enabled = true

		if (isReport) {
			filters.push(filterToAdd)
		} else {
			if (showFrontEvFilters) {
				filters.frontend.push(filterToAdd)
			} else {
				filters.backend.push(filterToAdd)
			}
		}

		evDataService.setFilters(filters)

		evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)
	}
	/**
	 * Used in only by report viewer.
	 * @param groupKey {string}
	 * @param _$popup {Object} - data from popup
	 */
	let removeGroup = function (groupKey, _$popup) {
		_$popup.cancel()
		// evEventService.dispatchEvent(popupEvents.CLOSE_POPUP);

		var groups = evDataService.getGroups()

		/** remove group */
		/* var i;
	                   for (i = 0; i < groups .value.length; i++) {
	                       if (groups[i].___group_type_id === columnTableId) {
	                           groups .value.splice(i, 1);
	                           break;
	                       }
	                   } */
		var groupToRemoveIndex = groups.findIndex((group) => group.key === groupKey)

		if (groupToRemoveIndex > -1) {
			groups.splice(groupToRemoveIndex, 1)
		} else {
			throw new Error('No group with such key found: ' + groupKey)
		}

		evDataService.setGroups(groups)
		evEventService.dispatchEvent(evEvents.GROUPS_CHANGE)

		/** remove column */
		/* var c;
	                   for (c = 0; c < columns.length; c++) {

	                       if (columns[c].___column_id === columnTableId) {
	                           columns.splice(c, 1);
	                           break;
	                       }

	                   } */
		var colToRemoveIndex = columns.findIndex(
			(column) => column.key === groupKey
		)
		if (colToRemoveIndex > -1) {
			columns.splice(colToRemoveIndex, 1)
		} else {
			throw new Error('No column with such key found: ' + groupKey)
		}

		evDataService.setColumns(columns)

		columnsToShow.value = getColumnsToShow()

		collectMissingCustomFieldsErrors()

		evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
		evEventService.dispatchEvent(evEvents.UPDATE_COLUMNS_SIZE)

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
	}

	let unGroup = function (groupKey, _$popup) {
		_$popup.cancel()
		// evEventService.dispatchEvent(popupEvents.CLOSE_POPUP);

		var groups = evDataService.getGroups()

		/** remove group */
		var groupToRemoveIndex = groups.findIndex((group) => group.key === groupKey)

		/*var i;
	                   for (i = 0; i < groups.length; i++) {
	                       if (groups[i].___group_type_id === columnTableId) {
	                           groups.splice(i, 1);
	                           break;
	                       }
	                   }*/
		if (groupToRemoveIndex > -1) {
			groups.splice(groupToRemoveIndex, 1)
		} else {
			throw new Error('No group with such key found: ' + groupKey)
		}

		if (isReport) {
			const lastDraggedElem = contentWrapElement.querySelector(
				'.gDraggableHead.last-dragged'
			)
			if (lastDraggedElem) lastDraggedElem.classList.remove('last-dragged')

			const columns = evDataService.getColumns()
			const ungroupedColumn = columns.find((column) => column.key === groupKey)

			if (ungroupedColumn) {
				if (!ungroupedColumn.frontOptions) ungroupedColumn.frontOptions = {}

				ungroupedColumn.frontOptions.lastDragged = true
				evDataService.setColumns(columns)
			}
		}

		groups = groups
		evDataService.setGroups(groups)
		evEventService.dispatchEvent(evEvents.GROUPS_CHANGE)

		if (isReport) {
			evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
			evEventService.dispatchEvent(evEvents.UPDATE_COLUMNS_SIZE)

			evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
		}
	}

	let removeColumn = function (column) {
		evEventService.dispatchEvent(popupEvents.CLOSE_POPUP)

		var colToDeleteAttr = ''
		/*let columns = columns.filter(function (item) {
	                       return column.___column_id !== item.___column_id;
	                   });*/
		for (var i = 0; i < columns.length; i++) {
			if (column.___column_id === columns[i].___column_id) {
				colToDeleteAttr = JSON.parse(angular.toJson(columns[i]))
				columns.splice(i, 1)
				break
			}
		}

		if (viewContext === 'dashboard') {
			var hasAttrAlready = false
			var availableCols =
				attributeDataService.getAttributesAvailableForColumns()

			for (var i = 0; i < availableCols.length; i++) {
				if (availableCols[i].attribute_data.key === colToDeleteAttr.key) {
					hasAttrAlready = true
					break
				}
			}

			if (!hasAttrAlready) {
				var newAvailableCol = {
					attribute_data: {
						key: colToDeleteAttr.key,
						name: colToDeleteAttr.name,
						content_type: colToDeleteAttr.content_type,
						value_type: colToDeleteAttr.value_type,
					},
					is_default: false,
					layout_name: colToDeleteAttr.layout_name || '',
					order: colsAvailableForAdditions.length,
				}

				availableCols.push(newAvailableCol)
				attributeDataService.setAttributesAvailableForColumns(availableCols)
			}
		}

		evDataService.setColumns(columns)
		evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
		evEventService.dispatchEvent(evEvents.UPDATE_COLUMNS_SIZE)
		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
	}

	const hideSubtotalForColumn = function (prop, column) {
		if (!column.hasOwnProperty('report_settings')) {
			column.report_settings = {}
		}

		column.report_settings[prop] = !column.report_settings[prop]

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
		evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED)
	}

	let reportHideGrandTotal = function (column) {
		evEventService.dispatchEvent(popupEvents.CLOSE_POPUP)
		hideSubtotalForColumn('hide_grandtotal', column)
	}

	var getDownloadedTableItemsCount = function () {
		var unfilteredFlatList = evDataService.getUnfilteredFlatList()

		unfilteredFlatList = unfilteredFlatList.filter(function (item) {
			return item.___type !== 'control'
		})

		let downloadedItemsCount = unfilteredFlatList.length
	}

	const updateGroupTypeIds = function () {
		groups.value = evDataService.getGroups()

		groups.value.forEach((item) => {
			item.___group_type_id = evDataHelper.getGroupTypeId(item)
		})

		evDataService.setGroups(groups)
	}

	const setDefaultGroupType = function () {
		groups.value = evDataService.getGroups()

		/* TO DELETE: date 2021-01-24
	                   if (isReport) {

	                       let reportOptions = evDataService.getReportOptions();

	                       if (!reportOptions.subtotals_options) {
	                           reportOptions.subtotals_options = {}
	                       }

	                       if (!reportOptions.subtotals_options.type) {

	                           reportOptions.subtotals_options.type = 'line'

	                           evDataService.setReportOptions(reportOptions);
	                           evEventService.dispatchEvent(evEvents.REPORT_OPTIONS_CHANGE);

	                       }

	                   } */

		groups.value.forEach(function (group) {
			if (!group.hasOwnProperty('report_settings')) {
				group.report_settings = {}
			}

			if (!group.report_settings.subtotal_type) {
				group.report_settings.subtotal_type = 'line'
			}

			if (!isReport && !group.hasOwnProperty('ev_folded')) {
				group.ev_group_folded = true
			}
		})

		evDataService.setGroups(groups)
	}

	const updateGroupFoldingState = function () {
		groups.value = evDataService.getGroups()
		let parentGroupFullyFolded = false

		groups.value.forEach((group) => {
			if (parentGroupFullyFolded) {
				group.report_settings.is_level_folded = true
			} else if (group.report_settings.is_level_folded) {
				// if group is fully folded, groups after it must be folded too
				parentGroupFullyFolded = true
			}
		})

		evDataService.setGroups(groups)
	}

	const syncColumnsWithGroups = function () {
		let columns = evDataService.getColumns()
		groups.value = evDataService.getGroups()

		let columnsHaveBeenSynced = false

		groups.value.forEach((group, groupIndex) => {
			if (group.key !== columns[groupIndex].key) {
				let columnToAdd
				let groupColumnIndex = columns.findIndex(
					(column) => group.key === column.key
				)

				if (groupColumnIndex > -1) {
					columnToAdd = JSON.parse(JSON.stringify(columns[groupColumnIndex]))
					columns.splice(groupColumnIndex, 1)
				} else {
					columnToAdd = evHelperService.getTableAttrInFormOf('column', group)
				}

				columns.splice(groupIndex, 0, columnToAdd)

				columnsHaveBeenSynced = true
			}
		})

		evDataService.setColumns(columns)

		/* if (columnsHaveBeenSynced) {
	                       evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE);
	                   } */
		return columnsHaveBeenSynced
	}

	let hasFoldingBtn = function ($index) {
		var groups = evDataService.getGroups()

		if (isReport && $index < groups.value.length) {
			return true
		}

		return false
	}

	let foldLevel = function (key, $index) {
		groups = evDataService.getGroups()

		var item = groups[$index]
		item.report_settings.is_level_folded = true
		var i
		//<editor-fold desc="Set folded groups before calling rvDataHelper.setGroupSettings()">
		for (i = $index; i < groups.length; i++) {
			groups[i].report_settings.is_level_folded = true
		}

		evDataService.setGroups(groups)
		//</editor-fold">

		for (i = $index; i < groups.length; i++) {
			var groupsContent = evDataHelper.getGroupsByLevel(i + 1, evDataService)

			groupsContent.forEach(function (groupItem) {
				groupItem.___is_open = false

				var groupSettings = rvDataHelper.getOrCreateGroupSettings(
					evDataService,
					groupItem
				)
				groupSettings.is_open = false
				rvDataHelper.setGroupSettings(evDataService, groupItem, groupSettings)

				var childrens = evDataHelper.getAllChildrenGroups(
					groupItem.___id,
					evDataService
				)

				childrens.forEach(function (children) {
					if (children.___type === 'group') {
						item = evDataService.getData(children.___id)

						var groupSettings = rvDataHelper.getOrCreateGroupSettings(
							evDataService,
							children
						)
						groupSettings.is_open = false
						rvDataHelper.setGroupSettings(
							evDataService,
							children,
							groupSettings
						)

						if (item) {
							item.___is_open = false
							evDataService.setData(item)
						} else {
							children.___is_open = false
							evDataService.setData(children)
						}
					}
				})
			})
		}

		// rvDataHelper.markHiddenColumnsBasedOnFoldedGroups(evDataService);

		evEventService.dispatchEvent(evEvents.GROUPS_LEVEL_FOLD)
		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
	}

	let unfoldLevel = function (key, $index) {
		groups = evDataService.getGroups()

		var item = groups[$index]

		item.report_settings.is_level_folded = false

		groups = evDataService.getGroups()
		var i
		//<editor-fold desc="Set folded groups before calling rvDataHelper.setGroupSettings()">
		for (i = $index; i >= 0; i--) {
			groups[i].report_settings.is_level_folded = false
		}

		evDataService.setGroups(groups)
		//</editor-fold>

		for (i = $index; i >= 0; i--) {
			var groupsContent = evDataHelper.getGroupsByLevel(i + 1, evDataService)

			groupsContent.forEach(function (groupItem) {
				var groupSettings = rvDataHelper.getOrCreateGroupSettings(
					evDataService,
					groupItem
				)

				groupItem.___is_open = true
				groupSettings.is_open = true

				rvDataHelper.setGroupSettings(evDataService, groupItem, groupSettings)

				evDataService.setData(groupItem)
			})
		}

		rvDataHelper.markHiddenColumnsBasedOnFoldedGroups(evDataService)

		evEventService.dispatchEvent(evEvents.GROUPS_LEVEL_UNFOLD)
		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
	}

	let groupLevelIsFolded = function ($index) {
		var groups = evDataService.getGroups()

		return groups[$index].report_settings.is_level_folded
	}

	var getColsAvailableForAdditions = function () {
		var availableCols = attributeDataService.getAttributesAvailableForColumns()

		let colsAvailableForAdditions = availableCols.filter(function (aColumn) {
			for (var i = 0; i < columns.length; i++) {
				if (columns[i].key === aColumn.attribute_data.key) {
					return false
				}
			}

			return true
		})
	}

	async function addColumn($event) {
		const allAttrs = attributeDataService.getForAttributesSelector(entityType)
		const selectedAttrs = columns.map((col) => col.key)

		let res = await $mdDialog.show({
			controller: 'AttributesSelectorDialogController as vm',
			templateUrl: 'views/dialogs/attributes-selector-dialog-view.html',
			targetEvent: $event,
			multiple: true,
			locals: {
				data: {
					title: 'Add columns',
					attributes: allAttrs,
					layoutNames: evHelperService.getAttributesLayoutNames(columns),
					selectedAttributes: selectedAttrs,
					contentType: contentType,
				},
			},
		})

		if (res && res.status == 'agree') {
			console.log('res:', res)
			for (var i = 0; i < res.data.items.length; i = i + 1) {
				var colData = evHelperService.getTableAttrInFormOf(
					'column',
					res.data.items[i]
				)
				columns.push(colData)
			}

			evDataService.setColumns(columns)

			evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
			evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
		}
	}

	let addColumnToDashboardReport = function (attribute) {
		var colData = JSON.parse(JSON.stringify(attribute.attribute_data))

		colData.columns = true
		if (attribute.layout_name) {
			colData.layout_name = JSON.parse(JSON.stringify(attribute.layout_name))
		}
		columns.push(colData)
		evDataService.setColumns(columns)

		evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
	}

	const onGroupLevelFoldingSwitch = function (argumentsObj) {
		rvDataHelper.markHiddenColumnsBasedOnFoldedGroups(evDataService)

		groups = evDataService.getGroups()
		evDataHelper.importGroupsStylesFromColumns(groups, columns)

		if (argumentsObj && argumentsObj.updateScope) $apply()
	}

	const syncGroupLayoutNamesWithColumns = function () {
		var groupChanged = false

		columns.forEach((column) => {
			if (column.layout_name) {
				const matchingGroup = groups.find((group) => group.key === column.key)

				if (matchingGroup) {
					matchingGroup.layout_name = column.layout_name
					groupChanged = true
				}
			}
		})

		if (groupChanged) evDataService.setGroups(groups)
	}

	let onGroupsChange

	if (isReport) {
		checkForFilteringBySameAttr = function (columnKey) {
			var filters = evDataService.getFilters()

			for (var i = 0; i < filters.length; i++) {
				if (filters[i].key === columnKey) {
					return false
				}
			}

			return true
		}

		onGroupsChange = function () {
			updateGroupTypeIds()
			setDefaultGroupType()
			updateGroupFoldingState()

			groups = evDataService.getGroups()
			evDataService.resetTableContent(isReport)

			const colsChanged = syncColumnsWithGroups()

			evDataHelper.importGroupsStylesFromColumns(groups, columns)

			columnsToShow.value = getColumnsToShow()

			collectMissingCustomFieldsErrors()
			// setFiltersLayoutNames();
			var foldedGroup = groups.find(
				(group) =>
					group.report_settings && group.report_settings.is_level_folded
			)

			if (!foldedGroup) {
				rvDataHelper.markHiddenColumnsBasedOnFoldedGroups(evDataService)
			}

			if (colsChanged) evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)

			evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
		}
	} else {
		onGroupsChange = function () {
			updateGroupTypeIds()
			setDefaultGroupType()

			groups = evDataService.getGroups()
			evDataService.resetTableContent(isReport)

			collectMissingCustomFieldsErrors()

			evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
		}

		checkForFilteringBySameAttr = function (columnKey) {
			var filters = evDataService.getFilters()
			var filtersList = showFrontEvFilters ? filters.frontend : filters.backend

			for (var i = 0; i < filtersList.length; i++) {
				if (filtersList[i].key === columnKey) {
					return false
				}
			}

			return true
		}
	}

	const initEventListeners = function () {
		// Victor 2021.03.29 #88 fix bug with deleted custom fields
		evEventService.addEventListener(
			evEvents.DYNAMIC_ATTRIBUTES_CHANGE,
			function () {
				customFields =
					attributeDataService.getCustomFieldsByEntityType(entityType)
				collectMissingCustomFieldsErrors()
			}
		)

		evEventService.addEventListener(evEvents.GROUPS_CHANGE, onGroupsChange)

		evEventService.addEventListener(evEvents.COLUMNS_CHANGE, function () {
			evDataHelper.updateColumnsIds(evDataService)
			evDataHelper.setColumnsDefaultWidth(evDataService)

			let columns = evDataService.getColumns()
			console.log('columns:', columns)
			if (columns)
				console.log(
					'testing98.COLUMNS_CHANGE columns',
					JSON.parse(JSON.stringify(columns))
				)
			getColsAvailableForAdditions() // when inside dashboard
			// flagMissingColumns();
			makePopupDataForColumns(columns)

			let newColumns = getColumnsToShow()
			columnsToShow.value = JSON.parse(JSON.stringify(newColumns))

			collectMissingCustomFieldsErrors()
		})

		evEventService.addEventListener(
			evEvents.GROUPS_LEVEL_FOLD,
			onGroupLevelFoldingSwitch
		)
		evEventService.addEventListener(
			evEvents.GROUPS_LEVEL_UNFOLD,
			onGroupLevelFoldingSwitch
		)

		if (!isReport) {
			evEventService.addEventListener(evEvents.DATA_LOAD_END, function () {
				getDownloadedTableItemsCount()
			})

			evEventService.addEventListener(
				evEvents.FILTERS_TO_SHOW_CHANGE,
				function () {
					showFrontEvFilters = !showFrontEvFilters
				}
			)
		}
	}

	const init = function () {
		evDataHelper.importGroupsStylesFromColumns(groups.value, columns)

		if (hideRowSettings.value) {
			contentWrapElement.classList.add('g-row-settings-collapsed')
		} else {
			contentWrapElement.classList.remove('g-row-settings-collapsed')
		}

		updateGroupTypeIds()

		if (isReport) syncColumnsWithGroups()
		syncGroupLayoutNamesWithColumns()

		columns = evDataService.getColumns()
		// flagMissingColumns();
		makePopupDataForColumns(columns)

		columnsToShow.value = getColumnsToShow()

		collectMissingCustomFieldsErrors()

		evDataHelper.updateColumnsIds(evDataService)
		evDataHelper.setColumnsDefaultWidth(evDataService)

		if (viewContext === 'dashboard') {
			getColsAvailableForAdditions()
			// keysOfColsToHide = evDataService.getKeysOfColumnsToHide();
		}

		var evSettings = globalDataService.getMemberEntityViewersSettings(
			isReport,
			entityType
		)
		let rowFilterColor = evSettings.row_type_filter

		initEventListeners()
	}

	init()

	function getPopupData(item, $index, isAGroup) {
		let data = {
			$index: $index,
			isAGroup: isAGroup,
			item: item, // can be column or group
			viewContext: viewContext,
			renameColumn: renameColumn,
			isReport: isReport,
			columnHasCorrespondingGroup: columnHasCorrespondingGroup,
			addColumnEntityToGrouping: addColumnEntityToGrouping,
			checkForFilteringBySameAttr: checkForFilteringBySameAttr,
			addFiltersWithColAttr: addFiltersWithColAttr,
			editManualSorting: editManualSorting,
			activateColumnNumberRenderingPreset: activateColumnNumberRenderingPreset,
			// openColumnNumbersRenderingSettings: openColumnNumbersRenderingSettings,
			selectSubtotalType: selectSubtotalType,
			checkSubtotalFormula: checkSubtotalFormula,
			// isSubtotalFormulaSelected: isSubtotalFormulaSelected,
			getSubtotalFormula: getSubtotalFormula,
			resizeColumn: resizeColumn,
			removeColumn: removeColumn,
			unGroup: unGroup,

			changeColumnTextAlign: changeColumnTextAlign,
			checkColTextAlign: checkColTextAlign,
			removeGroup: removeGroup,
			// reportHideSubtotal: reportHideSubtotal,
			reportHideGrandTotal: reportHideGrandTotal,
			isSubtotalWeightedShouldBeExcluded: isSubtotalWeightedShouldBeExcluded,

			isSubtotalSum: isSubtotalSum(item),
			isSubtotalWeighted: isSubtotalWeighted(item),
			isSubtotalAvgWeighted: isSubtotalAvgWeighted(item),
			subtotalFormula: getSubtotalFormula(item),
			isTemporaryWeighted: false,

			onSubtotalSumClick: onSubtotalSumClick,
			onSubtotalWeightedClick: onSubtotalWeightedClick,
			onSubtotalAvgWeightedClick: onSubtotalAvgWeightedClick,

			openNumberFormatDialog: openNumberFormatDialog,
		}

		if (isAGroup) {
			data.reportSetSubtotalType = reportSetSubtotalType
		}

		return data
	}
</script>

<style lang="scss" scoped>
	$gRowIconColor: #888;

	$star-icon-size: 25px;

	// Victor 2020.1202 #69 New report viewer interface
	$g-top-part-height: 50px;
	$icon-size: 20px;
	$g-top-part-color: $gray;
	$g-table-header-background-color: rgba(242, 242, 242, 1);
	//$g-table-border-color: rgb(219, 219, 219);
	$g-table-border-color: #e0e0e0;
	$g-table-cell-hover-color: rgba(216, 216, 216, 1);
	$rv-active-color: #f05a22;
	$gRowSelectionWidth: 50px; // used inside entity-viewer.less
	$gTableBackgroundColor: #fafafa;
</style>
