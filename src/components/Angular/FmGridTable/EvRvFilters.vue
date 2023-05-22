<template>
	<FmHorizontalPanel
		class="ev_toolbar g-filters-holder"
		:class="{
			'hide-ev-front-filters':
				!scope.isReport &&
				scope.thereAreFrontendFilters &&
				scope.shownFiltersType === 'frontend',
		}"
		height="initial"
	>
		<template #leftActions>
			<div
				class="g-filter-left-part gFiltersLeftPart"
				:class="{ 'no-ev-g-filter-switch': !scope.thereAreFrontendFilters }"
			>
				<template v-if="scope.isReport">
					<FmMenu>
						<template #btn>
							<FmIcon
								class="add_ev_btn"
								btnPrimary
								icon="add"
								v-fm-tooltip="'Add'"
							/>
						</template>

						<template #default="{ close }">
							<div class="fm_list" @click="close()">
								<div
									class="fm_list_item"
									@click="dispatchAddMenuAction($event, item)"
								>
									{{ item.name }}
								</div>
							</div>
						</template>
					</FmMenu>

					<FmIcon
						btnPrimary
						icon="link"
						class="g-toggle-filters-btn md-icon-button chain-button"
						:class="{
							'g-use-from-above-filters-hidden': !scope.showUseFromAboveFilters,
						}"
						@click="toggleUseFromAboveFilters()"
					/>
				</template>

				<template v-if="!scope.isReport">
					<FmIcon
						v-if="
							scope.entityType != 'instrument' &&
							scope.entityType != 'instrument-type' &&
							scope.entityType != 'account-type' &&
							scope.entityType != 'transaction-type'
						"
						btnPrimary
						icon="add"
						class="g-filter-settings-big-left-btn"
						:class="{
							'g-use-from-above-filters-hidden': !scope.showUseFromAboveFilters,
						}"
						v-fm-tooltip="'ADD ' + evGetEntityNameByState()"
						@click="evAddEntity"
					/>

					<md-menu v-if="scope.entityType == 'instrument'">
						<md-button
							class="g-filter-settings-big-left-btn md-icon-button primary-button rounded"
							@click="$mdOpenMenu($event)"
						>
							<span class="material-icons">add</span>
							<md-tooltip md-direction="top"
								>ADD {{ evGetEntityNameByState() }}</md-tooltip
							>
						</md-button>

						<md-menu-content width="4">
							<md-menu-item>
								<md-button
									@click="evAddEntity($event)"
									class="g-settings-option-btn"
								>
									<span>Add Blank</span>
								</md-button>
							</md-menu-item>
							<md-menu-item>
								<md-button
									@click="openTransactionTypeDialog($event)"
									class="g-settings-option-btn"
								>
									<span>Add Typical</span>
								</md-button>
							</md-menu-item>
							<md-menu-item>
								<md-button
									@click="openSimpleImportDialog($event)"
									class="g-settings-option-btn"
								>
									<span>Import from File</span>
								</md-button>
							</md-menu-item>
							<md-menu-item>
								<md-button
									@click="addFromProvider($event)"
									class="g-settings-option-btn"
								>
									<span>Get From Provider</span>
								</md-button>
							</md-menu-item>
						</md-menu-content>
					</md-menu>

					<md-menu v-if="scope.entityType == 'instrument-type'">
						<md-button
							class="g-filter-settings-big-left-btn md-icon-button primary-button rounded"
							@click="$mdOpenMenu($event)"
						>
							<span class="material-icons">add</span>
							<md-tooltip md-direction="top"
								>ADD {{ evGetEntityNameByState() }}</md-tooltip
							>
						</md-button>

						<md-menu-content width="4">
							<md-menu-item>
								<md-button
									@click="evAddEntity($event)"
									class="g-settings-option-btn"
								>
									<span>Add Blank</span>
								</md-button>
							</md-menu-item>
							<md-menu-item>
								<md-button
									class="md-raised"
									package-manager-button
									content-type="'instruments.instrumenttype'"
								>
									Select from List
								</md-button>
							</md-menu-item>
						</md-menu-content>
					</md-menu>

					<md-menu v-if="scope.entityType == 'account-type'">
						<md-button
							class="g-filter-settings-big-left-btn md-icon-button primary-button rounded"
							@click="$mdOpenMenu($event)"
						>
							<span class="material-icons">add</span>
							<md-tooltip md-direction="top"
								>ADD {{ evGetEntityNameByState() }}</md-tooltip
							>
						</md-button>

						<md-menu-content width="4">
							<md-menu-item>
								<md-button
									@click="evAddEntity($event)"
									class="g-settings-option-btn"
								>
									<span>Add Blank</span>
								</md-button>
							</md-menu-item>
							<md-menu-item>
								<md-button
									class="md-raised"
									package-manager-button
									content-type="'accounts.accounttype'"
								>
									Select from List
								</md-button>
							</md-menu-item>
						</md-menu-content>
					</md-menu>

					<md-menu v-if="scope.entityType == 'transaction-type'">
						<md-button
							class="g-filter-settings-big-left-btn md-icon-button primary-button rounded"
							@click="$mdOpenMenu($event)"
						>
							<span class="material-icons">add</span>
							<md-tooltip md-direction="top"
								>ADD {{ evGetEntityNameByState() }}</md-tooltip
							>
						</md-button>

						<md-menu-content width="4">
							<md-menu-item>
								<md-button
									@click="evAddEntity($event)"
									class="g-settings-option-btn"
								>
									<span>Add Blank</span>
								</md-button>
							</md-menu-item>
							<md-menu-item>
								<md-button
									class="md-raised"
									package-manager-button
									content-type="'transactions.transactiontype'"
								>
									Select from List
								</md-button>
							</md-menu-item>
						</md-menu-content>
					</md-menu>

					<md-button
						v-if="scope.thereAreFrontendFilters"
						class="g-toggle-filters-btn md-icon-button"
						@click="toggleFiltersToShow()"
					>
						<span
							v-show="scope.shownFiltersType === 'frontend'"
							class="material-icons"
							>laptop_mac</span
						>
						<span
							v-show="scope.shownFiltersType === 'backend'"
							class="material-icons"
							>dns</span
						>
					</md-button>
				</template>
			</div>

			<div class="gFiltersContainer flex aic fww">
				<div
					v-if="scope.readyStatus.filters"
					custom-popup
					popup-template-url="{{filterPopupTemplate}}"
					popup-data="popupData"
					popup-event-service="popupEventService"
					popup-x="popupPosX"
					popup-y="popupPosY"
					on-save="filterSettingsChange()"
					class="g-filter-chips-wrap"
				></div>

				<FmChips
					v-if="scope.readyStatus.filters"
					class="g-filter-chips"
					:items="filtersChips"
					canDelete
					on-chip-click="onFilterChipClick(chipsData, event)"
					hide-overflowing-chips="false"
					on-chips-deletion="removeFilter(chipsData)"
					on-add-chip-click="addFilter(event)"
					on-first-render-ending="onChipsFirstRender()"
				/>

				<FmBtn type="action" @click="addFilter">ADD FILTER</FmBtn>
			</div>
		</template>
		<template #rightActions>
			<FmIcon
				icon="refresh"
				@click="refreshTable()"
				v-fm-tooltip="'Refresh Database Filters'"
				btn
			/>

			<FmMenu v-if="scope.isRootEntityViewer">
				<template #btn>
					<FmIcon btn icon="view_stream" v-fm-tooltip="'Split'" />
				</template>

				<template #default="{ close }">
					<div class="fm_list" @click="close()">
						<div
							v-if="
								!scope.isReport && scope.entityType !== 'complex-transaction'
							"
							class="fm_list_item g-settings-option-btn"
							@click="toggleSplitPanel($event, 'permission-editor')"
						>
							<FmIcon
								:style="{
									opacity:
										scope.currentAdditions?.type == 'permission-editor' ? 1 : 0,
								}"
								icon="done"
							/>
							<span>Open permission editor</span>
						</div>

						<div
							v-if="!scope.isReport"
							class="fm_list_item g-settings-option-btn"
							@click="toggleSplitPanel($event, 'editor')"
						>
							<FmIcon
								:style="{
									opacity: scope.currentAdditions?.type == 'editor' ? 1 : 0,
								}"
								icon="done"
							/>

							<span>Open editor split panel</span>
						</div>

						<md-menu-item v-if="scope.isReport">
							<md-button
								@click="toggleSplitPanel($event, 'balance-report')"
								class="g-settings-option-btn"
							>
								<span
									class="material-icons"
									v-show="scope.currentAdditions?.type === 'balance-report'"
									>done</span
								>
								<span
									class="material-icons"
									v-show="scope.currentAdditions?.type !== 'balance-report'"
									style="visibility: hidden"
									>done</span
								>

								<span>Open Balance Report view panel</span>
							</md-button>
						</md-menu-item>

						<md-menu-item v-if="scope.isReport">
							<md-button
								@click="toggleSplitPanel($event, 'pl-report')"
								class="g-settings-option-btn"
							>
								<span
									class="material-icons"
									v-show="scope.currentAdditions?.type === 'pl-report'"
									>done</span
								>
								<span
									class="material-icons"
									v-show="scope.currentAdditions?.type !== 'pl-report'"
									style="visibility: hidden"
									>done</span
								>

								<span>Open P&L Report view panel</span>
							</md-button>
						</md-menu-item>

						<md-menu-item v-if="scope.isReport">
							<md-button
								@click="toggleSplitPanel($event, 'transaction-report')"
								class="g-settings-option-btn"
							>
								<span
									class="material-icons"
									v-show="scope.currentAdditions?.type === 'transaction-report'"
									>done</span
								>
								<span
									class="material-icons"
									v-show="scope.currentAdditions?.type !== 'transaction-report'"
									style="visibility: hidden"
									>done</span
								>

								<span>Open Transaction Report view panel</span>
							</md-button>
						</md-menu-item>
					</div>
				</template>
			</FmMenu>

			<!-- <div v-if="scope.isReport">
							<div v-if="scope.reportOptions.auth_time">
								Auth Time: {{ reportOptions.auth_time }}s<br />
								Execution Time: {{ reportOptions.execution_time }}s<br />
								Relation Prefetch Time:
								{{ reportOptions.relation_prefetch_time }}s<br />
								Serialization Time: {{ reportOptions.serialization_time }}s
								<br />
								Render Time: {{ renderTime }}s <br />
								Rows downloaded: {{ reportOptions.items.length }} <br />
							</div>
						</div> -->

			<FmMenu v-if="scope.isRootEntityViewer && scope.isReport">
				<template #btn>
					<FmIcon btn icon="view_module" v-fm-tooltip="'Matrix'" />
				</template>

				<template #default="{ close }">
					<div class="fm_list" @click="close()">
						<div class="fm_list_item" @click="toggleMatrix">
							<FmIcon
								v-show="scope.currentAdditions?.type === 'permission-editor'"
								icon="matrix"
							/>
							<span>Open Matrix</span>
						</div>
					</div>
				</template>
			</FmMenu>

			<FmMenu>
				<template #btn>
					<FmIcon btn icon="upgrade" v-fm-tooltip="'Export'" />
				</template>

				<template #default="{ close }">
					<div class="fm_list" @click="close()">
						<div
							class="fm_list_item"
							v-if="scope.isReport"
							@click="exportAsPdf"
						>
							Export to PDF
						</div>

						<div class="fm_list_item" @click="exportAsCSV">Export to CSV</div>

						<div class="fm_list_item" @click="exportAsExcel">
							Export to Excel
						</div>

						<div class="fm_list_item" @click="copyReport">
							Copy all to buffer
						</div>

						<div class="fm_list_item" @click="copySelectedToBuffer">
							copySelectedToBuffer
						</div>
					</div>
				</template>
			</FmMenu>

			<FmMenu>
				<template #btn>
					<FmIcon btn icon="more_vert" v-fm-tooltip="'More'" />
				</template>

				<template #default="{ close }">
					<div class="fm_list" @click="close()">
						<div class="fm_list_item" @click="openViewConstructor">
							View Constructor
						</div>

						<div
							class="fm_list_item"
							v-if="scope.entityType !== 'complex-transaction'"
							@click="openCustomFieldsManager"
						>
							Custom Columns
						</div>

						<div
							class="fm_list_item"
							v-if="scope.isReport"
							@click="toggleAutoRefresh"
						>
							<span v-if="scope.rvAutoRefresh">Disable Auto Refresh</span>
							<span v-if="!scope.rvAutoRefresh">Enable Auto Refresh</span>
						</div>

						<div
							class="fm_list_item"
							v-if="!scope.isReport"
							@click="openInputFormEditor"
						>
							Edit form
						</div>
					</div>
				</template>
			</FmMenu>
		</template>
	</FmHorizontalPanel>
</template>

<script setup>
	import uiService from '@/angular/services/uiService'
	import evEvents from '@/angular/services/entityViewerEvents'

	import evHelperService from '@/angular/services/entityViewerHelperService'
	// import EventService from '@/angular/services/eventService';

	const props = defineProps(['attributeDataService', 'vm'])
	const gFiltersVm = props.vm

	let scope = reactive({
		...props,
		viewContext: evDataService.getViewContext(),
	})

	const elem = ref(null)

	let filters = ref(evDataService.getFilters())
	let filtersChips = ref([])

	let filtersChipsContainer
	let customFields

	onMounted(() => {
		elem.value = document.querySelector('.ev_toolbar.g-filters-holder')

		filtersChipsContainer = elem.value.querySelector('.gFiltersContainer')

		let addFilterElem
		customFields = scope.attributeDataService.getCustomFieldsByEntityType(
			scope.entityType
		)

		init()
	})
	// link: function (, , attrs, ) {
	scope.entityType = gFiltersVm.entityType
	scope.isReport = false
	scope.isRootEntityViewer = evDataService.isRootEntityViewer()
	scope.shownFiltersType = 'frontend' // hack

	scope.thereAreFrontendFilters = false // needed for existing layouts with frontend filters

	scope.readyStatus = {
		filters: false,
	}

	scope.filterPopupTemplate =
		'views/popups/groupTable/filters/ev-filter-popup-view.html'

	scope.popupPosX = gFiltersVm.popupPosX
	scope.popupPosY = gFiltersVm.popupPosY
	/* scope.fpBackClasses = gFiltersVm.fpBackClasses;
                scope.fpClasses = gFiltersVm.fpClasses;*/

	function evGetEntityNameByState() {
		switch ($state.current.name) {
			case 'app.data.portfolio':
				return 'PORTFOLIO'
				break
			case 'app.data.account':
				return 'ACCOUNT'
				break
			case 'app.data.counterparty':
				return 'COUNTERPARTY'
				break
			case 'app.data.counterparty-group':
				return 'COUNTERPARTY GROUP'
				break
			case 'app.data.responsible':
				return 'RESPONSIBLE'
				break
			case 'app.data.responsible-group':
				return 'RESPONSIBLE GROUP'
				break
			case 'app.data.instrument':
				return 'INSTRUMENT'
				break
			case 'app.data.transaction':
				return 'TRANSACTION'
				break
			case 'app.data.price-history':
				return 'PRICE HISTORY'
				break
			case 'app.data.currency-history':
				return 'CURRENCY HISTORY'
				break
			case 'app.data.strategy':
				return 'STRATEGY'
				break
			case 'app.data.strategy-subgroup':
				return 'STRATEGY SUBGROUP'
				break
			case 'app.data.strategy-group':
				return 'STRATEGY GROUP'
				break
			case 'app.data.account-type':
				return 'ACCOUNT TYPES'
				break
			case 'app.data.instrument-type':
				return 'INSTRUMENT TYPES'
				break
			/* case 'app.data.pricing-policy':
                            return "PRICING POLICY";
                            break; */
			case 'app.data.transaction-type':
				return 'TRANSACTION TYPE'
				break
			case 'app.data.transaction-type-group':
				return 'TRANSACTION TYPE GROUP'
				break
			case 'app.data.currency':
				return 'CURRENCY'
				break
			case 'app.data.complex-transaction':
				return 'TRANSACTION'
				break
			default:
				return 'ENTITIY'
				break
		}
	}

	async function evAddEntity() {
		let editLayout,
			entity = {}

		switch (scope.entityType) {
			case 'transaction-type':
				editLayout = await uiService.getDefaultEditLayout(scope.entityType)
				evHelperService.openTTypeAddDrawer(
					evDataService,
					evEventService,
					editLayout,
					$bigDrawer,
					scope.entityType,
					entity
				)

				break

			case 'instrument-type':
				editLayout = await uiService.getDefaultEditLayout(scope.entityType)
				evHelperService.openInstrumentTypeAddDrawer(
					evDataService,
					evEventService,
					editLayout,
					$bigDrawer,
					scope.entityType,
					entity
				)

				break

			case 'complex-transaction':
				editLayout = await uiService.getDefaultEditLayout(scope.entityType)

				evHelperService.openComplexTransactionAddDrawer(
					evDataService,
					evEventService,
					editLayout,
					$bigDrawer,
					scope.entityType,
					entity
				)

				break

			default:
				editLayout = await uiService.getDefaultEditLayout(scope.entityType)
				evHelperService.openEntityViewerAddDrawer(
					evDataService,
					evEventService,
					editLayout,
					$bigDrawer,
					scope.entityType,
					entity
				)

				break
		}
	}

	function addFromProvider($event) {
		$mdDialog.show({
			controller: 'InstrumentSelectDatabaseDialogController as vm',
			templateUrl: 'views/dialogs/instrument-select-database-dialog-view.html',
			targetEvent: $event,
			multiple: true,
			locals: {
				data: {
					context: {
						action: 'add_instrument_dialog',
					},
					inputText: '',
				},
			},
		})
	}

	async function openTransactionTypeDialog() {
		let editLayout,
			entity = {}

		editLayout = await uiService.getDefaultEditLayout(scope.entityType)
		evHelperService.openTTypeAddDrawer(
			evDataService,
			evEventService,
			editLayout,
			$bigDrawer,
			scope.entityType,
			entity
		)
	}

	function openSimpleImportDialog($event) {
		$mdDialog.show({
			controller: 'SimpleEntityImportDialogController as vm',
			templateUrl:
				'views/dialogs/simple-entity-import/simple-entity-import-dialog-view.html',
			targetEvent: $event,
			multiple: true,
			locals: {
				data: {},
			},
		})
	}

	/* function evApplyDatabaseFilters() {
                    evDataService.resetTableContent(false);
                    evEventService.dispatchEvent(evEvents.UPDATE_TABLE);
                }; */
	function refreshTable() {
		evDataService.resetTableContent(false)

		evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
	}

	//region Chips
	const formatFiltersForChips = function () {
		filtersChips.value = []

		const errors = []
		// const shownFilters = scope.showFrontFilters ? filters.valuefrontend : filters.valuebackend;
		filters.value[scope.shownFiltersType].forEach((filter) => {
			const filterOpts = filter.options || {}
			console.log('filterOpts:', filterOpts)

			let filterData = {
				id: filter.key,
				isActive: filterOpts.enabled,
			}
			console.log('filterData:', filterData)

			const filterName = filter.layout_name ? filter.layout_name : filter.name

			let chipText = gFiltersVm.getChipTextElem(
				filterName,
				filterOpts.filter_values,
				filterOpts.filter_type
			)

			filterData.text = chipText

			if (filter.key.startsWith('custom_fields')) {
				let error
				;[filter, filterData, error] =
					gFiltersVm.checkCustomFieldFilterForError(
						filter,
						filterData,
						customFields
					)
				if (error) errors.push(error)
			}

			if (scope.shownFiltersType === 'frontend') {
				filterData.error_data = {
					code: 20,
					description: 'Outdated filter. Please delete it. ',
				}
			}

			filtersChips.value.push(filterData)
		})
		console.log('filtersChips.value:', filtersChips.value)

		if (errors.length) gFiltersVm.updateMissingCustomFieldsList(errors)

		gFiltersVm.updateFilterAreaHeight()
	}

	scope.onFilterChipClick = gFiltersVm.onFilterChipClick

	function filterSettingsChange() {
		evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)

		if (scope.shownFiltersType === 'frontend')
			evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
	}

	scope.onChipsFirstRender = gFiltersVm.onChipsFirstRender

	async function addFilter($event) {
		let res = await gFiltersVm.openAddFilterDialog(
			$event,
			filters.value[scope.shownFiltersType]
		)

		if (res.status === 'agree') {
			for (var i = 0; i < res.data.items.length; i = i + 1) {
				filters.value[scope.shownFiltersType].push(res.data.items[i])
			}

			evDataService.setFilters(filters.value)
			evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)
		}
	}

	function removeFilter(filtersToRemove) {
		filters[scope.shownFiltersType] = filters[scope.shownFiltersType].filter(
			(filter) => {
				return filtersToRemove.find((item) => item.id !== filter.key)
			}
		)

		evDataService.setFilters(filters.value)

		evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)
		evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
	}
	//endregion

	function toggleFiltersToShow() {
		// scope.showFrontFilters = !scope.showFrontFilters;

		scope.shownFiltersType =
			scope.shownFiltersType === 'frontend' ? 'backend' : 'frontend'
		scope.popupData.shownFiltersType = scope.shownFiltersType

		if (!addFilterElem) {
			addFilterElem = filtersChipsContainer.querySelector(
				'.add-chip-wrap .chip-list-content'
			)
		}

		addFilterElem.innerText =
			scope.shownFiltersType === 'frontend' ? 'ADD FILTER' : 'ADD SERVER FILTER'

		formatFiltersForChips()

		evEventService.dispatchEvent(evEvents.FILTERS_TO_SHOW_CHANGE)
	}

	const toggleSplitPanel = gFiltersVm.toggleSplitPanel

	const exportAsCSV = gFiltersVm.exportAsCSV
	const exportAsExcel = gFiltersVm.exportAsExcel
	const copyReport = gFiltersVm.copyReport
	const copySelectedToBuffer = gFiltersVm.copySelectedToBuffer

	const openViewConstructor = gFiltersVm.openViewConstructor

	function openCustomFieldsManager($event) {
		$mdDialog.show({
			controller: 'AttributesManagerDialogController as vm',
			templateUrl: 'views/dialogs/attributes-manager-dialog-view.html',
			targetEvent: $event,
			multiple: true,
			locals: {
				data: {
					entityType: scope.entityType,
				},
			},
		})
	}

	function openInputFormEditor(ev) {
		$mdDialog.show({
			controller: 'EntityDataConstructorDialogController as vm',
			templateUrl: 'views/dialogs/entity-data-constructor-dialog-view.html',
			targetEvent: ev,
			multiple: true,
			locals: {
				data: {
					entityType: scope.entityType,
				},
			},
		})
	}

	const initEventListeners = function () {
		// placed here because formatFiltersForChips() should be called only after customFields update
		evEventService.addEventListener(
			evEvents.DYNAMIC_ATTRIBUTES_CHANGE,
			function () {
				customFields = scope.attributeDataService.getCustomFieldsByEntityType(
					scope.entityType
				)
				formatFiltersForChips()
			}
		)

		evEventService.addEventListener(
			evEvents.TABLE_SIZES_CALCULATED,
			function () {}
		)

		evEventService.addEventListener(evEvents.FILTERS_CHANGE, function () {
			filters.value = evDataService.getFilters()

			formatFiltersForChips()

			setTimeout(function () {
				// wait until DOM elems reflow after v-if

				const filterAreaHeightChanged = gFiltersVm.updateFilterAreaHeight()

				if (filterAreaHeightChanged) {
					evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)
				}
			}, 0)
		})

		evEventService.addEventListener(evEvents.ADDITIONS_CHANGE, function () {
			scope.currentAdditions = evDataService.getAdditions()
		})
	}

	function init() {
		if (
			scope.viewContext !== 'reconciliation_viewer' &&
			filters.value.frontend.length
		)
			scope.thereAreFrontendFilters = true

		console.log('scope.thereAreFrontendFilters:', scope.thereAreFrontendFilters)

		scope.currentAdditions = evDataService.getAdditions()

		scope.popupEventService = gFiltersVm.popupEventService
		scope.chipsListEventService = gFiltersVm.chipsListEventService

		scope.popupData = gFiltersVm.popupData

		if (scope.popupData)
			scope.popupData.shownFiltersType = scope.shownFiltersType

		formatFiltersForChips()

		scope.readyStatus.filters = true
		gFiltersVm.updateFilterAreaHeightOnInit()

		initEventListeners()
	}
</script>

<style lang="scss" scoped></style>
