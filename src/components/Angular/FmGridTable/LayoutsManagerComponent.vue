<template>
	<div class="popup-menu">
		<div class="layout-menu-item" @click="createNewLayout($event)">
			<span class="material-icons">add_circle</span>
			<span>New layout</span>
		</div>

		<md-menu-divider></md-menu-divider>

		<div class="layouts-container">
			<div v-if="!processing">
				<div v-for="layout in layouts" class="layout-menu-item">
				<span
					class="material-icons default-icons"
					v-if="!layout.origin_for_global_layout && !layout.sourced_from_global_layout"
					:class="{'default-layout': layoutIsDefault(layout)}"
					@click="setAsDefault(layout)"
				>home</span
				>

					<span
						class="material-icons default-icons"
						v-if="layout.origin_for_global_layout"
						style="color: #747474"
					>share</span
					>
					<span
						class="material-icons default-icons"
						v-if="!layout.origin_for_global_layout && layout.sourced_from_global_layout"
						style="color: #747474"
					>update</span
					>

					<a
						href="{{getLinkToLayout(layout.user_code)}}"
						@click="onLayoutLinkClick($event, layout)"
						class="layout-menu-a"
					>{{layout.name}}</a
					>
				</div>

				<div v-if="autosaveLayout.id" class="layout-menu-item">
				<span
					class="material-icons default-icons"
					:class="{'default-layout': layoutIsDefault(autosaveLayout)}"
					@click="setAsDefault(autosaveLayout)"
				>home</span
				>

					<a
						href="{{getLinkToLayout(autosaveLayout.user_code)}}"
						@click="onLayoutLinkClick($event, autosaveLayout)"
						class="layout-menu-a text-bold"
					>{{autosaveLayout.name}}</a
					>
				</div>
			</div>

			<div
				v-if="processing"
				class="p-t-16"
				layout="row"
				layout-sm="column"
				layout-align="space-around"
			>
				<progress-circular diameter="50"></progress-circular>
			</div>
		</div>

		<md-menu-divider></md-menu-divider>

		<div v-if="viewContext !== 'dashboard'">
			<md-button
				class="layout-menu-item"
				@click="saveLayoutList()"
				ng-disabled="isNewLayout"
			>
				<span class="material-icons">save</span>
				<span>Save</span>
			</md-button>

			<div class="layout-menu-item" @click="saveAsLayoutList()">
				<span class="material-icons" style="visibility: hidden">save</span>
				<span>Save as</span>
			</div>

			<div class="layout-menu-item" @click="openLayoutList($event)">
				<span class="material-icons" style="visibility: hidden">open_in_new</span>
				<span>Open</span>
			</div>
		</div>

		<div v-if="viewContext === 'dashboard'">
			<div class="layout-menu-item" @click="saveLayoutList()">
				<span class="material-icons">save</span>
				<span>Save</span>
			</div>

			<div class="layout-menu-item" @click="openLayoutList($event)">
				<span class="material-icons" style="visibility: hidden">open_in_new</span>
				<span>Open</span>
			</div>

			<div class="layout-menu-item" @click="makeCopy($event)">
				<span class="material-icons">duplicate</span>
				<span>Make copy</span>
			</div>

			<div class="layout-menu-item" @click="editDashboardLayout()">
				<span class="material-icons" style="visibility: hidden">edit</span>
				<span>Edit Dashboard Layout</span>
			</div>
		</div>

		<md-menu-divider></md-menu-divider>

		<div class="layout-menu-item" @click="exportLayout($event)">
			<span class="material-icons">exit_to_app</span>
			<span>Export</span>
		</div>

		<div
			class="layout-menu-item"
			package-manager-button
			@click="parentPopup.cancel()"
			content-type="'ui.listlayout'"
			target-content-type="targetContentType"
		>
			<span class="material-icons">system_update_alt</span>
			<span>Select from list</span>
		</div>

		<div
			class="layout-menu-item"
			@click="openInvites($event)"
			:class="{'disabled-btn': !invites.length}"
		>
			<span class="material-icons">email</span>
			<span>Invites ({{invites.length}})</span>
		</div>

		<md-button
			class="layout-menu-item"
			@click="renameLayout($event)"
			ng-disabled="isNewLayout || layout.id === autosaveLayout.id"
		>
			<span class="material-icons">create</span>
			<span>Rename</span>
		</md-button>

		<div
			v-if="layout.sourced_from_global_layout && !layout.origin_for_global_layout"
			class="layout-menu-item"
			@click="pullUpdate($event)"
		>
			<span class="material-icons">share</span>
			<span>Update</span>
		</div>

		<div
			class="layout-menu-item"
			@click="shareLayout($event)"
			v-if="layout.id !== autosaveLayout.id && ((!layout.sourced_from_global_layout && !layout.origin_for_global_layout) || (layout.sourced_from_global_layout && layout.origin_for_global_layout))"
		>
			<span class="material-icons">share</span>
			<span>Share</span>
		</div>

		<md-button
			class="layout-menu-item"
			:class="{'default-layout': layout.is_default}"
			@click="setAsDefault(layout)"
			data-ng-disabled="layoutIsDefault(layout)"
		>
			<span class="material-icons">home</span>
			<span>Make default</span>
		</md-button>

		<md-menu-divider></md-menu-divider>

		<md-button
			class="layout-menu-item"
			@click="deleteLayout($event)"
			data-ng-disabled="isNewLayout || layout.id === autosaveLayout.id"
		>
			<span class="material-icons">delete</span>
			<span>Delete</span>
		</md-button>
	</div>

</template>

<script>
import AutosaveLayoutService from '../../services/autosaveLayoutService'
import evEvents from '../../services/entityViewerEvents'
	;('use strict')

import metaService from '../../services/metaService'
// import middlewareService from '../../services/middlewareService';
import evEvents from '../../services/entityViewerEvents'
import popupEvents from '../../services/events/popupEvents'

import evHelperService from '../../services/entityViewerHelperService'

import downloadFileHelper from '../../helpers/downloadFileHelper'

import convertReportHelper from '../../helpers/converters/convertReportHelper'
import reportCopyHelper from '../../helpers/reportCopyHelper'

import exportExcelService from '../../services/exportExcelService'

import inviteToSharedConfigurationFileService from '../../services/inviteToSharedConfigurationFileService'
import shareConfigurationFileService from '../../services/shareConfigurationFileService'
// import backendConfigurationImportService from '../../services/backendConfigurationImportService';

// export default function (
// 	$mdDialog,
// 	$state,
// 	toastNotificationService,
// 	usersService,
// 	globalDataService,
// 	ecosystemDefaultService,
// 	metaContentTypesService,
// 	uiService,
// 	backendConfigurationImportService,
// 	reportHelper,
// 	evRvLayoutsHelper
// ) {
// 	console.log('evRvLayoutsHelper:', evRvLayoutsHelper)

const props = defineProps([
	'entityType',
	'evDataService',
	'evEventService',
	'spExchangeService',
	'parentPopup',
])
		// templateUrl: 'views/components/layouts-manager-view.html',
		// scope: {
		// 	entityType: '=',
		// 	evDataService: '=',
		// 	evEventService: '=',
		// 	spExchangeService: '=',
		// 	parentPopup: '=',
		// },
		// link: function (scope) {
			scope.isReport = metaService.isReport(scope.entityType)

			scope.targetContentType = metaContentTypesService.findContentTypeByEntity(
				scope.entityType,
				'ui'
			)
			scope.isNewLayout = scope.evDataService.isLayoutNew()
			scope.viewContext = scope.evDataService.getViewContext()

			scope.layout = scope.evDataService.getLayoutCurrentConfiguration(
				scope.isReport
			)
			scope.autosaveLayout = {}

			const isRootEntityViewer = scope.evDataService.isRootEntityViewer()
			let splitPanelLayoutId = null
			let spDefaultLayoutData = null
			let autosaveLayoutService = new AutosaveLayoutService(
				metaContentTypesService,
				uiService,
				reportHelper
			)

			if (!isRootEntityViewer) {
				spDefaultLayoutData = scope.evDataService.getSplitPanelDefaultLayout()
				splitPanelLayoutId = spDefaultLayoutData.layoutId
			}

			scope.layouts = []
			scope.invites = []

			scope.deleteLayout = function (ev) {
				// scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP);
				scope.parentPopup.cancel()

				$mdDialog
					.show({
						controller: 'WarningDialogController as vm',
						templateUrl: 'views/dialogs/warning-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: ev,
						clickOutsideToClose: false,
						locals: {
							warning: {
								title: 'Warning',
								description: 'Are you sure want to delete this layout?',
							},
						},
						preserveScope: true,
						autoWrap: true,
						skipHide: true,
						multiple: true,
					})
					.then(function (res) {
						if (res.status === 'agree') {
							const listLayout = scope.evDataService.getListLayout()

							uiService
								.deleteListLayoutByKey(scope.layout.id)
								.then(async function (data) {
									if (scope.layout.is_default && scope.layouts.length > 1) {
										// If default layout was deleted and other layouts exist. Make another layout default.

										let nextDefaultLayout = scope.layouts[0]

										if (scope.layouts[0].id === scope.layout.id) {
											nextDefaultLayout = scope.layouts[1]
										}

										nextDefaultLayout.is_default = true

										await uiService.updateListLayout(
											nextDefaultLayout.id,
											nextDefaultLayout
										)
									}

									if (listLayout.id === scope.layout.id) {
										scope.evDataService.setLayoutChangesLossWarningState(false)
										$state.reload()
									} else {
										scope.layouts = await getLayouts()
									}
								})
						}
					})
			}

			scope.openLayout = (layout) => {
				// scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP);
				scope.parentPopup.cancel()

				if (isRootEntityViewer) {
					if (layout.user_code) {
						// middlewareService.setNewEntityViewerLayoutName(layout.name); // Give signal to update active layout name in the toolbar
						$state.transitionTo($state.current, {
							layoutUserCode: layout.user_code,
						})
					} else {
						const errorText = 'Layout "' + layout.name + '" has no user code.'
						toastNotificationService.error(errorText)
					}
				} else {
					// middlewareService.setNewSplitPanelLayoutName(layout.name); // Give signal to update active layout name in the toolbar

					scope.evDataService.setSplitPanelLayoutToOpen(layout.id)
					scope.evEventService.dispatchEvent(evEvents.LIST_LAYOUT_CHANGE)
				}
			}

			scope.onLayoutLinkClick = function ($event, layout) {
				scope.parentPopup.cancel()
				$event.preventDefault()

				if (!isRootEntityViewer) {
					scope.evDataService.setSplitPanelLayoutToOpen(layout.id)
					scope.evEventService.dispatchEvent(evEvents.LIST_LAYOUT_CHANGE)
				} else {
					// const stateToGo = $state.current.name + "({layoutUserCode: '" + layout.user_code + "'})";
					$state.go($state.current.name, { layoutUserCode: layout.user_code })
				}
			}

			scope.getLinkToLayout = function (userCode) {
				let link = $state.href($state.current.name)
				if (userCode) link = link + '?layout=' + userCode
				return link
			}

			scope.layoutIsDefault = (layout) => {
				if (isRootEntityViewer) return layout.is_default

				return spDefaultLayoutData.layoutId === layout.id
			}

			scope.setAsDefault = (targetLayout) => {
				if (isRootEntityViewer) {
					if (!targetLayout.is_default) {
						scope.layouts.forEach((layout) => {
							layout.is_default = layout.id === targetLayout.id
						})

						targetLayout.is_default = true

						uiService
							.updateListLayout(targetLayout.id, targetLayout)
							.then(function (updatedLayoutData) {
								// needed to update is_default on front-end
								const listLayout = updatedLayoutData
								const activeLayoutConfig =
									scope.evDataService.getActiveLayoutConfiguration()

								if (listLayout.id === targetLayout.id) {
									// if active layout made default

									listLayout.is_default = true
									activeLayoutConfig.is_default = true
								} else {
									listLayout.is_default = false
									activeLayoutConfig.is_default = false
								}

								scope.evDataService.setListLayout(listLayout)
								scope.evDataService.setActiveLayoutConfiguration({
									layoutConfig: activeLayoutConfig,
								})

								scope.evEventService.dispatchEvent(
									evEvents.DEFAULT_LAYOUT_CHANGE
								)

								toastNotificationService.success(
									'Success. Layout made by default'
								)

								scope.$apply()
							})
					}
				} else if (targetLayout.id !== splitPanelLayoutId) {
					spDefaultLayoutData = {
						layoutId: targetLayout.id,
						name: targetLayout.name,
						content_type: targetLayout.content_type,
					}

					scope.evDataService.setSplitPanelDefaultLayout(spDefaultLayoutData)
					scope.evEventService.dispatchEvent(
						evEvents.SPLIT_PANEL_DEFAULT_LIST_LAYOUT_CHANGED
					)
					splitPanelLayoutId = targetLayout.id
				}
			}

			scope.openLayoutList = function ($event) {
				// scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP);
				scope.parentPopup.cancel()

				$mdDialog
					.show({
						controller: 'UiLayoutListDialogController as vm',
						templateUrl: 'views/dialogs/ui/ui-layout-list-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						preserveScope: false,
						locals: {
							options: {
								entityViewerDataService: scope.evDataService,
								entityViewerEventService: scope.evEventService,
								entityType: scope.entityType,
							},
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							if (isRootEntityViewer) {
								if (res.data.layoutUserCode) {
									// middlewareService.setNewEntityViewerLayoutName(res.data.layoutName); // Give signal to update active layout name in the toolbar
									$state.transitionTo($state.current, {
										layoutUserCode: res.data.layoutUserCode,
									})
								} else {
									var errorText =
										'Layout "' + res.data.layoutName + '" has no user code.'
									toastNotificationService.error(errorText)
								}
							} else {
								// middlewareService.setNewSplitPanelLayoutName(res.data.layoutName); // Give signal to update active layout name in the toolbar

								scope.evDataService.setSplitPanelLayoutToOpen(res.data.layoutId)
								scope.evEventService.dispatchEvent(evEvents.LIST_LAYOUT_CHANGE)
							}
						}
					})
			}

			function clearAdditions() {
				const additions = scope.evDataService.getAdditions()

				additions.isOpen = false
				additions.type = ''
				delete additions.layoutData
				/* delete additions.layoutId; */

				scope.evDataService.setSplitPanelStatus(false)
				scope.evDataService.setAdditions(additions)

				scope.currentAdditions = scope.evDataService.getAdditions()

				scope.evEventService.dispatchEvent(evEvents.ADDITIONS_CHANGE)
				// delete scope.evEventService.dispatchEvent(evEvents.UPDATE_ENTITY_VIEWER_CONTENT_WRAP_SIZE);
				scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)
			}

			var createNewLayoutMethod = function () {
				scope.evDataService.resetData()

				const rootGroup = scope.evDataService.getRootGroupData()
				scope.evDataService.setActiveRequestParametersId(rootGroup.___id)

				const defaultList = uiService.getListLayoutTemplate(scope.isReport)

				const listLayout = {}
				listLayout.data = Object.assign({}, defaultList[0].data)

				/* listLayout.name = res.data.name
					listLayout.user_code = res.data.user_code; */
				listLayout.content_type = scope.evDataService.getContentType()
				listLayout.name = 'New layout'
				listLayout.user_code = ''

				listLayout.data.columns = []

				scope.evDataService.setColumns(listLayout.data.columns)
				scope.evDataService.setGroups(listLayout.data.grouping)
				scope.evDataService.setFilters(listLayout.data.filters)

				scope.evEventService.dispatchEvent(evEvents.GROUPS_CHANGE)
				scope.evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
				scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)

				if (!scope.isReport) {
					scope.evDataService.setListLayout(listLayout)
				}

				listLayout.data.components = {
					sidebar: true,
					// groupingArea: true,
					columnArea: true,
					columnAreaHeader: true,
					splitPanel: true,
					addEntityBtn: true,
					fieldManagerBtn: true,
					layoutManager: true,
					autoReportRequest: false,
				}

				scope.evDataService.setComponents(listLayout.data.components)
				scope.evDataService.setEditorTemplateUrl(
					'views/additions-editor-view.html'
				)
				// scope.evDataService.setRootEntityViewer(true);
				scope.evDataService.setRootEntityViewer(isRootEntityViewer)

				const interfaceLayout = scope.evDataService.getInterfaceLayout()

				// interfaceLayout.groupingArea.collapsed = false;
				// interfaceLayout.groupingArea.height = 98;
				interfaceLayout.columnArea.collapsed = false
				interfaceLayout.columnArea.height = 70

				scope.evDataService.setInterfaceLayout(interfaceLayout)

				// middlewareService.setNewSplitPanelLayoutName(false);
				if (isRootEntityViewer) clearAdditions()

				if (scope.isReport) {
					const rootGroupOptions = scope.evDataService.getRootGroupOptions()
					rootGroupOptions.subtotal_type = false
					scope.evDataService.setRootGroupOptions(rootGroupOptions)

					const reportOptions = {}
					const reportLayoutOptions = {
						datepickerOptions: {
							reportFirstDatepicker: {},
							reportLastDatepicker: {},
						},
						useDateFromAbove: true,
					}

					const todaysDate = moment(new Date()).format('YYYY-MM-DD')

					var finishCreatingNewReportLayout = function () {
						scope.evDataService.setReportOptions(reportOptions)
						scope.evDataService.setReportLayoutOptions(reportLayoutOptions)
						scope.evDataService.setExportOptions({})

						listLayout.data.reportOptions = reportOptions
						listLayout.data.reportLayoutOptions = reportLayoutOptions
						listLayout.data.export = {}

						scope.evDataService.setListLayout(listLayout)
						//
						// scope.evEventService.dispatchEvent(evEvents.REPORT_OPTIONS_CHANGE);
						// scope.evEventService.dispatchEvent(evEvents.REQUEST_REPORT);
						//
						// scope.evDataService.setActiveLayoutConfiguration({isReport: scope.isReport});
						//
						// scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE);
						// scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT);
						//
						// middlewareService.setNewEntityViewerLayoutName(listLayout.name); // Give signal to update active layout name in the toolbar
						// scope.$apply(); // needed to update Report settings area in right sidebar and layout name
						// scope.isNewLayout = true;
						scope.evDataService.setIsNewLayoutState(true)

						scope.evEventService.dispatchEvent(evEvents.LAYOUT_NAME_CHANGE)
						scope.evEventService.dispatchEvent(evEvents.REPORT_OPTIONS_CHANGE)
						scope.evEventService.dispatchEvent(
							evEvents.TOGGLE_USE_REPORT_DATE_FROM_ABOVE
						)
						// middlewareService.setNewEntityViewerLayoutName(listLayout.name);

						setTimeout(function () {
							scope.$apply() // needed to update layout name inside gTopPartDirective
						}, 0)
						/*uiService.createListLayout(scope.entityType, listLayout).then(() => {
								toastNotificationService.success("Layout was successfully created");
							});

							uiService.createListLayout(scope.entityType, listLayout).then(function (data){
								$state.transitionTo($state.current, {layoutUserCode: listLayout.user_code});
							})*/
					}

					reportOptions.cost_method = 1
					reportOptions.portfolio_mode = 1
					reportOptions.account_mode = 0
					reportOptions.strategy1_mode = 0
					reportOptions.strategy2_mode = 0
					reportOptions.strategy3_mode = 0
					reportOptions.accounts_cash = []
					// reportOptions.accounts_cash[0] = 1;
					reportOptions.accounts_position = []
					// reportOptions.accounts_position[0] = 1;
					reportOptions.approach_multiplier = 0.5
					reportOptions.calculationGroup = 'portfolio'

					if (scope.entityType !== 'transaction-report') {
						reportOptions.report_date = todaysDate

						reportLayoutOptions.datepickerOptions.reportLastDatepicker = {
							datepickerMode: 'datepicker',
						}

						if (scope.entityType === 'pl-report') {
							reportOptions.pl_first_date = todaysDate

							reportLayoutOptions.datepickerOptions.reportFirstDatepicker = {
								datepickerMode: 'datepicker',
							}

							reportOptions.report_date = moment(new Date())
								.add(1, 'day')
								.format('YYYY-MM-DD')
						}

						ecosystemDefaultService.getList().then(function (data) {
							const defaultValues = data.results[0]
							reportOptions.pricing_policy = defaultValues.pricing_policy
							reportOptions.report_currency = defaultValues.currency

							finishCreatingNewReportLayout()
						})
					} else {
						// For transaction report

						reportOptions.date_field = null

						reportOptions.begin_date = todaysDate

						reportLayoutOptions.datepickerOptions.reportFirstDatepicker = {
							datepickerMode: 'datepicker',
						}

						reportOptions.end_date = todaysDate

						reportLayoutOptions.datepickerOptions.reportLastDatepicker = {
							datepickerMode: 'datepicker',
						}

						finishCreatingNewReportLayout()
					}
				} else {
					// scope.evDataService.setActiveLayoutConfiguration({isReport: scope.isReport});
					// scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE);
					//
					// middlewareService.setNewEntityViewerLayoutName(listLayout.name); // Give signal to update active layout name in the toolbar
					//
					// scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT);
					//
					// scope.isNewLayout = true;
					scope.evDataService.setIsNewLayoutState(true)

					scope.evDataService.setListLayout(listLayout)

					// middlewareService.setNewEntityViewerLayoutName(listLayout.name);
					scope.evEventService.dispatchEvent(evEvents.LAYOUT_NAME_CHANGE)

					setTimeout(() => {
						scope.$apply() // needed to update layout name inside gTopPartDirective
					}, 0)

					/* uiService.createListLayout(scope.entityType, listLayout).then(() => {
							toastNotificationService.success("Layout was successfully created");
						});
						uiService.createListLayout(scope.entityType, listLayout).then(function (data){
							$state.transitionTo($state.current, {layoutUserCode: listLayout.user_code});
						}) */
				}

				scope.parentPopup.cancel()
			}

			scope.createNewLayout = function () {
				/*var activeLayoutConfig = scope.evDataService.getActiveLayoutConfiguration();
                    var layoutCurrentConfig = scope.evDataService.getLayoutCurrentConfiguration(scope.isReport);*/

				const activeLayoutConfig =
					scope.evDataService.getActiveLayoutConfiguration()

				let spChangedLayout = false
				if (isRootEntityViewer) {
					const additions = scope.evDataService.getAdditions()
					if (additions.isOpen) {
						spChangedLayout =
							scope.spExchangeService.getSplitPanelChangedLayout()
					}
				}

				let layoutChanged = false
				let layoutCurrentConfig

				if (activeLayoutConfig && activeLayoutConfig.data) {
					layoutCurrentConfig =
						scope.evDataService.getLayoutCurrentConfiguration(scope.isReport)

					layoutChanged = !evHelperService.checkForLayoutConfigurationChanges(
						activeLayoutConfig,
						layoutCurrentConfig,
						scope.isReport
					)
				}

				//if (!evHelperService.checkForLayoutConfigurationChanges(activeLayoutConfig, layoutCurrentConfig, scope.isReport)) {
				if (layoutChanged || spChangedLayout) {
					$mdDialog
						.show({
							controller: 'LayoutChangesLossWarningDialogController as vm',
							templateUrl:
								'views/dialogs/layout-changes-loss-warning-dialog.html',
							parent: document.querySelector('.dialog-containers-wrap'),
							preserveScope: false,
							autoWrap: true,
							multiple: true,
							locals: {
								data: null,
							},
						})
						.then(function (res, rej) {
							if (res.status === 'save_layout') {
								const layoutsSavePromises = []

								// if split panel layout changed, save it
								if (spChangedLayout) {
									const saveSPLayoutChanges = new Promise(function (
										spLayoutSaveRes,
										spLayoutSaveRej
									) {
										if (spChangedLayout.hasOwnProperty('id')) {
											uiService
												.updateListLayout(spChangedLayout.id, spChangedLayout)
												.then(function () {
													spLayoutSaveRes(true)
												})
										} else {
											uiService
												.createListLayout(scope.entityType, spChangedLayout)
												.then(function () {
													spLayoutSaveRes(true)
												})
										}
									})

									layoutsSavePromises.push(saveSPLayoutChanges)
								}
								// < if split panel layout changed, save it >

								/*if (layoutCurrentConfig.hasOwnProperty('id')) {

                                    uiService.updateListLayout(layoutCurrentConfig.id, layoutCurrentConfig).then(function () {
                                        createNewLayoutMethod();
                                    });

                                } else {

                                    uiService.createListLayout(scope.entityType, layoutCurrentConfig).then(function () {
                                        createNewLayoutMethod();
                                    });

                                }*/
								if (activeLayoutConfig && layoutChanged) {
									const saveLayoutChanges = new Promise(function (
										saveLayoutRes,
										saveLayoutRej
									) {
										if (layoutCurrentConfig.hasOwnProperty('id')) {
											uiService
												.updateListLayout(
													layoutCurrentConfig.id,
													layoutCurrentConfig
												)
												.then(function () {
													saveLayoutRes(true)
												})
										} else {
											if (res.data && res.data.layoutName) {
												layoutCurrentConfig.name = res.data.layoutName
											}

											/* When saving is_default: true layout on backend, others become is_default: false
                                            uiService.getDefaultListLayout(scope.entityType).then(function (data) {

                                                layoutCurrentConfig.is_default = true;

                                                if (data.count > 0 && data.results) {
                                                    var activeLayout = data.results[0];
                                                    activeLayout.is_default = false;

                                                    uiService.updateListLayout(activeLayout.id, activeLayout).then(function () {

                                                        uiService.createListLayout(scope.entityType, layoutCurrentConfig).then(function () {
                                                            saveLayoutRes(true);
                                                        });

                                                    });

                                                } else {
                                                    uiService.createListLayout(scope.entityType, layoutCurrentConfig).then(function () {
                                                        saveLayoutRes(true);
                                                    });
                                                }

                                            }); */

											uiService
												.createListLayout(scope.entityType, layoutCurrentConfig)
												.then(function () {
													saveLayoutRes(true)
												})
										}
									})

									layoutsSavePromises.push(saveLayoutChanges)
								}

								Promise.all(layoutsSavePromises).then(function () {
									createNewLayoutMethod()
								})
							} else if (res.status === 'do_not_save_layout') {
								createNewLayoutMethod()
							}
						})
				} else {
					createNewLayoutMethod()
				}
			}

			scope.saveLayoutList = function () {
				// scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP);
				scope.parentPopup.cancel()
				evRvLayoutsHelper.saveLayoutList(
					scope.evDataService,
					scope.isReport,
					usersService,
					globalDataService
				)
			}

			/* var applyLayout = function (layout) {

					if (isRootEntityViewer) {

						middlewareService.setNewEntityViewerLayoutName(layout.name);

					} else {
						scope.evDataService.setSplitPanelDefaultLayout(layout.id);
						scope.evEventService.dispatchEvent(evEvents.SPLIT_PANEL_DEFAULT_LIST_LAYOUT_CHANGED);
						middlewareService.setNewSplitPanelLayoutName(layout.name); // Give signal to update active split panel layout name in the toolbar
					}

					scope.evDataService.setListLayout(layout);
					scope.evDataService.setActiveLayoutConfiguration({layoutConfig: layout});

					scope.evEventService.dispatchEvent(evEvents.LAYOUT_NAME_CHANGE);

					toastNotificationService.success("New layout with name '" + layout.name + "' created");

					scope.isNewLayout = false;
					scope.evDataService.setIsNewLayoutState(scope.isNewLayout);

					scope.$apply();

				};

				scope.getLayoutByUserCode = function (userCode) {

					const contentType = metaContentTypesService.findContentTypeByEntity(scope.entityType, 'ui');

					return uiService.getListLayout(
						null,
						{
							pageSize: 1000,
							filters: {
								content_type: contentType,
								user_code: userCode
							}
						}
					);

				};

				var overwriteLayout = function (changeableLayout, listLayout) {

					const id = changeableLayout.id;

					listLayout.id = id;
					changeableLayout.data = listLayout.data;
					changeableLayout.name = listLayout.name;

					return uiService.updateListLayout(id, changeableLayout);

				}; */

			scope.saveAsLayoutList = function ($event) {
				// scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP);
				scope.parentPopup.cancel()

				/* const listLayout = scope.evDataService.getLayoutCurrentConfiguration(scope.isReport);

                    $mdDialog.show({
                        controller: 'UiLayoutSaveAsDialogController as vm',
                        templateUrl: 'views/dialogs/ui/ui-layout-save-as-view.html',
                        parent: angular.element(document.body),
                        targetEvent: $event,
                        locals: {
                            options: {
                            	label: "Save layout as",
								layoutName: listLayout.name,
                                complexSaveAsLayoutDialog: {
                                    entityType: scope.entityType
                                }
                            }
                        },
                        clickOutsideToClose: false

                    })
					.then(function (res) {

                        if (res.status === 'agree') {

                            const saveAsLayout = function () {

                                listLayout.name = res.data.name;
                                listLayout.user_code = res.data.user_code;

                                uiService.createListLayout(scope.entityType, listLayout).then(function (data) {

                                    listLayout.id = data.id;
                                    applyLayout(listLayout);

                                }).catch(error => {
                                    toastNotificationService.error("Error occurred");
                                });

                            };

                            if (listLayout.id) { // if layout based on another existing layout

                                if (isRootEntityViewer) {

                                    listLayout.is_default = true;

                                } else { // for split panel

                                    listLayout.is_default = false;

                                }

                                delete listLayout.id;
                                saveAsLayout();

                            } else { // if layout was not based on another layout

                                if (isRootEntityViewer) {
                                    listLayout.is_default = true;
                                }

                                saveAsLayout();
                            }
                        }

                        if (res.status === 'overwrite') {

                            const userCode = res.data.user_code;

                            listLayout.name = res.data.name;
                            listLayout.user_code = userCode;

                            scope.getLayoutByUserCode(userCode).then(function (changeableLayoutData) {

                                const changeableLayout = changeableLayoutData.results[0];
                                overwriteLayout(changeableLayout, listLayout).then(function (updatedLayoutData) {

                                    listLayout.is_default = true;
                                    listLayout.modified = updatedLayoutData.modified;
                                    applyLayout(listLayout);

                                });

                            });

                        }

                    }); */
				evRvLayoutsHelper
					.saveAsLayoutList(
						scope.evDataService,
						scope.evEventService,
						scope.isReport,
						$mdDialog,
						scope.entityType,
						$event
					)
					.then((saveAsData) => {
						if (saveAsData.status !== 'disagree') scope.$apply()
					})
			}

			scope.exportLayout = function ($event) {
				// scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP);
				scope.parentPopup.cancel()

				$mdDialog.show({
					controller: 'ListLayoutExportDialogController as vm',
					templateUrl: 'views/dialogs/list-layout-export-dialog-view.html',
					parent: angular.element(document.body),
					targetEvent: $event,
					locals: {
						data: { layout: scope.layout, isReport: scope.isReport },
					},
				})
			}

			scope.openInvites = function ($event) {
				// scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP);
				scope.parentPopup.cancel()

				$mdDialog.show({
					controller: 'UiLayoutListInvitesDialogController as vm',
					templateUrl: 'views/dialogs/ui/ui-layout-list-invites-view.html',
					parent: angular.element(document.body),
					targetEvent: $event,
					preserveScope: false,
					locals: {
						options: {
							entityViewerDataService: scope.evDataService,
							entityViewerEventService: scope.evEventService,
							entityType: scope.entityType,
						},
					},
				})
			}

			// scope.exportAsPdf = function ($event) {
			//
			//     scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP);
			//
			//     $mdDialog.show({
			//         controller: 'ExportPdfDialogController as vm',
			//         templateUrl: 'views/dialogs/export-pdf-dialog-view.html',
			//         parent: angular.element(document.body),
			//         targetEvent: $event,
			//         locals: {
			//             evDataService: scope.evDataService,
			//             evEventService: scope.evEventService,
			//             data: {entityType: scope.entityType}
			//         }
			//     })
			//
			// };
			//
			// scope.exportAsCSV = function () {
			//
			//     scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP);
			//
			//     const flatList = scope.evDataService.getFlatList();
			//     const columns = scope.evDataService.getColumns();
			//     const groups = scope.evDataService.getGroups();
			//
			//     const blobPart = convertReportHelper.convertFlatListToCSV(flatList, columns, scope.isReport, groups.length);
			//     downloadFileHelper.downloadFile(blobPart, "text/plain", "report.csv");
			// };
			//
			// scope.exportAsExcel = function() {
			//
			//     scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP);
			//
			//     const data = {
			//         entityType: scope.entityType,
			//         contentSettings: {
			//             columns: scope.evDataService.getColumns(),
			//             groups: scope.evDataService.getGroups()
			//         },
			//         content: scope.evDataService.getFlatList()
			//     };
			//
			//     exportExcelService.generatePdf(data).then(function (blob) {
			//
			//         downloadFileHelper.downloadFile(blob, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "report.xlsx");
			//
			//         $mdDialog.hide();
			//
			//     })
			//
			// };
			//
			// scope.copyReport = function () {
			//
			//     scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP);
			//     reportCopyHelper.copy(scope.evDataService, scope.isReport);
			//
			// };
			//
			// scope.copySelectedToBuffer = function () {
			//
			//     scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP);
			//     reportCopyHelper.copy(scope.evDataService, scope.isReport, 'selected');
			//
			// };

			scope.renameLayout = function ($event) {
				// scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP);
				scope.parentPopup.cancel()

				//$event.stopPropagation();
				// var layoutData = layoutsList[index];
				const layoutData = scope.layout

				$mdDialog
					.show({
						controller: 'UiLayoutSaveAsDialogController as vm',
						templateUrl: 'views/dialogs/ui/ui-layout-save-as-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						multiple: true,
						clickOutsideToClose: false,
						locals: {
							options: {
								layoutName: layoutData.name,
								layoutUserCode: layoutData.user_code,
							},
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							layoutData.name = res.data.name
							layoutData.user_code = res.data.user_code

							uiService
								.updateListLayout(layoutData.id, layoutData)
								.then(function (updatedLayoutData) {
									const listLayout = updatedLayoutData

									scope.evDataService.setListLayout(listLayout)
									scope.evDataService.setActiveLayoutConfiguration({
										layoutConfig: listLayout,
									})

									/* if (isRootEntityViewer) {
                                    middlewareService.setNewEntityViewerLayoutName(layoutData.name); // Give signal to update active layout name in the toolbar
                                } else {
                                    middlewareService.setNewSplitPanelLayoutName(layoutData.name); // Give signal to update active layout name in the toolbar
                                } */

									scope.evEventService.dispatchEvent(
										evEvents.LAYOUT_NAME_CHANGE
									)

									toastNotificationService.success(
										'Success. Layout has been renamed.'
									)

									scope.$apply()
								})
						}
					})
			}

			scope.shareLayout = function ($event) {
				// needed because on slower devices option "Share" may not hide in time
				if (scope.layout.id === scope.autosaveLayout.id) {
					return
				}
				// scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP);
				scope.parentPopup.cancel()

				let type = 'entity_viewer'

				if (scope.evDataService.getEntityType().indexOf('report') !== -1) {
					type = 'report_viewer'
				}

				$mdDialog
					.show({
						controller: 'UiShareLayoutDialogController as vm',
						templateUrl: 'views/dialogs/ui/ui-share-layout-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						multiple: true,
						clickOutsideToClose: false,
						locals: {
							options: {
								layout: scope.layout,
								type: type,
							},
						},
					})
					.then(async function (res) {
						if (res.status === 'agree') {
							// vm.getList();
							scope.layouts = await getLayouts()
						}
					})
			}

			scope.importConfiguration = function (resolve) {
				backendConfigurationImportService
					.importConfigurationAsJson(scope.importConfig)
					.then(function (data) {
						scope.importConfig = data

						scope.$apply()

						if (scope.importConfig.task_status === 'SUCCESS') {
							resolve()
						} else {
							setTimeout(function () {
								scope.importConfiguration(resolve)
							}, 1000)
						}
					})
			}

			scope.pullUpdate = function ($event) {
				// scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP);
				scope.parentPopup.cancel()

				shareConfigurationFileService
					.getByKey(scope.layout.sourced_from_global_layout)
					.then(function (data) {
						var sharedFile = data

						scope.importConfig = { data: sharedFile.data, mode: 'overwrite' }

						new Promise(function (resolve, reject) {
							scope.importConfiguration(resolve)
						}).then(function (data) {
							toastNotificationService.success(
								"Layout '" + scope.layout.name + "' was updated"
							)
						})
					})
			}

			const getLayouts = async () => {
				const { results } = await uiService.getListLayout(scope.entityType, {
					pageSize: 1000,
				})

				const autosaveLayoutUserCode =
					autosaveLayoutService.getAutosaveLayoutUserCode(
						scope.targetContentType
					)
				const autosaveLayoutIndex = results.findIndex(
					(layout) => layout.user_code === autosaveLayoutUserCode
				)

				if (autosaveLayoutIndex > -1) {
					scope.autosaveLayout = results.splice(autosaveLayoutIndex, 1)[0]
				}

				return results
			}

			const getInvites = function () {
				inviteToSharedConfigurationFileService
					.getListOfMyInvites({
						filters: {
							status: '0',
						},
					})
					.then(function (data) {
						scope.invites = data.results

						scope.$apply()
					})
			}

			const init = async () => {
				Promise.allSettled([getLayouts(), getInvites()]).then((resData) => {
					if (resData[0].status === 'fulfilled')
						scope.layouts = resData[0].value

					scope.$apply()
				})
			}

			init()
// 		},
// 	}
// }

</script>

<style lang="scss" scoped>

</style>
