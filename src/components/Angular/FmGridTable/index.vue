<template>

	<div
		v-if="!possibleToRequestReportRef"
	>

		<h1 class="text-center m-t-20 m-b-20 text-bold">Warning</h1>
		<p class="text-center m-t-16 m-b-16">

			We've noticed that you've opened <b>{{ openGroupsCountRef }}</b> groups since your last session. This
			might result in slower loading times. Do you wish to continue?

		</p>

		<div class="flex-row flex-center">

			<FmBtn
				type="outlined"
				class="m-8"
				@click="resetUnfoldedGroups()"
				v-fm-tooltip="'Close all previously opened groups. All other settings will remain'"
			>START NEW
			</FmBtn>

			<FmBtn
				type="outlined"
				class="m-8"
				@click="continueReportGeneration()"
				v-fm-tooltip="'Loading Report could take time.'"
			>RESTORE SESSION
			</FmBtn>

		</div>

	</div>

	<div
		v-if="possibleToRequestReportRef"
		class="g-wrapper position-relative"
		:class="getWrapperClasses()"
		:ref="(el) => (elem = jquery(el))"
		v-bind="$attrs"
	>
		<div
			class="g-recon verticalSplitPanelWrapper"
			v-if="isRootEntityViewerRef && verticalAdditions.isOpen && domElemsAreReady"
		>

			<div class="g-width-slider"></div>

			<div
				class="g-additions-workarea"
				v-if="verticalAdditions.type === 'reconciliation'"
			>
				<!--				VerticalSplitPanel.vue  ready-->
				<!-- </g-vertical-split-panel-report-binder> -->
				<!-- gSplitDerictiv -->
				<!-- <g-vertical-split-panel-report-binder
						ev-data-service="evDataService"
						ev-event-service="evEventService"
						sp-exchange-service="spExchangeService"
						root-wrap-elem.value="rootWrapElem"
						class="display-block height-100"
					/> -->

				<div class="split-panel-controller-container"></div>
				<div class="report-viewer-holder">
					<div class="height-100">
						<div
							v-if="vm.readyStatus.attributes && vm.readyStatus.layout"
							class="g-group-table-holder"
						>

						</div>
						<div v-if="!vm.readyStatus.attributes || !vm.readyStatus.layout">
							<div
								class="e-data-loader"
								layout="row"
								layout-sm="column"
								layout-align="space-around"
							>
								<!-- <progress-circular diameter="100"></progress-circular> -->
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div
			class="g-workarea-wrap g-workarea main-area"
			:class="{
				'g-content-wrap-right': verticalAdditions.isOpen,
				wrap_dashboard: viewContext == 'dashboard',
			}"
			v-if="domElemsAreReady"
			ev-data-service="evDataService"
			ev-event-service="evEventService"
		>
			<AngularFmGridTableTopPart
				v-if="components.topPart"
				:attributeDataService="attributeDataService"
				:evDataService="evDataService"
				:evEventService="evEventService"
				:spExchangeService="spExchangeService"
				:vm="vm"
			/>

<!--			<AngularFmGridTableFiltersArea
				v-show="components.filterArea"
				:attributeDataService="attributeDataService"
				:hideFiltersBlock="hideFiltersBlock"
				:hideUseFromAboveFilters="hideUseFromAboveFilters"
				:vm="vm"
			/>-->
            <FmTableToolbar />

			<div v-if="domElemsAreReady" class="g-table-section flex-row">
				<AngularFmGridTableLeftPanel
					v-if="!isReport"
					:attributeDataService="attributeDataService"
					:evDataService="evDataService"
					:evEventService="evEventService"
					:spExchangeService="spExchangeService"
					:contentWrapElement="contentWrapElem"
				/>
				<div class="g-table-container">
					<div class="g-table-wrap">
						<div class="g-column-area-wrap">
							<div v-if="components.columnArea && viewType != 'matrix'">
								<AngularFmGridTableColumns
									v-if="contentWrapElem"
									:evDataService="evDataService"
									:evEventService="evEventService"
									:attributeDataService="attributeDataService"
									:contentWrapElement="contentWrapElem"
									:vm="vm"
								/>
							</div>
						</div>
						<!-- :class="{
											'g-font-size-small':
												reportOptions.table_font_size === 'small',
											'g-font-size-medium':
												reportOptions.table_font_size === 'medium',
											'g-font-size-large':
												reportOptions.table_font_size === 'large',
										}" -->
						<AngularFmGridTableBody
							v-if="viewType == 'report_viewer' && workareaWrapElem"
							:workareaWrapElement="workareaWrapElem"
							:contentWrapElement="contentWrapElem"
							:rootWrapElement="rootWrapElem"
						/>

						<!--				ViewerMatrixDirectiv.vue  ready-->
						<!-- <report-viewer-matrix NEED RELOC
											v-if="viewType == 'matrix'"
											class="height-100 display-block matrix-inside-report-builder"
											style="height: 600px"
											matrix-settings="viewSettings"
											ev-data-service="evDataService"
											ev-event-service="evEventService"
										></report-viewer-matrix> -->

						<AngularFmGridTableRvAreasDnd
							v-if="isReport && contentWrapElem"
							:contentWrapElement="contentWrapElem"
							:evDataService="evDataService"
							:evEventService="evEventService"
						/>

						<AngularFmGridTableAreasDnd
							v-if="!isReport && contentWrapElem"
							:contentWrapElement="contentWrapElem"
						/>
					</div>
				</div>
			</div>
		</div>

		<div class="g-additions" v-if="isRootEntityViewerRef && additions?.isOpen">
			<div v-if="domElemsAreReady">
				<div
					data-g-height-aligner
					data-ev-data-service="evDataService"
					data-ev-event-service="evEventService"
					data-root-wrap-elem.value="rootWrapElem"
					data-content-wrap-elem.value="contentWrapElem"
				></div>
			</div>

			<div class="g-height-slider"></div>

			<div class="g-additions-workarea" v-if="additions.type === 'editor'">
				<div class="height-100">
					<!--				EditorBinder.vue  ready-->
					<!-- <group-editor-binder  NEED RELOC
							ev-data-service="evDataService"
							ev-event-service="evEventService"
						></group-editor-binder> -->
				</div>
			</div>

			<div
				class="g-additions-workarea"
				v-if="additions.type === 'permission-editor'"
			>
				<!--				PermissionEditorBinder.vue ready-->
				<!-- <group-permission-editor-binder  NEED RELOC
						class="display-block height-100"
						ev-data-service="evDataService"
						ev-event-service="evEventService"
						sp-exchange-service="spExchangeService"
					></group-permission-editor-binder> -->
			</div>

			<div
				class="g-additions-workarea"
				v-if="
					additions.type === 'balance-report' ||
					additions.type === 'pl-report' ||
					additions.type === 'transaction-report'
				"
			>
				<!--				SplitPanelReportBinder   ready-->
				<!-- <group-split-panel-report-binder  NEED RELOC
						ev-data-service="evDataService"
						ev-event-service="evEventService"
						sp-exchange-service="spExchangeService"
					></group-split-panel-report-binder> -->
			</div>

			<div
				class="g-additions-workarea"
				v-if="additions.type === 'reconciliation_match_editor'"
			>
				<!--				ReconciliationMatchEditorBinder.vue -->
				<!-- <group-reconciliation-match-editor-binder NEED RELOC
						class="display-block height-100"
						ev-data-service="evDataService"
						ev-event-service="evEventService"
						sp-exchange-service="spExchangeService"
					></group-reconciliation-match-editor-binder> -->
			</div>
		</div>
	</div>

	<BaseModal
		v-if="$mdDialog.modals['WarningDialogController']"
		:modelValue="true"
		:title="
			`${
				$mdDialog.modals['WarningDialogController'].warning.title ||
				'Warning'
			}`
		"
		@close="
				() => {
					$mdDialog.modals['WarningDialogController'].resolve({})
					delete $mdDialog.modals['WarningDialogController']
				}
			"
	>

		<div class="warning-text">
			<div v-html="$mdDialog.modals['WarningDialogController'].warning.description"></div>
		</div>

		<template #controls>
			<div
				v-if="$mdDialog.modals['WarningDialogController'].warning.actionsButtons"
				class="flex sb">

				<FmBtn
					v-for="btnData in $mdDialog.modals['WarningDialogController'].warning.actionsButtons"
					type="text"
					@click="
							() => {
								$mdDialog.modals['WarningDialogController'].resolve( btnData.response )
								delete $mdDialog.modals['WarningDialogController']
							}
						"
				>
					{{ btnData.name }}
				</FmBtn>

			</div>

			<div v-else class="flex sb">

				<FmBtn
					type="text"
					@click="
							() => {
								$mdDialog.modals['WarningDialogController'].resolve({})
								delete $mdDialog.modals['WarningDialogController']
							}
						"
				>cancel
				</FmBtn>

				<FmBtn
					@click="
							() => {
								$mdDialog.modals['WarningDialogController'].resolve({
									status: 'agree',
								})
								delete $mdDialog.modals['WarningDialogController']
							}
						"
				>save
				</FmBtn>

			</div>

		</template>
	</BaseModal>

</template>

<script setup>

	import evEvents from '@/angular/services/entityViewerEvents'
	import metaService from '@/angular/services/metaService'
	import rvDataHelper from '@/angular/helpers/rv-data.helper'
	import localStorageService from '@/angular/shell/scripts/app/services/localStorageService'
	import jquery from 'jquery'

	const props = defineProps([
		'evEventService',
		'evDataService',
		'attributeDataService',
		'components',
		'vm',
	])

	const {attributeDataService, evEventService, evDataService} = props
	// fmTableData
	provide('fmTableData', {
		evEventService,
		evDataService,
		attributeDataService,
	})

	let $mdDialog = inject('$mdDialog');

	let scope = {
		spExchangeService: '=',
		hideFiltersBlock: '=',
		hideUseFromAboveFilters: '=',
	}

	let elem = ref(null)

	let additions = evDataService.getAdditions()
	let verticalAdditions = evDataService.getVerticalAdditions()

	const components = reactive(props.components || evDataService.getComponents())

	let entityType = evDataService.getEntityType()
	let activeObject = evDataService.getActiveObject()
	let isReport = evDataService.isEntityReport()

	let viewType = ref(evDataService.getViewType())
	let viewSettings = evDataService.getViewSettings(viewType.value)
	let readyToRenderTable = ref(false)

	let reportOptions = evDataService.getReportOptions()
	var interfaceLayout = evDataService.getInterfaceLayout()
	var viewContext = ref(evDataService.getViewContext())
	var contentType = evDataService.getContentType()
	var activeLayoutConfigIsSet = false

	let isInsideDashboard = false;
	let isRecon = false;

	let possibleToRequestReportRef = ref(true);
	let openGroupsCountRef = ref(0);

	/* *
	 * TODO: rework this inside vue
	 * IMPORTANT, variable domElemsAreReady blocks child component rendering
	 * because child components require some elements that render in this component
	 * we need to query from DOM rootWrapElem, contentWrapElem, workareaWrapElem
	 * Here how it looks like in 2 steps:
	 * 1) template create .g-wrapper, .g-content-wrap, .g-workarea-wrap' and we query them here
	 * 2) then we set domElemsAreReady to true, and components children start rendering and we pass queried elements to them
	 * */
	let domElemsAreReady = ref(true)

	let contentWrapElem = ref(null)
	let workareaWrapElem = ref(null)
	let rootWrapElem = ref(null)

	let isRootEntityViewerRef = ref(true);

	async function renderTemplate() {

		domElemsAreReady.value = true

		await nextTick()

		contentWrapElem.value = elem.value[0].querySelector('.g-workarea-wrap')
		workareaWrapElem.value = elem.value[0].querySelector('.g-workarea-wrap')
		rootWrapElem.value = document.querySelector('.g-wrapper.g-root-wrapper') // we are looking for parent

		if (isRootEntityViewerRef.value) {
			// we took a local root wrapper = .g-wrapper
			// because there is an issue with ng-class, we can't set 'g-root-wrapper' before querying it from DOM

			rootWrapElem.value = elem.value[0]

		} else {

			// if this component inside split panel, set .g-content-wrap height
			var splitPanelHeight = elem.value.parents('.g-additions').height()
			contentWrapElem.value.style.height = splitPanelHeight + 'px'

		}

	}

	function checkForGroupsFolding() {

		let localStorageReportData = localStorageService.getReportData();

		const layout = evDataService.getListLayout();

		possibleToRequestReportRef.value = true // in case if user open too many groups, then we need to ask him if his ready

		if (localStorageReportData) {

			if (localStorageReportData[contentType]) {

				if (localStorageReportData[contentType][layout.user_code]) {

					if (localStorageReportData[contentType][layout.user_code].hasOwnProperty('groups')) {

						openGroupsCountRef.value = 0;

						Object.keys(localStorageReportData[contentType][layout.user_code].groups).forEach(function (key) {

							var _group = localStorageReportData[contentType][layout.user_code].groups[key]

							if (_group.is_open) {
								openGroupsCountRef.value = openGroupsCountRef.value + 1;
							}

						})

						if (openGroupsCountRef.value > 10) {
							possibleToRequestReportRef.value = false;
						}

					}

				}
			}

		}

		/* *
		 * Because full transaction report takes a long time to calculate,
		 * calculation does not start until active object from above changes
		 * and filters are applied
		 * */
		let notSpWithTransactionReport =
			viewContext !== 'split_panel' ||
			entityType !== 'transaction-report';

		if (possibleToRequestReportRef.value && notSpWithTransactionReport) {

			rvDataProviderService.createDataStructure(evDataService, evEventService);

		}

	}

	var applyGroupsFoldingFromLocalStorage = function () {

		var listLayout = evDataService.getListLayout();
		var reportData = localStorageService.getReportDataForLayout(contentType, listLayout.user_code);

		if (reportData.groupsList && reportData.groupsList.length) {

			var groups = evDataService.getGroups()

			reportData.groupsList.forEach((groupObj) => {

				var group = groups.find((group) => group.key === groupObj.key)

				if (group) {

					if (!group.report_settings) group.report_settings = {}

					group.report_settings.is_level_folded = groupObj.report_settings.is_level_folded

				}

			})

			evDataService.setGroups(groups)

			rvDataHelper.markHiddenColumnsBasedOnFoldedGroups(evDataService)

		}

	}

	function initEventListeners() {

		evEventService.addEventListener(evEvents.ADDITIONS_CHANGE, function () {

			let additions = evDataService.getAdditions()
			let activeObject = evDataService.getActiveObject()

		})

		evEventService.addEventListener(evEvents.VERTICAL_ADDITIONS_CHANGE, function () {

			let verticalAdditions = evDataService.getVerticalAdditions()

			if (!verticalAdditions || !verticalAdditions.isOpen) {

				setTimeout(function () {
					// wait for angular to remove vertical split panel

					// delete evEventService.dispatchEvent(evEvents.UPDATE_ENTITY_VIEWER_CONTENT_WRAP_SIZE);
					evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)
				}, 200)

			}

		})

		evEventService.addEventListener(evEvents.ACTIVE_OBJECT_CHANGE, function () {
			let activeObject = evDataService.getActiveObject()
		})

		evEventService.addEventListener(evEvents.FILTERS_RENDERED, function () {
			readyToRenderTable.value = true
		})

		evEventService.addEventListener(evEvents.DATA_LOAD_END, function () {

			let additions = evDataService.getAdditions()
			let activeObject = evDataService.getActiveObject()

			if (viewType.value === 'matrix' && !activeLayoutConfigIsSet) {

				activeLayoutConfigIsSet = true

				evDataService.setActiveLayoutConfiguration({isReport: true}) // saving layout for checking for changes
				evEventService.dispatchEvent(evEvents.ACTIVE_LAYOUT_CONFIGURATION_CHANGED)

			}

		});

		evEventService.addEventListener(evEvents.VIEW_TYPE_CHANGED, function () {

			scope.viewType = scope.evDataService.getViewType();
			scope.viewSettings = scope.evDataService.getViewSettings(scope.viewType);

		})

		evEventService.addEventListener(evEvents.REPORT_OPTIONS_CHANGE, function () {
			let reportOptions = evDataService.getReportOptions()
		})

	}

	/**
	 * Should be called after values assigned to
	 * isReport, isRootEntityViewerRef, isInsideDashboard (inside onMounted)
	 */
	function init() {

		initEventListeners()

		if (isReport) applyGroupsFoldingFromLocalStorage()

		if (
			document
				.querySelector('body')
				.classList.contains('filter-side-nav-collapsed')
		) {
			evDataService.toggleRightSidebar(true)
		}

	}

	checkForGroupsFolding(); // have to be executed before scripts inside hook onMounted

	onMounted(async () => {

		let attrs = null

		// var iframeMode = globalDataService.insideIframe()

		if (viewContext.value === 'dashboard') {
			isInsideDashboard = true

			/* For old rv interface
		interfaceLayout.groupingArea.collapsed = true;
		interfaceLayout.groupingArea.height = 2;
		interfaceLayout.columnArea.collapsed = true;
		interfaceLayout.columnArea.height = 37;

		evDataService.setInterfaceLayout(interfaceLayout);
		*/

			additions.isOpen = false
			evDataService.setAdditions(additions)
		}

		let dashboardFilterCollapsed = true

		let splitPanelIsActive = evDataService.isSplitPanelActive()
		// isRootEntityViewer = evDataService.isRootEntityViewer()
		isRootEntityViewerRef.value = evDataService.isRootEntityViewer();

		if (viewContext.value === 'reconciliation_viewer') {
			isRecon = true
		}

		if (!possibleToRequestReportRef.value) {
			return;
		}

		renderTemplate();

		let toggleGroupAndColumnArea = function () {
			interfaceLayout = evDataService.getInterfaceLayout()

			//let groupingAndColumnAreaCollapsed = groupingAndColumnAreaCollapsed;

			evDataService.setInterfaceLayout(interfaceLayout)
			evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)
		}

		let toggleDashboardFilter = function () {
			let dashboardFilterCollapsed = !dashboardFilterCollapsed
		}

		init()

	})

	function getWrapperClasses() {
		var classes = ''

		if (isRootEntityViewerRef.value) {
			classes = 'g-root-wrapper'
		} else if (isRecon) {
			classes = 'g-reconciliation-wrapper'
		}

		if (evDataService.isVerticalSplitPanelActive()) {
			classes += ' g-v-split-panel-active'
		}

		if (isReport) {
			classes += ' g-is-report'
		}

		return classes;

	}


	function continueReportGeneration() {

		possibleToRequestReportRef.value = true;

		renderTemplate();
		init();

		window.rvDataProviderService.createDataStructure(
			evDataService, evEventService
		);

		// evEventService.dispatchEvent(evEvents.UPDATE_TABLE);

	}

	function resetUnfoldedGroups() {

		var localStorageReportData = localStorageService.getReportData();

		var layout = evDataService.getListLayout();
		var contentType = evDataService.getContentType();

		delete localStorageReportData[contentType][layout.user_code]

		var groups = evDataService.getGroups();

		groups.forEach(function (group) {

			if (!group.report_settings) {
				group.report_settings = {}
			}

			group.report_settings.is_level_folded = true;

		})

		evDataService.setGroups(groups);

		localStorageService.cacheReportData(localStorageReportData);

		continueReportGeneration();

	}

	defineExpose({
		init,
	})

</script>

<style lang="scss" scoped>
	.g-wrapper .g-table-wrap {
		overflow: auto;
	}

	.wrap_dashboard {
		display: block;
		height: 100%;
	}
</style>
