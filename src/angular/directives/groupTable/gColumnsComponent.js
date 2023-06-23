/**
 * Created by szhitenev on 05.05.2016.
 */

import evEvents from '../../services/entityViewerEvents'
import popupEvents from '../../services/events/popupEvents'
import evDataHelper from '../../helpers/ev-data.helper'

// import metaService from '../../services/metaService';
import evHelperService from '../../services/entityViewerHelperService'
import rvDataHelper from '../../helpers/rv-data.helper'

import localStorageService from '@/angular/shell/scripts/app/services/localStorageService'

export default function (
	$mdDialog,
	toastNotificationService,
	usersService,
	globalDataService,
	uiService,
	evRvDomManagerService
) {
	return {
		restrict: 'AE',
		scope: {
			evDataService: '=',
			evEventService: '=',
			attributeDataService: '=',
			contentWrapElement: '=',
		},
		templateUrl: 'views/directives/groupTable/g-columns-view.html',
		link: function (scope, elem, attrs) {
			scope.columns = scope.evDataService.getColumns()

			scope.groups = scope.evDataService.getGroups()

			scope.viewContext = scope.evDataService.getViewContext()
			// scope.isReport = metaService.isReport(scope.entityType);
			scope.isReport = scope.evDataService.isEntityReport()

			scope.entityType = scope.evDataService.getEntityType()
			scope.rowStatusFilterIcon = `<span class="material-icons">star_outline</span>`

			let filters = scope.evDataService.getFilters()
			/**
			 * What filters (front or back) are shown now in filter area of entity viewer
			 * @type {Boolean}
			 */
			let showFrontEvFilters = !scope.isReport && filters.frontend.length > 0
			// var data = scope.evDataService.getData();

			/* const setFiltersLayoutNames = () => {

                    const filters = scope.evDataService.getFilters();
                    const columns = scope.evDataService.getColumns();
                    // const totalColumns = [...scope.groups, ...scope.notGroupingColumns];

                    filters.forEach(filter => {

                        const column = columns.find(col => col.key === filter.key);

                        if (column && column.layout_name) {

                            filter.layout_name = column.layout_name;

                        }

                    });

                    scope.evDataService.setFilters(filters);

                    scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE);

                }; */

			scope.isSubtotalWeightedShouldBeExcluded = function (column) {
				return [
					'market_value',
					'market_value_percent',
					'exposure',
					'exposure_percent',
				].some((excludedKey) => column.key === excludedKey)
			}

			const getColumnsToShow = function () {
				if (scope.isReport) {
					scope.columnsToShow = evDataHelper.separateNotGroupingColumns(
						scope.columns,
						scope.groups
					)
				} else {
					scope.columnsToShow = scope.columns
				}

				return scope.columnsToShow
			}

			// Victor 2021.03.29 #88 fix bug with deleted custom fields
			let customFields = scope.attributeDataService.getCustomFieldsByEntityType(
				scope.entityType
			)

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
						const customField = customFields.find(
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
				}

				if (scope.isReport) {
					let groups = scope.evDataService.getGroups()

					groups.forEach((group) => {
						markItemUsingMissingCustomField(group, 'group', groupsErrorsList)
					})
				}

				let columns = scope.evDataService.getColumns()

				columns.forEach((column) => {
					markItemUsingMissingCustomField(column, 'column', columnsErrorsList)
				})

				/* const missingCustomFields = [];

                    errors.forEach(error => {

                        const errorNotRegistered = !!!missingCustomFields.find(field => field.key === error.key);

                        if (errorNotRegistered) missingCustomFields.push(error);

                    });

                    scope.evDataService.setMissingCustomFields({forColumns: missingCustomFields}); */
				scope.evDataService.setMissingCustomFields({
					forColumns: columnsErrorsList,
					forGroups: groupsErrorsList,
				})
			}

			// <Victor 2021.03.29 #88 fix bug with deleted custom fields>

			scope.components = scope.evDataService.getComponents()
			scope.downloadedItemsCount = null
			scope.contentType = scope.evDataService.getContentType()
			scope.columnAreaCollapsed = false

			scope.isAllSelected = scope.evDataService.getSelectAllRowsState()
			scope.isAllStarsSelected = false
			scope.hideRowSettings = !!scope.evDataService.getRowSettings().folded
			scope.groupsAreaDraggable = scope.viewContext !== 'dashboard'

			let entityAttrs = []
			let dynamicAttrs = []

			// var keysOfColsToHide = [];

			function onSubtotalSumClick(column) {
				const popupData = scope.columnsPopupsData[column.key].data

				if (popupData) {
					popupData.isSubtotalAvgWeighted = false
					popupData.isSubtotalWeighted = false
					popupData.isTemporaryWeighted = false
					popupData.isSubtotalSum = !popupData.isSubtotalSum
				}

				scope.selectSubtotalType(column, 1)
			}

			function onSubtotalWeightedClick(column) {
				const popupData = scope.columnsPopupsData[column.key].data

				if (popupData) {
					popupData.isSubtotalSum = false
					popupData.isSubtotalAvgWeighted = false
					popupData.isTemporaryWeighted = true
					popupData.isSubtotalWeighted = !popupData.isSubtotalWeighted
				}
			}

			function onSubtotalAvgWeightedClick(column) {
				const popupData = scope.columnsPopupsData[column.key].data

				if (popupData) {
					popupData.isSubtotalSum = false
					popupData.isSubtotalWeighted = false
					popupData.isTemporaryWeighted = true
					popupData.isSubtotalAvgWeighted = !popupData.isSubtotalAvgWeighted
				}
			}

			function openNumberFormatDialog(column) {
				scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP)

				let dialogData = {
					settings: {},
				}
				// column.options.number_format
				if (column.options) {
					dialogData.settings = column.options.numberFormat
				}

				if (!column.options) {
					dialogData.settings = column.report_settings
				}
				// for old layouts
				if (
					scope.isReport &&
					column.options &&
					!column.options.hasOwnProperty('numberFormat')
				) {
					dialogData.settings = column.report_settings
				}

				$mdDialog
					.show({
						controller: 'NumberFormatSettingsDialogController as vm',
						templateUrl:
							'views/dialogs/number-format-settings-dialog-view.html',
						parent: angular.element(document.body),
						locals: {
							data: dialogData,
						},
					})
					.then((res) => {
						if (res.status === 'agree') {
							// column.report_settings = res.data;

							if (!column.options) column.options = {}

							column.options.numberFormat = res.data

							scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
							scope.evEventService.dispatchEvent(
								evEvents.REPORT_TABLE_VIEW_CHANGED
							)
						}
					})
			}

			// Victor 2020.12.14 #69 New report viewer design
			scope.rowFilterColor = 'none'

			scope.columnsPopupsData = null

			function makePopupDataForColumns(columns) {
				scope.columnsPopupsData = {}

				columns.forEach((column, index) => {
					var matchingGroup = scope.groups.find(
						(group) => group.key === column.key
					)
					var item = matchingGroup || column

					scope.columnsPopupsData[column.key] = {
						data: getPopupData(item, index, !!matchingGroup),
					}
				})
			}

			scope.onSubtotalTypeSelectCancel = function () {
				makePopupDataForColumns(scope.columns)
			}

			function getPopupData(item, $index, isAGroup) {
				let data = {
					$index: $index,
					isAGroup: isAGroup,
					item: item, // can be column or group
					viewContext: scope.viewContext,
					renameColumn: scope.renameColumn,
					isReport: scope.isReport,
					columnHasCorrespondingGroup: scope.columnHasCorrespondingGroup,
					addColumnEntityToGrouping: scope.addColumnEntityToGrouping,
					checkForFilteringBySameAttr: scope.checkForFilteringBySameAttr,
					addFiltersWithColAttr: scope.addFiltersWithColAttr,
					editManualSorting: scope.editManualSorting,
					activateColumnNumberRenderingPreset:
						scope.activateColumnNumberRenderingPreset,
					openColumnNumbersRenderingSettings:
						scope.openColumnNumbersRenderingSettings,
					selectSubtotalType: scope.selectSubtotalType,
					checkSubtotalFormula: scope.checkSubtotalFormula,
					// isSubtotalFormulaSelected: isSubtotalFormulaSelected,
					getSubtotalFormula: getSubtotalFormula,
					resizeColumn: scope.resizeColumn,
					removeColumn: scope.removeColumn,
					unGroup: scope.unGroup,

					changeColumnTextAlign: scope.changeColumnTextAlign,
					checkColTextAlign: scope.checkColTextAlign,
					removeGroup: scope.removeGroup,
					// reportHideSubtotal: scope.reportHideSubtotal,
					reportHideGrandTotal: scope.reportHideGrandTotal,
					isSubtotalWeightedShouldBeExcluded:
						scope.isSubtotalWeightedShouldBeExcluded,

					isSubtotalSum: isSubtotalSum(item),
					isSubtotalWeighted: isSubtotalWeighted(item),
					isSubtotalAvgWeighted: isSubtotalAvgWeighted(item),
					subtotalFormula: getSubtotalFormula(item),
					isTemporaryWeighted: false,

					onSubtotalSumClick: onSubtotalSumClick,
					onSubtotalWeightedClick: onSubtotalWeightedClick,
					onSubtotalAvgWeightedClick: onSubtotalAvgWeightedClick,

					openNumberFormatDialog: openNumberFormatDialog,
				}

				if (isAGroup) {
					data.reportSetSubtotalType = scope.reportSetSubtotalType
				}

				return data
			}

			scope.getPopupMenuTemplate = function (column) {
				if (scope.isReport && column.value_type == 20) {
					return "'views/popups/groupTable/columnSettings/g-numeric-column-settings-popup-menu.html'" // Victor 2020.12.14 #69 string in string must returned for template binding
				}

				return "'views/popups/groupTable/columnSettings/g-column-settings-popup-menu.html'"
			}

			/* scope.columnWithoutGroupIsHidden = columnKey => {

					const column = scope.evDataService.getColumn(columnKey);
					const columnWithoutSubtotal = !column.report_settings || !column.report_settings.subtotal_formula_id;

					if (!column.error && columnWithoutSubtotal) {

					}

				}; */

			scope.getPopupMenuClasses = function (column) {
				if (scope.isReport && column.value_type == 20) {
					return 'rounded-border g-column-number-context-menu-popup'
				}

				return 'rounded-border g-column-context-menu-popup'
			}

			scope.rowFiltersToggle = function () {
				scope.hideRowSettings = !scope.hideRowSettings
				/* var rowColorsColumnCollapsed = scope.evDataService.getRowColorsColumnData();

                    rowColorsColumnCollapsed = !rowColorsColumnCollapsed; */

				var rowSettings = scope.evDataService.getRowSettings(
					scope.hideRowSettings
				)

				rowSettings.folded = scope.hideRowSettings

				scope.evDataService.setRowSettings(rowSettings)

				if (scope.hideRowSettings) {
					scope.contentWrapElement.classList.add('g-row-settings-collapsed')
				} else {
					scope.contentWrapElement.classList.remove('g-row-settings-collapsed')
				}

				/* var rowSettingsElems = scope.contentWrapElement.querySelectorAll(".gRowSettings");

                    rowSettingsElems.forEach(rowSElem => {

                        if (scope.hideRowSettings) {
                            rowSElem.classList.add('closed');

                        } else {
                            rowSElem.classList.remove('closed');
                        }

                    }); */
			}

			scope.changeRowFilterColor = function (color) {
				let rowTypeFiltersData = scope.evDataService.getRowTypeFilters()

				scope.rowFilterColor = color
				rowTypeFiltersData.markedRowFilters = color

				scope.evDataService.setRowTypeFilters(rowTypeFiltersData)

				scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
			}

			// scope.rowFilterColor = localStorageService.getRowTypeFilter(scope.isReport, scope.entityType);

			scope.removeColorMarkFromAllRows = function ($event) {
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
								scope.evDataService,
								scope.evEventService,
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

			scope.showArrowDown = ($event) => {
				/* activeNameBlockElement = $event.target.closest('.name-block');
                    activeNameBlockElement.classList.add('active'); */
				columnWithOpenSortMenuElem = $event.target.closest('.gColumnElem')
				columnWithOpenSortMenuElem.classList.add('sort-menu-opened')
			}

			scope.hideArrowDown = () => {
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

			scope.changeSortMode = function (column, sortMode) {
				// scope.hideArrowDown();
				scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP)

				// const direction = column.options && column.options.sort ? column.options.sort : 'ASC'; // save direction before clear sort options for all columns

				/*if (scope.columnHasCorrespondingGroup(column.key)) {

                        clearAllSortOptions(scope.groups);

                    } else {

                        clearAllSortOptions(scope.columns);

                    }*/

				column.options.sort_settings.mode = sortMode
				// column.options.sort = direction;
				if (!column.options) column.options = {}
				if (!column.options.sort) column.options.sort = 'ASC'

				sort(column)
			}

			scope.changeSortDirection = function (columnOrGroup, direction) {
				scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP)

				/*if (scope.columnHasCorrespondingGroup(column.key)) {

                        clearAllSortOptions(scope.groups);

                    } else {

                        clearAllSortOptions(scope.columns);

                    }*/
				if (!columnOrGroup.options) columnOrGroup.options = {}

				columnOrGroup.options.sort = direction
				sort(columnOrGroup)
			}

			const signalSortChange = function (columnOrGroup) {
				if (scope.columnHasCorrespondingGroup(columnOrGroup.key)) {
					const placeholder1 = scope.groups.find(
						(group) => group.key === columnOrGroup.key
					)
					placeholder1.options.sort = columnOrGroup.options.sort
					placeholder1.options.sort_settings =
						columnOrGroup.options.sort_settings

					scope.evDataService.setGroups(scope.groups)

					scope.evDataService.setActiveGroupTypeSort(columnOrGroup)
					scope.evEventService.dispatchEvent(evEvents.GROUP_TYPE_SORT_CHANGE)
				} else {
					scope.evDataService.setActiveColumnSort(columnOrGroup)
					scope.evEventService.dispatchEvent(evEvents.COLUMN_SORT_CHANGE)
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

								scope.evDataService.setColumnSortData(
									columnOrGroup.key,
									layout.data
								)

								signalSortChange(columnOrGroup)
							} else {
								toastNotificationService.error('Manual Sort is not configured')
								columnOrGroup.options.sort_settings.layout_user_code = null
							}
						})
				} else {
					// default sort handler TODO External sort mode is not defined, and handling as default

					signalSortChange(columnOrGroup)
				}
			}

			// <Victor 2021.04.07 #90 sort setting for column>

			const getAttributes = function () {
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

			scope.reportSetSubtotalType = function (group, type) {
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

				scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
				scope.evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED)
			}

			scope.columnHasCorrespondingGroup = function (columnKey) {
				/*for (var i = 0; i < scope.groups.length; i++) {
                        if (scope.groups[i].key === columnKey) {
                            return true;
                        }
                    }*/
				var groupIndex = scope.groups.findIndex(
					(group) => group.key === columnKey
				)

				return groupIndex > -1
			}

			/*var getColumnSettingsMenu = function (column) {
                    var menuComp;

                    if (scope.isReport) {

                        if (column.value_type === 20) {
                            menuComp = [
                                {

                                }
                            ]
                        }

                    }
                };*/

			/*scope.openColumnSettingsMenu = function (e, column) {

                    e.preventDefault();
                    e.stopPropagation();

                    if (scope.isReport) {
                        var menuDiv = document.createElement('div');

                        menuDiv.style.top = e.pageY + 'px';
                        menuDiv.style.left = e.pageX + 'px';


                    } else {

                    }

                };*/

			scope.checkReportSortButton = function (column, index) {
				if (scope.isReport && index < scope.groups.length) {
					if (column.key === scope.groups[index].key) {
						return false
					}

					return true
				}

				return true
			}

			/**
			 * @param dataList {Array<Object>} - For rv list of all groups' data. For ev list of selected groups' data.
			 */
			var selectRowsInsideData = function (dataList) {
				dataList.forEach(function (dataListItem) {
					if (scope.isReport && dataListItem.___type === 'group') {
						dataListItem.___is_area_subtotal_activated = scope.isAllSelected
						dataListItem.___is_line_subtotal_activated = scope.isAllSelected
					} else if (dataListItem.___type === 'object') {
						dataListItem.___is_activated = scope.isAllSelected
					}

					if (dataListItem.results && dataListItem.results.length) {
						dataListItem.results.forEach(function (child) {
							if (child.___type === 'object') {
								child.___is_activated = scope.isAllSelected
							}
						})
					}

					scope.evDataService.setData(dataListItem)
				})

				var data = scope.evDataService.getData()
			}

			scope.selectAllRows = function () {
				console.time('Selecting all rows')

				var flatList
				var dataList = []
				// var activateItems;

				if (scope.isReport) {
					flatList = rvDataHelper.getFlatStructure(scope.evDataService)
					/* activateItems = function (item) {

                            if (item.___type === 'group') {

                                var itemData = Object.assign({}, scope.evDataService.getData(item.___id));
                                itemData.___is_area_subtotal_activated = scope.isAllSelected;
                                itemData.___is_line_subtotal_activated = scope.isAllSelected;
                                scope.evDataService.setData(itemData);

                            } else {
                                item.___is_activated = scope.isAllSelected;
                            }

                        }; */
				} else {
					flatList = evDataHelper.getObjectsFromSelectedGroups(
						scope.evDataService,
						globalDataService
					)
					/* activateItems = function (item) {
                            item.___is_activated = scope.isAllSelected;
                        };*/
				}

				scope.isAllSelected = scope.evDataService.getSelectAllRowsState()

				scope.isAllSelected = !scope.isAllSelected

				flatList.forEach(function (item) {
					if (item.___type === 'object') {
						item.___is_activated = scope.isAllSelected
					}
				})

				if (scope.isReport) {
					/* dataList.forEach(function (dataListItem) {

                            if (dataListItem.results && dataListItem.results.length) {

                                dataListItem.results.forEach(function (childItem) {

                                    childItem.___is_activated = false;

                                    flatList.forEach(function (item) {

                                        if (childItem.___id === item.___id) {

                                            childItem.___is_activated = item.___is_activated

                                        }

                                    })


                                });

                            }


                        }); */
					dataList = scope.evDataService.getDataAsList()
				} else {
					var selGroups = scope.evDataService.getSelectedGroups()

					if (selGroups.length) {
						selGroups.forEach(function (sGroup) {
							var rawData = scope.evDataService.getData(sGroup.___id)
							dataList.push(rawData)
						})
					} else {
						var rawData = scope.evDataService.getRootGroupData()

						dataList.push(rawData)
					}
				}

				selectRowsInsideData(dataList)

				scope.evDataService.setSelectAllRowsState(scope.isAllSelected)

				scope.evDataService.setFlatList(flatList)

				scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
				scope.evEventService.dispatchEvent(evEvents.ROW_ACTIVATION_CHANGE)

				console.timeEnd('Selecting all rows')
			}

			scope.isColumnFloat = function (column) {
				return column.value_type == 20
			}

			scope.sortHandler = function (column, sort) {
				if (!column.options) column.options = {}
				if (!column.options.sort_settings) column.options.sort_settings = {}

				if (column.options.sort_settings.layout_user_code) {
					// manual sort handler

					uiService
						.getColumnSortDataList({
							filters: {
								user_code: column.options.sort_settings.layout_user_code,
							},
						})
						.then(function (data) {
							if (data.results.length) {
								var layout = data.results[0]

								scope.evDataService.setColumnSortData(column.key, layout.data)

								var i
								for (i = 0; i < scope.columns.length; i = i + 1) {
									if (!scope.columns[i].options) {
										scope.columns[i].options = {}
									}
									scope.columns[i].options.sort = null
								}

								column.options.sort = sort
								column.options.sort_settings.mode = 'manual'

								console.log('sortHandler.column', column)

								scope.evDataService.setActiveColumnSort(column)

								if (scope.isReport) {
									scope.columnsToShow = getColumnsToShow()
								}

								collectMissingCustomFieldsErrors()
								scope.evEventService.dispatchEvent(evEvents.COLUMN_SORT_CHANGE)
							} else {
								toastNotificationService.error('Manual Sort is not configured')

								column.options.sort_settings.layout_user_code = null
							}
						})
				} else {
					// default sort handler

					var i
					for (i = 0; i < scope.columns.length; i = i + 1) {
						if (!scope.columns[i].options) {
							scope.columns[i].options = {}
						}
						scope.columns[i].options.sort = null
					}

					column.options.sort = sort
					column.options.sort_settings.mode = 'default'

					console.log('sortHandler.column', column)

					var columns = scope.evDataService.getColumns()

					columns.forEach(function (item) {
						if (column.key === item.key) {
							item = column
						}
					})

					scope.evDataService.setActiveColumnSort(column)

					scope.evDataService.setColumns(columns)

					scope.columnsToShow = getColumnsToShow()

					collectMissingCustomFieldsErrors()

					scope.evEventService.dispatchEvent(evEvents.COLUMN_SORT_CHANGE)
				}
			}

			scope.groupsSortHandler = function (groupIndex, sort) {
				// reset sorting for other groups
				var i
				for (i = 0; i < scope.groups.length; i = i + 1) {
					if (!scope.groups[i].options) {
						scope.groups[i].options = {}
					}
				}

				var group = scope.groups[groupIndex]
				console.log('groups sorting group', group)
				group.options.sort = sort

				var groups = scope.evDataService.getGroups()

				groups.forEach(function (item) {
					if (group.key === item.key || group.id === item.id) {
						item = group
					}
				})

				scope.evDataService.setGroups(groups)
				scope.evDataService.setActiveGroupTypeSort(group)

				scope.evEventService.dispatchEvent(evEvents.GROUP_TYPE_SORT_CHANGE)
			}

			scope.selectSubtotalType = function (column, type) {
				scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP)

				if (!column.hasOwnProperty('report_settings')) {
					column.report_settings = {}
				}

				if (column.report_settings.subtotal_formula_id == type) {
					column.report_settings.subtotal_formula_id = null
				} else {
					column.report_settings.subtotal_formula_id = type
				}

				makePopupDataForColumns(scope.columns)

				scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
				scope.evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED)
			}

			function getSubtotalFormula(column) {
				if (column.hasOwnProperty('report_settings')) {
					return column.report_settings.subtotal_formula_id
				}

				return null
			}

			function isSubtotalSum(column) {
				const subtotalFormula = getSubtotalFormula(column)
				return subtotalFormula === 1
			}

			function isSubtotalWeighted(column) {
				const subtotalFormula = getSubtotalFormula(column)
				return subtotalFormula >= 2 && subtotalFormula <= 5
			}

			function isSubtotalAvgWeighted(column) {
				const subtotalFormula = getSubtotalFormula(column)
				return subtotalFormula >= 6 && subtotalFormula <= 9
			}

			scope.checkSubtotalFormula = function (column, type) {
				if (
					column.hasOwnProperty('report_settings') &&
					column.report_settings
				) {
					if (column.report_settings.subtotal_formula_id === type) {
						return true
					}
				}

				return false
			}

			/**
			 * Can be called by a group.
			 *
			 * @param itemKey {string} - key of column or group
			 * @param $mdMenu {Object} - object with data of $mdMenu
			 * @param $event {Object} event object
			 * @param _$popup
			 */
			scope.renameColumn = function (itemKey, $mdMenu, $event, _$popup) {
				// TODO after reworking entity viewer, remove $mdMenu argument

				if ($mdMenu) {
					$mdMenu.close()
				} else {
					_$popup.cancel()
				}

				var column = scope.columns.find((column) => column.key === itemKey)

				$mdDialog
					.show({
						controller: 'RenameFieldDialogController as vm',
						templateUrl: 'views/dialogs/rename-field-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						locals: {
							data: column,
						},
					})
					.then((res) => {
						if (res.status === 'agree') {
							column.layout_name = res.data.layout_name
							scope.evDataService.setColumns(scope.columns)

							if (scope.columnHasCorrespondingGroup(column.key)) {
								var group = scope.groups.find((group) => group.key === itemKey)
								group.layout_name = res.data.layout_name

								scope.evDataService.setGroups(scope.groups)
							}

							const filters = scope.evDataService.getFilters()

							if (scope.isReport) {
								const filter = filters.find(
									(filter) => filter.key === res.data.key
								)

								if (filter) {
									filter.layout_name = res.data.layout_name

									scope.evDataService.setFilters(filters)

									scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)
								}
							} else {
								let filterLayoutNameChanged = false

								for (var filtersProp in filters) {
									// search among front and back filters

									const filter = filters[filtersProp].find(
										(filter) => filter.key === res.data.key
									)

									if (filter) {
										filter.layout_name = res.data.layout_name
										filterLayoutNameChanged = true
									}
								}

								if (filterLayoutNameChanged) {
									scope.evDataService.setFilters(filters)
									scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)
								}
							}

							/* var filters = scope.evDataService.getFilters();
                            var filterToRename = filters.find(filter => filter.key === res.data.key);

                            if (filterToRename) {

                                filterToRename.layout_name = res.data.layout_name;

                                scope.evDataService.setFilters(filters);

                                scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE);

                            } */
						}
					})
			}

			scope.resizeColumn = function (column, $mdMenu, $event) {
				if ($mdMenu) {
					$mdMenu.close()
				} else {
					scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP)
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
							scope.evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
							scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
						}
					})
			}

			scope.checkColTextAlign = function (column, type) {
				if (column.hasOwnProperty('style') && column.style) {
					if (column.style.text_align === type) {
						return true
					}
				}

				return false
			}

			scope.changeColumnTextAlign = function (column, type) {
				scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP)

				if (!column.hasOwnProperty('style')) {
					column.style = {}
				}

				if (column.style.text_align === type) {
					delete column.style.text_align
				} else {
					column.style.text_align = type
				}

				scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
			}

			scope.selectRoundFormat = function (column, type) {
				if (!column.hasOwnProperty('report_settings')) {
					column.report_settings = {}
				}

				if (column.report_settings.round_format_id == type) {
					column.report_settings.round_format_id = null
				} else {
					column.report_settings.round_format_id = type
				}

				scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
				scope.evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED)
			}

			scope.checkRoundFormatFormula = function (column, type) {
				if (
					column.hasOwnProperty('report_settings') &&
					column.report_settings
				) {
					if (column.report_settings.round_format_id == type) {
						return true
					}
				}

				return false
			}

			scope.selectThousandsSeparatorFormat = function (column, type) {
				if (!column.hasOwnProperty('report_settings')) {
					column.report_settings = {}
				}

				if (column.report_settings.thousands_separator_format_id === type) {
					column.report_settings.thousands_separator_format_id = null
				} else {
					column.report_settings.thousands_separator_format_id = type
				}

				scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
				scope.evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED)
			}

			scope.checkThousandsSeparatorFormat = function (column, type) {
				if (
					column.hasOwnProperty('report_settings') &&
					column.report_settings
				) {
					if (column.report_settings.thousands_separator_format_id === type) {
						return true
					}
				}
				return false
			}

			scope.selectNegativeColor = function (column, type) {
				if (!column.hasOwnProperty('report_settings')) {
					column.report_settings = {}
				}

				if (column.report_settings.negative_color_format_id === type) {
					column.report_settings.negative_color_format_id = null
				} else {
					column.report_settings.negative_color_format_id = type
				}

				scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
				scope.evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED)
			}

			scope.checkNegativeColor = function (column, type) {
				if (
					column.hasOwnProperty('report_settings') &&
					column.report_settings
				) {
					if (column.report_settings.negative_color_format_id === type) {
						return true
					}
				}
				return false
			}

			scope.selectNegativeFormat = function (column, type) {
				if (!column.hasOwnProperty('report_settings')) {
					column.report_settings = {}
				}

				if (column.report_settings.negative_format_id == type) {
					column.report_settings.netgative_format_id = null
				} else {
					column.report_settings.negative_format_id = type
				}

				scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
				scope.evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED)
			}

			scope.checkNegativeFormatFormula = function (column, type) {
				if (
					column.hasOwnProperty('report_settings') &&
					column.report_settings
				) {
					if (column.report_settings.negative_format_id == type) {
						return true
					}
				}
				return false
			}

			scope.selectZeroFormat = function (column, type) {
				if (!column.hasOwnProperty('report_settings')) {
					column.report_settings = {}
				}

				if (column.report_settings.zero_format_id == type) {
					column.report_settings.zero_format_id = null
				} else {
					column.report_settings.zero_format_id = type
				}

				scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
				scope.evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED)
			}

			scope.checkZeroFormatFormula = function (column, type) {
				if (
					column.hasOwnProperty('report_settings') &&
					column.report_settings
				) {
					if (column.report_settings.zero_format_id == type) {
						return true
					}
				}

				return false
			}

			scope.isSortable = function (column) {
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

			/* scope.openColumnNumbersRenderingSettings = function (column, $event) {

                    scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP);

                    $mdDialog.show({
                        controller: 'gColumnNumbersRenderingSettingsDialogController as vm',
                        templateUrl: 'views/dialogs/g-column-numbers-rendering-settings-dialog-view.html',
                        targetEvent: $event,
                        multiple: true,
                        locals: {
                            data: {
                                column: column
                            }
                        }

                    }).then(function (res) {

                        if (res.status === 'agree') {

                            column.report_settings = res.data.report_settings;

                            scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE);
                            scope.evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED);

                        }

                    });
                }; */

			scope.activateColumnNumberRenderingPreset = function (
				column,
				rendPreset
			) {
				scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP)

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

				scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
				scope.evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED)
			}

			scope.addColumnEntityToGrouping = function (column) {
				scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP)

				var groups = scope.evDataService.getGroups()
				var groupToAdd = evHelperService.getTableAttrInFormOf('group', column)

				groups.push(groupToAdd)
				scope.evDataService.setGroups(groups)

				scope.evEventService.dispatchEvent(evEvents.GROUPS_CHANGE)
				scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
			}

			scope.editManualSorting = function ($event, column) {
				scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP)

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
							entityViewerDataService: scope.evDataService,
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							/* scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE);
                            scope.evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED); */

							column.options.sort_settings = {
								...column.options.sort_settings,
								...res.data.sort_settings,
							}

							if (!column.options.sort) column.options.sort = 'ASC'

							sort(column)
						}
					})
			}

			scope.addFiltersWithColAttr = function (column) {
				scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP)

				var filters = scope.evDataService.getFilters()
				var filterToAdd = evHelperService.getTableAttrInFormOf('filter', column)
				filterToAdd.options.enabled = true

				if (scope.isReport) {
					filters.push(filterToAdd)
				} else {
					if (showFrontEvFilters) {
						filters.frontend.push(filterToAdd)
					} else {
						filters.backend.push(filterToAdd)
					}
				}

				scope.evDataService.setFilters(filters)

				scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)
			}
			/**
			 * Used in only by report viewer.
			 * @param groupKey {string}
			 * @param _$popup {Object} - data from popup
			 */
			scope.removeGroup = function (groupKey, _$popup) {
				_$popup.cancel()
				// scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP);

				var groups = scope.evDataService.getGroups()

				/** remove group */
				/* var i;
                    for (i = 0; i < groups.length; i++) {
                        if (groups[i].___group_type_id === columnTableId) {
                            groups.splice(i, 1);
                            break;
                        }
                    } */
				var groupToRemoveIndex = groups.findIndex(
					(group) => group.key === groupKey
				)

				if (groupToRemoveIndex > -1) {
					groups.splice(groupToRemoveIndex, 1)
				} else {
					throw new Error('No group with such key found: ' + groupKey)
				}

				scope.evDataService.setGroups(groups)
				scope.evEventService.dispatchEvent(evEvents.GROUPS_CHANGE)

				/** remove column */
				/* var c;
                    for (c = 0; c < scope.columns.length; c++) {

                        if (scope.columns[c].___column_id === columnTableId) {
                            scope.columns.splice(c, 1);
                            break;
                        }

                    } */
				var colToRemoveIndex = scope.columns.findIndex(
					(column) => column.key === groupKey
				)
				if (colToRemoveIndex > -1) {
					scope.columns.splice(colToRemoveIndex, 1)
				} else {
					throw new Error('No column with such key found: ' + groupKey)
				}

				scope.evDataService.setColumns(scope.columns)

				scope.columnsToShow = getColumnsToShow()

				collectMissingCustomFieldsErrors()

				scope.evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
				scope.evEventService.dispatchEvent(evEvents.UPDATE_COLUMNS_SIZE)

				scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
			}

			scope.unGroup = function (groupKey, _$popup) {
				_$popup.cancel()
				// scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP);

				var groups = scope.evDataService.getGroups()

				/** remove group */
				var groupToRemoveIndex = groups.findIndex(
					(group) => group.key === groupKey
				)

				/*var i;
                    for (i = 0; i < groups.length; i++) {
                        if (groups[i].___group_type_id === columnTableId) {
                            groups.splice(i, 1);
                            break;
                        }
                    }*/
				if (groupToRemoveIndex > -1) {
					groups.splice(groupToRemoveIndex, 1)
				} else {
					throw new Error('No group with such key found: ' + groupKey)
				}

				if (scope.isReport) {
					const lastDraggedElem = scope.contentWrapElement.querySelector(
						'.gDraggableHead.last-dragged'
					)
					if (lastDraggedElem) lastDraggedElem.classList.remove('last-dragged')

					const columns = scope.evDataService.getColumns()
					const ungroupedColumn = columns.find(
						(column) => column.key === groupKey
					)

					if (ungroupedColumn) {
						if (!ungroupedColumn.frontOptions) ungroupedColumn.frontOptions = {}

						ungroupedColumn.frontOptions.lastDragged = true
						scope.evDataService.setColumns(columns)
					}
				}

				scope.groups = groups
				scope.evDataService.setGroups(groups)
				scope.evEventService.dispatchEvent(evEvents.GROUPS_CHANGE)

				if (scope.isReport) {
					scope.evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
					scope.evEventService.dispatchEvent(evEvents.UPDATE_COLUMNS_SIZE)

					scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
				}
			}

			scope.removeColumn = function (column) {
				scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP)

				var colToDeleteAttr = ''
				/*scope.columns = scope.columns.filter(function (item) {
                        return column.___column_id !== item.___column_id;
                    });*/
				for (var i = 0; i < scope.columns.length; i++) {
					if (column.___column_id === scope.columns[i].___column_id) {
						colToDeleteAttr = JSON.parse(angular.toJson(scope.columns[i]))
						scope.columns.splice(i, 1)
						break
					}
				}

				if (scope.viewContext === 'dashboard') {
					var hasAttrAlready = false
					var availableCols =
						scope.attributeDataService.getAttributesAvailableForColumns()

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
							order: scope.colsAvailableForAdditions.length,
						}

						availableCols.push(newAvailableCol)
						scope.attributeDataService.setAttributesAvailableForColumns(
							availableCols
						)
					}
				}

				scope.evDataService.setColumns(scope.columns)
				scope.evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
				scope.evEventService.dispatchEvent(evEvents.UPDATE_COLUMNS_SIZE)
				scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
			}

			const hideSubtotalForColumn = function (prop, column) {
				if (!column.hasOwnProperty('report_settings')) {
					column.report_settings = {}
				}

				column.report_settings[prop] = !column.report_settings[prop]

				scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
				scope.evEventService.dispatchEvent(evEvents.REPORT_TABLE_VIEW_CHANGED)
			}

			/* scope.reportHideSubtotal = function (column) {

                    scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP);
                    hideSubtotalForColumn('hide_subtotal', column)

                }; */

			scope.reportHideGrandTotal = function (column) {
				scope.evEventService.dispatchEvent(popupEvents.CLOSE_POPUP)
				hideSubtotalForColumn('hide_grandtotal', column)
			}

			var getDownloadedTableItemsCount = function () {
				var unfilteredFlatList = scope.evDataService.getUnfilteredFlatList()

				unfilteredFlatList = unfilteredFlatList.filter(function (item) {
					return item.___type !== 'control'
				})

				scope.downloadedItemsCount = unfilteredFlatList.length
			}

			/*scope.getColumnContentClasses = function ($index) {
                    var classes = '';

                    /!*if (scope.viewContext === 'dashboard' && !scope.hasFoldingBtn($index)) {
                        classes += 'p-r-8';
                    }*!/

                    if (scope.viewContext === 'dashboard' && scope.hasFoldingBtn($index)) {
                        classes += 'p-r-8';
                    }
                };*/

			const updateGroupTypeIds = function () {
				let groups = scope.evDataService.getGroups()

				groups.forEach((item) => {
					item.___group_type_id = evDataHelper.getGroupTypeId(item)
				})

				scope.evDataService.setGroups(groups)
			}

			const setDefaultGroupType = function () {
				let groups = scope.evDataService.getGroups()

				/* TO DELETE: date 2021-01-24
                    if (scope.isReport) {

                        let reportOptions = scope.evDataService.getReportOptions();

                        if (!reportOptions.subtotals_options) {
                            reportOptions.subtotals_options = {}
                        }

                        if (!reportOptions.subtotals_options.type) {

                            reportOptions.subtotals_options.type = 'line'

                            scope.evDataService.setReportOptions(reportOptions);
                            scope.evEventService.dispatchEvent(evEvents.REPORT_OPTIONS_CHANGE);

                        }

                    } */

				groups.forEach(function (group) {
					if (!group.hasOwnProperty('report_settings')) {
						group.report_settings = {}
					}

					if (!group.report_settings.subtotal_type) {
						group.report_settings.subtotal_type = 'line'
					}

					if (!scope.isReport && !group.hasOwnProperty('ev_folded')) {
						group.ev_group_folded = true
					}
				})

				scope.evDataService.setGroups(groups)
			}

			const updateGroupFoldingState = function () {
				let groups = scope.evDataService.getGroups()
				let parentGroupFullyFolded = false

				groups.forEach((group) => {
					if (parentGroupFullyFolded) {
						group.report_settings.is_level_folded = true
					} else if (group.report_settings.is_level_folded) {
						// if group is fully folded, groups after it must be folded too
						parentGroupFullyFolded = true
					}
				})

				scope.evDataService.setGroups(groups)
			}

			const syncColumnsWithGroups = function () {
				let columns = scope.evDataService.getColumns()
				let groups = scope.evDataService.getGroups()

				let columnsHaveBeenSynced = false

				groups.forEach((group, groupIndex) => {
					if (group.key !== columns[groupIndex].key) {
						let columnToAdd
						let groupColumnIndex = columns.findIndex(
							(column) => group.key === column.key
						)

						if (groupColumnIndex > -1) {
							columnToAdd = JSON.parse(
								JSON.stringify(columns[groupColumnIndex])
							)
							columns.splice(groupColumnIndex, 1)
						} else {
							columnToAdd = evHelperService.getTableAttrInFormOf(
								'column',
								group
							)
						}

						columns.splice(groupIndex, 0, columnToAdd)

						columnsHaveBeenSynced = true
					}
				})

				scope.evDataService.setColumns(columns)

				/* if (columnsHaveBeenSynced) {
                        scope.evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE);
                    } */
				return columnsHaveBeenSynced
			}

			scope.hasFoldingBtn = function ($index) {
				var groups = scope.evDataService.getGroups()

				if (scope.isReport && $index < groups.length) {
					return true
				}

				return false
			}

			scope.foldLevel = function (key, $index) {
				scope.groups = scope.evDataService.getGroups()

				var item = scope.groups[$index]
				item.report_settings.is_level_folded = true
				var i
				//<editor-fold desc="Set folded groups before calling rvDataHelper.setGroupSettings()">
				for (i = $index; i < scope.groups.length; i++) {
					scope.groups[i].report_settings.is_level_folded = true
				}

				scope.evDataService.setGroups(scope.groups)
				//</editor-fold">

				for (i = $index; i < scope.groups.length; i++) {
					var groupsContent = evDataHelper.getGroupsByLevel(
						i + 1,
						scope.evDataService
					)

					groupsContent.forEach(function (groupItem) {
						groupItem.___is_open = false

						var groupSettings = rvDataHelper.getOrCreateGroupSettings(
							scope.evDataService,
							groupItem
						)
						groupSettings.is_open = false
						rvDataHelper.setGroupSettings(
							scope.evDataService,
							groupItem,
							groupSettings
						)

						var childrens = evDataHelper.getAllChildrenGroups(
							groupItem.___id,
							scope.evDataService
						)

						childrens.forEach(function (children) {
							if (children.___type === 'group') {
								item = scope.evDataService.getData(children.___id)

								var groupSettings = rvDataHelper.getOrCreateGroupSettings(
									scope.evDataService,
									children
								)
								groupSettings.is_open = false
								rvDataHelper.setGroupSettings(
									scope.evDataService,
									children,
									groupSettings
								)

								if (item) {
									item.___is_open = false
									scope.evDataService.setData(item)
								} else {
									children.___is_open = false
									scope.evDataService.setData(children)
								}
							}
						})
					})
				}

				// rvDataHelper.markHiddenColumnsBasedOnFoldedGroups(scope.evDataService);

				scope.evEventService.dispatchEvent(evEvents.GROUPS_LEVEL_FOLD)
				scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
			}

			scope.unfoldLevel = function (key, $index) {
				scope.groups = scope.evDataService.getGroups()

				var item = scope.groups[$index]

				item.report_settings.is_level_folded = false

				scope.groups = scope.evDataService.getGroups()
				var i
				//<editor-fold desc="Set folded groups before calling rvDataHelper.setGroupSettings()">
				for (i = $index; i >= 0; i--) {
					scope.groups[i].report_settings.is_level_folded = false
				}

				scope.evDataService.setGroups(scope.groups)
				//</editor-fold>

				for (i = $index; i >= 0; i--) {
					var groupsContent = evDataHelper.getGroupsByLevel(
						i + 1,
						scope.evDataService
					)

					groupsContent.forEach(function (groupItem) {
						var groupSettings = rvDataHelper.getOrCreateGroupSettings(
							scope.evDataService,
							groupItem
						)

						groupItem.___is_open = true
						groupSettings.is_open = true

						rvDataHelper.setGroupSettings(
							scope.evDataService,
							groupItem,
							groupSettings
						)

						scope.evDataService.setData(groupItem)
					})
				}

				rvDataHelper.markHiddenColumnsBasedOnFoldedGroups(scope.evDataService)

				scope.evEventService.dispatchEvent(evEvents.GROUPS_LEVEL_UNFOLD)
				scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
			}

			scope.groupLevelIsFolded = function ($index) {
				var groups = scope.evDataService.getGroups()

				return groups[$index].report_settings.is_level_folded
			}

			var getColsAvailableForAdditions = function () {
				var availableCols =
					scope.attributeDataService.getAttributesAvailableForColumns()

				scope.colsAvailableForAdditions = availableCols.filter(function (
					aColumn
				) {
					for (var i = 0; i < scope.columns.length; i++) {
						if (scope.columns[i].key === aColumn.attribute_data.key) {
							return false
						}
					}

					return true
				})
			}

			/* var flagMissingColumns = function () {


                    console.log("flagMissingColumns.columns", scope.columns);

                    var attributeTypes;
                    var attributes;

                    if (scope.isReport) {

                        switch (scope.entityType) {

                            case 'balance-report':
                                attributes = scope.attributeDataService.getBalanceReportAttributes();
                                break;

                            case 'pl-report':
                                attributes = scope.attributeDataService.getPlReportAttributes();
                                break;

                            case 'transaction-report':
                                attributes = scope.attributeDataService.getTransactionReportAttributes();
                                break;

                        }

                        console.log("flagMissingColumns.attributes", attributes);

                        scope.columns = scope.columns.map(function (column) {

                            column.status = 'ok';

                            if (column.key.indexOf('attributes.') !== -1) {

                                isMissing = true;

                                attributes.forEach(function (attribute) {

                                    if (column.key === attribute.key) {
                                        isMissing = false;
                                    }


                                });

                                if (isMissing) {
                                    column.status = 'missing'
                                }

                            }

                            return column

                        });

                        scope.evDataService.setColumns(scope.columns);

                    } else {

                        attributeTypes = scope.attributeDataService.getDynamicAttributesByEntityType(scope.entityType);

                        console.log("flagMissingColumns.attributeTypes", attributeTypes);

                        var user_code;
                        var isMissing;

                        scope.columns = scope.columns.map(function (column) {

                            column.status = 'ok';

                            if (column.key.indexOf('attributes.') !== -1) {

                                isMissing = true;

                                user_code = column.key.split('attributes.')[1];

                                attributeTypes.forEach(function (attributeType) {

                                    if (attributeType.user_code === user_code) {
                                        isMissing = false;
                                    }

                                });

                                if (isMissing) {
                                    column.status = 'missing'
                                }

                            }

                            return column


                        });

                        scope.evDataService.setColumns(scope.columns);

                    }


                }; */

			scope.addColumn = function ($event) {
				var allAttrsList = getAttributes()

				var availableAttrs

				availableAttrs = allAttrsList.filter(function (attr) {
					if (attr.value_type === 'mc_field') return false

					for (var i = 0; i < scope.columns.length; i++) {
						if (scope.columns[i].key === attr.key) {
							return false
						}
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

							res.data.columns = true

							for (var i = 0; i < res.data.items.length; i = i + 1) {
								var colData = evHelperService.getTableAttrInFormOf(
									'column',
									res.data.items[i]
								)
								scope.columns.push(colData)
							}

							scope.evDataService.setColumns(scope.columns)

							scope.evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
							scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
						}
					})
			}

			scope.addColumnToDashboardReport = function (attribute) {
				var colData = JSON.parse(JSON.stringify(attribute.attribute_data))

				colData.columns = true
				if (attribute.layout_name) {
					colData.layout_name = JSON.parse(
						JSON.stringify(attribute.layout_name)
					)
				}
				scope.columns.push(colData)
				scope.evDataService.setColumns(scope.columns)

				scope.evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
				scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
			}

			const onGroupLevelFoldingSwitch = function (argumentsObj) {
				rvDataHelper.markHiddenColumnsBasedOnFoldedGroups(scope.evDataService)

				scope.groups = scope.evDataService.getGroups()
				evDataHelper.importGroupsStylesFromColumns(scope.groups, scope.columns)

				if (argumentsObj && argumentsObj.updateScope) scope.$apply()
			}

			const syncGroupLayoutNamesWithColumns = function () {
				var groupChanged = false

				scope.columns.forEach((column) => {
					if (column.layout_name) {
						const matchingGroup = scope.groups.find(
							(group) => group.key === column.key
						)

						if (matchingGroup) {
							matchingGroup.layout_name = column.layout_name
							groupChanged = true
						}
					}
				})

				if (groupChanged) scope.evDataService.setGroups(scope.groups)
			}

			let onGroupsChange

			if (scope.isReport) {
				scope.checkForFilteringBySameAttr = function (columnKey) {
					var filters = scope.evDataService.getFilters()

					for (var i = 0; i < filters.length; i++) {
						if (filters[i].key === columnKey) {
							return false
						}
					}

					return true
				}

				onGroupsChange = function () {
					updateGroupTypeIds()
					setDefaultGroupType()
					updateGroupFoldingState()

					scope.groups = scope.evDataService.getGroups()
					scope.evDataService.resetTableContent(scope.isReport)

					const colsChanged = syncColumnsWithGroups()

					evDataHelper.importGroupsStylesFromColumns(
						scope.groups,
						scope.columns
					)

					scope.columnsToShow = getColumnsToShow()

					collectMissingCustomFieldsErrors()
					// setFiltersLayoutNames();
					var foldedGroup = scope.groups.find(
						(group) =>
							group.report_settings && group.report_settings.is_level_folded
					)

					if (!foldedGroup) {
						rvDataHelper.markHiddenColumnsBasedOnFoldedGroups(
							scope.evDataService
						)
					}

					if (colsChanged)
						scope.evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)

					scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
				}
			} else {
				onGroupsChange = function () {
					updateGroupTypeIds()
					setDefaultGroupType()

					scope.groups = scope.evDataService.getGroups()
					scope.evDataService.resetTableContent(scope.isReport)

					collectMissingCustomFieldsErrors()

					scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
				}

				scope.checkForFilteringBySameAttr = function (columnKey) {
					var filters = scope.evDataService.getFilters()
					var filtersList = showFrontEvFilters
						? filters.frontend
						: filters.backend

					for (var i = 0; i < filtersList.length; i++) {
						if (filtersList[i].key === columnKey) {
							return false
						}
					}

					return true
				}
			}

			const initEventListeners = function () {
				// Victor 2021.03.29 #88 fix bug with deleted custom fields
				scope.evEventService.addEventListener(
					evEvents.DYNAMIC_ATTRIBUTES_CHANGE,
					function () {
						customFields =
							scope.attributeDataService.getCustomFieldsByEntityType(
								scope.entityType
							)
						collectMissingCustomFieldsErrors()
					}
				)
				// <Victor 2021.03.29 #88 fix bug with deleted custom fields>

				// Victor 2021.05.12 #111 multi rows selection
				scope.evEventService.addEventListener(
					evEvents.ROW_ACTIVATION_CHANGE,
					function () {
						scope.isAllSelected = scope.evDataService.getSelectAllRowsState()
						setTimeout(() => scope.$apply())
					}
				)
				// Victor 2021.05.12 #111 multi rows selection

				scope.evEventService.addEventListener(
					evEvents.GROUPS_CHANGE,
					onGroupsChange
				)

				scope.evEventService.addEventListener(
					evEvents.COLUMNS_CHANGE,
					function () {
						evDataHelper.updateColumnsIds(scope.evDataService)
						evDataHelper.setColumnsDefaultWidth(scope.evDataService)

						scope.columns = scope.evDataService.getColumns()

						getColsAvailableForAdditions() // when inside dashboard
						// flagMissingColumns();
						makePopupDataForColumns(scope.columns)

						scope.columnsToShow = getColumnsToShow()

						collectMissingCustomFieldsErrors()
					}
				)

				/* scope.evEventService.addEventListener(evEvents.GROUPS_LEVEL_UNFOLD, function () {

                        scope.groups = scope.evDataService.getGroups();
                        evDataHelper.importGroupsStylesFromColumns(scope.groups, scope.columns)
                        scope.notGroupingColumns = evDataHelper.separateNotGroupingColumns(scope.columns, scope.groups);
                        collectMissingCustomFieldsErrors(scope.notGroupingColumns, scope.groups);

                        setFiltersLayoutNames()

                    }); */
				scope.evEventService.addEventListener(
					evEvents.GROUPS_LEVEL_FOLD,
					onGroupLevelFoldingSwitch
				)
				scope.evEventService.addEventListener(
					evEvents.GROUPS_LEVEL_UNFOLD,
					onGroupLevelFoldingSwitch
				)

				if (!scope.isReport) {
					scope.evEventService.addEventListener(
						evEvents.DATA_LOAD_END,
						function () {
							getDownloadedTableItemsCount()
						}
					)

					scope.evEventService.addEventListener(
						evEvents.FILTERS_TO_SHOW_CHANGE,
						function () {
							showFrontEvFilters = !showFrontEvFilters
						}
					)
				}
			}

			const init = function () {
				evDataHelper.importGroupsStylesFromColumns(scope.groups, scope.columns)

				if (scope.hideRowSettings) {
					scope.contentWrapElement.classList.add('g-row-settings-collapsed')
				} else {
					scope.contentWrapElement.classList.remove('g-row-settings-collapsed')
				}

				updateGroupTypeIds()

				if (scope.isReport) syncColumnsWithGroups()
				syncGroupLayoutNamesWithColumns()

				scope.columns = scope.evDataService.getColumns()
				// flagMissingColumns();
				makePopupDataForColumns(scope.columns)

				scope.columnsToShow = getColumnsToShow()

				collectMissingCustomFieldsErrors()

				evDataHelper.updateColumnsIds(scope.evDataService)
				evDataHelper.setColumnsDefaultWidth(scope.evDataService)

				if (scope.viewContext === 'dashboard') {
					getColsAvailableForAdditions()
					// keysOfColsToHide = scope.evDataService.getKeysOfColumnsToHide();
				}

				var evSettings = globalDataService.getMemberEntityViewersSettings(
					scope.isReport,
					scope.entityType
				)
				scope.rowFilterColor = evSettings.row_type_filter

				initEventListeners()
			}

			init()
		},
	}
}
