import uiService from '@/angular/services/uiService'
import evEvents from '@/angular/services/entityViewerEvents'

import evHelperService from '@/angular/services/entityViewerHelperService'
// import EventService from '@/angular/services/eventService';

export default function ($mdDialog, $state, $bigDrawer) {
	return {
		require: '^^gFilters',
		restrict: 'E',
		scope: {
			evDataService: '=',
			evEventService: '=',
			attributeDataService: '=',
		},
		templateUrl:
			'views/directives/groupTable/filters/g-ev-rv-filters-view.html',
		link: function (scope, elem, attrs, gFiltersVm) {
			scope.entityType = gFiltersVm.entityType
			scope.isReport = false
			scope.isRootEntityViewer = scope.evDataService.isRootEntityViewer()
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

			const gFiltersLeftPartWidth =
				elem[0].querySelector('.gFiltersLeftPart').clientWidth
			const gFiltersRightPartWidth =
				elem[0].querySelector('.gFiltersRightPart').clientWidth
			let filtersChipsContainer = elem[0].querySelector('.gFiltersContainer')
			let addFilterElem

			let filters = scope.evDataService.getFilters()
			let customFields = scope.attributeDataService.getCustomFieldsByEntityType(
				scope.entityType
			)
			const viewContext = scope.evDataService.getViewContext()

			scope.evGetEntityNameByState = function () {
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

			scope.evAddEntity = async function () {
				let editLayout,
					entity = {}

				switch (scope.entityType) {
					case 'transaction-type':
						editLayout = await uiService.getDefaultEditLayout(scope.entityType)
						evHelperService.openTTypeAddDrawer(
							scope.evDataService,
							scope.evEventService,
							editLayout,
							$bigDrawer,
							scope.entityType,
							entity
						)

						break

					case 'instrument-type':
						editLayout = await uiService.getDefaultEditLayout(scope.entityType)
						evHelperService.openInstrumentTypeAddDrawer(
							scope.evDataService,
							scope.evEventService,
							editLayout,
							$bigDrawer,
							scope.entityType,
							entity
						)

						break

					case 'complex-transaction':
						editLayout = await uiService.getDefaultEditLayout(scope.entityType)

						evHelperService.openComplexTransactionAddDrawer(
							scope.evDataService,
							scope.evEventService,
							editLayout,
							$bigDrawer,
							scope.entityType,
							entity
						)

						break

					default:
						editLayout = await uiService.getDefaultEditLayout(scope.entityType)
						evHelperService.openEntityViewerAddDrawer(
							scope.evDataService,
							scope.evEventService,
							editLayout,
							$bigDrawer,
							scope.entityType,
							entity
						)

						break
				}
			}

			scope.addFromProvider = function ($event) {
				$mdDialog.show({
					controller: 'InstrumentSelectDatabaseDialogController as vm',
					templateUrl:
						'views/dialogs/instrument-select-database-dialog-view.html',
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

			scope.openTransactionTypeDialog = async function () {
				let editLayout,
					entity = {}

				editLayout = await uiService.getDefaultEditLayout(scope.entityType)
				evHelperService.openTTypeAddDrawer(
					scope.evDataService,
					scope.evEventService,
					editLayout,
					$bigDrawer,
					scope.entityType,
					entity
				)
			}

			scope.openSimpleImportDialog = function ($event) {
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

			/* scope.evApplyDatabaseFilters = function () {
                    scope.evDataService.resetTableContent(false);
                    scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE);
                }; */
			scope.refreshTable = function () {
				scope.evDataService.resetTableContent(false)

				scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
			}

			//region Chips
			const formatFiltersForChips = function () {
				scope.filtersChips = []

				const errors = []
				// const shownFilters = scope.showFrontFilters ? filters.frontend : filters.backend;
				filters[scope.shownFiltersType].forEach((filter) => {
					const filterOpts = filter.options || {}
					/* let filterVal = filterOpts.filter_values || "";

                        if (filterOpts.filter_type === 'from_to') {

                            filterVal = `From ${filterOpts.filter_values.min_value} to ${filterOpts.filter_values.max_value}`;

                        } else if (filterOpts.filter_type === 'out_of_range' ) {

                            filterVal = `Out of range from ${filterOpts.filter_values.min_value} to ${filterOpts.filter_values.max_value}`;

                        } */

					let filterData = {
						id: filter.key,
						isActive: filterOpts.enabled,
					}

					const filterName = filter.layout_name
						? filter.layout_name
						: filter.name

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

			scope.filterSettingsChange = function () {
				scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)

				if (scope.shownFiltersType === 'frontend')
					scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
			}

			scope.onChipsFirstRender = gFiltersVm.onChipsFirstRender

			scope.addFilter = function ($event) {
				// const shownFilters = scope.showFrontFilters ? filters.frontend : filters.backend;

				gFiltersVm
					.openAddFilterDialog($event, filters[scope.shownFiltersType])
					.then((res) => {
						if (res.status === 'agree') {
							for (var i = 0; i < res.data.items.length; i = i + 1) {
								filters[scope.shownFiltersType].push(res.data.items[i])
							}

							console.log('filters addFilter', filters)

							scope.evDataService.setFilters(filters)
							scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)

							scope.$apply()
						}
					})
			}

			scope.removeFilter = function (filtersToRemove) {
				filters[scope.shownFiltersType] = filters[
					scope.shownFiltersType
				].filter((filter) => {
					return filtersToRemove.find((item) => item.id !== filter.key)
				})

				scope.evDataService.setFilters(filters)

				scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)
				scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
			}
			//endregion

			scope.toggleFiltersToShow = function () {
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
					scope.shownFiltersType === 'frontend'
						? 'ADD FILTER'
						: 'ADD SERVER FILTER'

				formatFiltersForChips()

				scope.evEventService.dispatchEvent(evEvents.FILTERS_TO_SHOW_CHANGE)
			}

			scope.toggleSplitPanel = gFiltersVm.toggleSplitPanel

			scope.exportAsCSV = gFiltersVm.exportAsCSV
			scope.exportAsExcel = gFiltersVm.exportAsExcel
			scope.copyReport = gFiltersVm.copyReport
			scope.copySelectedToBuffer = gFiltersVm.copySelectedToBuffer

			scope.openViewConstructor = gFiltersVm.openViewConstructor

			scope.openCustomFieldsManager = function ($event) {
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

			scope.openInputFormEditor = function (ev) {
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
				scope.evEventService.addEventListener(
					evEvents.DYNAMIC_ATTRIBUTES_CHANGE,
					function () {
						customFields =
							scope.attributeDataService.getCustomFieldsByEntityType(
								scope.entityType
							)
						formatFiltersForChips()
					}
				)

				scope.evEventService.addEventListener(
					evEvents.TABLE_SIZES_CALCULATED,
					function () {
						gFiltersVm.calculateFilterChipsContainerWidth(
							gFiltersLeftPartWidth,
							gFiltersRightPartWidth,
							filtersChipsContainer
						)
					}
				)

				scope.evEventService.addEventListener(
					evEvents.FILTERS_CHANGE,
					function () {
						filters = scope.evDataService.getFilters()

						formatFiltersForChips()

						setTimeout(function () {
							// wait until DOM elems reflow after ng-repeat

							const filterAreaHeightChanged =
								gFiltersVm.updateFilterAreaHeight()

							if (filterAreaHeightChanged) {
								scope.evEventService.dispatchEvent(
									evEvents.UPDATE_TABLE_VIEWPORT
								)
							}
						}, 0)
					}
				)

				scope.evEventService.addEventListener(
					evEvents.ADDITIONS_CHANGE,
					function () {
						scope.currentAdditions = scope.evDataService.getAdditions()
					}
				)
			}

			const init = function () {
				if (viewContext !== 'reconciliation_viewer' && filters.frontend.length)
					scope.thereAreFrontendFilters = true

				scope.currentAdditions = scope.evDataService.getAdditions()

				scope.popupEventService = gFiltersVm.popupEventService
				scope.chipsListEventService = gFiltersVm.chipsListEventService

				scope.popupData = gFiltersVm.popupData
				scope.popupData.shownFiltersType = scope.shownFiltersType

				formatFiltersForChips()

				scope.readyStatus.filters = true

				gFiltersVm.updateFilterAreaHeightOnInit()

				initEventListeners()
			}

			init()
		},
	}
}
