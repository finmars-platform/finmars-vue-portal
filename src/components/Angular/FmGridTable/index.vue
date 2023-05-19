<template>
	<div
		class="g-wrapper position-relative"
		data-ng-class="getWrapperClasses()"
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
			class="g-content-wrap"
			data-ng-class="{'g-content-wrap-right': verticalAdditions.isOpen, 'g-root-content-wrap': isRootEntityViewer}"
		>
			<div class="g-workarea-wrap">
				<div
					class="g-workarea main-area"
					v-if="domElemsAreReady"
					ev-data-service="evDataService"
					ev-event-service="evEventService"
				>
					<div v-if="components.topPart">
						<AngularFmGridTableTopPart
							:attributeDataService="attributeDataService"
							:evDataService="evDataService"
							:evEventService="evEventService"
							:spExchangeService="spExchangeService"
							:vm="vm"
						/>
					</div>

					<div v-if="components.filterArea" class="position-relative">
						<!-- <g-filters MAIN NEED RELOC
								ev-data-service="evDataService"
								ev-event-service="evEventService"
								attribute-data-service="attributeDataService"
								content-wrap-element="contentWrapElem"
								hide-filters-block="hideFiltersBlock"
								hide-use-from-above-filters="hideUseFromAboveFilters"
							>
							</g-filters> -->
					</div>

					<div v-if="readyToRenderTable" class="g-table-section">
						<div class="flex-row">
							<div
								v-if="!isReport"
								class="g-ev-left-panel-holder gEvLeftPanelHolder"
							>
								<!-- <g-ev-left-panel MIEN
										class="height-100 display-block"
										ev-data-service="evDataService"
										ev-event-service="evEventService"
										attribute-data-service="attributeDataService"
										sp-exchange-service="spExchangeService"
										content-wrap-element="contentWrapElem"
									></g-ev-left-panel> -->

								<div
									class="drop-area-wrap left-side-groups-drop-area display-none gLeftSideGroupsHolder"
								>
									<div class="g-drop-area gDropArea"></div>

									<div class="drop-area-content">
										<span>Drop here to add grouping</span>
									</div>
								</div>
							</div>

							<div class="g-table-container">
								<div class="g-table-wrap">
									<div class="g-column-area-wrap">
										<div v-if="components.columnArea && viewType !== 'matrix'">
											<!-- <group-columns MAIN
													ev-data-service="evDataService"
													ev-event-service="evEventService"
													attribute-data-service="attributeDataService"
													content-wrap-element="contentWrapElem"
												></group-columns> -->
											<div class="g-scrollable-area">
												<div
													class="g-column-bottom-row g-table-header flex-row"
												>
													<div class="g-cell g-cell-select-all">
														<md-checkbox
															data-ng-click="selectAllRows()"
															data-ng-checked="isAllSelected"
														></md-checkbox>
													</div>

													<div class="g-cell-rows-settings">
														<div class="g-row-settings height-100">
															<div class="context-menu-btn-wrapper"></div>

															<button
																v-if="!isReport"
																class="g-row-settings-btn visibility-hidden"
																data-click-action-type="open_row_status_picker"
															>
																<span
																	ng-bind-html="rowStatusFilterIcon"
																	style="height: 24px"
																></span>
																<span class="material-icons arrow-icon"
																	>arrow_drop_down</span
																>
															</button>

															<md-menu>
																<md-button
																	class="g-cell-button g-row-settings-btn g-row-color-picker-btn"
																	data-ng-class="rowFilterColor"
																	data-ng-click="$mdOpenMenu($event)"
																>
																	<span
																		class="material-icons label-icon"
																		v-if="rowFilterColor === 'none'"
																		>label_outline</span
																	>
																	<span
																		class="material-icons"
																		v-if="rowFilterColor !== 'none'"
																		>label</span
																	>
																	<span class="material-icons arrow-icon"
																		>arrow_drop_down</span
																	>
																</md-button>

																<md-menu-content
																	class="g-row-color-picker-content"
																	width="2"
																	ng-mouseleave="$mdMenu.close()"
																>
																	<md-menu-item>
																		<md-button
																			class="g-cell-button g-row-color-picker-option"
																			data-ng-click="changeRowFilterColor('none')"
																		>
																			<span class="material-icons"
																				>label_outline</span
																			>
																		</md-button>
																	</md-menu-item>

																	<md-menu-item>
																		<md-button
																			class="g-cell-button g-row-color-picker-option red"
																			data-ng-click="changeRowFilterColor('red')"
																		>
																			<span class="material-icons">label</span>
																		</md-button>
																	</md-menu-item>

																	<md-menu-item>
																		<md-button
																			class="g-cell-button g-row-color-picker-option yellow"
																			data-ng-click="changeRowFilterColor('yellow')"
																		>
																			<span class="material-icons">label</span>
																		</md-button>
																	</md-menu-item>

																	<md-menu-item>
																		<md-button
																			class="g-cell-button g-row-color-picker-option green"
																			data-ng-click="changeRowFilterColor('green')"
																		>
																			<span class="material-icons">label</span>
																		</md-button>
																	</md-menu-item>

																	<md-menu-item>
																		<md-button
																			class="g-cell-button g-row-color-picker-option divider"
																			data-ng-click="removeColorMarkFromAllRows($event)"
																		>
																			<span class="material-icons"
																				>label_off</span
																			>
																		</md-button>
																	</md-menu-item>
																</md-menu-content>
															</md-menu>
														</div>

														<md-button
															class="g-row-settings-toggle"
															data-ng-click="rowFiltersToggle()"
														>
															<div class="flex-row flex-i-center height-100">
																<span
																	v-show="hideRowSettings"
																	class="material-icons f-s-16"
																	>keyboard_arrow_left</span
																>
																<span
																	v-show="!hideRowSettings"
																	class="material-icons f-s-16"
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
															v-show="column?.isHidden"
															ng-class="{'last-dragged': column.frontOptions && column.frontOptions.lastDragged, 'error': column.error_data}"
															ng-style="column.style"
															data-column-id="{{column.___group_type_id}}"
															data-attr-key="{{column.key}}"
															draggable="{{groupsAreaDraggable}}"
															custom-popup
															popup-id="{{column.key}}"
															popup-template-url="{{getPopupMenuTemplate(column)}}"
															position-relative-to="mouse"
															open-on="right_click"
															close-on-click-outside="true"
															prevent-default="'true'"
															on-save-callback=""
															popup-data="columnsPopupsData[column.key]"
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
																<span ng-bind="column.name"></span>
																<span v-if="column.status == 'missing'"
																	>(Deleted)</span
																>
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
																	ng-click="unfoldLevel(column, $index)"
																>
																	<span class="material-icons">add</span>
																</div>

																<div
																	v-if="!column.report_settings.is_level_folded"
																	class="g-cell-button"
																	ng-click="foldLevel(column, $index)"
																>
																	<span class="material-icons">remove</span>
																</div>

																<span
																	v-if="column?.error_data"
																	class="material-icons error"
																	>error</span
																>

																<div class="g-table-header-button">
																	<div class="column-name-wrapper">
																		<div
																			class="flex-row flex-i-center name-block"
																		>
																			<div v-if="!column.layout_name">
																				<span ng-bind="column.name"></span>
																				<span v-if="column.status == 'missing'"
																					>(Deleted)</span
																				>
																			</div>

																			<div v-if="column.layout_name">
																				<span
																					ng-bind="column.layout_name"
																				></span>
																				<span v-if="column.status == 'missing'"
																					>(Deleted)</span
																				>
																			</div>

																			<!--                                <span class="material-icons arrow-down">arrow_drop_down</span>-->

																			<span
																				v-if="
																					column?.options.sort_settings &&
																					column?.options.sort_settings.mode ===
																						'manual'
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
																			data-ng-click="changeSortDirection(column, column?.options.sort === 'DESC' ? 'ASC' : 'DESC')"
																		>
																			<span
																				data-ng-show="column?.options.sort === 'DESC' || !column?.options.sort"
																				class="material-icons gt-sorting-icon"
																				>arrow_upward</span
																			>
																			<span
																				data-ng-show="column?.options.sort === 'ASC'"
																				class="material-icons gt-sorting-icon"
																				>arrow_downward</span
																			>
																		</div>
																	</div>
																</div>
															</div>

															<div
																class="resize-slider"
																data-group-column-resizer
																ev-data-service="evDataService"
																ev-event-service="evEventService"
															></div>
															<!-- gDraggableHeadArea used to prevent call of event "dragleave" by children of gcAreaDnD -->
															<div
																class="g-table-header-drop gDraggableHeadArea"
																data-attr-key="{{column.key}}"
															></div>
														</div>
													</div>

													<div
														class="flex-row width-100 g-cols-holder gColumnsHolder gcAreaDnD"
													>
														<div
															class="g-table-header-cell-wrapper gColumnElem gDraggableHead gcAreaDnD"
															ng-repeat="column in columnsToShow track by column.key"
															v-show="column?.isHidden"
															ng-class="{'last-dragged': column.frontOptions && column.frontOptions.lastDragged, 'error': column.error_data}"
															ng-style="column.style"
															data-column-id="{{column.___column_id}}"
															data-attr-key="{{column.key}}"
															draggable="true"
															custom-popup
															popup-id="{{column.key}}"
															popup-template-url="{{getPopupMenuTemplate(column)}}"
															position-relative-to="mouse"
															open-on="right_click"
															close-on-click-outside="true"
															prevent-default="'true'"
															popup-data="columnsPopupsData[column.key]"
															offset-x="-10"
															offset-y="-10"
															popup-classes="{{getPopupMenuClasses(column)}}"
															backdrop-classes="low-z-index-backdrop"
															on-cancel="onSubtotalTypeSelectCancel()"
															popup-event-service="evEventService"
														>
															<md-tooltip
																md-direction="top"
																data-ng-class="{'custom-field-error': column.error_data}"
															>
																<span ng-bind="column.name"></span>
																<!--                    <span v-if="column.status == 'missing'">(Deleted)</span>-->
																<span v-if="column?.error_data">{{
																	column?.error_data.description
																}}</span>
															</md-tooltip>

															<div
																class="g-cell g-table-header-cell position-relative"
															>
																<div
																	v-if="!isReport"
																	data-ng-click="sortHandler(column, column?.options.sort === 'DESC' ? 'ASC' : 'DESC')"
																	class="g-column-sort-settings-opener"
																></div>

																<span
																	v-if="column?.error_data"
																	class="material-icons error"
																	>error</span
																>

																<div class="g-table-header-button">
																	<div class="column-name-wrapper">
																		<div
																			class="flex-row flex-i-center name-block"
																		>
																			<div>
																				<span
																					v-if="!column.layout_name"
																					ng-bind="column.name"
																				></span>
																				<span
																					v-if="column.layout_name"
																					ng-bind="column.layout_name"
																				></span>
																				<span v-if="column?.status == 'missing'"
																					>(Deleted)</span
																				>
																			</div>

																			<span
																				v-if="
																					column?.options.sort_settings &&
																					column?.options.sort_settings.mode ===
																						'manual'
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
																			class="sort {{column?.options.sort ? 'has-sort' : ''}}"
																			data-ng-click="changeSortDirection(column, column?.options.sort === 'DESC' ? 'ASC' : 'DESC')"
																		>
																			<span
																				data-ng-show="column?.options.sort === 'DESC' || !column?.options.sort"
																				class="material-icons gt-sorting-icon"
																				>arrow_upward</span
																			>
																			<span
																				data-ng-show="column?.options.sort === 'ASC'"
																				class="material-icons gt-sorting-icon"
																				>arrow_downward</span
																			>
																		</div>
																	</div>
																</div>
															</div>

															<div
																class="resize-slider"
																data-group-column-resizer
																ev-data-service="evDataService"
																ev-event-service="evEventService"
															></div>

															<div
																class="g-table-header-drop gDraggableHeadArea"
																data-attr-key="{{column.key}}"
															></div>
														</div>

														<button
															class="g-cell g-add-column-button"
															data-ng-click="addColumn($event)"
														>
															<md-tooltip md-direction="top">
																Add new column
															</md-tooltip>
															<span class="material-icons">add_circle</span>
														</button>
													</div>
												</div>
											</div>
										</div>
									</div>

									<!-- <group-table-body MAIN
											v-if="viewType == 'report_viewer'"
											class="group-table-body"
											data-ng-class="{
																								'g-font-size-small': reportOptions.table_font_size === 'small',
																								'g-font-size-medium': reportOptions.table_font_size === 'medium',
																								'g-font-size-large': reportOptions.table_font_size === 'large'
																							}"
											ev-data-service="evDataService"
											ev-event-service="evEventService"
											workarea-wrap-element="workareaWrapElem"
											content-wrap-element="contentWrapElem"
											root-wrap-element="rootWrapElem"
										></group-table-body> -->

									<div class="g-table-body position-relative">
										<div class="ev-viewport">
											<div
												class="ev-content"
												data-ng-show="dataLoadStatus"
											></div>
											<div v-if="!dataLoadStatus" class="ev-content-loader">
												<div
													class="e-data-loader"
													layout="row"
													layout-sm="column"
													layout-align="space-around"
												>
													<progress-circular diameter="100"></progress-circular>
												</div>
											</div>
										</div>

										<div
											v-if="isReport"
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

									<!-- <report-viewer-matrix NEED RELOC
											v-if="viewType == 'matrix'"
											class="height-100 display-block matrix-inside-report-builder"
											style="height: 600px"
											matrix-settings="viewSettings"
											ev-data-service="evDataService"
											ev-event-service="evEventService"
										></report-viewer-matrix> -->

									<div
										v-if="isReport"
										rv-gcf-areas-dnd
										ev-data-service="evDataService"
										ev-event-service="evEventService"
										content-wrap-element="contentWrapElem"
									></div>

									<div
										v-if="!isReport"
										ev-gcf-areas-dnd
										ev-data-service="evDataService"
										ev-event-service="evEventService"
										content-wrap-element="contentWrapElem"
									></div>
								</div>
							</div>
						</div>
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

	const props = defineProps(['evEventService', 'evDataService', 'vm'])

	let scope = {
		attributeDataService: '=',
		spExchangeService: '=',
		hideFiltersBlock: '=',
		hideUseFromAboveFilters: '=',
	}
	let elem = ref(null)

	let additions = props.evDataService.getAdditions()
	let verticalAdditions = props.evDataService.getVerticalAdditions()
	let components = props.evDataService.getComponents()
	let entityType = props.evDataService.getEntityType()
	let activeObject = props.evDataService.getActiveObject()
	let isReport = metaService.isReport(entityType)

	let viewType = props.evDataService.getViewType()
	let viewSettings = props.evDataService.getViewSettings(viewType)
	let readyToRenderTable = false

	let reportOptions = props.evDataService.getReportOptions()
	var interfaceLayout = props.evDataService.getInterfaceLayout()
	var viewContext = props.evDataService.getViewContext()
	var contentType = props.evDataService.getContentType()
	var activeLayoutConfigIsSet = false

	let isInsideDashboard = false
	let domElemsAreReady = ref(true)

	onMounted(async () => {
		let attrs = null

		// var iframeMode = globalDataService.insideIframe()

		if (viewContext === 'dashboard') {
			let isInsideDashboard = true

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

		let contentWrapElem = elem.value[0].querySelector('.g-content-wrap')
		let workareaWrapElem = elem.value[0].querySelector('.g-workarea-wrap')
		let rootWrapElem = document.querySelector('.g-wrapper.g-root-wrapper') // we are looking for parent

		if (isRootEntityViewer) {
			// we took a local root wrapper = .g-wrapper
			// because there is an issue with ng-class, we can't set 'g-root-wrapper' before querying it from DOM

			let rootWrapElem = elem.value[0].querySelector('.g-wrapper')
		}

		if (!isRootEntityViewer) {
			// if this component inside split panel, set .g-content-wrap height
			var splitPanelHeight = elem.value.parents('.g-additions').height()
			contentWrapElem.style.height = splitPanelHeight + 'px'
		}

		console.log('groupTable.rootWrapElem', rootWrapElem)
		console.log('groupTable.contentWrapElem', contentWrapElem)
		console.log('groupTable.workareaWrapElem', workareaWrapElem)

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

		console.log('additions', additions)

		let toggleGroupAndColumnArea = function () {
			interfaceLayout = props.evDataService.getInterfaceLayout()

			//let groupingAndColumnAreaCollapsed = groupingAndColumnAreaCollapsed;

			props.evDataService.setInterfaceLayout(interfaceLayout)
			props.evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)
		}

		let toggleDashboardFilter = function () {
			let dashboardFilterCollapsed = !dashboardFilterCollapsed
		}

		let getWrapperClasses = function () {
			var classes = ''

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
					let readyToRenderTable = true

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

	// scope.$on('$destroy', function () {
	// 	console.log('==== Table is destroyed ==== ')
	// })
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

	@keyframes fadein {
		from {
			opacity: 0;
		}

		to {
			opacity: 1;
		}
	}

	@keyframes fadeout {
		from {
			opacity: 1;
		}

		to {
			opacity: 0;
		}
	}

	.fade-in {
		animation-name: fadein;
		animation-duration: 0.3s;
		animation-timing-function: ease-out;
		animation-fill-mode: forwards;
	}

	.fade-out {
		animation-name: fadeout;
		animation-duration: 0.2s;
		animation-fill-mode: forwards;
	}

	//  START

	//region Inside dashboard
	.dashboard-component:not(.dashboard-component-filled-in) {
		.g-filter-settings-big-left-btn {
			display: none;
		}

		.g-filter-left-part {
			flex-basis: 52px;
		}

		.icon-buttons {
			display: none;
		}

		.report-viewer-holder .ev-content {
			padding-bottom: 2px;
		}
	}
	//endregion Inside dashboard

	.g-table-container {
		flex: 0 1 100%;
		overflow: hidden;
	}

	.g-wrapper {
		overflow: hidden;
		height: 100%;

		.g-content-wrap {
			position: relative;

			.g-table-header-drop {
				display: none;
				position: absolute;
				width: 100%;
				height: 100%;
				top: 0;
				left: 0;
				z-index: 1;
			}

			&.g-groups-columns-dnd {
				.g-table-header-cell-wrapper {
					.g-table-header-drop {
						display: block;
					}
				}
			}

			&.g-row-settings-collapsed {
				div.g-row-settings {
					width: 0;
					padding: 0;
					overflow: hidden;
					border: none;
				}
			}
		}

		.g-rootentity-content-wrap {
			position: relative;
		}

		.g-workarea-wrap {
			//float: left;
			overflow: hidden;
			height: 100%;
		}

		.g-workarea {
			width: 100%;
			//width: calc(100% - border-right);
			//border-right: 6px solid #4C334D;
			background: #4c334d;
			overflow: auto;
			position: relative;

			.ev-content {
				background-color: $gTableBackgroundColor;

				.g-row-selection {
					display: flex;
					align-items: center;
					justify-content: center;
					height: $gRowHeight;
					width: $gRowSelectionWidth;
					border-bottom: $gCellBorder;
					border-right: $gCellBorder;
					box-sizing: border-box;
				}

				.g-row-selection-button {
					width: 17px;
					height: 17px;
					min-width: 17px;
					font-size: 15px;
					line-height: 13px;
					border: 2px solid $gCellBorderColor;
					border-radius: 3px;
					box-sizing: border-box;
					background: rgba(0, 0, 0, 0.01960784);
					margin: 0;
					cursor: pointer;

					svg {
						width: 14px;
						height: 14px;
					}

					&.checked {
						background-color: $orange;
						border-color: $orange;

						svg {
							position: relative;
							width: 19px;
							height: 19px;
							bottom: 4px;
							right: 3px;
							fill: #fff;
						}
					}

					&:hover {
						border: 2px solid $gray;
					}
				}
			}
		}

		.g-cell {
			white-space: nowrap;
			padding: 0 15px;
			border-right: 1px solid $borderPale;
			border-bottom: 1px solid $borderPale;
			box-sizing: border-box;
			font-size: 13px;
		}

		.g-row {
			// position: relative;
			position: absolute;
			max-width: none;
			height: $gRowHeight;
			// border-bottom: 1px solid #ddd;
			border-bottom: none;
			background-color: #fff;

			&:focus {
				outline: none !important;
			}

			.g-cell {
				height: $gRowHeight;
				color: #666666;
				text-align: left;
				font-weight: 400;
				line-height: $gRowHeight;

				&.text-left {
					text-align: left;
				}

				&.text-center {
					text-align: center;
				}

				&.text-right {
					text-align: right;
				}

				&.negative-red {
					color: #fa393e;
				}
			}

			/* .g-cell.cell-center-align {
	      text-align: center;
	    }

	    .g-cell.cell-right-align {
	      text-align: right;
	    } */

			&:after {
				content: '';
				clear: both;
				display: block;
			}

			&.is-active-object,
			&.context-menu-opened,
			&.selected {
				// background: #e4c1b5;
				.g-row-selection {
					fill: #4c334d;

					svg {
						fill: #000;
					}
				}
			}

			&.is-active-object {
				box-shadow: 0 1px 5px rgba(0, 0, 0, 0.35);
				z-index: 1;
			}

			&.context-menu-opened {
				outline: 1px solid $orange;
				z-index: 1;
			}
		}

		.g-cell-content-wrap {
			text-overflow: ellipsis;
			overflow: hidden;
		}

		.ev-content {
			position: relative;

			.g-row {
				.g-cell {
					font-family: 'Roboto-Regular', 'Roboto', sans-serif;
					font-style: normal;
				}

				.g-click-catcher {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					padding: 0;
					z-index: 1;
				}

				.border-right-transparent {
					border-right: transparent;
				}

				.border-bottom-transparent {
					border-bottom: transparent;
				}

				&.g-row-marked-red {
					background-color: #fdece5;

					div.g-row-color-picker span.label-icon {
						color: #f05a22;
					}
				}

				&.g-row-marked-yellow {
					background-color: #fef9ef;

					div.g-row-color-picker span.label-icon {
						color: #fac878;
					}
				}

				&.g-row-marked-green {
					background-color: #e1fef5;

					div.g-row-color-picker span.label-icon {
						color: #a5d9c9;
					}
				}
			}
		}

		.g-additions {
			position: relative;
			display: block;
			width: 100%;
			//float: left;
			background: #fff;
			z-index: 3;

			group-editor-binder {
				.mCSB_scrollTools_vertical {
					opacity: 1;
					will-change: scroll-position, height, top;

					.mCSB_draggerContainer {
						background: #dcdcdc;
						border-left: 1px solid #000;
					}
				}

				.mCSB_horizontal.mCSB_inside > .mCSB_container {
					margin-bottom: 15px;
				}

				.mCSB_scrollTools .mCSB_dragger .mCSB_dragger_bar {
					background-color: #4c334d;
				}

				.mCSB_scrollTools .mCSB_dragger:hover .mCSB_dragger_bar {
					background-color: #4c334d;
				}
			}

			.g-additions-editor-caption {
				display: flex;
				flex-direction: column;
				justify-content: center;
				height: 100%;
				font-size: 3em;
				text-align: center;
			}

			.g-height-slider {
				width: 100%;
				height: 3px;
				cursor: row-resize;
				border-top: 1px solid $g-table-border-color;
			}
		}

		.g-filter-sidebar {
			position: absolute;
			top: 0;
			right: 0;
			z-index: 1;
			height: 100%;
			width: 239px;
			min-width: 235px;

			&::after {
				display: block;
				content: '';
				height: 100%;
				z-index: 1;
				width: 2px;
				background: #4c334d;
				left: 0;
				top: 0;
				position: absolute;
			}

			&:first-child {
				border-bottom: 6px solid #4c334d;
			}
		}

		.g-filter-sidebar.split-panel-active {
			height: inherit;
		}

		.g-row-selection-component {
			background-color: #eee;
		}

		.g-table-section {
			background-color: #fff;
			overflow: hidden;
		}

		.g-cell:last-child {
			margin-right: 0;
		}

		.g-thead {
			overflow: hidden;

			&:after {
				content: '';
				clear: both;
				display: block;
			}

			.settings-btn {
				ng-md-icon {
					position: relative;
					top: -3px;
				}
			}
		}

		.g-thead .g-cell {
			// position: relative;
			font-size: 14px;

			.caption {
				user-select: none;
			}

			.resize-slider {
				width: 4px;
				height: 21px;
				background: #fff;
				position: absolute;
				right: 0;
				top: 2px;
				cursor: col-resize;
			}
		}

		.group-table-body {
			height: 100%;
			overflow: auto;
			width: 100%;
			display: block;
			background-color: $gTableBackgroundColor;

			&.g-font-size-small {
				.g-cell {
					font-size: 12px;
				}
			}

			&.g-font-size-medium {
				.g-cell {
					font-size: 16px;
				}
			}

			&.g-font-size-large {
				.g-cell {
					font-size: 20px;
				}
			}
		}

		.g-group {
			float: left;
			text-transform: uppercase;
			color: #4c334d;
			font-size: 13px;
			margin-right: 0.5em;

			&:after {
				display: inline-block;
				margin-left: 0.5em;
				content: '>';
			}

			&:last-child:after {
				content: '';
			}
		}

		.g-grouping-section {
			overflow: auto;
			background: #dcdcdc;
		}

		.g-settings-btn {
			float: right;
			margin-top: -1.5em;
		}

		.groups-holder {
			/*width: calc(~"100% - 120px");
	    float: left;*/
		}

		.g-columns-component.g-thead {
			height: 70px;
			padding-top: 4px;
			background: #4c334d;
			box-sizing: border-box;
			transition: height ease 0.25s;
		}

		.g-second-line {
			&:after {
				display: block;
				clear: both;
				content: '';
			}
		}

		.g-column-title-row {
			padding: 0.75em 0.5em 0.3em;
		}

		.g-column-title {
			position: relative;
			margin: 0 50px 0 0;
			color: #ffffff;
		}

		.g-downloaded-items-count {
			color: #ffffff;
			margin-left: 20px;
		}

		.g-cell-select {
			height: 30px;
			box-sizing: border-box;
			border-bottom: 1px solid #b3b3b3;
		}

		.drop-new-group {
			width: 210px;
			float: left;
			height: 2.5em;
			padding-top: 0.6em;
			font-size: 0.8em;
			padding-left: 1em;
			user-select: none;
			padding-right: 1em;
			z-index: 10000;
			//z-index: 60;
			position: relative;
			box-sizing: border-box;
			margin: 8px;
			color: #575757;
			border: 1px dotted #575757;

			.gu-transit {
				display: none;
			}

			&.active {
				box-shadow: 0 0 6px #363636 inset;
				background: rgba(0, 0, 0, 0.3);
				color: #363636;

				div {
					display: none;
				}

				.gu-transit {
					display: none;
				}
			}
		}

		.drop-new-filter {
			display: none;
			height: 58px;
			padding-top: 17px;
			font-size: 1em;
			padding-left: 1em;
			user-select: none;
			text-align: center;
			padding-right: 1em;
			z-index: 10000;
			//z-index: 60;
			position: relative;
			box-sizing: border-box;
			margin: 8px;
			color: #575757;
			border: 1px dotted #575757;

			.gu-transit {
				display: none;
			}

			&.active {
				box-shadow: 0 0 6px #363636 inset;
				background: rgba(0, 0, 0, 0.3);
				color: #363636;

				div {
					display: none;
				}

				.gu-transit {
					display: none;
				}
			}
		}

		#filtersbag .drop-new-filter {
			display: block;
		}

		.filters-control-btn {
			position: relative;

			.full-width {
				width: 100%;
			}

			.filters-management-btn {
				min-width: 36px;
				width: 36px;
				min-height: 36px;
				height: 36px;
				padding: 0;

				ng-md-icon {
					fill: #777777;
					margin: 0;
				}
			}
		}

		.layout-change-indicator {
			position: absolute;
			left: 8px;
			top: 5px;
			z-index: 1;
		}

		%g-add-gcf-btn-mixin {
			line-height: 1;
			min-height: 10px;
			color: #fff;
			background-color: #ad725d;
			transition: background-color 0.2s linear 0s;

			&.md-button.md-raised:not([disabled]):hover {
				background-color: #f4af8b;
			}
		}

		.add-column-menu {
			button.md-button {
				margin-left: 20px;
				margin-top: 7px;
			}
		}

		.g-add-column-btn {
			float: left;
			margin: 0;
			height: 18px;
			@extend %g-add-gcf-btn-mixin;
		}

		.g-add-column-btn2-container {
			position: relative;
			float: left;
			margin-left: 20px;
			margin-top: 6px;

			.gac-btn2-tooltip-wrapper {
				position: absolute;
				left: 0;
				top: 0;
				width: 100%;
				height: 100%;
				z-index: 1;
			}

			button.md-button {
				margin: 0;
				height: 18px;
				@extend %g-add-gcf-btn-mixin;

				&:disabled {
					opacity: 0.5;
				}
			}
		}

		.g-add-group-btn {
			float: left;
			margin-top: 7px;
			height: 32px;
			@extend %g-add-gcf-btn-mixin;
		}

		.g-add-filter-btn {
			background-color: #ad725d;
			transition: background-color 0.2s linear 0s;
			color: #fff;

			&.md-button.md-raised:not([disabled]):hover {
				background-color: #f4af8b;
			}
		}

		.drop-new-field {
			float: left;
			user-select: none;
			//height: 2.5em;
			height: 24px;
			padding-top: 0.6em;
			padding-left: 2em;
			font-size: 0.8em;
			line-height: 0.5;
			padding-right: 2em;
			box-sizing: border-box;
			margin: 3px 8px 0;
			//z-index: 10000;
			//z-index: 60;
			position: relative;
			// color: #999199;
			color: #575757;
			background-color: #dcdcdc;
			// border: 1px dotted #999199;
			.gu-transit {
				display: none;
			}

			&.active {
				box-shadow: 0 0 6px #fff;
				border: 1px dotted #fff;
				color: #fff;
				background: rgba(255, 255, 255, 0.2);

				div {
					display: none;
				}

				.gu-transit {
					display: none;
				}
			}
		}

		.g-row-selection {
			width: $gRowSelectionWidth;
			// height: $gRowHeight;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			float: left;
			// background: #fff;
			background: transparent;
			fill: #f5f5f5;
			border-right: 1px solid #ddd;
			border-bottom: 1px solid #ddd;
			text-align: center;

			.material-icons {
				font-size: 20px;
				color: $gRowIconColor;
			}

			svg {
				width: 20px;
				height: 20px;
				fill: $gRowIconColor;
			}
		}

		.g-row-settings-table {
			float: left;
			height: $gRowHeight;
			border-bottom: 1px solid #dbdbdb;
			border-right: 1px solid #dbdbdb;
			box-sizing: border-box;
		}

		.g-table-wrap {
			//width: calc(~"100% - 40px");
			width: 100%;
			height: 100%;
			//float: left;
		}

		.g-column-area-wrap {
			position: relative;
		}

		/* .g-table-body {
	    position: relative;
	  } */

		.toggle-group-column-area-btn {
			position: absolute;
			min-width: 30px;
			width: 30px;
			min-height: 30px;
			height: 30px;
			background-color: #ad725d;
			fill: #fff;
			line-height: initial;
			right: 0;
			bottom: 0;
			opacity: 0.5;

			&:not([disabled]).md-focused {
				background-color: #ad725d;
			}

			&:hover {
				background-color: #f4af8b;
				opacity: 1;
			}

			ng-md-icon {
				position: absolute;
				top: 4px;
				left: 3px;
			}
		}

		.g-columns-holder {
			float: left;
			white-space: nowrap;

			.modal-dialog-card {
				margin: 3px 0 5px;
				font-size: 11.2px;
				display: inline-block;
				padding: 0.5em 1em;
				line-height: 1;
				overflow: hidden;
			}

			.group-item {
				margin: 3px 0 5px;
				font-size: 11.2px;
				display: inline-block;
				padding: 0.5em 1em;
				line-height: 1;
				overflow: hidden;
			}
		}

		.g-groups-holder {
			//float: left;

			.modal-dialog-card {
				margin: 8px;
				display: inline-block;
				padding: 0.5em 1em;
				line-height: 1;
				overflow: hidden;
			}
		}

		/* .g-cell-select.all {
	    height: 24px;
	    position: absolute;
	    cursor: pointer;
	    text-align: center;
	    float: left;
	    background: #fff;
	    margin-top: 7px;
	    width: 25px;

	    &.active {
	      //background-color: #DFB29A;
	      background-color: #ffeee8;;
	      //fill: #fff;
	      fill: #4C334D;

	      svg {
	        path {
	          fill-opacity: 1
	        }
	      }
	    }
	  }

	  .g-group-holder {
	    height: 24px;
	    box-sizing: border-box;
	    overflow: hidden;
	    line-height: 2;
	  } */

		.g-filter-sidebar {
			background-color: #dcdcdc;
			//overflow: hidden;
			overflow: auto;
		}

		.g-row-settings {
			// inside table
			width: $gRvRowSettingsWidth;
			display: flex;
			flex-direction: row;
			// justify-content: space-between;
			justify-content: flex-start;
			align-items: center;
			border-right: $gCellBorder;
			transition: width 100ms linear;
			padding: 0;
			box-sizing: border-box;

			/* &.closed {
	      width: 0;
	      padding: 0;
	      overflow: hidden;
	      border-right: none;
	    } */

			.context-menu-btn-wrapper {
				// width: 38px;
				flex: 0 0 38px;
				/* margin-left: 6px;
	      margin-right: 8px; */

				.context-menu-btn {
					display: flex;
					align-items: center;
					border-radius: 50%;
					margin-left: 6px;
					margin-right: 8px;
					color: #b2b2b2;
					font-size: 24px;
					padding: 0;

					&:hover {
						color: $gray;
						background-color: $g-table-header-background-color;
					}
				}
			}
		}

		.g-row-settings-btn {
			display: flex;
			flex-direction: row;
			justify-content: center;
			align-items: center;
			min-width: 0;
			background-color: transparent;
			border: none;
			padding: 0;
			cursor: pointer;

			& > svg {
				fill: $gCellBorderColor;
				height: 24px;
				width: 24px;
			}

			/* .label-icon {
	      color: $gCellBorderColor;
	    } */

			span.material-icons:not(.arrow-icon) {
				color: $gCellBorderColor;
			}

			.arrow-icon {
				width: 16px;
				position: relative;
				right: 5px;
				opacity: 0;
				color: $gray;
			}

			&[disabled] {
				cursor: default;
			}

			&:not([disabled]):hover {
				.label-icon,
				span.material-icons:not(.arrow-icon) {
					color: $gray;
				}

				& > svg {
					fill: $gray;
				}

				.arrow-icon {
					opacity: 1;
				}
			}
		}

		.g-row-color-picker {
			&:not([disabled]):focus {
				background-color: initial;
			}

			&.red {
				color: $rv-active-color;
			}

			&.yellow {
				color: #fac878;
			}

			&.green {
				color: #a5d9c9;
			}
		}

		.md-button {
			ng-md-icon {
				width: $icon-size;
				height: $icon-size;
			}

			&.rounded {
				border-radius: 50%;

				ng-md-icon svg {
					fill: white;
				}
			}

			&.signed-button {
				min-width: auto;
				margin: 0;

				span {
					line-height: normal;
					text-transform: none;
				}

				ng-md-icon svg {
					fill: $g-top-part-color;
				}
			}
		}

		.g-top-part {
			box-sizing: border-box;
			// z-index: 1;
			color: $g-top-part-color;
			font-size: 14px;
			background-color: white;

			position: relative;
			height: $g-top-part-height;
			border-bottom: 1px solid $borderPale;
			// box-shadow: 0 2px 5px 0 rgba(0,0,0,.26);

			.g-top-button {
				margin: 0;
				padding: 0;

				span {
					text-transform: none;
				}
			}

			.md-icon-button {
				position: relative;

				width: $g-top-part-height;
				height: $g-top-part-height;

				margin: 0;
			}

			ng-md-icon svg {
				fill: $g-top-part-color;
			}

			/* .complex-datepicker-wrapper {
	      top: 15px;
	    } */

			md-select {
				margin: 0;

				md-select-value {
					border-bottom: none;
				}
			}

			md-checkbox {
				margin-bottom: 0;

				.md-label {
					margin-top: 2px;
				}
			}

			md-checkbox.g-top-link-date-checkbox {
				margin-right: 16px;
				margin-left: 8px;

				.md-label {
					white-space: nowrap;
				}
			}

			.g-top-part-left {
				.g-top-button.small-button-icon {
					padding: 0 6px;

					&:hover:not([disabled]) {
						background-color: $optionHoverColor;
					}
				}
			}
		}

		$gRowsActionSelectorWidth: 133px;

		.active-rows-actions {
			position: absolute;
			display: flex;
			justify-content: flex-start;
			align-items: center;
			left: 0;
			bottom: 0;
			right: 0;
			height: 100%;
			color: #fff;
			font-size: 16px;
			background-color: $rv-active-color;
			z-index: 1;

			.active-row-actions-wrapper {
				flex: 1 1 auto;
				max-width: 1000px;
				height: 33px;
				display: flex;

				.selected-rows-count {
					// width: 115px;
					flex: 0 0 115px;
					display: flex;
					justify-content: center;
					align-items: center;
					border-right: 1px solid #fff;

					span:first-child {
						margin-right: 5px;
					}
				}

				.ev-active-row-actions {
					.selector-btn {
						width: $gRowsActionSelectorWidth;
						margin: 0 0 0 20px;
						min-height: 33px;
						display: flex;
						flex-direction: row;
						align-items: center;
						line-height: 1;
					}
				}
			}

			.close-button {
				flex: 0 0 30px;
				color: #fff;
				// margin-right: 505px;
			}
		}

		.rows-actions-selector-popup {
			min-width: $gRowsActionSelectorWidth;
		}

		//region groups, columns, filters drag and drop
		.drop-area-wrap {
			position: absolute;
			top: 0;
			height: 100%;
			z-index: 2;

			/* .drop-area-holder {
	      display: block;
	      position: relative;
	      width: 100%;
	      height: 100%;
	      pointer-events: auto;

	       &.dragged-over + .drop-area-content {
	        background-color: rgba(0, 0, 0, 0.5);
	      }
	    } */

			.drop-area-content {
				pointer-events: none;
				position: absolute;
				top: 0;
				left: 0;

				height: 100%;
				width: 100%;

				box-sizing: border-box;
				background-color: transparent;
				z-index: 1;

				box-sizing: border-box;

				outline: 5px dashed #acacac;
				outline-offset: -10px;

				span {
					position: absolute;
					font-size: 20px;
					color: #acacac;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
				}
			}

			.g-drop-area {
				position: absolute;
				width: 100%;
				height: 100%;
				top: 0;
				left: 0;
				z-index: 1;
				background-color: rgba(0, 0, 0, 0.7);

				&.dragged-over {
					background-color: rgba(0, 0, 0, 0.5);
				}
			}
		}

		.column-to-filters-drop-area {
			left: 0;
			width: 85%;
		}

		.remove-column-drop-area {
			right: 0;
			width: 15%;
		}

		%left-right-drop-area {
			width: 150px;

			.drop-area-content {
				span {
					writing-mode: tb;
				}
			}
		}

		.left-side-groups-drop-area {
			left: 0;
			transform: rotate(180deg);

			@extend %left-right-drop-area;
		}

		.right-side-columns-drop-area {
			right: 0;

			@extend %left-right-drop-area;
		}

		//endregion groups, columns, filters drag and drop

		.g-column-bottom-row.g-table-header {
			// inside column area
			$g-table-header-height: 50px;

			min-height: $g-table-header-height;
			background-color: $g-table-header-background-color;

			.g-cell {
				position: relative;

				display: flex;
				align-items: center;

				padding-top: 0;
				padding-bottom: 0;

				height: $g-table-header-height;

				border-top: 1px solid $g-table-border-color;
			}

			.g-cell-select-all {
				position: relative;
				width: $gRowSelectionWidth;
				border-right: 1px solid $g-table-border-color;

				.md-checked {
					.md-container .md-icon {
						&:after {
							top: 0;
							bottom: 0;
							left: 5px;
						}
					}
				}
			}

			md-checkbox {
				margin: 0;

				.md-icon {
					width: 17px;
					height: 17px;
					border: 2px solid $gray;
					border-radius: 4px;
				}

				&.md-checked {
					.md-icon {
						border: none;

						&:after {
							bottom: 2px;
						}
					}
				}
			}

			.g-cell-rows-settings {
				position: relative;
				padding: 0;
				border-top: $gCellBorder;
				border-bottom: $gCellBorder;
			}

			.g-row-settings-btn {
				& > span {
					fill: $gray;
				}

				.label-icon,
				span.material-icons:not(.arrow-icon) {
					color: $gray;
				}
			}

			.g-row-settings-btn.g-row-color-picker-btn {
				&.red .material-icons {
					color: #f05a22;
				}

				&.yellow .material-icons {
					color: #fac878;
				}

				&.green .material-icons {
					color: #04f7ae;
				}
			}

			.g-groups-holder,
			.g-cols-holder {
				&.dragged-over {
					box-shadow: 0 0 8px #363636 inset;
					background: rgba(174, 174, 174, 0.3);
				}
			}

			.g-cols-holder {
				&.drop-right {
					.g-table-header-cell-wrapper:last-child {
						box-shadow: inset -8px 0px 0px rgba(0, 0, 0, 0.5);
					}
				}
			}

			.g-cell-button {
				margin: 0 0 0 1px;
				padding: 0;

				min-height: auto;

				&.md-button {
					ng-md-icon {
						width: $star-icon-size;
						height: $star-icon-size;

						svg {
							fill: $g-table-border-color;
						}
					}

					&:hover {
						background: none;

						ng-md-icon {
							svg {
								fill: $g-top-part-color;
							}
						}
					}
				}

				&.selected.md-button {
					ng-md-icon {
						svg {
							fill: #fac878;
						}
					}
				}
			}

			.g-row-settings-toggle {
				position: absolute;
				right: -10px;
				top: calc(50% - 10px);

				margin: 0;
				padding: 0;

				width: 18px;
				height: 18px;
				min-width: auto;
				min-height: auto;

				background-color: white;

				border: 1px solid $g-table-border-color;
				border-radius: 50%;
				z-index: 2;

				ng-md-icon {
					width: auto;
					height: auto;
				}
			}

			.g-table-header-cell {
				&:focus {
					outline: none;
				}

				.g-cell-button {
					width: 17px;
					height: 17px;
					font-size: 16px;
					line-height: 0;
					text-align: center;

					border: 2px solid $g-top-part-color;
					border-radius: 3px;
					box-sizing: border-box;
					z-index: 1;

					cursor: pointer;

					&:focus {
						outline: none;
					}

					.material-icons {
						font-size: 13px;
					}
				}

				.g-table-header-button {
					width: 100%;
					overflow: hidden;
					padding: 2px 0 2px 10px;
					color: #666666;
					font-weight: 700;
					font-size: 12px;

					cursor: pointer;

					/* &:hover,
	        &:focus {
	          color: black;
	        } */

					&:focus {
						outline: none;
						color: black;
					}

					.sort {
						position: relative;
						width: 13px;
						margin-top: -7px;
						margin-right: 10px;
						outline: none;
						z-index: 1;
					}

					.gt-sorting-icon {
						position: relative;
						top: 3px;
						color: #666666;
						font-size: 15px;
						font-weight: 700;
					}
				}

				&:not(.g-table-header-group-cell) {
					padding: 0;
				}

				&.g-table-header-group-cell {
					padding: 0 0 0 15px;
				}

				.g-column-sort-settings-opener {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					z-index: 1;
				}

				&:hover {
					.column-name-wrapper {
						.sort span {
							display: block;
						}
					}
				}

				.column-name-wrapper {
					display: flex;
					flex-direction: row;
					justify-content: space-between;
					align-items: center;

					width: 100%;

					.sort span {
						display: none;
					}

					.sort.has-sort span {
						display: block;
					}

					div {
						max-width: 100%;

						span {
							display: block;
							overflow: hidden;
							text-overflow: ellipsis;
						}
					}

					.name-block {
						outline: none;

						.arrow-down {
							display: none;
						}

						.column-manual-sort-icon {
							margin-left: 5px;
						}

						/*&:hover {
	            .column-manual-sort-icon {
	              margin-left: 0;
	            }
	          }*/

						/* &.active {
	            .arrow-down {
	              display: block;
	            }

	            .column-manual-sort-icon {
	              margin-left: 0;
	            }
	          } */
					}
				}
			}

			.g-table-header-cell-wrapper {
				position: relative;
				box-sizing: border-box;
				cursor: pointer;

				.resize-slider {
					width: 3px;
					height: 100%;
					background: $g-table-header-background-color;
					position: absolute;
					right: 0;
					top: 0;
					cursor: col-resize;
					border: 1px solid $g-table-border-color;
					border-left: none;
					box-sizing: border-box;
					z-index: 1;
				}

				.md-button {
					cursor: grab;
				}

				&.drop-left {
					box-shadow: inset 3px 0 0 rgba(0, 0, 0, 0.5);
				}

				&.drop-right {
					box-shadow: inset 3px 0 0 rgba(0, 0, 0, 0.5);
				}

				&.sort-menu-opened {
					.column-name-wrapper .name-block .arrow-down {
						display: block;
					}

					.column-manual-sort-icon {
						margin-left: 0;
					}

					.g-table-header-cell .g-table-header-button {
						color: black;
					}
				}

				&:hover {
					background-color: $g-table-cell-hover-color;

					.resize-slider {
						background-color: $g-table-cell-hover-color;
					}

					.column-name-wrapper .name-block .arrow-down {
						display: block;
					}

					.g-table-header-cell .g-table-header-button {
						color: black;
					}
				}

				&.error {
					span.error {
						padding-left: 10px;
						color: $rv-active-color;
					}

					.g-table-header-button {
						color: $rv-active-color;
					}
				}
			}

			.g-add-column-button {
				color: $gray;
				cursor: pointer;

				&:hover {
					background-color: transparent;
					color: $orange;
				}
			}

			@keyframes flash {
				from {
					background-color: rgba(240, 90, 34, 0.2);
				}
				to {
					background-color: rgba(240, 90, 34, 0);
				}
			}

			.last-dragged {
				background-color: rgba(240, 90, 34, 0.2);

				animation-name: flash;
				animation-timing-function: linear;
				animation-delay: 3s;
				animation-duration: 1s;
				animation-fill-mode: forwards;
			}

			.container-shadowed {
				box-shadow: 0 0 8px #363636 inset;
				background: rgba(174, 174, 174, 0.3);
			}
		}

		// <Victor 2020.1202 #69 New report viewer interface>
	}

	.md-button.g-filter-area-toggle {
		min-width: auto;
		color: $gray;

		&.active {
			color: $orange;
		}
	}

	.ev-dropdown {
		display: block;
		background: #fff;
		width: 320px;
		border: 1px solid #dcdcdc;
		z-index: 3;
	}

	.ev-dropdown-popup {
		border-radius: 4px;
		box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2),
			0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12);
		z-index: 1;

		.ev-dropdown-content {
			background-color: #fff;
			border-radius: 4px;
			overflow: hidden;
			padding: 8px 0;
		}
	}

	.ev-dropdown2 {
		min-width: 195px;
		z-index: 3;

		.ev-dropdown-content {
			font-size: 14px;

			.ev-dropdown-menu-option {
				display: flex;
				flex-direction: column;
				justify-content: center;
				height: $gPopupMenuOptionHeight;
				width: 100%;
				padding-left: 48px;
				box-sizing: border-box;

				&:hover {
					background-color: #f5f5f5;
				}
			}

			.g-menu-opt-check-icon {
				position: absolute;
				left: 17px;
				color: $gray;
			}
		}
	}

	.g-column-context-menu-popup {
		min-width: 235px;
	}

	.g-column-number-context-menu-popup {
		min-width: 266px;
	}

	.g-column-context-menu-submenu-popup {
		min-width: 186px;
	}

	.g-column-context-menu-number-format-popup {
		min-width: 247px;
	}

	.g-row-color-picker-content {
		min-width: 58px;
		width: 58px;
		padding: 0 4px;
		box-sizing: border-box;
	}

	md-menu-item > .g-row-color-picker-option, // needed to work inside md-menu
	.g-row-color-picker-option {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		min-width: auto;
		width: 58px;
		min-height: auto;
		height: $gPopupMenuOptionHeight;
		padding: 0;
		margin: 0;
		background-color: #fff;
		border: none;
		color: $gray;

		&:hover {
			background-color: #f5f5f5;
		}

		&.red {
			color: $rv-active-color;

			span {
				color: $rv-active-color;
			}
		}

		&.yellow {
			color: #fac878;
		}

		&.green {
			//color: #a5d9c9;
			color: #04f7ae;
		}

		&.divider {
			border-top: 3px solid $borderGray;
		}
	}

	.g-wrapper.g-v-split-panel-active {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
	}

	.draggable-dialog {
		position: absolute;
		box-shadow: 5px 12px 25px rgba(0, 0, 0, 0.5);

		md-toolbar {
			cursor: grab;

			.md-toolbar-tools {
				padding-left: 35px;
			}
		}
	}

	.drag-dialog {
		.g-modal-dialog {
			left: 0;
			top: 0;
			max-width: none;
			width: 440px;
			margin-top: 150px;

			&.md-transition-in {
				transition: none;
				transform: none;
				overflow: hidden;
			}

			md-toolbar {
				height: 32px;
				min-height: 32px;
			}
		}

		.draggable-dialog {
			-webkit-user-select: none;
			user-select: none;
			//transform: rotate(-140deg);
			/*right: -5px;
	    top: -7px;*/

			.md-toolbar-tools {
				height: 100%;
			}
		}
	}

	.g-settings-option-btn.md-button {
		display: flex;
	}

	.g-meta-circle {
		width: 18px;
		height: 18px;
		color: #fff;
		text-align: center;
		display: inline-block;
		border-radius: 50%;

		&.green {
			background-color: #58bf64;
		}

		&.blue {
			background-color: rgba(63, 81, 181, 0.87);
		}

		&.red {
			background-color: rgba(255, 64, 129, 0.87);
		}
	}

	.g-th-checkbox-row {
		margin-bottom: 8px;

		.g-meta-circle {
			margin-right: 24px;
		}
	}

	.drag-dialog {
		md-dialog {
			position: absolute;
		}
	}

	.g-cell-wrap {
		float: left;
		overflow: hidden;
		// background-color: #fff;
		background: transparent;

		.g-cell {
			float: none;
		}
	}

	.g-column-content {
		padding: 4px 21px 4px 8px;
		height: 16px;
		margin: 0 8px;
		overflow: visible;
		position: relative;
		background-color: #ffffff;
		border-radius: 2px;
		// border-left: 1px solid $gCellBorderColor;
		//margin-left: 14px;
		cursor: grab;

		&:after {
			content: '';
			display: block;
			clear: both;
		}

		&:hover .column-name-tooltip-wrap {
			transition: opacity 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) 0s;
			opacity: 1;
		}
	}

	.g-cell.g-column {
		//float: left;
		//display: block;
		display: inline-block;
		position: relative;
		margin: 3px 0 5px 0;
		overflow: visible;
		background-color: transparent;
		height: auto;
		padding: 0;
		min-width: 50px;

		&:first-child {
			margin-left: 2px;
		}

		.column-left-content {
			float: left;
			overflow: hidden;
			width: 100%;
			height: 100%;
		}

		.sort {
			display: inline;
			vertical-align: top;

			.md-button {
				position: relative;
				top: -7px;
				z-index: 1;
			}
		}

		.column-sort {
			min-width: 0;
			width: 20px;
		}

		.column-sort.column-both-sorted {
			opacity: 0;

			&:hover {
				opacity: 1;
			}
		}

		.column-sort-up {
			top: -8px;
			min-width: 0;
			width: 20px;
		}

		.caption {
			display: inline;
			color: #0c0c0c;
			font-size: 0.8em;
			margin-left: 4px;
			margin-right: 4px;
			vertical-align: top;
		}

		.settings-btn {
			position: absolute;
			right: 1px;

			ng-md-icon {
				top: 0;
			}
		}

		.column-btns {
			opacity: 0.5;
			min-width: auto;
			/* line-height: 1; */
			fill: #767676;
			padding: 0;
			height: 20px;
			margin: 0;
			min-height: 20px;
			width: 20px;

			&:hover {
				opacity: 1;
				background: transparent;
			}

			svg {
				height: 16px;
				width: 16px;
			}
		}

		.column-settings-menu {
			position: relative;
			bottom: 1px;
		}
	}

	.g-workarea.main-area.column-group-areas-collapsed {
		.g-grouping-component {
			height: 2px;
			overflow: hidden;
		}

		.g-columns-component.g-thead {
			height: 37px;
		}

		.g-column-title-row {
			display: none;
		}
	}

	.drag-dialog {
		.md-scroll-mask {
			display: none;
		}
	}

	body.md-dialog-is-showing {
		overflow: hidden;
	}

	.g-modal-draggable-card {
		display: inline-block;
		cursor: grab;
	}

	.group-item {
		//float: left;
		//display: block;
		display: inline-block;
		height: 2em;
		overflow: hidden;

		.add {
			.md-button {
				//background: #C6C6C6 ;
				//border-radius: 50%;
				fill: #767676;
			}
		}

		.sort {
			.md-button {
				min-width: 33px;
				//background: #C6C6C6;
				//border-radius: 50%;
				fill: #767676;
			}

			.c-up {
				position: absolute;
				top: 0px;
				left: 5px;
			}

			.c-down {
				position: absolute;
				top: 10px;
				left: 5px;
			}
		}

		.settings-btn {
			.md-button {
				fill: #767676;

				svg {
					background: transparent;
				}
			}
		}

		.caption {
			color: #0c0c0c;
			margin-right: 1em;
			margin-left: 1em;
			padding-top: 0.6em;
			font-size: 0.8em;
			cursor: grab;
		}

		.md-button {
			min-width: auto;
			line-height: 1;
			//margin-left: 3px;
			//margin-right: 3px;
			margin-right: 0px;
			margin-left: 0px;
			margin-top: -0.1em;

			svg {
				border-radius: 50%;
				//background: #C6C6C6;
				height: 1.5em;
				width: 1.5em;
			}
		}

		& > div {
			float: left;
		}
	}

	.group-row-fold-holder {
		width: 16px;
		height: 16px;
		float: left;
		margin: 4px 5px 0 0;

		md-card {
			margin: 0;
			width: 100%;
		}

		.md-button {
			min-width: 0;
			margin-right: 0;
			margin-left: 0;
			width: 16px;
			padding: 0;
			line-height: 1;
			height: 16px;
			min-height: 0;
			margin: 0;
			fill: #767676;
			position: relative;
			top: -5px;
		}

		svg {
			height: 16px;
			width: 16px;
		}
	}

	.group-folding-holder {
		width: 64px;
		float: left;
		margin-right: 10px;

		md-card {
			width: 100%;
		}

		.fold-btn-wrap {
			float: left;

			&.disabled {
				opacity: 0.5;
				cursor: not-allowed;

				.md-button {
					pointer-events: none;
					background: rgba(158, 158, 158, 0.2);
				}
			}
		}

		.grouping-fold-btn {
			min-width: 0;
			width: 32px;
		}

		.md-button {
			min-width: auto;
			margin-right: 0;
			margin-left: 0;
			width: 32px;
			line-height: 1;
			height: 32px;
			min-height: 0;
			margin: 0;
		}

		svg {
			height: 1.5em;
			width: 1.5em;
		}
	}

	.modal-dialog-card {
		margin: 0;
		display: inline-block;
		padding: 0.5em 1em;
	}
	.g-table-dial {
		position: absolute;
		// left: 5%;
		left: 20px;
		bottom: 20px;
	}

	.select-menu-visible {
		label,
		label:not(.md-no-float):not(.md-container-ignore),
		input {
			padding-left: 15px;
		}
	}

	.complex-datepicker-wrapper {
		position: relative;

		.complex-datepicker-popup-btn {
			display: block;
			min-height: 0;
			min-width: 78px;
			padding: 0;
			margin: 0;

			&:hover {
				background-color: initial;
			}
		}

		.complex-datepicker-popup-btn:not([disabled]) {
			.complex-datepicker-sel-value:hover {
				opacity: 0.5;
			}
		}

		.complex-datepicker-sel-value {
			position: relative;
			display: flex;
			flex-direction: row;
			align-items: center;
			height: 26px;
			padding: 2px 26px 1px 2px;
			margin: 0;
			box-sizing: border-box;
		}

		&.range-of-dates {
			.complex-datepicker-popup-btn {
				min-width: 156px;
			}
		}

		.complex-datepicker-custom-input {
			// cursor: pointer;

			.custom-input:not([disabled]) {
				cursor: pointer;
			}

			.custom-input-indicator-btn:hover {
				opacity: 1;
			}
		}
	}

	.complex-datepicker-settings {
		position: absolute;
		right: 0;
		bottom: 25px;
		margin: 0;
		z-index: 1;
	}

	.g-scroll-wrapper {
		display: inline-block;
		height: 28px;
		max-height: 28px;
		padding-left: 23px;
	}

	.g-scrollable-area {
		height: 100%;
		min-width: 100%;
	}

	.g-group-table-holder {
		overflow: hidden;
		max-width: 100%;
		height: 100%;
	}

	.app-md-content.g-table-overflow {
		overflow: hidden;
	}

	.column-both-sorted {
		.c-up {
			position: absolute;
			top: -4px;
			left: 0;
		}

		.c-down {
			position: absolute;
			left: 0;
			top: 3px;
		}
	}

	.group-table-body {
		.mCSB_container {
			margin-right: 0;
			padding-bottom: 5px;
		}
	}

	.table-end-row {
		width: 100%;
		height: 10px;
		background-color: #adadad;
	}

	// horizontal scroll
	.g-table-section {
		.mCSB_scrollTools.mCSB_scrollTools_horizontal {
			position: absolute;
			bottom: 0;
			opacity: 1;

			.mCSB_draggerRail {
				opacity: 0;
			}

			.mCSB_dragger_bar {
				margin: 4px auto;
			}

			.mCSB_draggerContainer {
				background: #dcdcdc;
				border-top: 1px solid #000;
			}
		}
	}

	.g-table-section {
		-webkit-backface-visibility: hidden;
		clip: rect(auto, auto, auto, auto);
		-moz-backface-visibility: hidden;
		backface-visibility: hidden;

		.mCSB_scrollTools_vertical {
			opacity: 1;
			will-change: scroll-position, height, top;

			.mCSB_draggerContainer {
				background: #dcdcdc;
				border-left: 1px solid #000;
			}
		}

		.mCSB_horizontal.mCSB_inside > .mCSB_container {
			margin-bottom: 15px;
		}

		.mCSB_scrollTools .mCSB_dragger .mCSB_dragger_bar {
			background-color: #4c334d;
		}

		.mCSB_scrollTools .mCSB_dragger:hover .mCSB_dragger_bar {
			background-color: #4c334d;
		}
	}

	#mCSB_2_scrollbar_vertical {
		opacity: 1;

		.mCSB_dragger .mCSB_dragger_bar {
			background-color: #4c334d;
		}
	}

	#mCSB_2_scrollbar_vertical .mCSB_dragger:hover .mCSB_dragger_bar {
		background-color: #4c334d;
	}

	.md-button.md-raised.to-small-btn.filter-sidenav {
		left: 0;
		line-height: 1;
	}

	.g-wrapper {
		.g-filter-sidebar {
			.f-s-expand {
				display: none;
			}
		}

		.s-f-collapsed-btns {
			display: none;
		}

		.s-f-collapsed-elems {
			display: none;
		}
	}
	.g-table-body-pagination {
		ul {
			list-style-type: none;
			margin: 0;
			overflow: hidden;
			background: #4c334d;
			padding: 4px;
		}

		li {
			display: block;
			float: left;
			background: #4c334d;
			min-width: 24px;
			height: 24px;
			text-align: center;
			line-height: 24px;
			border-radius: 2px;
			//border: 1px solid #fff;
			margin-right: 4px;

			&.active {
				background: #f4af8b;
			}

			&:hover {
				background: #f4af8b;
			}

			a {
				display: block;
				width: 100%;
				height: 100%;
				color: #fff;
				text-decoration: none;
			}
		}
	}

	.report-holder {
		.g-row.report-normal-row,
		.g-row.report-subtotal-row,
		.g-row.report-header-row {
			border-bottom: 1px solid transparent;
		}

		.g-row {
			border: none !important;
			box-shadow: -1px 0 0 0 #363636 inset, 0 1px 0 0 #363636 inset,
				-1px 1px 0 0 #363636, -1px 0 0 0 #363636 inset, 0 1px 0 0 #363636 inset;
		}

		.g-row .g-cell {
			height: 24px;
			box-sizing: border-box;
			border: none !important;
			box-shadow: -1px 0 0 0 #363636 inset, 0 1px 0 0 #363636 inset,
				-1px 1px 0 0 #363636, -1px 0 0 0 #363636 inset, 0 1px 0 0 #363636 inset;
		}

		.g-row .g-row-selection {
			box-shadow: 1px 1px 0 0 #363636 inset, 1px 1px 0 0 #363636 inset,
				-1px 1px 0 0 #363636 inset, 1px 0 0 0 #363636 inset,
				0 1px 0 0 #363636 inset;
			border: none !important;
		}

		.g-cell.g-cell-group {
			box-shadow: -1px 0 0 0 #363636 inset, 0 1px 0 0 #363636 inset,
				-1px 1px 0 0 #363636, -1px 0 0 0 #363636 inset, 0 1px 0 0 #363636 inset;
		}

		.g-row.report-preinit-row {
			border-bottom: 0;
			position: relative;
			z-index: 1;

			box-shadow: -1px 0 0 0 #363636 inset, 0 1px 0 0 #363636 inset,
				-1px 1px 0 0 #363636, -1px 0 0 0 #363636 inset, 0 1px 0 0 #363636 inset;

			.g-group {
				height: 24px;
				line-height: 24px;
			}

			.g-row-selection {
				margin-right: 6px;
			}
		}

		.g-row.report-init-row {
			position: relative;
			z-index: 1;

			.g-group {
				height: 24px;
				line-height: 24px;
			}

			.g-row-selection {
				margin-right: 6px;
			}
		}

		.g-row.report-init-row {
			box-shadow: 1px 0 0 0 #363636, 0 1px 0 0 #363636, 1px 1px 0 0 #363636,
				1px 0 0 0 #363636 inset, 0 1px 0 0 #363636 inset;
		}

		.g-row.report-subtotal-row {
			.g-cell {
				border-right: 0;
				//border-bottom: 1px solid #363636;
			}

			/* .g-cell-wrap:last-child .g-cell {
	      box-shadow: 1px 0 0 0 #363636,
	      0 1px 0 0 #363636,
	      1px 1px 0 0 #363636,
	      1px 0 0 0 #363636 inset,
	      0 1px 0 0 #363636 inset;
	    }
	    .g-cell-wrap:nth-child(2) .g-cell { //wut?
	      box-shadow: 1px 0 0 0 #363636, 0 1px 0 0 #363636, 1px 1px 0 0 #363636, 1px 0 0 0 #363636 inset;
	    } */
		}
	}

	.g-cell-group {
		background: #dcdcdc;
	}

	.cell-area-bg-1 {
		//background: rgba(187, 52, 52, 0.2);
		background: #f1d6d6;
	}

	.cell-area-bg-2 {
		background: #d6e0f1;
		//background: rgba(52, 100, 187, 0.2)
	}

	.cell-area-bg-3 {
		background: #d6f1d8;
		//background: rgba(52, 187, 62, 0.2);
	}

	.cell-line-bg-1 {
		background: rgba(187, 52, 52, 0.2);
	}

	.cell-line-bg-2 {
		background: rgba(52, 100, 187, 0.2);
	}

	.cell-line-bg-3 {
		background: rgba(52, 187, 62, 0.2);
	}

	.g-cell-group > div {
		display: inline-block;
		margin-right: 6px;

		&::after {
			display: inline-block;
			margin-left: 6px;
			content: '>';
		}
	}

	.g-cell-group > div:last-child {
		&::after {
			content: '';
		}
	}

	.g-report-settings-dialog-view {
		min-width: 570px;
		max-width: 95%;
		width: 570px;
		max-height: 90%;
		box-sizing: border-box;

		md-dialog-content {
			width: 570px;
			padding-right: 2px;
			padding-left: 20px;
			box-sizing: border-box;
		}

		h5 {
			margin: 20px 0;
		}

		.g-report-settings-row {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-left: 20px;
		}

		.g-report-settings-field {
			display: block;
			width: 280px;
		}

		.complex-datepicker-popup-btn {
			width: 100%;
		}
	}

	.g-cell {
		.group-row-fold-holder {
			position: relative;
			margin-right: 6px;
			margin-left: -10px;
			top: -4px;

			.md-button {
				top: 0;
			}
		}
	}

	.ev-permission-editor-item {
		padding: 8px 0;
		cursor: pointer;

		& > div:hover {
			background: #ccc;
		}

		& > div {
			padding: 0 16px;
		}

		& > div.selected {
			background: #ccc;
		}

		border-bottom: 1px solid #ccc;
	}

	.folded-root-item .g-cell-wrap.ng-scope {
		font-weight: bold;
	}

	.copy-report-to-buffer {
		.md-button {
			padding-left: 30px;

			ng-md-icon {
				position: absolute;
				top: 4px;
				left: 6px;
			}
		}
	}

	.split-panel-controller-container {
		//overflow: auto;
		overflow: hidden;
		height: 100%;
		width: 100%;
	}

	.vertical-split-panel-controller-container {
		height: 100%;
		width: 100%;
	}

	.column-nrs-dialog {
		md-dialog-content {
			width: 515px;

			.column-nrs-checkboxes-field {
				width: 200px;
				margin: 10px;
			}

			.column-nrs-modification-fields-container {
				padding: 0 11px;

				md-input-container {
					width: 100%;
					margin-left: 0;
					margin-right: 0;
				}
			}
		}
	}

	.g-dashboard-filter {
		position: absolute;
		top: 36px;
		background: #fff;
		height: calc(100% - 60px);
		right: 10px;
		overflow: auto;
		z-index: 10;
	}

	button.md-button.toggle-dashboard-filter-btn {
		position: absolute;
		right: 0;
		top: 0;

		min-width: 30px;
		width: 30px;
		min-height: 30px;
		height: 30px;
		background-color: #ad725d;
		fill: #fff;
		line-height: initial;
		bottom: 0;
		opacity: 0.5;
		z-index: 10;
		padding-left: 4px;

		&:hover {
			background-color: #f4af8b;
			opacity: 1;
		}
	}

	// test top-right menu
	.top-right-menu-btns {
		.g-tr-btn-holder {
			position: relative;
			width: 100%;
			padding: 2px 5px;
			box-sizing: border-box;

			&.p-r-0 {
				padding-right: 0;
			}

			.md-button {
				width: 100%;
				box-sizing: border-box;
				margin: 0;
			}
		}

		.layout-change-indicator {
			position: absolute;
			left: 3px;
			top: 3px;
			z-index: 1;
		}

		.md-button.long-text-btn {
			font-size: 9px;
		}
	}

	.test-margin-left {
		margin: 2px 2px 2px 5px !important;
	}

	.test-margin-right {
		margin: 2px 5px 2px 2px !important;
	}

	// < test top-right menu >

	.layout-settings-layout-name-holder {
		position: relative;
		text-align: left;
		width: 100%;
		min-height: 40px;
		padding: 3px 50px 0 4px;
		overflow: hidden;
		text-overflow: ellipsis;
		box-sizing: border-box;

		button.md-button {
			position: absolute;
			top: 0;
			min-width: 25px;
			width: 25px;
			min-height: 25px;
			height: 25px;
			padding: 0;
			margin: 0;
		}

		.layout-settings-is-layout-default-btn {
			right: 27px;
		}

		.layout-settings-rename-btn {
			right: 0;
		}
	}

	.layout-settings-actions-btns-container {
		margin-bottom: 10px;

		button.md-button {
			min-width: 25px;
			width: 25px;
			min-height: 25px;
			height: 25px;
			margin-left: 2px;
			margin-right: 2px;
			padding: 0;

			&:not([disabled]):hover {
				background-color: transparent;
			}

			&:first-child {
				margin-left: 0;
			}

			&:last-child {
				margin-right: 0;
			}
		}
	}

	.column-status-missing {
		opacity: 0.7;
	}

	.g-cell.cell-status-missing {
		opacity: 0.7;
	}

	.group-status-missing {
		opacity: 0.7;
	}

	.md-panel.md-tooltip {
		&.custom-field-error {
			background-color: $orange;
		}
	}

	.number-format-dialog {
		width: 570px;

		.md-toolbar-tools {
			height: 67px;

			h2 {
				color: #000000;
			}
		}

		.number-format-preset-container {
			min-height: 92px;
			padding: 0 24px;

			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;

			color: $g-top-part-color;

			border-top: 2px solid $borderPale;
			border-bottom: 2px solid $borderPale;
		}

		.preset-selector {
			width: 280px;
			height: 55px;
			display: flex;
			justify-content: space-between;
			align-items: center;

			padding: 0 10px;

			background-color: $g-table-header-background-color;
			border-bottom: 1px solid #000000;

			box-sizing: border-box;
			cursor: pointer;
		}

		.examples {
			width: 210px;
			display: flex;
			flex-direction: column;
		}

		.examples-caption {
			font-size: 12px;
		}

		.examples-items {
			width: 100%;
			color: #000000;
			font-size: 14px;

			margin-top: 4px;

			display: flex;
			flex-direction: row;
			justify-content: space-between;

			box-sizing: border-box;

			&.low-font-size {
				font-size: 12px;
			}

			&.small-font-size {
				font-size: 11px;
			}

			.red {
				color: $orange;
			}
		}

		.number-format-accordion {
			height: 416px;
			max-height: 416px;
			padding: 13px 18px;
			overflow-y: scroll;

			.cb1-main-container {
				font-size: 14px;
				margin-bottom: 10px;

				box-shadow: 2px 0px 2px rgba(0, 0, 0, 0.1),
					0px 2px 2px rgba(0, 0, 0, 0.1), -2px 0px 2px rgba(0, 0, 0, 0.1);

				&:first-child {
					border-radius: 4px 4px 0 0;
				}

				&:last-child {
					border-radius: 0 0 4px 4px;
				}

				&.cb1-block-collapsed {
					margin-bottom: 0;

					box-shadow: -2px 0px 2px rgba(0, 0, 0, 0.1),
						2px 0px 2px rgba(0, 0, 0, 0.1);

					.material-icons {
						transition: 0.35s;
					}
				}

				&:not(.cb1-block-collapsed) {
					border-bottom-left-radius: 4px;
					border-bottom-right-radius: 4px;

					.material-icons {
						transform: rotate(180deg);
						transition: 0.35s;
					}
				}

				&:last-child {
					margin-bottom: 0;
					border-bottom: 1px solid $borderPale;
				}

				.example.red {
					color: $orange;
				}

				.settings {
					.red {
						.md-label {
							color: $orange;
						}
					}
				}
			}

			.NF-group-toggle {
				min-height: 48px;
				display: flex;
				justify-content: space-between;
				align-items: center;
				cursor: pointer;

				.parameter {
					padding-left: 22px;
					flex-basis: 210px;
					color: #000000;
					font-weight: 700;
				}

				.example {
					flex-basis: 280px;
					color: $g-top-part-color;
				}

				.collapse-icon {
					padding-right: 16px;
					color: $g-top-part-color;
				}
			}

			.cb1-resizing-wrap {
				box-shadow: 0px -1px 2px rgba(0, 0, 0, 0.1);

				.settings {
					margin-left: 218px;
					margin-right: 40px;
					padding: 22px 0;

					md-radio-button {
						margin-bottom: 20px;

						&:last-child {
							margin-bottom: 0;
						}
					}

					md-radio-button.md-checked {
						.md-off {
							border-color: $orange;
						}

						.md-on {
							background-color: $orange;
						}
					}
				}
			}
		}

		.number-format-footer {
			height: 60px;
			border-top: solid 2px $borderPale;
		}
	}

	.popup-container.preset-options {
		width: 280px;
		border-radius: 3px;
	}
</style>
