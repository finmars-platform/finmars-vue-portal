<template>
	<div
		class="g-filters-holder width-100 flex-row fc-space-between flex-i-start"
		:class="{
			'hide-ev-front-filters':
				!scope.isReport &&
				scope.thereAreFrontendFilters &&
				scope.shownFiltersType === 'frontend',
		}"
		:ref="(el) => (elem = jquery(el))"
	>
		<div class="flex-row flex-i-start">
			<div
				class="g-filter-left-part gFiltersLeftPart"
				:class="{ 'no-ev-g-filter-switch': !scope.thereAreFrontendFilters }"
			>
				<div v-if="scope.isReport" layout="row">
					<!--<md-button class="g-filter-settings-big-left-btn md-icon-button primary-button rounded"
                           @click="calculateReport()">
                    <span class="material-icons">refresh</span>
                    <md-tooltip md-direction="top">Calculate</md-tooltip>
                </md-button>-->
					<md-menu>
						<md-button
							class="g-filter-settings-big-left-btn md-icon-button primary-button rounded"
							@click="$mdOpenMenu($event)"
						>
							<span class="material-icons">add</span>
							<md-tooltip md-direction="top">Add</md-tooltip>
						</md-button>

						<md-menu-content width="4">
							<md-menu-item v-for="item in addMenu.data.menu.root.items">
								<md-button
									@click="dispatchAddMenuAction($event, item)"
									class="g-settings-option-btn"
								>
									<span>{{ item.name }}</span>
								</md-button>
							</md-menu-item>
						</md-menu-content>
					</md-menu>

					<md-button
						class="g-toggle-filters-btn md-icon-button chain-button"
						:class="{
							'g-use-from-above-filters-hidden': !scope.showUseFromAboveFilters,
						}"
						@click="toggleUseFromAboveFilters()"
					>
						<span class="material-icons">link</span>
					</md-button>
				</div>

				<div v-if="!isReport" layout="row">
					<md-button
						class="g-filter-settings-big-left-btn md-icon-button primary-button rounded"
						@click="evAddEntity($event)"
						v-if="
							entityType != 'instrument' &&
							entityType != 'instrument-type' &&
							entityType != 'account-type' &&
							entityType != 'transaction-type'
						"
					>
						<span class="material-icons">add</span>
						<md-tooltip md-direction="top"
							>ADD {{ evGetEntityNameByState() }}</md-tooltip
						>
					</md-button>

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

					<md-menu v-if="entityType == 'instrument-type'">
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

					<md-menu v-if="entityType == 'account-type'">
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

					<md-menu v-if="entityType == 'transaction-type'">
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
						v-if="thereAreFrontendFilters"
						class="g-toggle-filters-btn md-icon-button"
						@click="toggleFiltersToShow()"
					>
						<span
							v-show="shownFiltersType === 'frontend'"
							class="material-icons"
							>laptop_mac</span
						>
						<span v-show="shownFiltersType === 'backend'" class="material-icons"
							>dns</span
						>
					</md-button>
				</div>
			</div>

			<div class="gFiltersContainer">
				<div v-if="scope.readyStatus.filters">
					<div
						custom-popup
						popup-template-url="{{filterPopupTemplate}}"
						popup-data="popupData"
						popup-event-service="popupEventService"
						popup-x="popupPosX"
						popup-y="popupPosY"
						on-save="filterSettingsChange()"
						class="g-filter-chips-wrap"
					></div>
					<chips-list
						chips-list="filtersChips"
						chips-deletion="true"
						chips-addition="ADD FILTER"
						on-chip-click="onFilterChipClick(chipsData, event)"
						hide-overflowing-chips="false"
						on-chips-deletion="removeFilter(chipsData)"
						on-add-chip-click="addFilter(event)"
						on-first-render-ending="onChipsFirstRender()"
						class="g-filter-chips"
					></chips-list>
				</div>
			</div>
		</div>

		<div class="icon-buttons gFiltersRightPart">
			<md-button @click="refreshTable()" class="signed-button">
				<div class="flex-column flex-i-center">
					<span class="material-icons">refresh</span>
					<span>Refresh</span>
					<md-tooltip md-direction="bottom">
						<div v-if="isReport">
							<div v-if="reportOptions.auth_time">
								Auth Time: {{ reportOptions.auth_time }}s<br />
								Execution Time: {{ reportOptions.execution_time }}s<br />
								Relation Prefetch Time:
								{{ reportOptions.relation_prefetch_time }}s<br />
								Serialization Time: {{ reportOptions.serialization_time }}s
								<br />
								Render Time: {{ renderTime }}s <br />
								Rows downloaded: {{ reportOptions.items.length }} <br />
							</div>

							<div>Refresh Database Filters</div>

							<div v-if="!isReport">Refresh Database Filters</div>
						</div>
					</md-tooltip>
				</div>
			</md-button>
			<md-menu v-if="isRootEntityViewer" class="full-width">
				<md-button class="signed-button" @click="$mdOpenMenu($event)">
					<div class="flex-column flex-i-center">
						<span class="material-icons">view_stream</span>
						<span>Split</span>
					</div>
				</md-button>

				<md-menu-content width="4">
					<md-menu-item
						v-if="!isReport && entityType !== 'complex-transaction'"
					>
						<md-button
							@click="toggleSplitPanel($event, 'permission-editor')"
							class="g-settings-option-btn"
						>
							<span
								class="material-icons"
								v-show="currentAdditions.type === 'permission-editor'"
								>done</span
							>
							<span
								class="material-icons"
								v-show="currentAdditions.type !== 'permission-editor'"
								style="visibility: hidden"
								>done</span
							>

							<span>Open permission editor</span>
						</md-button>
					</md-menu-item>

					<md-menu-item v-if="!isReport">
						<md-button
							@click="toggleSplitPanel($event, 'editor')"
							class="g-settings-option-btn"
						>
							<span
								class="material-icons"
								v-show="currentAdditions.type === 'editor'"
								>done</span
							>
							<span
								class="material-icons"
								v-show="currentAdditions.type !== 'editor'"
								style="visibility: hidden"
								>done</span
							>

							<span>Open editor split panel</span>
						</md-button>
					</md-menu-item>

					<md-menu-item v-if="isReport">
						<md-button
							@click="toggleSplitPanel($event, 'balance-report')"
							class="g-settings-option-btn"
						>
							<span
								class="material-icons"
								v-show="currentAdditions.type === 'balance-report'"
								>done</span
							>
							<span
								class="material-icons"
								v-show="currentAdditions.type !== 'balance-report'"
								style="visibility: hidden"
								>done</span
							>

							<span>Open Balance Report view panel</span>
						</md-button>
					</md-menu-item>

					<md-menu-item v-if="isReport">
						<md-button
							@click="toggleSplitPanel($event, 'pl-report')"
							class="g-settings-option-btn"
						>
							<span
								class="material-icons"
								v-show="currentAdditions.type === 'pl-report'"
								>done</span
							>
							<span
								class="material-icons"
								v-show="currentAdditions.type !== 'pl-report'"
								style="visibility: hidden"
								>done</span
							>

							<span>Open P&L Report view panel</span>
						</md-button>
					</md-menu-item>

					<md-menu-item v-if="isReport">
						<md-button
							@click="toggleSplitPanel($event, 'transaction-report')"
							class="g-settings-option-btn"
						>
							<span
								class="material-icons"
								v-show="currentAdditions.type === 'transaction-report'"
								>done</span
							>
							<span
								class="material-icons"
								v-show="currentAdditions.type !== 'transaction-report'"
								style="visibility: hidden"
								>done</span
							>

							<span>Open Transaction Report view panel</span>
						</md-button>
					</md-menu-item>
				</md-menu-content>
			</md-menu>

			<md-menu class="full-width" v-if="isRootEntityViewer && isReport">
				<md-button class="signed-button" @click="$mdOpenMenu($event)">
					<div class="flex-column flex-i-center">
						<span class="material-icons">view_module</span>
						<span>Matrix</span>
					</div>
				</md-button>

				<md-menu-content width="4">
					<md-menu-item>
						<md-button
							@click="toggleMatrix($event)"
							class="g-settings-option-btn"
						>
							<span class="material-icons" v-show="viewContext === 'matrix'"
								>done</span
							>
							<span
								class="material-icons"
								v-show="viewContext !== 'matrix'"
								style="visibility: hidden"
								>done</span
							>

							<span>Open Matrix</span>
						</md-button>
					</md-menu-item>
				</md-menu-content>
			</md-menu>
			<md-menu>
				<md-button class="signed-button" @click="$mdOpenMenu($event)">
					<div class="flex-column flex-i-center">
						<span class="material-icons">upgrade</span>
						<span>Export</span>
					</div>
				</md-button>

				<md-menu-content width="4">
					<md-menu-item v-if="isReport">
						<md-button
							@click="exportAsPdf($event)"
							class="g-settings-option-btn"
						>
							<span>Export to PDF</span>
						</md-button>
					</md-menu-item>

					<md-menu-item>
						<md-button @click="exportAsCSV()" class="g-settings-option-btn">
							<span>Export to CSV</span>
						</md-button>
					</md-menu-item>

					<md-menu-item>
						<md-button @click="exportAsExcel()" class="g-settings-option-btn">
							<span>Export to Excel</span>
						</md-button>
					</md-menu-item>

					<md-menu-item>
						<md-button @click="copyReport()" class="g-settings-option-btn">
							<span>Copy all to buffer</span>
						</md-button>
					</md-menu-item>
					<md-menu-item>
						<md-button
							@click="copySelectedToBuffer()"
							class="g-settings-option-btn"
						>
							<span>Copy selected to buffer</span>
						</md-button>
					</md-menu-item>
				</md-menu-content>
			</md-menu>

			<md-menu>
				<md-button class="signed-button" @click="$mdOpenMenu($event)">
					<div class="flex-column flex-i-center">
						<span class="material-icons">more_vert</span>
						<span>More</span>
					</div>
				</md-button>

				<md-menu-content width="4">
					<md-menu-item>
						<md-button
							@click="openViewConstructor($event)"
							class="g-settings-option-btn"
						>
							<span>View Constructor</span>
						</md-button>
					</md-menu-item>

					<md-menu-item v-if="entityType !== 'complex-transaction'">
						<md-button
							@click="openCustomFieldsManager($event)"
							class="g-settings-option-btn"
						>
							<span>Custom Columns</span>
						</md-button>
					</md-menu-item>

					<md-menu-item v-if="isReport">
						<md-button
							@click="toggleAutoRefresh()"
							class="g-settings-option-btn"
						>
							<span v-if="rvAutoRefresh">Disable Auto Refresh</span>
							<span v-if="!rvAutoRefresh">Enable Auto Refresh</span>
						</md-button>
					</md-menu-item>

					<md-menu-item v-if="!isReport">
						<md-button
							@click="openInputFormEditor($event)"
							class="g-settings-option-btn"
						>
							<span>Edit form</span>
						</md-button>
					</md-menu-item>
				</md-menu-content>
			</md-menu>
		</div>
	</div>
</template>

<script setup>
	import uiService from '@/angular/services/uiService'
	import evEvents from '@/angular/services/entityViewerEvents'

	import evHelperService from '@/angular/services/entityViewerHelperService'
	// import EventService from '@/angular/services/eventService';
	import jquery from 'jquery'

	const props = defineProps(['attributeDataService', 'vm'])
	const gFiltersVm = props.vm

	let scope = reactive({
		...props,
	})

	const elem = ref(null)

	let filters = ref(evDataService.getFilters())
	let viewContext = evDataService.getViewContext()

	onMounted(() => {
		const gFiltersLeftPartWidth =
			elem.value[0].querySelector('.gFiltersLeftPart').clientWidth

		const gFiltersRightPartWidth =
			elem.value[0].querySelector('.gFiltersRightPart').clientWidth

		let filtersChipsContainer =
			elem.value[0].querySelector('.gFiltersContainer')
		let addFilterElem

		let customFields = scope.attributeDataService.getCustomFieldsByEntityType(
			scope.entityType
		)

		init()
	})
	// link: function (, , attrs, ) {
	scope.entityType = gFiltersVm.entityType
	scope.isReport = false
	scope.isRootEntityViewer = evDataService.isRootEntityViewer()
	scope.shownFiltersType = 'backend'

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
		scope.filtersChips = []

		const errors = []
		// const shownFilters = scope.showFrontFilters ? filters.valuefrontend : filters.valuebackend;
		filters.value[scope.shownFiltersType].forEach((filter) => {
			const filterOpts = filter.options || {}

			let filterData = {
				id: filter.key,
				isActive: filterOpts.enabled,
			}

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

			scope.filtersChips.push(filterData)
		})

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

	function addFilter($event) {
		// const shownFilters = scope.showFrontFilters ? filters.valuefrontend : filters.valuebackend;

		gFiltersVm
			.openAddFilterDialog($event, filters[scope.shownFiltersType])
			.then((res) => {
				if (res.status === 'agree') {
					for (var i = 0; i < res.data.items.length; i = i + 1) {
						filters[scope.shownFiltersType].push(res.data.items[i])
					}

					console.log('filters addFilter', filters)

					evDataService.setFilters(filters)
					evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)

					scope.$apply()
				}
			})
	}

	function removeFilter(filtersToRemove) {
		filters[scope.shownFiltersType] = filters[scope.shownFiltersType].filter(
			(filter) => {
				return filtersToRemove.find((item) => item.id !== filter.key)
			}
		)

		evDataService.setFilters(filters)

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

	scope.toggleSplitPanel = gFiltersVm.toggleSplitPanel

	scope.exportAsCSV = gFiltersVm.exportAsCSV
	scope.exportAsExcel = gFiltersVm.exportAsExcel
	scope.copyReport = gFiltersVm.copyReport
	scope.copySelectedToBuffer = gFiltersVm.copySelectedToBuffer

	scope.openViewConstructor = gFiltersVm.openViewConstructor

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
			function () {
				gFiltersVm.calculateFilterChipsContainerWidth(
					gFiltersLeftPartWidth,
					gFiltersRightPartWidth,
					filtersChipsContainer
				)
			}
		)

		evEventService.addEventListener(evEvents.FILTERS_CHANGE, function () {
			filters = evDataService.getFilters()

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
			viewContext !== 'reconciliation_viewer' &&
			filters.value.frontend.length
		)
			scope.thereAreFrontendFilters = true

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
