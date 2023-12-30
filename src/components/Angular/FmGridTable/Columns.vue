<template>
	<div class="g-scrollable-area">
		<div class="g-column-bottom-row g-table-header flex-row">
			<div class="g-cell g-cell-select-all">
				<FmCheckbox
					:modelValue="isAllSelectedRef"
					@update:modelValue="selectAllRows"
				/>
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

					<FmMenu
						anchor="top left"
						class="header_item header_icon_btn"
					>
						<template #btn>
							<button
								class="g-cell-button g-row-settings-btn g-row-color-picker-btn"
								:class="rowFilterColor"
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
							</button>
						</template>

						<template #default="{ close }">
                            <div class="fm_the_table_menu3">
                                <div class="menu_item">
                                    <button
                                            class="g-cell-button g-row-color-picker-option"
                                            @click="changeRowFilterColor(close, 'none')"
                                    >
                                        <span class="material-icons">label_outline</span>
                                    </button>
                                </div>

                                <div class="menu_item">
                                    <button
                                            class="g-cell-button g-row-color-picker-option red"
                                            @click="changeRowFilterColor(close, 'red')"
                                    >
                                        <span class="material-icons">label</span>
                                    </button>
                                </div>

                                <div class="menu_item">
                                    <button
                                            class="g-cell-button g-row-color-picker-option yellow"
                                            @click="changeRowFilterColor(close, 'yellow')"
                                    >
                                        <span class="material-icons">label</span>
                                    </button>
                                </div>

                                <div class="menu_item">
                                    <button
                                            class="g-cell-button g-row-color-picker-option green"
                                            @click="changeRowFilterColor(close, 'green')"
                                    >
                                        <span class="material-icons">label</span>
                                    </button>
                                </div>

                                <div class="menu_item">
                                    <button
                                            class="g-cell-button g-row-color-picker-option divider"
                                            @click="removeColorMarkFromAllRows($event)"
                                    >
                                        <span class="material-icons">label_off</span>
                                    </button>
                                </div>
                            </div>
						</template>
					</FmMenu>
				</div>

				<button class="g-row-settings-toggle" @click="rowFiltersToggle()">
					<div class="center aic height-100">
						<span v-show="!hideRowSettings" class="material-icons f-s-16"
							>keyboard_arrow_left</span
						>
						<span v-show="hideRowSettings" class="material-icons f-s-16"
							>keyboard_arrow_right</span
						>
					</div>
				</button>
			</div>

			<div
				v-if="isReport"
				class="flex-row g-groups-holder gGroupsHolder gcAreaDnD"
			>
				<AngularFmGridTableColumnCell
					v-for="(column, index) in groupsRef"
					:key="column.key"
					:item="column"
					:itemIndex="index"
					:isReport="isReport"
					isGroup
					:viewContext="viewContext"
					:style="column.style"
					@sort="
						changeSortDirection(
							column,
							column?.options.sort == 'DESC' ? 'ASC' : 'DESC'
						)
					"
					@groupUnfold="unfoldLevel(column, index)"
					@groupFold="foldLevel(column, index)"
				/>
			</div>

			<div class="flex-row width-100 g-cols-holder gColumnsHolder gcAreaDnD">
				<AngularFmGridTableColumnCell
					v-for="(column, index) in columnsToShow"
					:key="column.key"
					:item="column"
					:itemIndex="index"
					:isReport="isReport"
					:viewContext="viewContext"
					:style="column.style"
					@sort="
						changeSortDirection(
							column,
							column?.options.sort === 'DESC' ? 'ASC' : 'DESC'
						)
					"
				/>

				<button
					class="g-cell g-add-column-button"
					@click="columnsAdditionOpened()"
				>
					<FmIcon v-fm-tooltip="'Add new column'" icon="add_circle" />
				</button>
			</div>
		</div>

		<!--		<LazyFmAttributesSelectModal
					v-if="$mdDialog.modals['AttributesSelectorDialogController']"
					:modelValue="true"
					class="m-b-24"
					:multiselect="true"
					:selected="
						$mdDialog.modals['AttributesSelectorDialogController'].data
							.selectedAttributes
					"
					:title="$mdDialog.modals['AttributesSelectorDialogController'].data.title"
					:attributes="
						$mdDialog.modals['AttributesSelectorDialogController'].data.attributes
					"
					:content_type="contentType"
					@save="
						(selected) => {
							$mdDialog.modals['AttributesSelectorDialogController'].resolve({
								status: 'agree',
								data: { items: selected },
							})
							delete $mdDialog.modals['AttributesSelectorDialogController']
						}
					"
					@close="
						() => {
							$mdDialog.modals['AttributesSelectorDialogController'].resolve({})
							delete $mdDialog.modals['AttributesSelectorDialogController']
						}
					"
				/>-->

		<!--		<LazyModalNumberFormat
					v-if="$mdDialog.modals['NumberFormatSettingsDialogController']"
					:modelValue="true"
					:multiselect="true"
					:settings="
						$mdDialog.modals['NumberFormatSettingsDialogController'].data.settings
					"
					@save="
						(settings) => {
							$mdDialog.modals['NumberFormatSettingsDialogController'].resolve({
								status: 'agree',
								data: { settings: settings },
							})
							delete $mdDialog.modals['NumberFormatSettingsDialogController']
						}
					"
					@close="
						() => {
							$mdDialog.modals['NumberFormatSettingsDialogController'].resolve({})
							delete $mdDialog.modals['NumberFormatSettingsDialogController']
						}
					"
				/>-->

		<!--		<BaseModal
			v-if="$mdDialog.modals['RenameFieldDialogController']"
			:modelValue="true"
			title="Rename column"
			@close="
				() => {
					$mdDialog.modals['RenameFieldDialogController'].resolve({})
					delete $mdDialog.modals['RenameFieldDialogController']
				}
			"
		>
			<BaseInput readonly label="ID" v-model="columnToRename.key" />
			<BaseInput
				readonly
				label="Original"
				:modelValue="columnToRename.name"
			/>
			<BaseInput label="Name" v-model="columnToRename.layout_name" />

			<template #controls>
				<div class="flex sb">
					<FmBtn
						type="text"
						@click="
							() => {
								$mdDialog.modals['RenameFieldDialogController'].resolve({})
								delete $mdDialog.modals['RenameFieldDialogController']
							}
						"
					>cancel</FmBtn
					>

					<FmBtn
						@click="
							() => {
								$mdDialog.modals['RenameFieldDialogController'].resolve({
									status: 'agree',
								})
								delete $mdDialog.modals['RenameFieldDialogController']
							}
						"
					>save</FmBtn
					>
				</div>
			</template>
		</BaseModal>-->

		<LazyBaseModal
			v-if="renameOpened"
			v-model="renameOpened"
			title="Rename"
		>
			<!-- 		@close="columnToRename = null" -->
			<BaseInput
				v-model="columnToRename.key"
				readonly
				label="ID"
				class="m-b-24"
			/>

			<BaseInput
				readonly
				label="Original"
				:modelValue="columnToRename.name"
				class="m-b-24"
			/>

			<BaseInput
				label="Name"
				v-model="columnToRename.layout_name"
				class="m-b-24"
			/>

			<template #controls="{ cancel }">
				<div class="flex sb">
					<FmBtn type="text" @click="cancel()">cancel</FmBtn>

					<FmBtn @click="renameColumn(cancel)">save</FmBtn>
				</div>
			</template>
		</LazyBaseModal>

		<LazyFmAttributesSelectModal
			v-if="openColsAddition"
			v-model="openColsAddition"
			multiselect
			title="Add columns"
			:attributes="allAttrs"
			:selected="selectedAttrs"
			:disabledAttributes="selectedAttrs"
			:type="contentType"
			@selectedAttributesChanged="addColumn"
		/>

		<LazyModalNumberFormat
			v-if="colNumberFormatData.opened"
			v-model="colNumberFormatData.opened"
			:title="`${colNumberFormatData.name}: Number Format`"
            :settings="colNumberFormatData.numberFormat"
            @cancel="onColNumFormatClose"
			@save="editColNumberFormat"
		></LazyModalNumberFormat>
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

	const evAttrsStore = useEvAttributesStore()

	const $mdDialog = inject('$mdDialog')

	const {
		evDataService,
		evEventService,
		attributeDataService,
		contentWrapElement,
	} = props

	let viewContext = evDataService.getViewContext()
	// let isReport = metaService.isReport(entityType);
	let contentType = evDataService.getContentType()
	let isReport = evDataService.isEntityReport()

	let entityType = evDataService.getEntityType()
	let rowStatusFilterIcon = `<span class="material-icons">star_outline</span>`;

  let dataIsLoadingRef = ref(null);

	const getColumns = () => {
		return JSON.parse(JSON.stringify(evDataService.getColumns()))
	}

	const setColumns = (columns) => {
		evDataService.setColumns(JSON.parse(JSON.stringify(columns)))
	}

	/**
	 *
	 * @param key
	 * @return {Object} - column from entityViewerDataService
	 */
	const getColumnByKey = (key) => {
		const columnsList = evDataService.getColumns()
		const column = columnsList.find((col) => col.key === key)

		if (!column) {
			throw new Error(`No column found with the key: ${key}`)
		}

		return column
	}

	/**
	 * Update column inside entityViewerDataService
	 *
	 * @param columnData
	 */
	const setColumn = (columnData) => {
		const columnsList = evDataService.getColumns()
		const colIndex = columnsList.findIndex((col) => col.key === columnData.key)

		if (!colIndex) {
			throw new Error(`No column found with the key: ${columnData.key}`)
		}

		columnsList[colIndex] = columnData
	}

	function getGroups() {
		return JSON.parse(JSON.stringify(evDataService.getGroups()))
	}

	function setGroups(groups) {
		return evDataService.setGroups(JSON.parse(JSON.stringify(groups)))
	}

	let columns = ref( getColumns() )

	let groupsRef = ref( getGroups() )

	/** @type {ComputedRef<Array<String>>} - array of keys of attributes for groups and columns */
	let selectedAttrs = computed(() => {
		return columns.value.map(item => item.key);
	});
	// let columnsToShow = ref([])

	let filters = evDataService.getFilters()
	/**
	 * What filters (front or back) are shown now in filter area of entity viewer
	 * @type {Boolean}
	 */
	let showFrontEvFilters = !isReport && filters.frontend.length > 0

	/**
	 * Needed because columns inside dashboard
	 * can be different from columns saved in an ev / rv layout
	 *
	 * @type {ComputedRef<Array>}
	 */
	const columnsToShow = computed(() => {

		if (isReport) {

			const cols = evDataHelper.separateNotGroupingColumns(
				columns.value,
				groupsRef.value
			)

			return cols.filter(col => !col.isHidden);

		} else {
			return columns.value
		}

	})

	/*const getColumnsToShow = function () {
		if (isReport) {
			return evDataHelper.separateNotGroupingColumns(columns, groupsRef.value)
		} else {
			return columns.value
		}
	}*/
	/*let customFields =
		attributeDataService.getCustomFieldsByEntityType(entityType)*/
	let customFields = computed(() => {
		return evAttrsStore.customFields[contentType]
	})

	watch(customFields, () => {
		collectMissingCustomFieldsErrors()
	})

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
				const customField = customFields.value.find(
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

			return item
		}

		if (isReport) {
			let groupsList = evDataService.getGroups()

			groupsList = groupsList.map((group) => {
				return markItemUsingMissingCustomField(group, 'group', groupsErrorsList)
			})

			evDataService.setGroups(groupsList)
		}

		// columns.value = JSON.parse(JSON.stringify( evDataService.getColumns() ));
		let colsList = evDataService.getColumns()

		colsList = colsList.map((column) => {
			return markItemUsingMissingCustomField(
				column,
				'column',
				columnsErrorsList
			)
		})

		evDataService.setColumns(colsList)

		evDataService.setMissingCustomFields({
			forColumns: columnsErrorsList,
			forGroups: groupsErrorsList,
		})
	}

	let components = evDataService.getComponents()
	let downloadedItemsCount = null
	let columnAreaCollapsed = false

	let isAllSelectedRef = ref(evDataService.getSelectAllRowsState())
	let isAllStarsSelected = false
	let hideRowSettings = ref(!!evDataService.getRowSettings().folded)
	let groupsAreaDraggable = viewContext !== 'dashboard'

	let entityAttrs = []
	let dynamicAttrs = []

	// var keysOfColsToHide = [];

	/**
	 *
	 * @param {Object} column
	 * @param {Function} closeCb - callback to close FmMenu
	 * @return {Promise<void>}
	 */
	/*async function openNumberFormatDialog(column, closeCb) {
		console.log('fvafd')
		openColsAddition.value = true
		closeCb()

		let dialogData = {
			settings: {},
		}
		// column.options.number_format
		if (column.options.numberFormat) {
			dialogData.settings = column.options.numberFormat
		} else {
			dialogData.settings = column.report_settings
		}
		// for old layouts
		if (isReport && !column.options?.hasOwnProperty('numberFormat')) {
			dialogData.settings = column.report_settings
		}
		console.log('dialogData:', dialogData)

		let res = await $mdDialog.show({
			controller: 'NumberFormatSettingsDialogController as vm',
			templateUrl: 'views/dialogs/number-format-settings-dialog-view.html',
			locals: {
				data: dialogData,
			},
		})

		if (res.status === 'agree') {
			// column.report_settings = res.data;

			if (!column.options) column.options = {}

			column.options.numberFormat = res.data
			console.log('res:', res)

			evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
			evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED)
		}
	}*/

    //# region Number format

	/**
	 * Data for ModalNumberFormat
	 *
	 * @type {Ref<{opened: Boolean, key: String, name: String, numberFormat: Object|null}>}
	 */
	let colNumberFormatData = reactive({
		opened: false,
		key: '',
		name: '',
		numberFormat: null,
	});

	/**
	 *
	 * @param {String} columnKey
	 * @param {Function} closeCb - callback to close FmMenu
	 * @return {Promise<void>}
	 */
	function openNumberFormatDialog(columnKey, closeCb) {

		closeCb()

		const column = getColumnByKey(columnKey);
		let numberFormat;

		if (column.options?.numberFormat) {
			numberFormat = column.options.numberFormat;
		}
		else if (isReport && !column.options?.hasOwnProperty('numberFormat')) {
			numberFormat = column.report_settings
		}

		colNumberFormatData.key = columnKey;
		colNumberFormatData.name = column.name || column.layout_name;
		colNumberFormatData.numberFormat = numberFormat;
		colNumberFormatData.opened = true;

	}

    function onColNumFormatClose() {
        colNumberFormatData.key = '';
        colNumberFormatData.name = '';
        colNumberFormatData.numberFormat = null;
    }

	function editColNumberFormat(newNumberFormat) {

		const column = getColumnByKey(colNumberFormatData.key);

        if (!column.options) column.options = {};

        column.options.numberFormat = newNumberFormat;

        setColumn(column);

        onColNumFormatClose();

        evEventService.dispatchEvent(evEvents.REDRAW_TABLE);
        evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED);

	}
    //# endregion Number format

    // Victor 2020.12.14 #69 New report viewer design
	let rowFilterColor = ref('none');

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

	let changeRowFilterColor = function (closeMenuFn, color) {

        closeMenuFn();

		let rowTypeFiltersData = evDataService.getRowTypeFilters()

		rowFilterColor.value = color
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
		if (!columnOrGroup.options) columnOrGroup.options = {}

		columnOrGroup.options.sort = direction
		sortDeb(columnOrGroup)

	}

	const signalSortChange = function (columnOrGroup) {
    /* *
     * For some reason dispatch evEvents.DATA_LOAD_START from
     * ev-data-provider.service -> getObjects() do not register.
     * Whence dataIsLoading = true;
     * */
    columnsData.dataIsLoading = true;if (isReport &&columnHasCorrespondingGroup(columnOrGroup.key)) {
			const groupsList = evDataService.getGroups();

      const group = groupsList.find(group => group.key === columnOrGroup.key);
      group.options.sort = columnOrGroup.options.sort;
      group.options.sort_settings = columnOrGroup.options.sort_settings;

      evDataService.setGroups(groupsList);

      evDataService.setActiveGroupTypeSort(
          JSON.parse(JSON.stringify( columnOrGroup ))
      );

      evEventService.dispatchEvent(evEvents.GROUP_TYPE_SORT_CHANGE);

    }
    else {

      evDataService.setActiveGroupTypeSort(
          JSON.parse(JSON.stringify( columnOrGroup ))
      );

      evEventService.dispatchEvent(evEvents.COLUMN_SORT_CHANGE);

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

            useNotify({type: 'error', title: 'Manual Sort is not configured'})
						columnOrGroup.options.sort_settings.layout_user_code = null

					}

				})

		} else {
			signalSortChange(columnOrGroup)
		}

	}

  const sortDeb = useDebounce(function (columnOrGroup) {
    sort(columnOrGroup);
  }, 500);

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

	/**
	 *
	 * @param group
	 * @param type
	 * @param {Function} closeCb - - callback to close FmMenu
	 */
	let reportSetSubtotalType = function (group, type, closeCb) {
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

		closeCb()

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
		evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED)
	}

	/**
	 * @param dataList {Array<Object>} - For rv list of all groups' data. For ev list of selected groups' data.
	 */
	var selectRowsInsideData = function (dataList) {

		const isAllSelected = evDataService.getSelectAllRowsState();

		dataList.forEach(function (dataListItem) {
			if (isReport && dataListItem.___type === 'group') {
				dataListItem.___is_area_subtotal_activated = isAllSelected
				dataListItem.___is_line_subtotal_activated = isAllSelected
			} else if (dataListItem.___type === 'object') {
				dataListItem.___is_activated = isAllSelected
			}

			if (dataListItem.results && dataListItem.results.length) {
				dataListItem.results.forEach(function (child) {
					if (child.___type === 'object') {
						child.___is_activated = isAllSelected
					}
				})
			}

			evDataService.setData(dataListItem)
		})

	}

	function selectAllRows(isAllSelected) {

		console.time('Selecting all rows');

		let flatList;
		let dataList;

		if (isReport) {
		  flatList = rvDataHelper.getFlatStructure(evDataService);

		} else {
		  flatList = evDataHelper.getObjectsFromSelectedGroups(evDataService, globalDataService);
		}

		// let isAllSelected = evDataService.getSelectAllRowsState();
		if (typeof isAllSelected !== 'boolean') {
			// toggle selectedAllRowsState
			isAllSelected = !evDataService.getSelectAllRowsState();
		}

		// isAllSelected = !isAllSelected;

		flatList.forEach(function (item) {
		  if (item.___type === 'object') {
			item.___is_activated = isAllSelected;
		  }
		});

		if (isReport) {

		  dataList = evDataService.getDataAsList();

		}
		else {

		  let groupsIds = evDataService.getSelectedGroups();

		  if (!groupsIds.length) {
			groupsIds = [ evDataService.getRootGroupData() ];
		  }

		  groupsIds = groupsIds.map(group => group.___id);

		  dataList = evDataService.getDataAsList();

		  dataList = dataList.filter(item => {
			return groupsIds.includes(item.___parentId);
		  })

		}

		evDataService.setSelectAllRowsState(isAllSelected);
		isAllSelectedRef.value = isAllSelected;

		selectRowsInsideData(dataList); // must be called after evDataService.setSelectAllRowsState(isAllSelected);

		evDataService.setFlatList(flatList);

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE);
		evEventService.dispatchEvent(evEvents.ROW_ACTIVATION_CHANGE);

		console.timeEnd('Selecting all rows');

  	}

	let isColumnFloat = function (column) {
		return column.value_type == 20
	}

	let sortHandler = function (column, sort) {

    if (!column.options) column.options = {};
    if (!column.options.sort_settings) column.options.sort_settings = {};

    if (column.options.sort_settings.layout_user_code) { // manual sort handler

      uiService.getColumnSortDataList({
        filters: {
          user_code: column.options.sort_settings.layout_user_code
        }
      }).then(function (data) {

        if (data.results.length) {

          var layout = data.results[0];

          evDataService.setColumnSortData(column.key, layout.data)

          var i;
          for (i = 0; i < columns.length; i = i + 1) {
            if (!columns[i].options) {
              columns[i].options = {};
            }
            columns[i].options.sort = null;
          }

          column.options.sort = sort;
          column.options.sort_settings.mode = 'manual';

          console.log('sortHandler.column', column);

          evDataService.setActiveColumnSort(column);

          if (isReport) {
            columns.value = getColumns();
          }

          collectMissingCustomFieldsErrors();
          evEventService.dispatchEvent(evEvents.COLUMN_SORT_CHANGE);
					} else {
						useNotify({type: 'error', title: "Manual Sort is not configured"});

          column.options.sort_settings.layout_user_code = null;

        }

      })


    }
    else { // default sort handler

      let columnsList = evDataService.getColumns();

      var i;
      for (i = 0; i < columnsList.length; i = i + 1) {
        if (!columnsList[i].options) {
          columnsList[i].options = {};
        }
        columnsList[i].options.sort = null;
      }

      column.options.sort = sort;
      column.options.sort_settings.mode = 'default';

      console.log('sortHandler.column', column);

      /*columnsList.forEach(function (item) {

        if (column.key === item.key) {
          item = column;
        }

      });*/
      const columnIndex = columnsList.findIndex(col => col.key === column.key);
      columnsList[columnIndex] = structuredClone(column);

      evDataService.setActiveColumnSort(column);

      evDataService.setColumns(columns);

      columns.value = getColumns();

      collectMissingCustomFieldsErrors();

      evEventService.dispatchEvent(evEvents.COLUMN_SORT_CHANGE);

    }

	}

	/*let groupsSortHandler = function (groupIndex, sort) {
		// reset sorting for other groups
		var i
		for (i = 0; i < groupsRef.value.length; i = i + 1) {
			if (!groups[i].options) {
				groups[i].options = {}
			}
		}

		var group = groups[groupIndex]
		console.log('groups sorting group', group)
		group.options.sort = sort

		groupsRef.value = getGroups()

		groupsRef.value.forEach(function (item) {
			if (group.key === item.key || group.id === item.id) {
				item = group
			}
		})

		setGroups(groupsRef.value)
		evDataService.setActiveGroupTypeSort(group)

		evEventService.dispatchEvent(evEvents.GROUP_TYPE_SORT_CHANGE)
	}*/
	let checkColTextAlign = function (column, type) {
		if (column.hasOwnProperty('style') && column.style) {
			if (column.style.text_align === type) {
				return true
			}
		}

		return false
	}

	/**
	 *
	 * @param column
	 * @param type
	 * @param {Function} closeCb - callback to close FmMenu
	 */
	let changeColumnTextAlign = function (column, type, closeCb) {
		evEventService.dispatchEvent(popupEvents.CLOSE_POPUP)

		if (!column.hasOwnProperty('style')) {
			column.style = {}
		}

		if (column.style.text_align === type) {
			delete column.style.text_align
		} else {
			column.style.text_align = type
		}

		closeCb()
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

	/**
	 * Used in only by report viewer.
	 * @param groupKey {string}
	 * @param closeCb {Function} - callback to close FmMenu
	 */
	let removeGroup = function (groupKey, closeCb) {
		let groupsList = evDataService.getGroups()

		/*var groupToRemoveIndex = groupsList.findIndex(
			(group) => group.___group_type_id === groupKey
		)*/
		const groupToRemoveIndex = groupsList.findIndex(
			(group) => group.key === groupKey
		)

		if (groupToRemoveIndex > -1) {
			groupsList.splice(groupToRemoveIndex, 1)
		} else {
			throw new Error('No group with such key found: ' + groupKey)
		}

		evDataService.setGroups(groupsList)

		const columnsList = evDataService.getColumns()

		const colToRemoveIndex = columnsList.findIndex(
			(column) => column.key === groupKey
		)

		if (colToRemoveIndex > -1) {
			columnsList.splice(colToRemoveIndex, 1)
		} else {
			throw new Error('No column with such key found: ' + groupKey)
		}

		evDataService.setColumns(columnsList)

		// columnsToShow.value = getColumnsToShow()

		collectMissingCustomFieldsErrors()

		evEventService.dispatchEvent(evEvents.GROUPS_CHANGE)
		evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
		evEventService.dispatchEvent(evEvents.UPDATE_COLUMNS_SIZE)

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)

		closeCb()
	}

	/**
	 *
	 * @param {String} groupKey
	 * @param {Function} closeCb - callback to close FmMenu
	 */
	let unGroup = function (groupKey, closeCb) {
		closeCb()
		let groupsList = getGroups()

		var groupToRemoveIndex = groupsList.findIndex(
			(group) => group.key === groupKey
		)

		if (groupToRemoveIndex > -1) {
			groupsList.splice(groupToRemoveIndex, 1)
		} else {
			throw new Error('No group with such key found: ' + groupKey)
		}

		if (isReport) {
			const lastDraggedElem = contentWrapElement.querySelector(
				'.gDraggableHead.last-dragged'
			)

			if (lastDraggedElem) lastDraggedElem.classList.remove('last-dragged')

			const columnsList = evDataService.getColumns()
			const ungroupedColumn = columnsList.find(
				(column) => column.key === groupKey
			)

			if (ungroupedColumn) {
				if (!ungroupedColumn.frontOptions) ungroupedColumn.frontOptions = {}

				ungroupedColumn.frontOptions.lastDragged = true
				evDataService.setColumns(columnsList)
			}
		}

		// groupsRef.value = groups;
		evDataService.setGroups(groupsList)
		evEventService.dispatchEvent(evEvents.GROUPS_CHANGE)

		if (isReport) {
			evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
			evEventService.dispatchEvent(evEvents.UPDATE_COLUMNS_SIZE)

			evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
		}
	}

	const hideSubtotalForColumn = function (prop, column) {
		if (!column.hasOwnProperty('report_settings')) {
			column.report_settings = {}
		}

		column.report_settings[prop] = !column.report_settings[prop]

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
		evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED)
	}

	var getDownloadedTableItemsCount = function () {
		var unfilteredFlatList = evDataService.getUnfilteredFlatList()

		unfilteredFlatList = unfilteredFlatList.filter(function (item) {
			return item.___type !== 'control'
		})

		let downloadedItemsCount = unfilteredFlatList.length
	}

	const updateGroupTypeIds = function () {

		groupsRef.value = getGroups();

		groupsRef.value.forEach((item) => {
			item.___group_type_id = evDataHelper.getGroupTypeId(item)
		})

		setGroups(groupsRef.value)

		return groupsRef.value
	}

	const setDefaultGroupType = function () {
		groupsRef.value = getGroups()

		groupsRef.value.forEach(function (group) {
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

		setGroups(groupsRef.value)
	}

    const updateGroupFoldingState = function () {

        let groupsList = evDataService.getGroups()
        let parentGroupFullyFolded = false

        groupsList.forEach((group) => {

            if (!group.report_settings) {
                group.report_settings = {}
            }

            if (typeof group.report_settings.is_level_folded !== 'boolean') {
                group.report_settings.is_level_folded = true;
            }

            if (parentGroupFullyFolded) {
                group.report_settings.is_level_folded = true;

            } else if (group.report_settings.is_level_folded) { // if group is fully folded, groups after it must be folded too
                parentGroupFullyFolded = true;
            }

        })

        evDataService.setGroups(groupsList);

        groupsRef.value = getGroups();

    }

	const syncColumnsWithGroups = function () {
		let columnsList = evDataService.getColumns()
		let groups = getGroups()

		let columnsHaveBeenSynced = false

		groups.forEach((group, groupIndex) => {
			if (group.key !== columnsList[groupIndex].key) {
				let columnToAdd
				let groupColumnIndex = columnsList.findIndex(
					(column) => group.key === column.key
				)

				if (groupColumnIndex > -1) {
					columnToAdd = JSON.parse(
						JSON.stringify(columnsList[groupColumnIndex])
					)
					columnsList.splice(groupColumnIndex, 1)
				} else {
					columnToAdd = evHelperService.getTableAttrInFormOf('column', group)
				}

				columnsList.splice(groupIndex, 0, columnToAdd)

				columnsHaveBeenSynced = true
			}
		})

		evDataService.setColumns(columnsList)

		/* if (columnsHaveBeenSynced) {
												 evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE);
										 } */
		return {
			columns: JSON.parse(JSON.stringify(columnsList)),
			columnsHaveBeenSynced,
		}
	}

	let hasFoldingBtn = function ($index) {
		var groups = evDataService.getGroups()

		if (isReport && $index < groupsRef.value.length) {
			return true
		}

		return false
	}

	let foldLevel = function (key, $index) {
		// Optimized unfold logic
		// TODO probabaly still need a refactor, code looks too complicated

		var layout = evDataService.getListLayout();
		var contentType = evDataService.getContentType();

		let groupsList = evDataService.getGroups();

		var item = groupsList[$index];
		item.report_settings.is_level_folded = true;

		var i;
		//# region Set folded groups before calling rvDataHelper.setGroupSettings()
		for (i = $index; i < groupsList.length; i++) {
		  groupsList[i].report_settings.is_level_folded = true;
		}

		evDataService.setGroups(groupsList);
		//# endregion

		var maxLevel = 10
		var groupsByLevel = evDataHelper.getAllGroupsByLevel(maxLevel, evDataService);

		var reportData = localStorageService.getReportData();

		for (i = $index; i < groupsList.length; i++) {

		  var groupsContent = groupsByLevel[i + 1];

		  groupsContent.forEach(function (groupItem) {

			var parents = useGetEvRvParents(groupItem.___parentId, evDataService);

			parents.pop() // skip root group

			if (!reportData[contentType]) {
			  reportData[contentType] = {};
			}

			if (!reportData[contentType][layout.user_code]) {
			  reportData[contentType][layout.user_code] = {
				groups: {}
			  }
			}

			var full_path = parents.map(function (item) {
			  return item.___group_name
			})

			full_path.push(groupItem.___group_name);

			var full_path_prop = full_path.join('___'); // TODO check if safe enough

			var groupSettings;

			if (reportData[contentType][layout.user_code]['groups'][full_path_prop]) {
			  groupSettings = reportData[contentType][layout.user_code]['groups'][full_path_prop];
			}

			if (!groupSettings) {

			  groupSettings = {
				full_path: full_path,
				is_open: false
			  }

			  reportData[contentType][layout.user_code]['groups'][full_path_prop] = groupSettings;

			}

			groupItem.___is_open = false;
			groupSettings.is_open = false;

			if (!reportData[contentType][layout.user_code]['groups']) {
			  reportData[contentType][layout.user_code]['groups'] = {}
			}

			var full_path_prop = groupSettings.full_path;

			if (Array.isArray(full_path_prop)) {
			  full_path_prop = full_path_prop.join('___')
			}

			reportData[contentType][layout.user_code]['groups'][full_path_prop] = groupSettings;

			reportData[contentType][layout.user_code].groupsList = [];

			groupsList.forEach(group => {

			  var groupObj = {
				key: group.key,
				report_settings: {
				  is_level_folded: false
				}
			  };

			  if (group.report_settings) {
				groupObj.report_settings.is_level_folded = !!group.report_settings.is_level_folded;
			  }


			  reportData[contentType][layout.user_code].groupsList.push(groupObj);

			});

			evDataService.setData(groupItem);

		  });

		}

		localStorageService.cacheReportData(reportData);

		evEventService.dispatchEvent(evEvents.GROUPS_LEVEL_FOLD);
		evEventService.dispatchEvent(evEvents.REDRAW_TABLE);

	}

	let unfoldLevel = async function (key, $index) {

		var layout = evDataService.getListLayout();
		var contentType = evDataService.getContentType();

		let groupsList = evDataService.getGroups();

		var item = groupsList[$index];

		item.report_settings.is_level_folded = false;

		var i;

		//# region Set folded groups before calling rvDataHelper.setGroupSettings()
		for (i = $index; i >= 0; i--) {
		  groupsList[i].report_settings.is_level_folded = false;
		}

		evDataService.setGroups(groupsList);
		groupsRef.value = getGroups();

		var maxLevel = 10
		var groupsByLevel = evDataHelper.getAllGroupsByLevel(maxLevel, evDataService);

		console.log('groupsByLevel', groupsByLevel);
		console.log('maxLevel', $index);
		//# endregion

		var reportData = localStorageService.getReportData();

		for (i = $index; i >= 0; i--) {

		  var groupsContent = groupsByLevel[i + 1];

		  groupsContent.forEach(function (groupItem) {

			var parents = useGetEvRvParents(groupItem.___parentId, evDataService);

			parents.pop() // skip root group

			if (!reportData[contentType]) {
			  reportData[contentType] = {};
			}

			if (!reportData[contentType][layout.user_code]) {
			  reportData[contentType][layout.user_code] = {
				groups: {}
			  }
			}

			var full_path = parents.map(function (item) {
			  return item.___group_name
			})

			full_path.push(groupItem.___group_name);

			var full_path_prop = full_path.join('___'); // TODO check if safe enough

			var groupSettings;

			if (reportData[contentType][layout.user_code]['groups'][full_path_prop]) {
			  groupSettings = reportData[contentType][layout.user_code]['groups'][full_path_prop];
			}

			if (!groupSettings) {

			  groupSettings = {
				full_path: full_path,
				is_open: true
			  }

			  reportData[contentType][layout.user_code]['groups'][full_path_prop] = groupSettings;

			}

			groupItem.___is_open = true;
			groupSettings.is_open = true;

			if (!reportData[contentType][layout.user_code]['groups']) {
			  reportData[contentType][layout.user_code]['groups'] = {}
			}

			var full_path_prop = groupSettings.full_path;

			if (Array.isArray(full_path_prop)) {
			  full_path_prop = full_path_prop.join('___')
			}

			reportData[contentType][layout.user_code]['groups'][full_path_prop] = groupSettings;

			reportData[contentType][layout.user_code].groupsList = [];

			groupsList.forEach(group => {

			  var groupObj = {
				key: group.key,
				report_settings: {
				  is_level_folded: false
				}
			  };

			  if (group.report_settings) {
				groupObj.report_settings.is_level_folded = !!group.report_settings.is_level_folded;
			  }


			  reportData[contentType][layout.user_code].groupsList.push(groupObj);

			});

			evDataService.setData(groupItem);

		  });

		}

		localStorageService.cacheReportData(reportData);
		// localStorageService.cacheReportDataForLayout(contentType, layout.user_code, reportData);

		rvDataHelper.markHiddenColumnsBasedOnFoldedGroups(evDataService);

		evEventService.dispatchEvent(evEvents.GROUPS_LEVEL_UNFOLD);
		evEventService.dispatchEvent(evEvents.REDRAW_TABLE);

		// New Backend Logic, Try To Request New Unrequested Open Groups

		var unfoldPromises = []

		const currentLevelGroups = structuredClone(
			evDataHelper.getGroupsByLevel($index + 1, evDataService)
		);

		currentLevelGroups.forEach(function (group) {

		  console.log('handleFoldButtonClick.group', group);

		  if (group.___is_open) {

			if ( !evDataService.isRequestParametersExist(group.___id) ) {

			  unfoldPromises.push(function (){

				  var parentRequestParameters = evDataService.getRequestParameters(group.___parentId);


				  var requestParameters = window.rvDataProviderService.createRequestParameters(
					  evDataService, evEventService, group, parentRequestParameters
				  )

				console.log('handleFoldButtonClick.group', group);
				console.log('handleFoldButtonClick.requestParameters', requestParameters);

				return window.rvDataProviderService.updateDataStructureByRequestParameters(
					evDataService, evEventService, requestParameters
				)

			  })

			}

		  }

		})

		console.log('unfoldLevel.unfoldPromises', unfoldPromises);

		const unfoldGroups = async function () {

		  let promisesToExecute = unfoldPromises.map(func => func());

		  await Promise.all(promisesToExecute)

		  evEventService.dispatchEvent(evEvents.REDRAW_TABLE);

		}

		if (unfoldPromises.length > 10) {

		  let res= await $mdDialog.show({
			controller: 'WarningDialogController as vm',
			locals: {
			  warning: {
				title: 'Warning',
				description: "You are trying to unfold " + unfoldPromises.length + " groups. It may take a while. Do you want to continue?",
			  }
			}

		  });

		  if (res.status === 'agree') {
			await unfoldGroups();

		  } else {
			foldLevel(key, $index); // then fold this level back
		  }

		} else {
		  await unfoldGroups();
		}

	}

	let groupLevelIsFolded = function ($index) {
		var groups = evDataService.getGroups()

		return groups[$index].report_settings.is_level_folded
	}

	const setUpFrontOptions = (item) => {
		item.frontOptions = item.frontOptions || {}

		return item
	}

	const setColumnsFrontOptions = function () {
		let columnsList = evDataService.getColumns()

		columnsList = columnsList.map(setUpFrontOptions)

		evDataService.setColumns(columnsList)

		return getColumns()
	}

	const setGroupsFrontOptions = function () {
		let groupsList = evDataService.getGroups()

		groupsList = groupsList.map(setUpFrontOptions)

		evDataService.setGroups(groupsList)

		return getGroups()
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

	// async function addColumn($event) {
	// 	const allAttrs = attributeDataService.getForAttributesSelector(entityType)
	// 	const selectedAttrs = columns.map((col) => col.key)

	// 	let res = await $mdDialog.show({
	// 		controller: 'AttributesSelectorDialogController as vm',
	// 		templateUrl: 'views/dialogs/attributes-selector-dialog-view.html',
	// 		targetEvent: $event,
	// 		multiple: true,
	// 		locals: {
	// 			data: {
	// 				title: 'Add columns',
	// 				attributes: allAttrs,
	// 				layoutNames: evHelperService.getAttributesLayoutNames(columns),
	// 				selectedAttributes: selectedAttrs,
	// 				contentType: contentType,
	// 			},
	// 		},
	// 	})

	// 	if (res && res.status == 'agree') {
	// 		let newAttrs = allAttrs.filter((o) => res.data.items.includes(o.key))

	// 		for (var i = 0; i < newAttrs.length; i = i + 1) {
	// 			var colData = evHelperService.getTableAttrInFormOf(
	// 				'column',
	// 				newAttrs[i]
	// 			)
	// 			columns.push(colData)
	// 		}

	// 		evDataService.setColumns(columns)

	// 		columns.value = getColumns()

	// 		evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
	// 		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
	// 	}
	// }

	const onGroupLevelFoldingSwitch = function (argumentsObj) {

		rvDataHelper.markHiddenColumnsBasedOnFoldedGroups(evDataService)
		columns.value = getColumns();

		groupsRef.value = getGroups();

		groupsRef.value = evDataHelper.importGroupsStylesFromColumns(
			groupsRef.value,
			columns.value,
		)
		// if (argumentsObj && argumentsObj.updateScope) $apply()
	}

	const syncGroupLayoutNamesWithColumns = function () {
		const columnsList = evDataService.getColumns()

		columnsList.forEach((column) => {
			if (!column.layout_name) {
				return
			}

			const matchingGroup = groupsRef.value.find(
				(group) => group.key === column.key
			)

			if (matchingGroup) {
				matchingGroup.layout_name = column.layout_name
			}
		})

		setGroups(groupsRef.value)

		return groupsRef.value
	}

	let onGroupsChange

	// Must be called before declaring columnsData
	if (isReport) {
		checkForFilteringBySameAttr = function (columnKey) {
			console.log('columnKey:', columnKey)
			var filters = evDataService.getFilters()
			console.log('filters:', filters)

			for (var i = 0; i < filters.length; i++) {
				if (filters[i].key === columnKey) {
					return false
				}
			}

			return true
		}

		onGroupsChange = function () {
			groupsRef.value = updateGroupTypeIds()

			setDefaultGroupType()
			updateGroupFoldingState()

			// groupsRef.value = evDataService.getGroups()
			evDataService.resetTableContent(isReport)

			const res = syncColumnsWithGroups()

			columns.value = res.columns
			const colsChanged = res.columnsHaveBeenSynced

			groupsRef.value = evDataHelper.importGroupsStylesFromColumns(
				groupsRef.value,
				columns.value
			)

			// columnsToShow.value = getColumnsToShow()

			collectMissingCustomFieldsErrors()
			// setFiltersLayoutNames();
			var foldedGroup = groupsRef.value.find(
				(group) =>
					group.report_settings && group.report_settings.is_level_folded
			)

			groupsRef.value = setGroupsFrontOptions()

            rvDataHelper.markHiddenColumnsBasedOnFoldedGroups(evDataService)
            columns.value = getColumns();

            if (colsChanged) {
				evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
			}

			evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
		}
	} else {
		onGroupsChange = function () {

			groupsRef.value = updateGroupTypeIds();
			setDefaultGroupType();

			groupsRef.value = setGroupsFrontOptions();

			// groups = evDataService.getGroups();
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

	//# region Data to provide for components-children
	// Must be after assignment of checkForFilteringBySameAttr
	let renameOpened = ref(false)
	let columnToRename = ref(null)

	let openColsAddition = ref(false)
	const allAttrs = ref([])
	// const selectedAttrs = ref([])
	const numberFormatEdit = ref(false)
	/*let renameColumn = asyncrenameOpened function (itemKey, closeCb) {

		closeCb();

		let colsList = evDataService.getColumns();
		let column = colsList.find((column) => column.key === itemKey)

		columnToRename.value = structuredClone(column)

		if (!columnToRename.value.layout_name) {
			columnToRename.value.__isOriginal = true
		}

		let res = await $mdDialog.show({
			controller: 'RenameFieldDialogController as vm',
			templateUrl: 'views/dialogs/rename-field-dialog-view.html',
			locals: {
				data: columnToRename.value,
			},
		})

		if (res.status === 'agree') {

			delete columnToRename.value.__isOriginal

			column.layout_name = columnToRename.value.layout_name;
			evDataService.setColumns(colsList);

			evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE);

			if ( columnHasCorrespondingGroup(columnToRename.value.key) ) {

				// var group = groupsRef.value.find((group) => group.key === itemKey)

				let groupsList = evDataService.getGroups();
				let group = groupsList.find(group => group.key === itemKey)

				group.layout_name = columnToRename.value.layout_name

				evDataService.setGroups(groupsList)
				evEventService.dispatchEvent(evEvents.GROUPS_CHANGE);

			}

			const filters = evDataService.getFilters()

			if (isReport) {

				const filter = filters.find(
					(filter) => filter.key === columnToRename.value.key
				)

				if (filter) {
					filter.layout_name = columnToRename.value.layout_name

					evDataService.setFilters(filters)

					evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)
				}

			}
			else {

				let filterLayoutNameChanged = false

				for (let filtersProp in filters) {
					// search among frontend and backend filters

					const filter = filters[filtersProp].find(
						(filter) => filter.key === columnToRename.value.key
					)

					if (filter) {
						filter.layout_name = columnToRename.value.layout_name
						filterLayoutNameChanged = true
					}
				}

				if (filterLayoutNameChanged) {
					evDataService.setFilters(filters)
					evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)
				}

			}

			// columnsToShow.value = getColumnsToShow()
		}
	} */

	/**
	 *
	 * @param {String} itemKey - key of column or group
	 * @param {Function} closeCb - callback to close FmMenu
	 */
	function openRenameColumn(itemKey, closeCb) {
		closeCb()

		let column = getColumnByKey(itemKey)
		columnToRename.value = structuredClone(column)
		renameOpened.value = true
	}

	function columnsAdditionOpened(itemKey, closeCb) {

		allAttrs.value = evAttrsStore.getDataForAttributesSelector(contentType)

		openColsAddition.value = true
	}

	function addColumn(newAttrs) {

		let columnsList = evDataService.getColumns()

		for (var i = 0; i < newAttrs.length; i = i + 1) {
			var colData = evHelperService.getTableAttrInFormOf('column', newAttrs[i])
			columnsList.push(colData)
		}

		evDataService.setColumns(columnsList)

		columns.value = getColumns()

		evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)

	}

	/**
	 * Inside report viewer can be called by a group.
	 *
	 * @param {Function} closeModal
	 */
	function renameColumn(closeModal) {
		let column = getColumnByKey(columnToRename.value.key)

		column.layout_name = columnToRename.value.layout_name

		setColumn(column)

		evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)

		if (columnHasCorrespondingGroup(columnToRename.value.key)) {
			// var group = groupsRef.value.find((group) => group.key === itemKey)

			let groupsList = evDataService.getGroups()
			let group = groupsList.find(
				(group) => group.key === columnToRename.value.key
			)

			group.layout_name = columnToRename.value.layout_name

			evDataService.setGroups(groupsList)
			evEventService.dispatchEvent(evEvents.GROUPS_CHANGE)
		}

		const filters = evDataService.getFilters()

		if (isReport) {
			const filter = filters.find(
				(filter) => filter.key === columnToRename.value.key
			)

			if (filter) {
				filter.layout_name = columnToRename.value.layout_name

				evDataService.setFilters(filters)

				evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)
			}
		} else {
			let filterLayoutNameChanged = false

			for (let filtersProp in filters) {
				// search among frontend and backend filters

				const filter = filters[filtersProp].find(
					(filter) => filter.key === columnToRename.value.key
				)

				if (filter) {
					filter.layout_name = columnToRename.value.layout_name
					filterLayoutNameChanged = true
				}
			}

			if (filterLayoutNameChanged) {
				evDataService.setFilters(filters)
				evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)
			}
		}

		// Must be at the bottom, because closing modal empties ref columnToRename
		closeModal()
	}

	let columnHasCorrespondingGroup = function (columnKey) {
		var groupIndex = groupsRef.value.findIndex((group) => group.key === columnKey)

		return groupIndex > -1
	}

	let addColumnEntityToGrouping = function (column) {
		const groupToAdd = useGetEvRvAttrInFormOf('group', column)

		// groupsRef.value.push(groupToAdd)
		let groupsList = evDataService.getGroups()
		groupsList.push(groupToAdd)

		setGroups(groupsList)

		evEventService.dispatchEvent(evEvents.GROUPS_CHANGE)
		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
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

	/**
	 *
	 * @param column
	 * @param {Function} closeCb - callback to close FmMenu
	 */
	let removeColumn = function (column, closeCb) {
		closeCb()
		let columnsList = evDataService.getColumns()
		let colToDeleteAttr = null
		/*let columnsList = columnsList.filter(function (item) {
												 return column.___column_id !== item.___column_id;
										 });*/
		for (let i = 0; i < columnsList.length; i++) {
			if (column.___column_id === columnsList[i].___column_id) {
				colToDeleteAttr = JSON.parse(JSON.stringify(columnsList[i]))
				columnsList.splice(i, 1)
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

		evDataService.setColumns(columnsList)
		evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
		evEventService.dispatchEvent(evEvents.UPDATE_COLUMNS_SIZE)
		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
	}

	/**
	 *
	 * @param column
	 * @param {Function} closeCb - callback to close FmMenu
	 */
	let reportHideGrandTotal = function (column, closeCb) {
		evEventService.dispatchEvent(popupEvents.CLOSE_POPUP)
		hideSubtotalForColumn('hide_grandtotal', column)
	}

	//# region Subtotals

	/*
	 * Values for the property subtotal_formula_id
	 *
	 * 1 - Sum
	 * 2 - weighted by market value
	 * 3 - weighted by market value %
	 * 4 - weighted by exposure
	 * 5 - weighted by exposure %
	 * 6 - average weighted by market value
	 * 7 - average weighted by market value %
	 * 8 - average weighted by exposure
	 * 9 - average weighted by exposure %
	 * */

	/**
	 *
	 * @param {Object} column
	 * @param {Number} type
	 * @param {Function} [closeCb] - callback to close FmMenu
	 */
	let selectSubtotalType = function (column, type, closeCb) {
		if (closeCb) closeCb()

		const col = getColumnByKey(column.key)

		if (!col.hasOwnProperty('report_settings')) {
			col.report_settings = {}
		}

		if (col.report_settings.subtotal_formula_id === type) {
			// turn off subtotal after clicking on an active subtotal type
			col.report_settings.subtotal_formula_id = null
		} else {
			col.report_settings.subtotal_formula_id = type
		}

		col.frontOptions.temporaryWeightedActive = false

		setColumn(col)
		columns.value = getColumns()

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
		evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED)
	}

	function onSubtotalSumClick(column) {
		column.frontOptions.subtotalAvgWeightedActive = false
		column.frontOptions.subtotalWeightedActive = false

		column.frontOptions.subtotalAvgWeightedActive = false;
		column.frontOptions.subtotalWeightedActive = false;

    evDataService.resetTableContent(isReport);
    evEventService.dispatchEvent(evEvents.GROUPS_CHANGE); // make request to backend to recalculate subtotals

		selectSubtotalType(column, 1);

	}

  function subtotalWeightedChange() {

    evDataService.resetTableContent(isReport);

    evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE);
    evEventService.dispatchEvent(evEvents.GROUPS_CHANGE); // make request to backend to recalculate subtotals
    evEventService.dispatchEvent(evEvents.REDRAW_TABLE);

  }

	function onSubtotalWeightedClick(column) {
// column is an object inside ref columns
		column.frontOptions.subtotalAvgWeightedActive = false
		column.report_settings.subtotal_formula_id = null

		column.frontOptions.subtotalWeightedActive =
			!column.frontOptions.subtotalWeightedActive

		setColumns(columns.value)

    subtotalWeightedChange()
	}

	function onSubtotalAvgWeightedClick(column) {
    // column is an object inside ref columns
		column.frontOptions.subtotalWeightedActive = false;
		column.report_settings.subtotal_formula_id = null;

		setColumns(columns.value)

    subtotalWeightedChange()
	}

	function getSubtotalFormula(column) {
		if (column.hasOwnProperty('report_settings')) {
			return column.report_settings.subtotal_formula_id
		}

		return null
	}

	function onContextMenuClose(item) {
		item.frontOptions.subtotalWeightedActive = false
		item.frontOptions.subtotalAvgWeightedActive = false
	}
	//# endregion

	/** Used to pass data into AngularFmGridTableColumnCell */
	let columnsData = reactive({
		openRenameColumn: openRenameColumn,
		columnHasCorrespondingGroup: columnHasCorrespondingGroup,
		addColumnEntityToGrouping: addColumnEntityToGrouping,
		checkForFilteringBySameAttr: checkForFilteringBySameAttr,
		addFiltersWithColAttr: addFiltersWithColAttr,
		editManualSorting: editManualSorting,
		activateColumnNumberRenderingPreset: activateColumnNumberRenderingPreset,
		// openColumnNumbersRenderingSettings: openColumnNumbersRenderingSettings,
		resizeColumn: resizeColumn,
		removeColumn: removeColumn,
		unGroup: unGroup,

		changeColumnTextAlign: changeColumnTextAlign,
		checkColTextAlign: checkColTextAlign,
		removeGroup: removeGroup,

    dataIsLoading: false,

		//# region Subtotals
		selectSubtotalType: selectSubtotalType,
		// isSubtotalFormulaSelected: isSubtotalFormulaSelected,
		getSubtotalFormula: getSubtotalFormula,
		// reportHideSubtotal: reportHideSubtotal,
		reportHideGrandTotal: reportHideGrandTotal,

		subtotalFormula: getSubtotalFormula,

		onSubtotalSumClick: onSubtotalSumClick,
		onSubtotalWeightedClick: onSubtotalWeightedClick,
		onSubtotalAvgWeightedClick: onSubtotalAvgWeightedClick,
		//# endregion

		openNumberFormatDialog: openNumberFormatDialog,
		onContextMenuClose: onContextMenuClose,
	})

	provide('columnsData', columnsData)
	//# endregion Data to provide for components-children

	const initEventListeners = function () {
		// Victor 2021.03.29 #88 fix bug with deleted custom fields
		/* evEventService.addEventListener(
			evEvents.DYNAMIC_ATTRIBUTES_CHANGE,
			function () {
				customFields =
					attributeDataService.getCustomFieldsByEntityType(entityType)
				collectMissingCustomFieldsErrors()
			}
		) */

		evEventService.addEventListener(evEvents.GROUPS_CHANGE, onGroupsChange)

		evEventService.addEventListener(evEvents.COLUMNS_CHANGE, function () {
			evDataHelper.updateColumnsIds(evDataService)
			evDataHelper.setColumnsDefaultWidth(evDataService)

			getColsAvailableForAdditions() // when inside dashboard

			// flagMissingColumns();

			/*let newColumns = getColumnsToShow()
			columnsToShow.value = JSON.parse(JSON.stringify(newColumns))*/

			collectMissingCustomFieldsErrors()

			columns.value = setColumnsFrontOptions()
		})

		evEventService.addEventListener(
			evEvents.GROUPS_LEVEL_FOLD,
			onGroupLevelFoldingSwitch
		)
		evEventService.addEventListener(
			evEvents.GROUPS_LEVEL_UNFOLD,
			onGroupLevelFoldingSwitch
		)

    evEventService.addEventListener(evEvents.DATA_LOAD_START, function () {
      columnsData.dataIsLoading = true;
    });

    evEventService.addEventListener(evEvents.DATA_LOAD_END, function () {
      columnsData.dataIsLoading = false;
    });

		if (isReport) {
			evEventService.addEventListener(
				evEvents.UPDATE_GROUPS_SIZE,
				function (argumentsObj) {
					if (columnHasCorrespondingGroup(argumentsObj.key)) {
						let groupsList = evDataService.getGroups()
						const columnsList = evDataService.getColumns()

						groupsList = evDataHelper.importGroupsStylesFromColumns(
							groupsList,
							columnsList
						)
						evDataService.setGroups(groupsList)

						groupsRef.value = getGroups()
					}
				}
			)
		} else {
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
		if (hideRowSettings.value) {
			contentWrapElement.classList.add('g-row-settings-collapsed')
		} else {
			contentWrapElement.classList.remove('g-row-settings-collapsed')
		}

		columns.value = setColumnsFrontOptions()

		evDataHelper.importGroupsStylesFromColumns(groupsRef.value, columns.value)

		groupsRef.value = updateGroupTypeIds()

		if (isReport) {
			const res = syncColumnsWithGroups()

			columns.value = res.columns
		}

		groupsRef.value = syncGroupLayoutNamesWithColumns()
		groupsRef.value = setGroupsFrontOptions()

		setColumns(columns.value)
		// columns = evDataService.getColumns()
		// flagMissingColumns();

		// columnsToShow.value = getColumnsToShow()

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

		rowFilterColor.value = evSettings.row_type_filter

		// update refs after functions above changed groups and columns
		groupsRef.value = getGroups()
		columns.value = getColumns()

		initEventListeners()
	}

	init()
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
