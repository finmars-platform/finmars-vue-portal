/**
 * Created by szhitenev on 05.05.2016.
 *
 * DEPRECATED.
 */

import evEvents from '../../services/entityViewerEvents'
import evDomManager from '../../services/ev-dom-manager/ev-dom.manager'

import pricingPolicyService from '../../services/pricingPolicyService'
import currencyService from '../../services/currencyService'

// import middlewareService from '../../services/middlewareService';

import metaService from '../../services/metaService'

export default function (
	$mdDialog,
	$state,
	fieldResolverService,
	evRvLayoutsHelper
) {
	return {
		restrict: 'AE',
		scope: {
			evDataService: '=',
			evEventService: '=',
			attributeDataService: '=',
			spExchangeService: '=',
			contentWrapElement: '=',
		},
		templateUrl: 'views/directives/groupTable/g-sidebar-filter-view.html',
		link: function (scope, elem, attrs) {
			scope.filters = scope.evDataService.getFilters()
			scope.entityType = scope.evDataService.getEntityType()
			scope.contentType = scope.evDataService.getContentType()
			scope.reportOptions = scope.evDataService.getReportOptions()

			if (!scope.reportLayoutOptions) {
				scope.reportLayoutOptions = {}
			}

			scope.isReport = metaService.isReport(scope.entityType)
			scope.isRootEntityViewer = scope.evDataService.isRootEntityViewer()
			scope.viewContext = scope.evDataService.getViewContext()
			scope.isLayoutDefault = false

			scope.missingPricesData = {
				items: [],
			}

			scope.isReportFilterFromDashboard =
				scope.evDataService.dashboard.isReportDateFromDashboard()

			scope.fields = {}

			var listLayout = scope.evDataService.getListLayout()
			scope.layoutName = listLayout.name

			var entityAttrs = []
			var dynamicAttrs = []

			var contextMenu = {}
			var ttypes = null

			var checkIsLayoutDefault = function () {
				var listLayout = scope.evDataService.getLayoutCurrentConfiguration(
					scope.isReport
				)

				if (scope.isRootEntityViewer) {
					scope.isLayoutDefault = listLayout.is_default
				} else {
					var spDefaultLayoutData =
						scope.evDataService.getSplitPanelDefaultLayout()

					if (spDefaultLayoutData.layoutId === listLayout.id) {
						scope.isLayoutDefault = true
					} else {
						scope.isLayoutDefault = false
					}
				}
			}

			var getAttributes = function () {
				var allAttrsList = []

				if (scope.viewContext === 'reconciliation_viewer') {
					allAttrsList =
						scope.attributeDataService.getReconciliationAttributes()
				} else {
					switch (scope.entityType) {
						case 'balance-report':
							allAttrsList =
								scope.attributeDataService.getBalanceReportAttributes()
							break

						case 'pl-report':
							allAttrsList = scope.attributeDataService.getPlReportAttributes()
							break

						case 'transaction-report':
							allAttrsList =
								scope.attributeDataService.getTransactionReportAttributes()
							break

						default:
							entityAttrs = []
							dynamicAttrs = []
							allAttrsList = []

							entityAttrs =
								scope.attributeDataService.getEntityAttributesByEntityType(
									scope.entityType
								)

							entityAttrs.forEach(function (item) {
								if (
									item.key === 'subgroup' &&
									item.value_entity.indexOf('strategy') !== -1
								) {
									item.name = 'Group'
								}
								item.entity = scope.entityType
							})

							var instrumentUserFields =
								scope.attributeDataService.getInstrumentUserFields()
							var transactionUserFields =
								scope.attributeDataService.getTransactionUserFields()

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
								scope.attributeDataService.getDynamicAttributesByEntityType(
									scope.entityType
								)

							dynamicAttrs = dynamicAttrs.map(function (attribute) {
								var result = {}

								result.attribute_type = Object.assign({}, attribute)
								result.value_type = attribute.value_type
								result.content_type = scope.contentType
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

			var prepareReportLayoutOptions = function () {
				scope.reportLayoutOptions = scope.evDataService.getReportLayoutOptions()

				// preparing data for complexZhDatePickerDirective
				if (!scope.reportLayoutOptions.hasOwnProperty('datepickerOptions')) {
					scope.reportLayoutOptions.datepickerOptions = {}
				}

				if (
					!scope.reportLayoutOptions.datepickerOptions.hasOwnProperty(
						'reportLastDatepicker'
					)
				) {
					scope.reportLayoutOptions.datepickerOptions.reportLastDatepicker = {}
				}

				if (
					!scope.reportLayoutOptions.datepickerOptions.hasOwnProperty(
						'reportFirstDatepicker'
					)
				) {
					scope.reportLayoutOptions.datepickerOptions.reportFirstDatepicker = {}
				}

				scope.datepickerFromDisplayOptions = {
					position: 'left',
					labelName: 'Date from (excl)',
				}

				scope.datepickerToDisplayOptions = { position: 'left' }

				if (
					scope.entityType === 'pl-report' ||
					scope.entityType === 'transaction-report'
				) {
					if (scope.entityType === 'transaction-report') {
						scope.datepickerFromDisplayOptions = {
							position: 'left',
							labelName: 'Date from (incl)',
						}
					}

					scope.datepickerToDisplayOptions = {
						position: 'left',
						labelName: 'Date to (incl)',
						modes: {
							inception: false,
						},
					}
				}
				/* < preparing data for complexZhDatePickerDirective > */
			}

			scope.getNameOfReportLastDate = function () {
				if (
					scope.entityType === 'pl-report' ||
					scope.entityType === 'transaction-report'
				) {
					return 'To'
				}

				return 'Report Date'
			}

			scope.resolveFilterValue = function (field) {
				return field.id ? field.id : field.key
			}

			if (scope.isReport === true) {
				var ppOptions = {
					pageSize: 1000,
					page: 1,
				}

				scope.pricingPolicies = []

				var getPricingPolicies = function () {
					new Promise(function (resolve, reject) {
						pricingPolicyService
							.getListLight(ppOptions)
							.then(function (data) {
								scope.pricingPolicies = scope.pricingPolicies.concat(
									data.results
								)

								if (data.next) {
									ppOptions.page = ppOptions.page + 1
									getPricingPolicies(resolve, reject)
								} else {
									scope.$apply()
									resolve(true)
								}
							})
							.catch(function (error) {
								reject(error)
							})
					})
				}

				getPricingPolicies()

				var currencyOptions = {
					pageSize: 1000,
					page: 1,
				}

				scope.currencies = []

				var getCurrencies = function () {
					new Promise(function (resolve, reject) {
						currencyService
							.getListLight(currencyOptions)
							.then(function (data) {
								scope.currencies = scope.currencies.concat(data.results)

								if (data.next) {
									currencyOptions.page = currencyOptions.page + 1
									getPricingPolicies(resolve, reject)
								} else {
									scope.$apply()
									resolve(true)
								}
							})
							.catch(function (error) {
								reject(error)
							})
					})
				}

				getCurrencies()

				prepareReportLayoutOptions()
			}

			scope.updateReportOptions = function () {
				var reportOptions = scope.evDataService.getReportOptions()
				var reportLayoutOptions = scope.evDataService.getReportLayoutOptions()

				var newReportOptions = Object.assign(
					{},
					reportOptions,
					scope.reportOptions
				)
				var newReportLayoutOptions = Object.assign(
					{},
					reportLayoutOptions,
					scope.reportLayoutOptions
				)
				// TODO Delete in future
				delete newReportLayoutOptions.reportFirstDatepicker
				delete newReportLayoutOptions.reportLastDatepicker
				// < Delete in future >


				scope.evDataService.setReportOptions(newReportOptions)
				scope.evDataService.setReportLayoutOptions(newReportLayoutOptions)

				scope.evEventService.dispatchEvent(evEvents.REPORT_OPTIONS_CHANGE) // needed to keep tracks of changes for didLayoutChanged from gActionsBlockComponent

				setTimeout(function () {
					scope.$apply()
				}, 200)
			}

			scope.openMissingPricesDialog = function ($event) {
				$mdDialog.show({
					controller: 'ReportPriceCheckerDialogController as vm',
					templateUrl:
						'views/dialogs/report-missing-prices/report-price-checker-dialog-view.html',
					parent: angular.element(document.body),
					targetEvent: $event,
					locals: {
						data: {
							missingPricesData: scope.missingPricesData,
							evDataService: scope.evDataService,
						},
					},
				})
			}

			scope.openPeriodsDialog = function ($event) {
				$mdDialog
					.show({
						controller: 'PeriodsEditorDialogController as vm',
						templateUrl: 'views/dialogs/periods-editor-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						locals: {
							options: {
								periods: scope.reportOptions.periods,
							},
						},
					})
					.then(function (res) {


						if (res.status === 'agree') {
							// scope.externalCallback({reportOptionsUpdated: true, options: {reportOptions: res.data}});
							scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
						}
					})
			}

			scope.openContextMenu = function ($event) {
				$event.stopPropagation()

				var lastClickedRow = scope.evDataService.getActiveObject()

				if (lastClickedRow) {
					var objectId = lastClickedRow.___id
					var parentGroupHashId = lastClickedRow.___parentId

					//var contextMenuPosition = 'top: ' + $event.pageY + 'px; right: 0;';
					var contextMenuPosition = {
						positionX: $event.pageX,
						positionY: $event.pageY,
					}

					if (scope.isReport) {
						rvDomManager.createPopupMenu(
							objectId,
							contextMenu,
							ttypes,
							parentGroupHashId,
							scope.evDataService,
							scope.evEventService,
							contextMenuPosition
						)
					} else {
						evDomManager.createPopupMenu(
							objectId,
							parentGroupHashId,
							scope.evDataService,
							scope.evEventService,
							contextMenuPosition
						)
					}
				}
			}

			scope.resizeFilterSideNav = function (actionType) {
				if (actionType === 'collapse') {
					$('body').addClass('filter-side-nav-collapsed')
				} else {
					$('body').removeClass('filter-side-nav-collapsed')
				}

				scope.evEventService.dispatchEvent(evEvents.TOGGLE_FILTER_AREA)
			}

			scope.openFilterSettings = function ($mdOpenMenu, ev) {
				$mdOpenMenu(ev)
			}

			scope.toggleFilterState = function () {
				scope.evDataService.resetData()
				scope.evDataService.resetRequestParameters()

				var rootGroup = scope.evDataService.getRootGroupData()

				scope.evDataService.setActiveRequestParametersId(rootGroup.___id)

				scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
			}

			scope.filterChange = function (filter) {
				scope.evDataService.resetData()
				scope.evDataService.resetRequestParameters()

				var rootGroup = scope.evDataService.getRootGroupData()

				scope.evDataService.setActiveRequestParametersId(rootGroup.___id)

				scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
			}

			scope.selectAll = function () {
				scope.filters.forEach(function (item) {
					item.options.enabled = true
				})

				scope.evDataService.setFilters(scope.filters)
				scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)

				scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
			}

			scope.clearAll = function () {
				if (scope.filters && scope.filters.length > 0) {
					var hasEnabledFilters = false
					var hasFrontendFilters = false

					scope.filters.forEach(function (filter) {
						if (filter.options.filter_type === 'date_tree') {
							filter.options.dates_tree = []
						}

						if (filter.options.filter_type === 'from_to') {
							filter.options.filter_values = {}
						} else {
							filter.options.filter_values = []
						}

						if (filter.options.enabled) {
							hasEnabledFilters = true
						}

						if (filter.options.is_frontend_filter) {
							hasFrontendFilters = true
						}
					})

					scope.evDataService.setFilters(scope.filters)
					scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)

					if (hasEnabledFilters) {
						if (scope.isReport) {
							scope.evDataService.resetData()
							scope.evDataService.resetRequestParameters()

							var rootGroup = scope.evDataService.getRootGroupData()

							scope.evDataService.setActiveRequestParametersId(rootGroup.___id)

							scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
						} else if (hasFrontendFilters) {
							scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
						}
					}
				}
			}

			scope.deselectAll = function () {
				scope.filters.forEach(function (item) {
					item.options.enabled = false
				})

				scope.evDataService.setFilters(scope.filters)
				scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)

				scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
			}

			scope.useFromAbove = function (filter) {
				if (!filter.hasOwnProperty('options')) {
					filter.options = {}
				}

				filter.options.useFromAbove = !filter.options.useFromAbove

				scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
			}

			scope.renameFilter = function (filter, $mdMenu, $event) {
				$mdMenu.close($event)

				$mdDialog.show({
					controller: 'RenameFieldDialogController as vm',
					templateUrl: 'views/dialogs/rename-field-dialog-view.html',
					parent: angular.element(document.body),
					targetEvent: $event,
					locals: {
						data: filter,
					},
				})
			}

			scope.removeFilter = function (filter) {
				scope.filters = scope.filters
					.map(function (item) {
						// if (item.id === filter.id || item.name === filter.name) {
						if (item.name === filter.name) {
							// return undefined;
							item = undefined
						}

						return item
					})
					.filter(function (item) {
						return !!item
					})

				scope.evDataService.setFilters(scope.filters)
				scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)
				scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
			}

			scope.getFilterType = function (filterType) {
				switch (filterType) {
					case 'field':
					case 'mc_field':
						return true
						break
					default:
						return false
						break
				}
			}

			var attrsWithoutFilters = ['notes']

			scope.addFilter = function ($event) {
				var allAttrsList = getAttributes()

				var availableAttrs

				availableAttrs = allAttrsList.filter(function (attr) {
					for (var i = 0; i < scope.filters.length; i++) {
						if (scope.filters[i].key === attr.key) {
							return false
						}
					}

					if (attrsWithoutFilters.indexOf(attr.key) !== -1) {
						return false
					}

					return true
				})

				$mdDialog
					.show({
						controller: 'TableAttributeSelectorDialogController as vm',
						templateUrl:
							'views/dialogs/table-attribute-selector-dialog-view.html',
						targetEvent: $event,
						multiple: true,
						locals: {
							data: {
								availableAttrs: availableAttrs,
								title: 'Choose column to add',
								isReport: scope.isReport,
								multiselector: true,
							},
						},
					})
					.then(function (res) {
						if (res && res.status === 'agree') {
							res.data.groups = true

							for (var i = 0; i < res.data.items.length; i = i + 1) {
								scope.filters.push(res.data.items[i])
							}
							scope.evDataService.setFilters(scope.filters)
							scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)
						}
					})
			}

			var dragAndDrop = {
				init: function () {
					this.dragulaInit()
					this.eventListeners()
				},

				eventListeners: function () {
					this.dragula.on('over', function (elem, container, source) {
						$(container).addClass('active')
						$(container).on('mouseleave', function () {
							$(this).removeClass('active')
						})
					})

					this.dragula.on('drop', function (elem, target) {
						$(target).removeClass('active')

						var filterCards = target.querySelectorAll('.filterCardHolder')
						var newFiltersOrder = []

						filterCards.forEach(function (filter) {
							var filterKey = filter.dataset.filterKey

							for (var i = 0; i < scope.filters.length; i++) {
								if (scope.filters[i].key === filterKey) {
									newFiltersOrder.push(scope.filters[i])
									break
								}
							}
						})

						scope.evDataService.setFilters(newFiltersOrder)
						scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)
					})
				},

				dragulaInit: function () {
					var items = [document.querySelector('.g-filters-holder')]

					this.dragula = dragula(items, {
						revertOnSpill: true,
					})
				},
			}

			setTimeout(function () {
				dragAndDrop.init()
			}, 500)

			var syncFilters = function () {
				scope.filters = scope.evDataService.getFilters()

				scope.evDataService.setFilters(scope.filters)

				var promises = []

				scope.filters.forEach(function (item) {
					if (!scope.fields.hasOwnProperty(item.key)) {
						if (
							item['value_type'] === 'mc_field' ||
							item['value_type'] === 'field'
						) {
							if (item.key === 'group') {
								promises.push(
									fieldResolverService.getFields(item.key, {
										entityType: scope.entityType,
									})
								)
							} else {
								promises.push(fieldResolverService.getFields(item.key))
							}
						}

						/*if (item.value_type === 30) {

                                promises.push(attributeTypeService.getByKey(scope.entityType, item.id).then(function (data) {

                                    var result = data;
                                    result.key = item.key;

                                    return result;

                                }))

                            }*/
					}
				})

				Promise.all(promises).then(function (data) {
					data.forEach(function (item) {
						if (item.hasOwnProperty('classifiers_flat')) {
							scope.fields[item.key] = item.classifiers_flat
						} else {
							scope.fields[item.key] = item.data
						}
					})

					scope.$apply(function () {
						setTimeout(function () {
							$(elem)
								.find('.md-select-search-pattern')
								.on('keydown', function (ev) {
									ev.stopPropagation()
								})
						}, 100)
					})
				})
			}

			scope.filterItemsOutsideNgrepeat = function (itemValue, filterValue) {
				if (filterValue && itemValue.indexOf(filterValue) === -1) {
					return true
				}

				return false
			}

			var settingsLayoutAsDefault = false // prevent multiple PUT requests in case of multiple clicks

			scope.setLayoutAsDefault = function ($event) {
				var listLayout = JSON.parse(
					JSON.stringify(
						scope.evDataService.getLayoutCurrentConfiguration(scope.isReport)
					)
				)

				if (listLayout.hasOwnProperty('id')) {
					if (scope.isRootEntityViewer && !settingsLayoutAsDefault) {
						settingsLayoutAsDefault = true

						listLayout.is_default = true

						uiService
							.updateListLayout(listLayout.id, listLayout)
							.then(function () {
								scope.evDataService.setListLayout(listLayout)
								scope.evDataService.setActiveLayoutConfiguration({
									layoutConfig: listLayout,
								})

								checkIsLayoutDefault()
								settingsLayoutAsDefault = false
								scope.$apply()
							})
					} else {
						var defaultLayoutData = {
							layoutId: listLayout.id,
							name: listLayout.name,
							content_type: listLayout.content_type,
						}

						scope.evDataService.setSplitPanelDefaultLayout(defaultLayoutData)
						scope.evEventService.dispatchEvent(
							evEvents.SPLIT_PANEL_DEFAULT_LIST_LAYOUT_CHANGED
						)
					}
				} else {
					$mdDialog.show({
						controller: 'WarningDialogController as vm',
						templateUrl: 'views/dialogs/warning-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						clickOutsideToClose: false,
						multiple: true,
						locals: {
							warning: {
								title: 'Warning',
								description: 'Save layout before making it default',
							},
						},
					})
				}
			}

			// Methods for settings buttons inside right sidebar
			scope.renameLayout = function ($event) {
				var currentLayoutName = JSON.parse(JSON.stringify(scope.layoutName))

				$mdDialog
					.show({
						controller: 'RenameDialogController as vm',
						templateUrl: 'views/dialogs/rename-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						locals: {
							data: {
								name: currentLayoutName,
							},
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							scope.layoutName = res.name

							var listLayout = scope.evDataService.getListLayout()
							listLayout.name = res.name

							uiService
								.updateListLayout(listLayout.id, listLayout)
								.then(function (updatedLayoutData) {
									listLayout.modified_at = updatedLayoutData.modified_at
									scope.evDataService.setListLayout(listLayout)
									// Give signal to update layout name in the toolbar
									/*if (scope.isRootEntityViewer) {
                                    middlewareService.setNewEntityViewerLayoutName(listLayout.name);
                                } else {
                                    middlewareService.setNewSplitPanelLayoutName(listLayout.name);
                                }*/

									scope.evEventService.dispatchEvent(
										evEvents.LAYOUT_NAME_CHANGE
									)
									scope.$apply()
								})
						}
					})
			}

			scope.saveLayoutList = function () {
				evRvLayoutsHelper.saveLayoutList(scope.evDataService, scope.isReport)
			}

			scope.openLayoutList = function ($event) {


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
							if (scope.isRootEntityViewer) {
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

			scope.exportLayout = function ($event) {
				var layout = scope.evDataService.getLayoutCurrentConfiguration(
					scope.isReport
				)

				$mdDialog.show({
					controller: 'LayoutExportDialogController as vm',
					templateUrl: 'views/dialogs/layout-export-dialog-view.html',
					parent: angular.element(document.body),
					targetEvent: $event,
					locals: {
						data: { layout: layout, isReport: scope.isReport },
					},
				})
			}

			scope.openViewConstructor = function (ev) {
				if (scope.isReport) {
					var controllerName = ''
					var templateUrl = ''

					switch (scope.entityType) {
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
							attributeDataService: scope.attributeDataService,
							entityViewerDataService: scope.evDataService,
							entityViewerEventService: scope.evEventService,
							contentWrapElement: scope.contentWrapElement,
						},
					})
				} else {
					$mdDialog.show({
						controller: 'gModalController as vm', // ../directives/gTable/gModalComponents
						templateUrl: 'views/directives/groupTable/g-modal-view.html',
						parent: angular.element(document.body),
						targetEvent: ev,
						locals: {
							attributeDataService: scope.attributeDataService,
							entityViewerDataService: scope.evDataService,
							entityViewerEventService: scope.evEventService,
							contentWrapElement: scope.contentWrapElement,
						},
					})
				}
			}

			scope.openSettings = function ($event) {
				if (scope.isReport) {
					var reportOptions = scope.evDataService.getReportOptions()

					var options = {
						entityType: scope.entityType,
					}

					if (scope.viewContext === 'dashboard') {
						options.disableChangesSaving = true
					}

					$mdDialog
						.show({
							controller: 'GReportSettingsDialogController as vm',
							templateUrl: 'views/dialogs/g-report-settings-dialog-view.html',
							parent: angular.element(document.body),
							targetEvent: $event,
							locals: {
								reportOptions: reportOptions,
								options: options,
							},
						})
						.then(function (res) {
							if (res.status === 'agree') {
								reportOptions = res.data

								scope.evDataService.setReportOptions(reportOptions)

								scope.evEventService.dispatchEvent(
									evEvents.REPORT_OPTIONS_CHANGE
								)
							}
						})
				} else {
					$mdDialog.show({
						controller: 'GEntityViewerSettingsDialogController as vm',
						templateUrl:
							'views/dialogs/g-entity-viewer-settings-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						locals: {
							entityViewerDataService: scope.evDataService,
							entityViewerEventService: scope.evEventService,
						},
					})
				}
			}
			// < Methods for settings buttons inside right sidebar >

			var initEventListeners = function () {
				scope.evEventService.addEventListener(
					evEvents.FILTERS_CHANGE,
					function () {
						syncFilters()
					}
				)

				scope.evEventService.addEventListener(
					evEvents.REPORT_OPTIONS_CHANGE,
					function () {
						scope.reportOptions = scope.evDataService.getReportOptions()
						scope.reportLayoutOptions =
							scope.evDataService.getReportLayoutOptions()
					}
				)

				scope.evEventService.addEventListener(
					evEvents.UPDATE_FILTER_AREA_SIZE,
					function () {
						scope.evDataService.toggleRightSidebar()
						var interfaceLayout = scope.evDataService.getInterfaceLayout()

						/*if (scope.sideNavCollapsed) {
                            interfaceLayout.filterArea.width = 239;
                        } else {
                            interfaceLayout.filterArea.width = 74;
                        }

                        scope.sideNavCollapsed = !scope.sideNavCollapsed;*/

						scope.sideNavCollapsed = interfaceLayout.filterArea.collapsed

						scope.evDataService.setInterfaceLayout(interfaceLayout)

						scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)
					}
				)

				scope.evEventService.addEventListener(
					evEvents.TOGGLE_FILTER_AREA,
					function () {
						scope.evEventService.dispatchEvent(evEvents.UPDATE_FILTER_AREA_SIZE)
					}
				)

				if (scope.isRootEntityViewer) {
					scope.evEventService.addEventListener(
						evEvents.DEFAULT_LAYOUT_CHANGE,
						function () {
							checkIsLayoutDefault()
						}
					)

					scope.evEventService.addEventListener(
						evEvents.LAYOUT_NAME_CHANGE,
						function () {
							var listLayout = scope.evDataService.getListLayout()
							scope.layoutName = listLayout.name
						}
					)
				} else if (scope.viewContext !== 'reconciliation_viewer') {
					scope.evEventService.addEventListener(
						evEvents.SPLIT_PANEL_DEFAULT_LIST_LAYOUT_CHANGED,
						function () {
							checkIsLayoutDefault()
						}
					)

					scope.evEventService.addEventListener(
						evEvents.LAYOUT_NAME_CHANGE,
						function () {
							var spDefaultLayoutData =
								scope.evDataService.getSplitPanelDefaultLayout()
							scope.layoutName = spDefaultLayoutData.name
						}
					)
				}
			}

			var init = function () {
				scope.evEventService.addEventListener(
					evEvents.MISSING_PRICES_LOAD_END,
					function () {
						scope.missingPricesData = scope.evDataService.getMissingPrices()
					}
				)

				uiService
					.getTransactionFieldList({ pageSize: 1000 })
					.then(function (data) {
						var transactionFields = data.results

						console.log(
							'transactionFields transactionFields',
							transactionFields
						)

						scope.transactionsUserDates = transactionFields.filter(function (
							field
						) {
							return (
								[
									'user_date_1',
									'user_date_2',
									'user_date_3',
									'user_date_4',
									'user_date_5',
								].indexOf(field.key) !== -1
							)
						})
					})

				syncFilters()

				transactionTypeService
					.getListLight({
						pageSize: 1000,
					})
					.then(function (data) {
						uiService
							.getContextMenuLayoutList()
							.then(function (contextMenuData) {
								if (contextMenuData.results.length) {
									var contextMenuLayout = contextMenuData.results[0]
									contextMenu = contextMenuLayout.data.menu
								} else {
									contextMenu = {
										root: {
											items: [
												{
													name: 'Edit Instrument',
													action: 'edit_instrument',
												},
												{
													name: 'Edit Account',
													action: 'edit_account',
												},
												{
													name: 'Edit Portfolio',
													action: 'edit_portfolio',
												},
												{
													name: 'Edit Price',
													action: 'edit_price',
												},
												{
													name: 'Edit FX Rate',
													action: 'edit_fx_rate',
												},
												{
													name: 'Edit Pricing FX Rate',
													action: 'edit_pricing_currency',
												},
												{
													name: 'Edit Accrued FX Rate',
													action: 'edit_accrued_currency',
												},
												{
													name: 'Edit Currency',
													action: 'edit_currency',
												},
												{
													name: 'Open Book Manager',
													action: 'book_transaction',
												},
											],
										},
									}
								}

								ttypes = data.results
							})
					})

				initEventListeners()

				if (scope.viewContext !== 'reconciliation_viewer') {
					checkIsLayoutDefault()
				}

				/* var interfaceLayout = scope.evDataService.getInterfaceLayout();
                    scope.sideNavCollapsed = interfaceLayout.filterArea.collapsed; */
				scope.sideNavCollapsed = true
			}

			init()
		},
	}
}
