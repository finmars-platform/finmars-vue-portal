<template>
	<div
		class="fm_container ev_toolbar g-filters-holder"
		:style="{}"
		:class="{
			'hide-ev-front-filters':
				!scope.isReport &&
				scope.thereAreFrontendFilters &&
				scope.shownFiltersType === 'frontend',
		}"
	>
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
							v-tooltip="'Add'"
						/>
					</template>

					<template #default="{ close }">
						<div class="fm_list" @click="close()">
							<div
								v-for="item in scope.addMenu.data.menu.root.items"
								class="fm_list_item"
								@click="scope.dispatchAddMenuAction($event, item)"
							>
								{{ item.name }}
							</div>
						</div>
					</template>
				</FmMenu>

				<FmIcon
					btn
					icon="link"
					color="primary"
					class="g-toggle-filters-btn md-icon-button chain-button"
					:class="{
						'g-use-from-above-filters-hidden': !scope.showUseFromAboveFilters,
					}"
					style="margin-left: 10px"
					@click="scope.toggleUseFromAboveFilters()"
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
					v-tooltip="'ADD ' + evGetEntityNameByState()"
					@click="evAddEntity"
				/>

				<!-- <md-menu v-if="scope.entityType == 'instrument'">
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
				</md-menu> -->

				<FmMenu v-if="scope.entityType == 'instrument'">
					<template #btn>
						<FmIcon
							class="add_ev_btn"
							btnPrimary
							icon="add"
							@click="$mdOpenMenu($event)"
							v-tooltip="'ADD ' + evGetEntityNameByState()"
						/>
					</template>

					<template #default="{ close }">
						<div class="fm_list" @click="close()">
							<div class="fm_list_item" @click="evAddEntity($event)">
								Add Blank
							</div>
							<div
								class="fm_list_item"
								@click="openTransactionTypeDialog($event)"
							>
								Add Typical
							</div>
							<div class="fm_list_item" @click="openSimpleImportDialog($event)">
								Import from File
							</div>
							<div class="fm_list_item" @click="addFromProvider($event)">
								Get From Provider
							</div>
						</div>
					</template>
				</FmMenu>

				<!-- <md-menu v-if="scope.entityType == 'instrument-type'">
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
				</md-menu> -->

				<FmMenu v-if="scope.entityType == 'instrument-type'">
					<template #btn>
						<FmIcon
							class="add_ev_btn"
							btnPrimary
							icon="add"
							@click="$mdOpenMenu($event)"
							v-tooltip="'ADD ' + evGetEntityNameByState()"
						/>
					</template>

					<template #default="{ close }">
						<div class="fm_list" @click="close()">
							<div class="fm_list_item" @click="evAddEntity($event)">
								Add Blank
							</div>
							<div
								class="fm_list_item"
								@click="openTransactionTypeDialog($event)"
							>
								Select from List
							</div>
						</div>
					</template>
				</FmMenu>
				<!-- <md-menu v-if="scope.entityType == 'account-type'">
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
				</md-menu> -->
				<FmMenu v-if="scope.entityType == 'account-type'">
					<template #btn>
						<FmIcon
							class="add_ev_btn"
							btnPrimary
							icon="add"
							@click="$mdOpenMenu($event)"
							v-tooltip="'ADD ' + evGetEntityNameByState()"
						/>
					</template>

					<template #default="{ close }">
						<div class="fm_list" @click="close()">
							<div class="fm_list_item" @click="evAddEntity($event)">
								Add Blank
							</div>
							<div
								class="fm_list_item md-raised"
								package-manager-button
								content-type="'accounts.accounttype'"
							>
								Select from List
							</div>
						</div>
					</template>
				</FmMenu>
				<!-- <md-menu v-if="scope.entityType == 'transaction-type'">
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
				</md-menu> -->

				<FmMenu v-if="scope.entityType == 'transaction-type'">
					<template #btn>
						<FmIcon
							class="add_ev_btn"
							btnPrimary
							icon="add"
							@click="$mdOpenMenu($event)"
							v-tooltip="'ADD ' + evGetEntityNameByState()"
						/>
					</template>

					<template #default="{ close }">
						<div class="fm_list" @click="close()">
							<div class="fm_list_item" @click="evAddEntity($event)">
								Add Blank
							</div>
							<div
								class="fm_list_item md-raised"
								package-manager-button
								content-type="'transactions.transactiontype'"
							>
								Select from List
							</div>
						</div>
					</template>
				</FmMenu>

				<!-- <md-button
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
				</md-button> -->
				<FmBtn
					v-if="scope.thereAreFrontendFilters"
					type="text"
					class="g-toggle-filters-btn"
					@click="toggleFiltersToShow()"
				>
					<span
						v-show="scope.shownFiltersType == 'frontend'"
						class="material-icons"
						>laptop_mac</span
					>
					<span
						v-show="scope.shownFiltersType == 'backend'"
						class="material-icons"
						>dns</span
					>
				</FmBtn>
			</template>
		</div>
		<!--СustomPopupDirective.vue-->
		<div class="gFiltersContainer flex aic fww">
			<!-- <rv-filter
               on-cancel="cancel()"
               on-save="save()"> -->

			<AngularFmGridTableRvFilterPopup
				v-if="scope.popupData.filterKey"
				:filterKey="scope.popupData.filterKey"
				:popupEventService="scope.popupEventService"
				:popupData="scope.popupData"
				:vm="vm"
				:gFiltersHelper="scope.gFiltersHelper"
				@close="scope.popupData.filterKey = null"
			/>

			<FmChips
				v-if="scope.readyStatus.filters"
				class="g-filter-chips"
				:items="scope.filtersChips"
				canDelete
				@chipClick="scope.onFilterChipClick($event)"
				@delete="scope.removeFilter($event)"
			>
				<FmBtn type="action" @click="scope.addFilter" style="margin: 2px 0"
					>ADD FILTER</FmBtn
				>
			</FmChips>
		</div>

		<div class="flex aic gFiltersRightPart">
			<FmIcon
				icon="refresh"
				@click="scope.refreshTable()"
				v-tooltip="'Refresh Database Filters'"
				btn
			/>

			<FmMenu v-if="scope.isRootEntityViewer">
				<template #btn>
					<FmIcon btn icon="view_stream" v-tooltip="'Split'" />
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

			<FmMenu v-if="scope.isRootEntityViewer && scope.isReport">
				<template #btn>
					<FmIcon btn icon="view_module" v-tooltip="'Matrix'" />
				</template>

				<template #default="{ close }">
					<div class="fm_list" @click="close()">
						<div class="fm_list_item" @click="scope.toggleMatrix">
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
					<FmIcon btn icon="upgrade" v-tooltip="'Export'" />
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
							Copy selected to buffer
						</div>
					</div>
				</template>
			</FmMenu>

			<FmMenu>
				<template #btn>
					<FmIcon btn icon="more_vert" v-tooltip="'More'" />
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

<!--						<div
							class="fm_list_item"
							v-if="scope.isReport"
							@click="toggleAutoRefresh"
						>
							<span v-if="scope.rvAutoRefresh">Disable Auto Refresh</span>
							<span v-if="!scope.rvAutoRefresh">Enable Auto Refresh</span>
						</div>-->

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
		</div>


	</div>
</template>

<script setup>
	import gFiltersHelperInst from '~~/src/angular/helpers/gFiltersHelper'
	import uiService from '~~/src/angular/services/uiService'
	import evEvents from '@/angular/services/entityViewerEvents'
	// import EventService from '@/angular/services/eventService';

	const props = defineProps(['vm'])

	const { evEventService, evDataService, attributeDataService } =
		inject('fmTableData')
	const $mdDialog = inject('$mdDialog')

	let gFiltersHelper = new gFiltersHelperInst()

	// link: function (attrs) {

	const elem = ref(null)

	let scope = reactive({ ...props })
	scope.entityType = scope.vm.entityType
	scope.readyStatus = reactive({
		filters: false,
	})
	scope.processing = false;
	scope.gFiltersHelper = gFiltersHelper

	const filters = ref(evDataService.getFilters())
	let useFromAboveFilters = []
	let gFiltersLeftPartWidth
	let gFiltersRightPartWidth
	let filtersChipsContainer
	let customFields

	let reportOptionsRef = ref( evDataService.getReportOptions() );
	let renderTimeRef = ref(null);

	const refreshBtnTooltipComp = computed(() => {

		let tooltipHtmlStart = "";

		if (scope.isReport && reportOptionsRef.value.auth_time) {

			tooltipHtmlStart =
				`<div>
					Auth Time: ${reportOptionsRef.value.auth_time}s</br>
          Execution Time: ${reportOptionsRef.value.execution_time}s</br>
          Relation Prefetch Time: ${reportOptionsRef.value.relation_prefetch_time}s</br>
          Serialization Time: ${reportOptionsRef.value.serialization_time}s</br>
          Render Time: ${renderTimeRef.value}s</br>
          Rows downloaded: ${reportOptionsRef.value.items.length}</br>
         </div>`;

		}

		return `${tooltipHtmlStart}<div>Refresh Database Filters</div>`;

	});

	onMounted(() => {
		elem.value = document.querySelector('.ev_toolbar.g-filters-holder')

		/*scope.rvAutoRefresh = evDataService.getAutoRefreshState()

		if (scope.rvAutoRefresh === null || scope.rvAutoRefresh === undefined) {
			//if we missed initial state for already existing layout
			scope.rvAutoRefresh = true
		}*/

		scope.filterPopupTemplate =
			'views/popups/groupTable/filters/rv-filter-popup-view.html'

		scope.popupPosX = scope.vm.popupPosX
		scope.popupPosY = scope.vm.popupPosY
		/*scope.fpBackClasses = scope.vm.fpBackClasses;
		scope.fpClasses = scope.vm.fpClasses;*/

		gFiltersLeftPartWidth =
			elem.value.querySelector('.gFiltersLeftPart').clientWidth
		gFiltersRightPartWidth =
			elem.value.querySelector('.gFiltersRightPart').clientWidth

		filtersChipsContainer = elem.value.querySelector('.gFiltersContainer')

		customFields = attributeDataService.getCustomFieldsByEntityType(
			scope.entityType
		)

		init()
	})

	scope.isReport = true
	scope.isRootEntityViewer = evDataService.isRootEntityViewer()
	scope.showUseFromAboveFilters = !scope.hideUseFromAboveFilters

	const hideUseFromAboveFilters = scope.vm.hideUseFromAboveFilters

	if (hideUseFromAboveFilters) {
		scope.showUseFromAboveFilters = false
	} else {
		scope.showUseFromAboveFilters = !scope.isRootEntityViewer // show use from above filters by default inside split panel
	}

	/* scope.calculateReport = function () {
			evEventService.dispatchEvent(evEvents.REQUEST_REPORT);
		}; */
	scope.refreshTable = function () {

		scope.processing = true; // will be changed to false by evEvents.DATA_LOAD_END
		evDataService.resetTableContent(true);

		const reportOptions = evDataService.getReportOptions()

		if (reportOptions) {

			reportOptions.report_instance_id = null // if clear report_instance_id then we request new Report Calculation
			evDataService.setReportOptions(reportOptions);

			evEventService.dispatchEvent(evEvents.REPORT_OPTIONS_CHANGE);

		}

		evEventService.dispatchEvent(evEvents.REQUEST_REPORT)
	}

	//region Chips
	scope.onFilterChipClick = (chipsData) => {
		scope.popupData.filterKey = chipsData.data.id
		scope.popupData.elem = chipsData.event.currentTarget
	}

	scope.filterSettingsChange = function () {
		evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)

		evDataService.resetTableContent(true)

		evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
	}

	scope.toggleUseFromAboveFilters = function () {
		scope.showUseFromAboveFilters = !scope.showUseFromAboveFilters
		console.log('scope.showUseFromAboveFilters:', scope.showUseFromAboveFilters)
		evEventService.dispatchEvent(evEvents.TOGGLE_SHOW_FROM_ABOVE_FILTERS)
		formatFiltersForChips()

		setTimeout(() => {
			const filterAreaHeightChanged = scope.vm.updateFilterAreaHeight()

			if (filterAreaHeightChanged) {
				evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)
			}
		}, 0)
	}

	/* const getUseFromAboveFilters = function () {

			useFromAboveFilters = filters.filter((filter, index) => {

				if (filter.options && filter.options.use_from_above && Object.keys(filter.options.use_from_above).length) {

					filter.filtersListIndex = index;
					return true;

				}

				return false;

			});

		}; */

	const formatFiltersForChips = function () {
		scope.filtersChips = []
		const errors = []

		filters.value.forEach((filter) => {
			if (filter.type !== 'filter_link') {
				// don't show filter from dashboard component

				const filterOpts = filter.options || {}
				/* let filterVal = filterOpts.filter_values || "";

					if (filterOpts.filter_type === 'from_to') {

						filterVal = `From ${filterOpts.filter_values.min_value} to ${filterOpts.filter_values.max_value}`;

					} else if (filterOpts.filter_type === 'out_of_range' ) {

						filterVal = `Out of range from ${filterOpts.filter_values.min_value} to ${filterOpts.filter_values.max_value}`;

					} */

				// hide use from above filters if needed
				if (
					scope.showUseFromAboveFilters ||
					!filterOpts.use_from_above ||
					!Object.keys(filterOpts.use_from_above).length
				) {
					let filterData = {
						id: filter.key,
						isActive: filterOpts.enabled,
					}

					const filterName = filter.layout_name
						? filter.layout_name
						: filter.name

					let chipText = scope.vm.getChipTextElem(
						filterName,
						filterOpts.filter_values,
						filterOpts.filter_type
					)

					if (
						filterOpts.use_from_above &&
						Object.keys(filterOpts.use_from_above).length
					) {
						filterData.classes = 'use-from-above-filter-chip'
						filterData.tooltipContent = chipText

						chipText = '<span class="material-icons">link</span>' + chipText
					}

					filterData.text = chipText

					/*
						if (filter.key.startsWith('custom_fields')) {
							const customField = customFields.find( field => filter.key === `custom_fields.${field.user_code}`)
							if (!customField) {

								filter.options.enabled = false;
								const description = `The ${filter.groups ? 'group' : 'column'} does not exist in the Configuration`

								filterData.error_data = {
									code: 10,
									description: description
								}

								const error = {
									key: filter.key,
									description: description
								}

								errors.push(error)

							}

						}
						*/
					if (filter.key.startsWith('custom_fields')) {
						let error
						;[filter, filterData, error] =
							scope.vm.checkCustomFieldFilterForError(
								filter,
								filterData,
								customFields
							)
						if (error) errors.push(error)
					}

					scope.filtersChips.push(filterData)
				}
			}
		})

		if (errors.length) scope.vm.updateMissingCustomFieldsList(errors)

		scope.vm.updateFilterAreaHeight()
	}

	scope.onChipsFirstRender = scope.vm.onChipsFirstRender

	scope.addFilter = function ($event) {
		scope.vm.openAddFilterDialog($event, filters.value).then((res) => {
			if (res.status === 'agree') {
				for (var i = 0; i < res.data.items.length; i = i + 1) {
					filters.value.push(res.data.items[i])
				}

				evDataService.setFilters(filters.value)
				evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)
			}
		})
	}

	scope.removeFilter = function (filtersToRemove) {
		filters.value = filters.value.filter((filter) => {
			return filtersToRemove.find((item) => item.id !== filter.key)
		})

		evDataService.setFilters(filters.value)

		evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)
		evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
	}
	//endregion

	scope.toggleSplitPanel = scope.vm.toggleSplitPanel

	scope.toggleMatrix = function ($event) {
		var viewType = evDataService.getViewType()
		var newViewType

		if (viewType === 'matrix') {
			newViewType = 'report_viewer'
		} else {
			newViewType = 'matrix'
		}

		if (newViewType === 'matrix') {
			var settings = evDataService.getViewSettings(newViewType)

			$mdDialog
				.show({
					controller: 'ReportViewerMatrixSettingsDialogController as vm',
					locals: {
						data: {
							settings: settings,
						},
					},
				})
				.then(function (res) {
					if (res.status === 'agree') {
						settings = res.data.settings

						evDataService.setViewType(newViewType)
						evDataService.setViewSettings(newViewType, settings)

						evEventService.dispatchEvent(evEvents.VIEW_TYPE_CHANGED)
					}
				})
		} else {
			evDataService.setViewType(newViewType)
			evDataService.setViewSettings(newViewType, {})

			evEventService.dispatchEvent(evEvents.VIEW_TYPE_CHANGED)
		}
	}

	scope.exportAsPdf = function ($event) {
		$mdDialog.show({
			controller: 'ExportPdfDialogController as vm',
			templateUrl: 'views/dialogs/export-pdf-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			locals: {
				evDataService: evDataService,
				evEventService: evEventService,
				data: { entityType: scope.entityType },
			},
		})
	}

	scope.exportAsCSV = scope.vm.exportAsCSV
	scope.exportAsExcel = scope.vm.exportAsExcel
	scope.copyReport = scope.vm.copyReport
	scope.copySelectedToBuffer = scope.vm.copySelectedToBuffer

	scope.openViewConstructor = scope.vm.openViewConstructor

	scope.openCustomFieldsManager = function ($event) {
		$mdDialog.show({
			controller: 'CustomFieldDialogController as vm',
			templateUrl: 'views/dialogs/custom-field/custom-field-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			clickOutsideToClose: false,
			preserveScope: true,
			multiple: true,
			locals: {
				attributeDataService: attributeDataService,
				entityViewerEventService: evEventService,
				data: {
					entityType: scope.vm.entityType,
				},
			},
		})
	}

	/*scope.toggleAutoRefresh = function () {
		scope.rvAutoRefresh = !scope.rvAutoRefresh

		evDataService.setAutoRefreshState(scope.rvAutoRefresh)
	}*/

	scope.addMenu = {
		data: {
			menu: {
				root: {
					items: [
						{
							action: 'book_transaction',
							name: 'Book Transaction',
							order: 0,
						},
						{
							action: 'add_portfolio',
							name: 'Add Portfolio',
							order: 1,
						},
						{
							action: 'add_account',
							name: 'Add Account',
							order: 2,
						},
						{
							action: 'add_currency',
							name: 'Add Currency',
							order: 3,
						},
						{
							action: 'add_instrument',
							name: 'Add Instrument',
							order: 4,
						},
					],
				},
			},
		},
	}

	const getAddMenuLayout = function () {
		uiService
			.getContextMenuLayoutList({
				filters: {
					type: 'report_menu_add_entities',
				},
			})
			.then(function (data) {
				if (data.results.length) {
					scope.addMenu = data.results[0]
				}

				// scope.$apply()
			})
	}

	scope.dispatchAddMenuAction = function ($event, item) {
		evDataService.setUserRequestedAction(item.action)

		evEventService.dispatchEvent(evEvents.USER_REQUEST_AN_ACTION)
	}

	const initEventListeners = function () {
		// placed here because formatFiltersForChips() should be called only after customFields update
		evEventService.addEventListener(
			evEvents.DYNAMIC_ATTRIBUTES_CHANGE,
			function () {
				customFields = attributeDataService.getCustomFieldsByEntityType(
					scope.entityType
				)
				formatFiltersForChips()
			}
		)

		evEventService.addEventListener(
			evEvents.TABLE_SIZES_CALCULATED,
			function () {
				scope.vm.calculateFilterChipsContainerWidth(
					gFiltersLeftPartWidth,
					gFiltersRightPartWidth,
					filtersChipsContainer
				)
			}
		)

		evEventService.addEventListener(evEvents.FILTERS_CHANGE, function () {
			filters.value = evDataService.getFilters()

			let toOpenPopup = filters.value.findIndex((o) => o.__onceOpenSettings)

			if (toOpenPopup != -1) {
				delete filters.value[toOpenPopup].__onceOpenSettings
				evDataService.setFilters(filters.value)

				scope.popupData.filterKey = filters.value[toOpenPopup].key
			}

			// getUseFromAboveFilters();
			useFromAboveFilters = gFiltersHelper.filterUseFromAboveFilters(
				filters.value
			)

			formatFiltersForChips()

			const filterAreaHeightChanged = scope.vm.updateFilterAreaHeight()

			if (filterAreaHeightChanged) {
				evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)
			}
		})

		evEventService.addEventListener(
			evEvents.ACTIVE_OBJECT_FROM_ABOVE_CHANGE,
			function () {
				if (useFromAboveFilters.length) {
					// UPDATE_TABLE or REQUEST_REPORT dispatched inside gFiltersHelper.insertActiveObjectDataIntoFilters()
					const filtersChangedFromAbove =
						gFiltersHelper.insertActiveObjectDataIntoFilters(
							evDataService,
							evEventService
						)
					if (filtersChangedFromAbove) formatFiltersForChips()
				}
			}
		)

		evEventService.addEventListener(
			evEvents.CLEAR_USE_FROM_ABOVE_FILTERS,
			function () {
				if (useFromAboveFilters.length) {
					useFromAboveFilters.forEach((ufaFilter) => {
						filters[ufaFilter.filtersListIndex].options.filter_values = []
					})

					evDataService.setFilters(filters)

					evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)

					evDataService.resetTableContent(true)

					evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
				}
			}
		)

		evEventService.addEventListener(evEvents.ADDITIONS_CHANGE, function () {
			scope.currentAdditions = evDataService.getAdditions()
		})

		evEventService.addEventListener(evEvents.DATA_LOAD_START, function () {
			scope.processing = true;
		})

		evEventService.addEventListener(evEvents.DATA_LOAD_END, function () {
			reportOptionsRef.value = evDataService.getReportOptions(); // for refresh tooltip -> auth time
			scope.processing = false;
		})

		evEventService.addEventListener(evEvents.FINISH_RENDER, function () {
			renderTimeRef.value = evDataService.getRenderTime(); // for refresh tooltip -> auth time
		})

		evEventService.addEventListener(evEvents.REPORT_OPTIONS_CHANGE, function () {
			reportOptionsRef.value = evDataService.getReportOptions();
		})

	}

	scope.popupData = scope.vm.popupData
	scope.popupEventService = scope.vm.popupEventService

	function init() {
		scope.currentAdditions = evDataService.getAdditions()

		scope.chipsListEventService = scope.vm.chipsListEventService

		getAddMenuLayout()

		useFromAboveFilters = gFiltersHelper.filterUseFromAboveFilters(
			filters.value
		)
		formatFiltersForChips()

		scope.readyStatus.filters = true

		scope.vm.updateFilterAreaHeightOnInit()

		initEventListeners()
	}
</script>

<style lang="scss" scoped>
	.ev_toolbar {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 6px;
		align-items: flex-start;
		justify-content: space-between;
		background: var(--base-backgroundColor);
		padding-top: 10px;
		padding-bottom: 10px;
		border-bottom: 1px solid $border;
	}
	.g-use-from-above-filters-hidden {
		color: var(--primary-color);
	}
</style>
