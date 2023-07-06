<template>
	<div
		class="g-wrapper position-relative"
		:class="getWrapperClasses()"
		:ref="(el) => (elem = jquery(el))"
	>
		<div
			class="g-recon verticalSplitPanelWrapper"
			v-if="isRootEntityViewer && verticalAdditions.isOpen && domElemsAreReady"
		>
			<div
				group-width-aligner
				root-wrap-elem.value="rootWrapElem"
				content-wrap-elem.value="contentWrapElem"
				ev-data-service="evDataService"
				ev-event-service="evEventService"
			></div>

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
							<!-- <group-table
									attribute-data-service="vm.attributeDataService"
									ev-data-service="vm.entityViewerDataService"
									ev-event-service="vm.entityViewerEventService"
								></group-table> -->
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
				'g-root-content-wrap': isRootEntityViewer,
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

			<AngularFmGridTableFilters
				v-if="components.filterArea"
				:attributeDataService="attributeDataService"
				:hideFiltersBlock="hideFiltersBlock"
				:hideUseFromAboveFilters="hideUseFromAboveFilters"
				:vm="vm"
			/>

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

		<div class="g-additions" v-if="isRootEntityViewer && additions?.isOpen">
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

	const { attributeDataService } = props

	let scope = {
		spExchangeService: '=',
		hideFiltersBlock: '=',
		hideUseFromAboveFilters: '=',
	}
	let elem = ref(null)

	let additions = props.evDataService.getAdditions()
	let verticalAdditions = props.evDataService.getVerticalAdditions()

	const components = reactive(
		props.components || props.evDataService.getComponents()
	)

	let entityType = props.evDataService.getEntityType()
	let activeObject = props.evDataService.getActiveObject()
	let isReport = metaService.isReport(entityType)

	let viewType = props.evDataService.getViewType()
	let viewSettings = props.evDataService.getViewSettings(viewType)
	let readyToRenderTable = ref(false)

	let reportOptions = props.evDataService.getReportOptions()
	var interfaceLayout = props.evDataService.getInterfaceLayout()
	var viewContext = props.evDataService.getViewContext()
	var contentType = props.evDataService.getContentType()
	var activeLayoutConfigIsSet = false

	let isInsideDashboard = false
	let domElemsAreReady = ref(true)
	let contentWrapElem = ref(null)
	let workareaWrapElem = ref(null)
	let rootWrapElem = ref(null)

	onMounted(async () => {
		let attrs = null

		// var iframeMode = globalDataService.insideIframe()

		if (viewContext === 'dashboard') {
			isInsideDashboard = true

			/* For old rv interface
		interfaceLayout.groupingArea.collapsed = true;
		interfaceLayout.groupingArea.height = 2;
		interfaceLayout.columnArea.collapsed = true;
		interfaceLayout.columnArea.height = 37;

		props.evDataService.setInterfaceLayout(interfaceLayout);
		*/

			additions.isOpen = false
			props.evDataService.setAdditions(additions)
		}

		let dashboardFilterCollapsed = true

		let splitPanelIsActive = props.evDataService.isSplitPanelActive()
		let isRootEntityViewer = props.evDataService.isRootEntityViewer()

		let isRecon = false

		if (viewContext === 'reconciliation_viewer') {
			let isRecon = true
		}
		domElemsAreReady.value = true
		await nextTick()

		contentWrapElem.value = elem.value[0].querySelector('.g-workarea-wrap')
		workareaWrapElem.value = elem.value[0].querySelector('.g-workarea-wrap')
		rootWrapElem.value = document.querySelector('.g-wrapper.g-root-wrapper') // we are looking for parent

		if (isRootEntityViewer) {
			// we took a local root wrapper = .g-wrapper
			// because there is an issue with ng-class, we can't set 'g-root-wrapper' before querying it from DOM

			rootWrapElem.value = elem.value[0]
		}

		if (!isRootEntityViewer) {
			// if this component inside split panel, set .g-content-wrap height
			var splitPanelHeight = elem.value.parents('.g-additions').height()
			contentWrapElem.value.style.height = splitPanelHeight + 'px'
		}

		// IMPORTANT, that variable blocks child component rendering
		// because child components require some elements that render in this component
		// we need to query from DOM rootWrapElem, contentWrapElem, workareaWrapElem
		// Here how it looks like in 2 steps:
		// 1) template create .g-wrapper, .g-content-wrap, .g-workarea-wrap' and we query them here
		// 2) then we set domElemsAreReady to true, and child components start rendering and we pass queried elements to them

		// The point of this complexity is to remove extra
		// setTimeout(function() {... $apply()}, 0)
		// That trigger $digest and everything start refreshing
		// Slowdown really visible in dashboard

		let toggleGroupAndColumnArea = function () {
			interfaceLayout = props.evDataService.getInterfaceLayout()

			//let groupingAndColumnAreaCollapsed = groupingAndColumnAreaCollapsed;

			props.evDataService.setInterfaceLayout(interfaceLayout)
			props.evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)
		}

		let toggleDashboardFilter = function () {
			let dashboardFilterCollapsed = !dashboardFilterCollapsed
		}

		var applyGroupsFoldingFromLocalStorage = function () {
			var listLayout = props.evDataService.getListLayout()
			var reportData = localStorageService.getReportDataForLayout(
				contentType,
				listLayout.user_code
			)

			if (reportData.groupsList && reportData.groupsList.length) {
				var groups = props.evDataService.getGroups()

				reportData.groupsList.forEach((groupObj) => {
					var group = groups.find((group) => group.key === groupObj.key)

					if (group) {
						if (!group.report_settings) group.report_settings = {}

						group.report_settings.is_level_folded =
							groupObj.report_settings.is_level_folded
					}
				})

				props.evDataService.setGroups(groups)

				rvDataHelper.markHiddenColumnsBasedOnFoldedGroups(evDataService)
			}
		}

		var initEventListeners = function () {
			props.evEventService.addEventListener(
				evEvents.ADDITIONS_CHANGE,
				function () {
					let additions = props.evDataService.getAdditions()

					console.log('additions', additions)

					let activeObject = props.evDataService.getActiveObject()
				}
			)

			props.evEventService.addEventListener(
				evEvents.VERTICAL_ADDITIONS_CHANGE,
				function () {
					let verticalAdditions = props.evDataService.getVerticalAdditions()

					if (!verticalAdditions || !verticalAdditions.isOpen) {
						setTimeout(function () {
							// wait for angular to remove vertical split panel

							// delete props.evEventService.dispatchEvent(evEvents.UPDATE_ENTITY_VIEWER_CONTENT_WRAP_SIZE);
							props.evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)
						}, 200)
					}

					console.log('VERTICAL ADDITIONS CHANGE', verticalAdditions)
				}
			)

			props.evEventService.addEventListener(
				evEvents.ACTIVE_OBJECT_CHANGE,
				function () {
					let activeObject = props.evDataService.getActiveObject()
				}
			)

			props.evEventService.addEventListener(
				evEvents.FILTERS_RENDERED,
				function () {
					readyToRenderTable.value = true

					setTimeout(() => {
						$apply()
					}, 0)
				}
			)

			props.evEventService.addEventListener(
				evEvents.DATA_LOAD_END,
				function () {
					let additions = props.evDataService.getAdditions()
					let activeObject = props.evDataService.getActiveObject()
					readyToRenderTable.value = true

					if (viewType === 'matrix' && !activeLayoutConfigIsSet) {
						activeLayoutConfigIsSet = true

						props.evDataService.setActiveLayoutConfiguration({ isReport: true }) // saving layout for checking for changes
						props.evEventService.dispatchEvent(
							evEvents.ACTIVE_LAYOUT_CONFIGURATION_CHANGED
						)
					}
				}
			)

			props.evEventService.addEventListener(
				evEvents.VIEW_TYPE_CHANGED,
				function () {
					let viewType = props.evDataService.getViewType()
					let viewSettings = props.evDataService.getViewSettings(viewType)

					console.log('viewType ', viewType)
					console.log('viewSettings', viewSettings)
				}
			)

			props.evEventService.addEventListener(
				evEvents.REPORT_OPTIONS_CHANGE,
				function () {
					let reportOptions = props.evDataService.getReportOptions()
				}
			)
		}

		let init = function () {
			initEventListeners()

			if (isReport) applyGroupsFoldingFromLocalStorage()

			if (
				document
					.querySelector('body')
					.classList.contains('filter-side-nav-collapsed')
			) {
				props.evDataService.toggleRightSidebar(true)
			}
		}

		init()
	})
	function getWrapperClasses() {
		var classes = ''
		return classes
		if (isRootEntityViewer) {
			classes = 'g-root-wrapper'
		} else if (isRecon) {
			classes = 'g-reconciliation-wrapper'
		}

		if (props.evDataService.isVerticalSplitPanelActive()) {
			classes += ' g-v-split-panel-active'
		}

		if (isReport) {
			classes += ' g-is-report'
		}

		return classes
	}
</script>

<style lang="scss" scoped></style>
