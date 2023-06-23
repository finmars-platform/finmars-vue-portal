/**
 * Created by vzubr on 04.12.2020.
 * */

import metaService from '@/angular/services/metaService'
import evEvents from '@/angular/services/entityViewerEvents'
import popupEvents from '@/angular/services/events/popupEvents'

import metaHelper from '@/angularlpers/meta.helper'

import downloadFileHelper from '@/angularlpers/downloadFileHelper'

import convertReportHelper from '@/angularlpers/converters/convertReportHelper'
import reportCopyHelper from '@/angularlpers/reportCopyHelper'

import exportExcelService from '@/angular/services/exportExcelService'

import EventService from '@/angular/services/eventService'

export default function (
	$mdDialog,
	uiService,
	evRvLayoutsHelper,
	gFiltersHelper
) {
	return {
		restrict: 'E',
		scope: {
			evDataService: '=',
			evEventService: '=',
			attributeDataService: '=',
			contentWrapElement: '=',
			dashboardComponentElement: '=',
			hideFiltersBlock: '=',
			hideUseFromAboveFilters: '=',
		},
		templateUrl: 'views/directives/groupTable/filters/g-filters-view.html',
		controller: [
			'$scope',
			function gFiltersController($scope) {
				let vm = this

				vm.entityType = $scope.evDataService.getEntityType()
				$scope.isReport = metaService.isReport(vm.entityType)
				// $scope.currentAdditions = $scope.evDataService.getAdditions();
				$scope.isRootEntityViewer = $scope.evDataService.isRootEntityViewer()
				$scope.viewContext = $scope.evDataService.getViewContext()

				$scope.isFiltersOpened = !$scope.hideFiltersBlock // when inside dashboard or split panel
				vm.hideUseFromAboveFilters = $scope.hideUseFromAboveFilters

				vm.popupPosX = { value: null }
				vm.popupPosY = { value: null }

				/* $scope.readyStatus = {
                    filters: false
                } */
				$scope.showFrontFilters = true

				// const gFiltersElem = elem[0].querySelector('.gFilters');
				const filtersContainerElem = $scope.contentWrapElement
					? $scope.contentWrapElement
					: $scope.dashboardComponentElement
				const gFiltersElem = filtersContainerElem.querySelector('.gFilters')
				/** Used when inside dashboard, and does not change with window resize. Can be less than actual width, when used outside dashboard. */
				const gFiltersElemWidth = gFiltersElem.clientWidth

				const gFiltersWrapElem = gFiltersElem.querySelector('.gFiltersWrap')
				const gFiltersElemPadding = parseInt(gFiltersWrapElem.style.padding, 10)
				let currentAdditions = $scope.evDataService.getAdditions()
				// let filtersChipsContainer = elem[0].querySelector(".gFiltersContainerWidth");

				/* let filtersChipsContainer = elem[0].querySelector(".gFiltersContainerWidth");

                const gFiltersLeftPartWidth = elem[0].querySelector('.gFiltersLeftPart').clientWidth;
                const gFiltersRightPartWidth = elem[0].querySelector('.gFiltersRightPart').clientWidth; */

				let filters = []
				// let useFromAboveFilters = [];

				let entityAttrs = []
				let dynamicAttrs = []
				let attrsWithoutFilters = ['notes']
				// let customFields = $scope.attributeDataService.getCustomFieldsByEntityType(vm.entityType);

				const getAttributes = () => {
					let allAttrsList

					if ($scope.viewContext === 'reconciliation_viewer') {
						allAttrsList =
							$scope.attributeDataService.getReconciliationAttributes()
					} else {
						switch (vm.entityType) {
							case 'balance-report':
								allAttrsList =
									$scope.attributeDataService.getBalanceReportAttributes()
								break

							case 'pl-report':
								allAttrsList =
									$scope.attributeDataService.getPlReportAttributes()
								break

							case 'transaction-report':
								allAttrsList =
									$scope.attributeDataService.getTransactionReportAttributes()
								break

							default:
								entityAttrs = []
								dynamicAttrs = []
								allAttrsList = []

								entityAttrs =
									$scope.attributeDataService.getEntityAttributesByEntityType(
										vm.entityType
									)

								entityAttrs.forEach(function (item) {
									if (
										item.key === 'subgroup' &&
										item.value_entity.indexOf('strategy') !== -1
									) {
										item.name = 'Group'
									}

									item.entity = vm.entityType
								})

								let instrumentUserFields =
									$scope.attributeDataService.getInstrumentUserFields()
								let transactionUserFields =
									$scope.attributeDataService.getTransactionUserFields()

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
									$scope.attributeDataService.getDynamicAttributesByEntityType(
										vm.entityType
									)

								dynamicAttrs = dynamicAttrs.map(function (attribute) {
									let result = {}

									result.attribute_type = Object.assign({}, attribute)
									result.value_type = attribute.value_type
									result.content_type = $scope.contentType
									result.key = 'attributes.' + attribute.user_code
									result.name = attribute.name

									return result
								})

								allAttrsList = allAttrsList.concat(entityAttrs)
								allAttrsList = allAttrsList.concat(dynamicAttrs)

								break
						}
					}

					return allAttrsList
				}

				/* function clearAdditions() {

                    let additions = $scope.evDataService.getAdditions();

                    additions.isOpen = false;
                    additions.type = '';
                    delete additions.layoutData;
                    /!*delete additions.layoutId;*!/

                    $scope.evDataService.setSplitPanelStatus(false);
                    $scope.evDataService.setAdditions(additions);

                    $scope.currentAdditions = $scope.evDataService.getAdditions();

                    $scope.evEventService.dispatchEvent(evEvents.ADDITIONS_CHANGE);
                    // delete $scope.evEventService.dispatchEvent(evEvents.UPDATE_ENTITY_VIEWER_CONTENT_WRAP_SIZE);
                    $scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT);

                } */

				const getListLayoutByEntity = function (entityType) {
					var options = {
						pageSize: 1000,
						page: 1,
						sort: {
							key: 'content_type',
							direction: 'DSC',
						},
					}

					var layouts = []

					var getLayouts = function (resolve, reject) {
						uiService
							.getListLayout(entityType, options)
							.then(function (data) {
								layouts = layouts.concat(data.results)

								if (data.next) {
									options.page = options.page + 1
									getLayouts()
								} else {
									resolve(layouts)
								}
							})
							.catch(function (error) {
								reject(error)
							})
					}

					return new Promise(function (resolve, reject) {
						getLayouts(resolve, reject)
					})
				}

				vm.getChipTextElem = function (filterName, filterValues, filterType) {
					let filterVal = filterValues || ''

					switch (filterType) {
						case 'from_to':
							filterVal = `From ${filterValues.min_value} to ${filterValues.max_value}`
							break

						case 'out_of_range':
							filterVal = `Out of range from ${filterValues.min_value} to ${filterValues.max_value}`
							break

						case 'multiselector':
							filterVal = filterValues.join(', ')
							break

						case 'date_tree':
							const formattedDates = filterValues.map((date) =>
								moment(date).format('YYYY-MM-DD')
							)
							filterVal = formattedDates.join(', ')
							break
					}

					return `<span class="g-filter-chips-text">
						<span class="g-filter-chip-name">${filterName}:</span>
						<span class="g-filter-chip-value text-bold"> ${filterVal}</span>
					</span>`
				}

				vm.checkCustomFieldFilterForError = (
					filter,
					filterData,
					customFields
				) => {
					const customField = customFields.find(
						(field) => filter.key === `custom_fields.${field.user_code}`
					)

					if (!customField) {
						filter.options.enabled = false
						const description = `The ${
							filter.groups ? 'group' : 'column'
						} does not exist in the Configuration`

						filterData.error_data = {
							code: 10,
							description: description,
						}

						const error = {
							key: filter.key,
							description: description,
						}

						return [filter, filterData, error]
					}

					return [filter, filterData, null]
				}

				vm.updateMissingCustomFieldsList = function (errors) {
					const missingCustomFields = []

					errors.forEach((error) => {
						if (!missingCustomFields.find((field) => field.key === error.key)) {
							missingCustomFields.push(error)
						}
					})

					$scope.evDataService.setMissingCustomFields({
						forFilters: missingCustomFields,
					})
				}

				vm.toggleSplitPanel = function ($event, type) {
					if (currentAdditions.type === type) {
						evRvLayoutsHelper.clearSplitPanelAdditions($scope.evDataService)

						$scope.evEventService.dispatchEvent(evEvents.ADDITIONS_CHANGE)
						$scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)
					} else {
						var entityType = null

						switch (type) {
							case 'balance-report':
							case 'pl-report':
							case 'transaction-report':
								entityType = type
								break
						}

						if (entityType) {
							// in case of choosing entity viewer layout

							getListLayoutByEntity(entityType).then(function (layoutsList) {
								var layouts =
									evRvLayoutsHelper.getDataForLayoutSelectorWithFilters(
										layoutsList
									)

								$mdDialog
									.show({
										controller: 'ExpandableItemsSelectorDialogController as vm',
										templateUrl:
											'views/dialogs/expandable-items-selector-dialog-view.html',
										targetEvent: $event,
										multiple: true,
										locals: {
											data: {
												dialogTitle: 'Choose layout to open Split Panel with',
												items: layouts,
											},
										},
									})
									.then(function (res) {
										if (res.status === 'agree') {
											var additions = $scope.evDataService.getAdditions()

											additions.isOpen = true
											additions.type = type

											if (res.selected.id) {
												if (!additions.layoutData) {
													additions.layoutData = {}
												}

												additions.layoutData.user_code = res.selected.user_code
												additions.layoutData.layoutId = res.selected.id
												additions.layoutData.name = res.selected.name

												additions.layoutData.content_type =
													res.selected.content_type
											} else {
												delete additions.layoutData
											}

											$scope.evDataService.setSplitPanelStatus(true)
											$scope.evDataService.setAdditions(additions)
											$scope.evEventService.dispatchEvent(
												evEvents.ADDITIONS_CHANGE
											)
											currentAdditions = $scope.evDataService.getAdditions()
										}
									})
							})
						} else {
							var additions = $scope.evDataService.getAdditions()

							additions.isOpen = true
							additions.type = type

							delete additions.layoutData

							$scope.evDataService.setSplitPanelStatus(true)
							$scope.evDataService.setAdditions(additions)
							$scope.evEventService.dispatchEvent(evEvents.ADDITIONS_CHANGE)
							currentAdditions = $scope.evDataService.getAdditions()
						}
					}
				}

				vm.exportAsCSV = function () {
					var flatList = $scope.evDataService.getFlatList()
					var columns = $scope.evDataService.getColumns()
					var groups = $scope.evDataService.getGroups()

					var blobPart = convertReportHelper.convertFlatListToCSV(
						flatList,
						columns,
						$scope.isReport,
						groups.length
					)
					downloadFileHelper.downloadFile(blobPart, 'text/plain', 'report.csv')
				}

				vm.exportAsExcel = function () {
					var data = {
						entityType: vm.entityType,
						contentSettings: {
							columns: $scope.evDataService.getColumns(),
							groups: $scope.evDataService.getGroups(),
						},
						content: $scope.evDataService.getFlatList(),
					}

					exportExcelService.generateExcel(data).then(function (blob) {
						downloadFileHelper.downloadFile(
							blob,
							'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
							'report.xlsx'
						)

						$mdDialog.hide()
					})
				}

				vm.copyReport = function () {
					reportCopyHelper.copy($scope.evDataService, $scope.isReport)
				}

				vm.copySelectedToBuffer = function () {
					reportCopyHelper.copy(
						$scope.evDataService,
						$scope.isReport,
						'selected'
					)
				}

				vm.openViewConstructor = function (ev) {
					if ($scope.isReport) {
						let controllerName = ''
						let templateUrl = ''

						switch (vm.entityType) {
							case 'balance-report':
								controllerName = 'gModalReportController as vm'
								templateUrl =
									'views/directives/groupTable/modal-report-view.html'
								break
							case 'pl-report':
								controllerName = 'gModalReportPnlController as vm'
								templateUrl =
									'views/directives/groupTable/modal-report-view.html'
								break
							case 'performance-report':
								controllerName = 'gModalReportPerformanceController as vm'
								templateUrl =
									'views/directives/groupTable/modal-report-performance-view.html'
								break
							case 'cash-flow-projection-report':
								controllerName =
									'gModalReportCashFlowProjectionController as vm'
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
								attributeDataService: $scope.attributeDataService,
								entityViewerDataService: $scope.evDataService,
								entityViewerEventService: $scope.evEventService,
								contentWrapElement: $scope.contentWrapElement,
							},
						})
					} else {
						$mdDialog.show({
							controller: 'gModalController as vm', // ../directives/gTable/gModalComponents
							templateUrl: 'views/directives/groupTable/g-modal-view.html',
							parent: angular.element(document.body),
							targetEvent: ev,
							locals: {
								attributeDataService: $scope.attributeDataService,
								entityViewerDataService: $scope.evDataService,
								entityViewerEventService: $scope.evEventService,
								contentWrapElement: $scope.contentWrapElement,
							},
						})
					}
				}

				//region Chips filters

				/* $scope.removeFilter = function (filtersToRemove) {

                    filters = filters.filter(filter => {
                        return filtersToRemove.find(item => item.id !== filter.key);
                    });

                    // $scope.evDataService.setFilters($scope.filters);
                    setFilters();
                    $scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE);
                    $scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE);

                }; */

				const getAttrsForFilterAddition = (filtersList) => {
					const allAttrsList = getAttributes()

					let availableAttrs = allAttrsList.filter((attr) => {
						for (let i = 0; i < filtersList.length; i++) {
							if (filtersList[i].key === attr.key) {
								return false
							}
						}

						if (attrsWithoutFilters.includes(attr.key)) {
							return false
						}

						return true
					})

					if (!$scope.isReport) {
						availableAttrs = availableAttrs.filter((attr) => {
							return attr.value_type !== 'mc_field' && attr.key !== 'notes'
						})
					}

					return availableAttrs
				}

				vm.openAddFilterDialog = function (event, filters) {
					// const availableAttrs = getAttrsForFilterAddition();
					return new Promise((resolve, reject) => {
						try {
							let availableAttrs = getAttrsForFilterAddition(filters)

							$mdDialog
								.show({
									controller: 'TableAttributeSelectorDialogController as vm',
									templateUrl:
										'views/dialogs/table-attribute-selector-dialog-view.html',
									targetEvent: event,
									multiple: true,
									locals: {
										data: {
											availableAttrs: availableAttrs,
											title: 'Choose filter to add',
											isReport: $scope.isReport,
											multiselector: true,
										},
									},
								})
								.then(function (res) {
									if (res && res.status === 'agree') {
										// res.data.groups = true;
										/* if (!res.data.options) {
										res.data.options = {};
									}

									if (!res.data.options.filter_type) {
										res.data.options.filter_type = metaHelper.getDefaultFilterType(res.data.value_type);
									}

									if (!res.data.options.filter_values) {
										res.data.options.filter_values = [];
									}

									if (!res.data.options.hasOwnProperty('exclude_empty_cells')) {
										res.data.options.exclude_empty_cells = false;
									} */

										for (var i = 0; i < res.data.items.length; i = i + 1) {
											res.data.items[i] =
												gFiltersHelper.setFilterDefaultOptions(
													res.data.items[i]
												)
										}

										console.log(
											'openAddFilterDialog res.data.items',
											res.data.items
										)

										resolve({ status: res.status, data: res.data })
									}

									resolve({ status: res.status })
								})
								.catch((error) => reject(error))
						} catch (error) {
							reject(error)
						}
					})
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
				/**
				 * Sets width for element with filter chips.
				 *
				 * @param leftPartWidth {number} - width of .gFiltersLeftPartWidth element
				 * @param rightPartWidth {number} - width of .gFiltersRightPartWidth element
				 * @param filtersChipsContainer {HTMLElement}
				 */
				vm.calculateFilterChipsContainerWidth = function (
					leftPartWidth,
					rightPartWidth,
					filtersChipsContainer
				) {
					// let filtersChipsContainerWidth = 800;

					let filterAreaWidth
					if ($scope.contentWrapElement) {
						filterAreaWidth = $scope.contentWrapElement.clientWidth
					} else if ($scope.viewContext === 'dashboard') {
						// For dashboard components without wrapElems e.g. matrix
						filterAreaWidth = gFiltersElemWidth
					}

					const horizontalPaddings = gFiltersElemPadding * 2
					const availableSpace =
						filterAreaWidth -
						horizontalPaddings -
						leftPartWidth -
						rightPartWidth

					/* if (availableSpace < 800) {

                        filtersChipsContainerWidth = Math.max(availableSpace, 500);

                    } */

					filtersChipsContainer.style.width = availableSpace + 'px'
				}

				/* const formatFiltersForChips = function () {

					$scope.filtersChips = [];
                    const errors = [];

					filters.forEach(filter => {

						if (filter.type !== "filter_link") { // don't show filter from dashboard component

							const filterOpts = filter.options || {};
							let filterVal = filterOpts.filter_values || "";

							if (filterOpts.filter_type === 'from_to') {

								filterVal = `From ${filterOpts.filter_values.min_value} to ${filterOpts.filter_values.max_value}`

							} else if (filterOpts.filter_type === 'out_of_range' ) {

								filterVal = `Out of range from ${filterOpts.filter_values.min_value} to ${filterOpts.filter_values.max_value}`

							}

							// hide use from above filters if needed
							if (
								$scope.showUseFromAboveFilters ||
								(!filterOpts.use_from_above || !Object.keys(filterOpts.use_from_above).length)
							) {

								let filterData = {
									id: filter.key,
                                    isActive: filterOpts.enabled
								};

								const filterName = filter.layout_name ? filter.layout_name : filter.name;

								let chipText = '<span class="g-filter-chips-text">' +
									'<span class="g-filter-chip-name">' + filterName + ':</span>' +
									'<span class="g-filter-chip-value text-bold"> ' + filterVal + '</span>' +
									'</span>'

								if (filterOpts.use_from_above &&
									Object.keys(filterOpts.use_from_above).length) {

									filterData.classes = "use-from-above-filter-chip"
									filterData.tooltipContent = chipText

									chipText = '<span class="material-icons">link</span>' + chipText;

								}

								filterData.text = chipText;

                                // Victor 2021.03.29 #88 fix bug with deleted custom fields
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
                                // <Victor 2021.03.29 #88 fix bug with deleted custom fields>

								$scope.filtersChips.push(filterData);

							}

						}

					});

                    // Victor 2021.03.29 #88 fix bug with deleted custom fields
					const missingCustomFields = [];
					errors.forEach(error => {
					    if (!missingCustomFields.find(field => field.key === error.key)) {

					        missingCustomFields.push(error);

                        }
                    });

					$scope.evDataService.setMissingCustomFields({forFilters: missingCustomFields});
                    // <Victor 2021.03.29 #88 fix bug with deleted custom fields>

                    updateFilterAreaHeight()

				}; */

				vm.onFilterChipClick = function (chipsData, event) {
					vm.popupData.filterKey = chipsData.data.id

					vm.popupPosX.value = event.clientX
					vm.popupPosY.value = event.clientY

					vm.popupEventService.dispatchEvent(popupEvents.OPEN_POPUP, {
						doNotUpdateScope: true,
					})
				}

				vm.updateFilterAreaHeight = () => {
					let interfaceLayout = $scope.evDataService.getInterfaceLayout()
					const gFiltersHeight = gFiltersElem.clientHeight
					const originalHeight = interfaceLayout.filterArea.height

					interfaceLayout.filterArea.height = gFiltersHeight

					$scope.evDataService.setInterfaceLayout(interfaceLayout)

					return originalHeight !== gFiltersHeight
				}

				vm.onChipsFirstRender = function () {
					vm.updateFilterAreaHeight()
					$scope.evEventService.dispatchEvent(evEvents.FILTERS_RENDERED)
				}
				//endregion

				const initEventListeners = function () {
					/*
                    $scope.evEventService.addEventListener(evEvents.DYNAMIC_ATTRIBUTES_CHANGE, function () {
                        customFields = $scope.attributeDataService.getCustomFieldsByEntityType(vm.entityType);
                        formatFiltersForChips();
                    })

                    $scope.evEventService.addEventListener(evEvents.TABLE_SIZES_CALCULATED, calculateFilterChipsContainerWidth);

                    $scope.evEventService.addEventListener(evEvents.FILTERS_CHANGE, function () {

                        filters = getFilters();

                        getUseFromAboveFilters();

                        formatFiltersForChips();

                        setTimeout(function () { // wait until DOM elems reflow after ng-repeat

                            const filterAreaHeightChanged = vm.updateFilterAreaHeight();

                            if (filterAreaHeightChanged) {
                                $scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT);
                            }

                        }, 0);


                    }); */

					$scope.evEventService.addEventListener(
						evEvents.TOGGLE_FILTER_BLOCK,
						function () {
							$scope.isFiltersOpened = !$scope.isFiltersOpened

							setTimeout(() => {
								const interfaceLayout =
									$scope.evDataService.getInterfaceLayout()
								const gFiltersHeight = gFiltersElem.clientHeight

								interfaceLayout.filterArea.height = gFiltersHeight
								$scope.evDataService.setInterfaceLayout(interfaceLayout)

								$scope.evEventService.dispatchEvent(
									evEvents.UPDATE_TABLE_VIEWPORT
								)
							}, 500) // Transition time for .g-filters
						}
					)

					/* $scope.evEventService.addEventListener(evEvents.ACTIVE_OBJECT_FROM_ABOVE_CHANGE, function () {

                        if (useFromAboveFilters.length) {

                            let filterChangedFromAbove = false;

                            useFromAboveFilters.forEach((useFromAboveFilter) => {

                                let filter = filters[useFromAboveFilter.filtersListIndex];
                                let key = filter.options.use_from_above; // for old layouts

                                if (typeof filter.options.use_from_above === 'object') {
                                    key = filter.options.use_from_above.key;
                                }

                                var activeObjectFromAbove = $scope.evDataService.getActiveObjectFromAbove();

                                if (activeObjectFromAbove && typeof activeObjectFromAbove === 'object') {

                                    var value = activeObjectFromAbove[key];
                                    filter.options.filter_values = [value]; // example value 'Bank 1 Notes 4% USD'

                                    filterChangedFromAbove = true;

                                }

                            });

                            if (filterChangedFromAbove) {

                                // $scope.evDataService.setFilters($scope.filters);
                                setFilters();

                                formatFiltersForChips();
                                $scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE);

                            }

                        }

                    });

                    $scope.evEventService.addEventListener(evEvents.CLEAR_USE_FROM_ABOVE_FILTERS, function () {

                        /!* var hasUseFromAboveFilter = false;

                        $scope.filters.forEach(function (filter) {

                            if (filter.options.use_from_above && Object.keys(filter.options.use_from_above).length > 0) {

                                if (filter.options.filter_values.length) {
                                    hasUseFromAboveFilter = true;
                                    filter.options.filter_values = [];
                                }

                            }

                        }); *!/

                        if (useFromAboveFilters.length) {

                            useFromAboveFilters.forEach(ufaFilter => {

                                filters[ufaFilter.filtersListIndex].options.filter_values = [];

                            });

                            // $scope.evDataService.setFilters($scope.filters);
                            setFilters();

                            $scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE);

                            $scope.evDataService.resetTableContent($scope.isReport);

                            $scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE);

                        }

                    }); */
				}

				vm.updateFilterAreaHeightOnInit = function () {
					/*
                    TODO: Refactor this
                    1 add on "resize" event listener for filter area height change
                    2 calculate before render e.g width 1000px -> we got 2 rows - height 140px
                                                 width 500px -> we got 3 row - heiht 210px
                    */
					setTimeout(function () {
						vm.updateFilterAreaHeight() // important here
						$scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)
					}, 1000)
				}

				const syncFiltersLayoutNamesWithColumns = function () {
					const columns = $scope.evDataService.getColumns()
					const filters = $scope.evDataService.getFilters()

					columns.forEach((column) => {
						if (column.layout_name) {
							if ($scope.isReport) {
								const matchingFilter = filters.find(
									(filter) => filter.key === column.key
								)
								if (matchingFilter)
									matchingFilter.layout_name = column.layout_name
							} else {
								const matchingFrontFilter = filters.frontend.find(
									(filter) => filter.key === column.key
								)
								if (matchingFrontFilter)
									matchingFrontFilter.layout_name = column.layout_name

								const matchingBackFilter = filters.backend.find(
									(filter) => filter.key === column.key
								)
								if (matchingBackFilter)
									matchingBackFilter.layout_name = column.layout_name
							}
						}
					})

					$scope.evDataService.setFilters(filters)
				}

				const init = function () {
					const filtersObj = $scope.evDataService.getFilters()

					vm.popupEventService = new EventService()
					vm.chipsListEventService = new EventService()

					vm.popupData = {
						evDataService: $scope.evDataService,
						evEventService: $scope.evEventService,
						attributeDataService: $scope.attributeDataService,
					}

					syncFiltersLayoutNamesWithColumns()
					// formatFiltersForChips();

					// $scope.openCustomFieldsManager = $scope.isReport ? openCustomFieldsManagerDialog : openManageAttrsDialog;

					// $scope.readyStatus.filters = true;

					initEventListeners()
				}

				init()
			},
		],
	}
}
