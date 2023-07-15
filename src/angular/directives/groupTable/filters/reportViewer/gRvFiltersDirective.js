import evEvents from '@/angular/services/entityViewerEvents'

// import EventService from '@/angular/services/eventService';

export default function ($mdDialog, gFiltersHelper, uiService) {
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
			scope.isReport = true
			scope.isRootEntityViewer = scope.evDataService.isRootEntityViewer()
			scope.showUseFromAboveFilters = !scope.hideUseFromAboveFilters

			const hideUseFromAboveFilters = gFiltersVm.hideUseFromAboveFilters

			if (hideUseFromAboveFilters) {
				scope.showUseFromAboveFilters = false
			} else {
				scope.showUseFromAboveFilters = !scope.isRootEntityViewer // show use from above filters by default inside split panel
			}

			scope.rvAutoRefresh = scope.evDataService.getAutoRefreshState()

			if (scope.rvAutoRefresh === null || scope.rvAutoRefresh === undefined) {
				//if we missed initial state for already existing layout
				scope.rvAutoRefresh = true
			}

			scope.readyStatus = {
				filters: false,
			}

			scope.filterPopupTemplate =
				'views/popups/groupTable/filters/rv-filter-popup-view.html'

			scope.popupPosX = gFiltersVm.popupPosX
			scope.popupPosY = gFiltersVm.popupPosY
			/*scope.fpBackClasses = gFiltersVm.fpBackClasses;
                scope.fpClasses = gFiltersVm.fpClasses;*/

			const gFiltersLeftPartWidth =
				elem[0].querySelector('.gFiltersLeftPart').clientWidth
			const gFiltersRightPartWidth =
				elem[0].querySelector('.gFiltersRightPart').clientWidth
			let filtersChipsContainer = elem[0].querySelector('.gFiltersContainer')

			let filters = scope.evDataService.getFilters()
			let useFromAboveFilters = []
			let customFields = scope.attributeDataService.getCustomFieldsByEntityType(
				scope.entityType
			)

			/* scope.calculateReport = function () {
                    scope.evEventService.dispatchEvent(evEvents.REQUEST_REPORT);
                }; */
			scope.refreshTable = function () {
				scope.evEventService.dispatchEvent(evEvents.REQUEST_REPORT)
			}

			//region Chips
			scope.onFilterChipClick = gFiltersVm.onFilterChipClick

			scope.filterSettingsChange = function () {
				scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)

				scope.evDataService.resetTableContent(true)

				scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
			}

			scope.toggleUseFromAboveFilters = function () {
				scope.showUseFromAboveFilters = !scope.showUseFromAboveFilters
				scope.evEventService.dispatchEvent(
					evEvents.TOGGLE_SHOW_FROM_ABOVE_FILTERS
				)
				formatFiltersForChips()

				setTimeout(() => {
					const filterAreaHeightChanged = gFiltersVm.updateFilterAreaHeight()

					if (filterAreaHeightChanged) {
						scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)
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



				filters.forEach((filter) => {
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

							let chipText = gFiltersVm.getChipTextElem(
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
									gFiltersVm.checkCustomFieldFilterForError(
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

				if (errors.length) gFiltersVm.updateMissingCustomFieldsList(errors)

				gFiltersVm.updateFilterAreaHeight()
			}

			scope.onChipsFirstRender = gFiltersVm.onChipsFirstRender

			scope.addFilter = function ($event) {
				gFiltersVm.openAddFilterDialog($event, filters).then((res) => {
					if (res.status === 'agree') {
						for (var i = 0; i < res.data.items.length; i = i + 1) {
							filters.push(res.data.items[i])
						}

						scope.evDataService.setFilters(filters)
						scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)

						scope.$apply()
					}
				})
			}

			scope.removeFilter = function (filtersToRemove) {
				filters = filters.filter((filter) => {
					return filtersToRemove.find((item) => item.id !== filter.key)
				})

				scope.evDataService.setFilters(filters)

				scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)
				scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
			}
			//endregion

			scope.toggleSplitPanel = gFiltersVm.toggleSplitPanel

			scope.toggleMatrix = function ($event) {
				var viewType = scope.evDataService.getViewType()
				var newViewType

				if (viewType === 'matrix') {
					newViewType = 'report_viewer'
				} else {
					newViewType = 'matrix'
				}

				if (newViewType === 'matrix') {
					var settings = scope.evDataService.getViewSettings(newViewType)

					$mdDialog
						.show({
							controller: 'ReportViewerMatrixSettingsDialogController as vm',
							templateUrl:
								'views/dialogs/report-viewer-matrix-settings-dialog-view.html',
							parent: angular.element(document.body),
							clickOutsideToClose: false,
							targetEvent: $event,
							preserveScope: true,
							multiple: true,
							autoWrap: true,
							skipHide: true,
							locals: {
								data: {
									attributeDataService: scope.attributeDataService,
									evDataService: scope.evDataService,
									evEventService: scope.evEventService,
									settings: settings,
								},
							},
						})
						.then(function (res) {
							if (res.status === 'agree') {
								settings = res.data.settings

								scope.evDataService.setViewType(newViewType)
								scope.evDataService.setViewSettings(newViewType, settings)

								scope.evEventService.dispatchEvent(evEvents.VIEW_TYPE_CHANGED)
							}
						})
				} else {
					scope.evDataService.setViewType(newViewType)
					scope.evDataService.setViewSettings(newViewType, {})

					scope.evEventService.dispatchEvent(evEvents.VIEW_TYPE_CHANGED)
				}
			}

			scope.exportAsPdf = function ($event) {
				$mdDialog.show({
					controller: 'ExportPdfDialogController as vm',
					templateUrl: 'views/dialogs/export-pdf-dialog-view.html',
					parent: angular.element(document.body),
					targetEvent: $event,
					locals: {
						evDataService: scope.evDataService,
						evEventService: scope.evEventService,
						data: { entityType: scope.entityType },
					},
				})
			}

			scope.exportAsCSV = gFiltersVm.exportAsCSV
			scope.exportAsExcel = gFiltersVm.exportAsExcel
			scope.copyReport = gFiltersVm.copyReport
			scope.copySelectedToBuffer = gFiltersVm.copySelectedToBuffer

			scope.openViewConstructor = gFiltersVm.openViewConstructor

			scope.openCustomFieldsManager = function ($event) {
				$mdDialog.show({
					controller: 'CustomFieldDialogController as vm',
					templateUrl:
						'views/dialogs/custom-field/custom-field-dialog-view.html',
					parent: angular.element(document.body),
					targetEvent: $event,
					clickOutsideToClose: false,
					preserveScope: true,
					multiple: true,
					locals: {
						attributeDataService: scope.attributeDataService,
						entityViewerEventService: scope.evEventService,
						data: {
							entityType: gFiltersVm.entityType,
						},
					},
				})
			}

			scope.toggleAutoRefresh = function () {
				scope.rvAutoRefresh = !scope.rvAutoRefresh

				scope.evDataService.setAutoRefreshState(scope.rvAutoRefresh)
			}

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

						scope.$apply()
					})
			}

			scope.dispatchAddMenuAction = function ($event, item) {
				scope.evDataService.setUserRequestedAction(item.action)

				scope.evEventService.dispatchEvent(evEvents.USER_REQUEST_AN_ACTION)
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

						// getUseFromAboveFilters();
						useFromAboveFilters =
							gFiltersHelper.filterUseFromAboveFilters(filters)

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
					evEvents.ACTIVE_OBJECT_FROM_ABOVE_CHANGE,
					function () {
						if (useFromAboveFilters.length) {
							// UPDATE_TABLE or REQUEST_REPORT dispatched inside gFiltersHelper.insertActiveObjectDataIntoFilters()
							const filtersChangedFromAbove =
								gFiltersHelper.insertActiveObjectDataIntoFilters(
									scope.evDataService,
									scope.evEventService
								)
							if (filtersChangedFromAbove) formatFiltersForChips()
						}
					}
				)

				scope.evEventService.addEventListener(
					evEvents.CLEAR_USE_FROM_ABOVE_FILTERS,
					function () {
						if (useFromAboveFilters.length) {
							useFromAboveFilters.forEach((ufaFilter) => {
								filters[ufaFilter.filtersListIndex].options.filter_values = []
							})

							scope.evDataService.setFilters(filters)

							scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)

							scope.evDataService.resetTableContent(true)

							scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
						}
					}
				)

				scope.evEventService.addEventListener(
					evEvents.ADDITIONS_CHANGE,
					function () {
						scope.currentAdditions = scope.evDataService.getAdditions()
					}
				)

				scope.evEventService.addEventListener(
					evEvents.DATA_LOAD_END,
					function () {
						scope.reportOptions = scope.evDataService.getReportOptions() // for refresh tooltip -> auth time
					}
				)

				scope.evEventService.addEventListener(
					evEvents.FINISH_RENDER,
					function () {
						scope.renderTime = scope.evDataService.getRenderTime() // for refresh tooltip -> auth time
					}
				)
			}

			const init = function () {
				scope.currentAdditions = scope.evDataService.getAdditions()

				scope.popupEventService = gFiltersVm.popupEventService
				scope.chipsListEventService = gFiltersVm.chipsListEventService

				scope.popupData = gFiltersVm.popupData

				getAddMenuLayout()

				useFromAboveFilters = gFiltersHelper.filterUseFromAboveFilters(filters)
				formatFiltersForChips()

				scope.readyStatus.filters = true

				gFiltersVm.updateFilterAreaHeightOnInit()

				initEventListeners()
			}

			init()
		},
	}
}
