'use strict'
import QueuePromisesService from './queuePromisesService'

import evEvents from './entityViewerEvents'
import objectComparisonHelper from '../helpers/objectsComparisonHelper'
import metaHelper from '../helpers/meta.helper'
import utilsHelper from '../helpers/utils.helper'

import localStorageService from '@/angular/shell/scripts/app/services/localStorageService'

export default function (metaContentTypesService, uiService, reportHelper) {
	//region Autosave requests
	/**
	 * If there is actual default layout in cache, return it. Otherwise fetch layout from server.
	 *
	 * @param cachedLayoutResponse {*} - data about particular layout inside local storage
	 * @param fetchLayoutCallback {Function} - callback to fetch layout from server if default layout in local storage does not fit
	 * @param resolve - resolve function of parent promise
	 * @param reject - reject function of parent promise
	 */
	/* const resolveAutosaveListLayout = function (cachedLayoutResponse, fetchLayoutCallback, resolve, reject) {

        const cachedLayout = getCachedLayoutObj(cachedLayoutResponse);
        const onPingRejectCallback = getOnRejectCallback(fetchLayoutCallback, reject, cachedLayout);

        if (cachedLayout) {

            uiRepository.pingListLayoutByKey(cachedLayout.id).then(function (pingData) {

                if (pingData && pingData.is_default && isCachedLayoutActual(cachedLayout, pingData)) {
                    resolve(cachedLayoutResponse);

                } else {
                    fetchLayoutCallback();
                }

            }).catch(onPingRejectCallback);

        } else {
            fetchLayoutCallback();
        }

    }; */

	const updateUsingCachedLayout = function (cachedLayout, layout, entityType) {
		return new Promise(async function (resolve, reject) {
			try {
				// const pingData = await uiService.pingListLayoutByKey(cachedLayout.id);
				layout.id = cachedLayout.id
				layout.modified_at = cachedLayout.modified_at

				const options = {
					filters: {
						user_code: layout.user_code,
					},
				}

				const llData = await uiService.getListLayoutLight(entityType, options)

				if (
					llData.results.length &&
					!uiService.isCachedLayoutActual(cachedLayout, llData.results[0])
				) {
					layout.modified_at = llData.results[0].modified_at
				}

				uiService
					.updateListLayout(layout.id, layout)
					.then((updatedLayoutData) => {
						resolve(updatedLayoutData)
					})
			} catch (error) {
				reject(error)
			}
		})
	}

	const updateUsingUserCode = function (layout, entityType) {
		const options = {
			filters: {
				user_code: layout.user_code,
			},
		}

		return new Promise((resolve, reject) => {
			uiService
				.getListLayoutLight(entityType, options)
				.then(function (llData) {
					if (llData.results.length) {
						layout.id = llData.results[0].id
						layout.modified_at = llData.results[0].modified_at

						uiService
							.updateListLayout(layout.id, layout)
							.then(function (updatedLayoutData) {
								resolve(updatedLayoutData)
							})
							.catch((error) => reject(error))
					} else {
						resolve('Layout does not exist.')
					}
				})
				.catch((error) => reject(error))
		})
	}

	const updateAutosaveListLayout = function (cachedLayout, layout, entityType) {
		return new Promise((resolve, reject) => {
			if (cachedLayout) {
				// Error will occur if nonexistent autosave layout saved inside cache

				updateUsingCachedLayout(cachedLayout, layout, entityType)
					.then((updatedLayoutData) => {
						resolve(updatedLayoutData)
					})
					.catch((error) => reject(error))
			} else {
				updateUsingUserCode(layout, entityType)
					.then((updatedLayoutData) => {
						resolve(updatedLayoutData)
					})
					.catch((error) => reject(error))
			}
		})
	}

	const getAutosaveLayoutUserCode = function (contentType) {
		const formattedContentType = contentType.replace('.', '_')
		return 'system_autosave_' + formattedContentType
	}

	const autosaveListLayout = function (evDataService, isReport) {
		return new Promise((resolve, reject) => {
			let layout = evDataService.getLayoutCurrentConfiguration(isReport)

			layout = JSON.parse(JSON.stringify(layout))

			delete layout.id
			delete layout.modified_at

			layout.name = 'Autosave'

			layout.user_code = getAutosaveLayoutUserCode(layout.content_type)

			// In case of auto saving default layout
			layout.is_default = !!layout.is_systemic && layout.is_default
			layout.is_systemic = true

			const cachedLayout = localStorageService.getAutosaveLayout(
				layout.content_type
			)

			const entityType = metaContentTypesService.findEntityByContentType(
				layout.content_type
			)

			/*            setTimeout(function () {

                layout.modified_at = Date.now();

                evDataService.setListLayout(layout);
                evDataService.setActiveLayoutConfiguration({layoutConfig: layout});

                resolve({message: 'layout ready', layoutToSave: layout});
            }, 4000);*/
			updateAutosaveListLayout(cachedLayout, layout, entityType).then(function (
				updateData
			) {
				if (updateData === 'Layout does not exist.') {
					uiService
						.createListLayout(entityType, layout)
						.then(function (createdLayoutData) {
							// evDataService.setListLayout(createdLayoutData);
							// evDataService.setActiveLayoutConfiguration({layoutConfig: createdLayoutData});

							resolve(createdLayoutData)
						})
				} else {
					// evDataService.setListLayout(updateData);
					// evDataService.setActiveLayoutConfiguration({layoutConfig: updateData});

					resolve(updateData)
				}
			})
		})
	}

	/* const fetchAutosaveListLayout = function (contentType, resolve, reject) {

        const formattedContentType = contentType.replace('.', '_');
        const entityType = metaContentTypesService.findEntityByContentType(contentType);
        const autosaveLayoutUserCode = 'system_autosave_' + formattedContentType;

        const options = {
            filters: {
                user_code: autosaveLayoutUserCode
            }
        };

        return new Promise((resolve, reject) => {

            uiService.getListLayout(entityType, options).then(layoutsData => {

                if (layoutsData.result.length) {
                    resolve(layoutsData.result[0])
                }

            }).catch(error => reject(error));

        })

    };

    const getAutosaveListLayout = function (contentType) {

        return new Promise (function (resolve, reject) {

            // const contentType = metaContentTypesService.findContentTypeByEntity(entityType, 'ui');
            const cachedLayout = localStorageService.getDefaultLayout(contentType);

            if (cachedLayout) {

                uiService.pingListLayoutByKey(cachedLayout.id).then(function (pingData) {

                    if (pingData && isCachedLayoutActual(cachedLayout, pingData)) {
                        resolve(cachedLayout);

                    } else {
                        fetchAutosaveListLayout(contentType).then(layoutData => {
                            resolve(layoutData)

                        }).catch(error => reject(error));
                    }

                });

            } else {

                fetchAutosaveListLayout(contentType).then(layoutData => {
                    resolve(layoutData)

                }).catch(error => reject(error));

            }

        });

    };*/
	//endregion Autosave requests

	let changesTrackingEvents = {
		GROUPS_CHANGE: null,
		COLUMNS_CHANGE: null,
		COLUMN_SORT_CHANGE: null,
		RESIZE_COLUMNS_END: null,
		FILTERS_CHANGE: null,
		ADDITIONS_CHANGE: null,
		UPDATE_TABLE_VIEWPORT: null,
		TOGGLE_FILTER_AREA: null,
		REPORT_OPTIONS_CHANGE: null,
		REPORT_TABLE_VIEW_CHANGED: null,
		REPORT_EXPORT_OPTIONS_CHANGED: null,
		DATA_LOAD_END: null,
		ENTITY_VIEWER_PAGINATION_CHANGED: null,
		VIEW_TYPE_CHANGED: null,
	}

	const areObjTheSame = function (data1, data2) {
		if (typeof data1 === 'object' && typeof data2 === 'object') {
			return objectComparisonHelper.areObjectsTheSame(data1, data2)
		} else {
			if (data1 !== data2) {
				return false
			}

			return true
		}
	}

	const areReportOptionsTheSame = function (activeLayoutConfig, evDataService) {
		var originalReportOptions = metaHelper.recursiveDeepCopy(
			activeLayoutConfig.data.reportOptions
		)
		var originReportLayoutOptions = metaHelper.recursiveDeepCopy(
			activeLayoutConfig.data.reportLayoutOptions
		)

		if (
			originReportLayoutOptions.datepickerOptions.reportFirstDatepicker
				.datepickerMode !== 'datepicker'
		) {
			delete originalReportOptions.pl_first_date
			delete originalReportOptions.begin_date
		}

		if (
			originReportLayoutOptions.datepickerOptions.reportLastDatepicker
				.datepickerMode !== 'datepicker'
		) {
			delete originalReportOptions.report_date
			delete originalReportOptions.end_date
		}

		delete originalReportOptions.task_id
		delete originalReportOptions.recieved_at
		delete originalReportOptions.task_status

		var currentReportOptions = metaHelper.recursiveDeepCopy(
			evDataService.getReportOptions()
		)
		var currentReportLayoutOptions = metaHelper.recursiveDeepCopy(
			evDataService.getReportLayoutOptions()
		)

		var viewContext = evDataService.getViewContext()

		if (
			viewContext === 'split_panel' &&
			currentReportLayoutOptions.useDateFromAbove
		) {
			currentReportOptions =
				evDataService.applyStashedReportDates(currentReportOptions)
		}

		if (
			currentReportLayoutOptions.datepickerOptions.reportFirstDatepicker
				.datepickerMode !== 'datepicker'
		) {
			delete currentReportOptions.pl_first_date
			delete currentReportOptions.begin_date
		}

		if (
			currentReportLayoutOptions.datepickerOptions.reportLastDatepicker
				.datepickerMode !== 'datepicker'
		) {
			delete currentReportOptions.report_date
			delete currentReportOptions.end_date
		}

		delete currentReportOptions.task_id
		delete currentReportOptions.recieved_at
		delete currentReportOptions.task_status
		/* delete currentReportOptions.items;
        delete currentReportOptions.item_complex_transactions;
        delete currentReportOptions.item_counterparties;
        delete currentReportOptions.item_responsibles;
        delete currentReportOptions.item_strategies3;
        delete currentReportOptions.item_strategies2;
        delete currentReportOptions.item_strategies1;
        delete currentReportOptions.item_portfolios;
        delete currentReportOptions.item_instruments;
        delete currentReportOptions.item_instrument_pricings;
        delete currentReportOptions.item_instrument_accruals;
        delete currentReportOptions.item_currency_fx_rates;
        delete currentReportOptions.item_currencies;
        delete currentReportOptions.item_accounts; */
		currentReportOptions =
			reportHelper.cleanReportOptionsFromTmpProps(currentReportOptions)

		if (
			areObjTheSame(originalReportOptions, currentReportOptions) &&
			areObjTheSame(originReportLayoutOptions, currentReportLayoutOptions)
		) {
			return true
		} else {
			return false
		}
	}

	let autosaveTimeoutId

	/*const autosaveLayout = function (evDataService, promiseQueueService, isReport) {

        autosaveTimeoutId = setTimeout(function () {

            const autosavePromFn = function () {

                return new Promise((resolve, reject) => {

                    autosaveListLayout(evDataService, isReport).then(data => {
                        resolve(data);
                    }).catch(error => reject(error));

                })

            };

            promiseQueueService.enqueue(autosavePromFn);

        }, 5*1000);

    };*/
	let autosaveLayout

	const forceAutosaveLayout = function () {
		autosaveLayout()
	}

	const onLayoutChange = function (current, original) {
		// clearTimeout(autosaveTimeoutId);

		/*if (!areObjTheSame(current, original) && !autosaveTimeoutId) {

            autosaveTimeoutId = setTimeout(function () {

                autosaveLayout(evDataService, promiseQueueService, isReport);
                autosaveTimeoutId = null;

            }, 5*1000);

        }*/

		if (!areObjTheSame(current, original)) {
			autosaveLayout()
		}
	}

	const initListenersForAutosaveLayout = function (
		evDataService,
		evEventService,
		isReport
	) {
		let alQueueService = new QueuePromisesService()

		autosaveLayout = utilsHelper.throttle(function () {
			const autosavePromFn = function () {
				return new Promise((resolve, reject) => {
					autosaveListLayout(evDataService, isReport)
						.then((data) => {
							resolve(data)
						})
						.catch((error) => reject(error))
				})
			}

			alQueueService.enqueue(autosavePromFn)
		}, 5 * 1000)

		const groupsChangeEventIndex = evEventService.addEventListener(
			evEvents.GROUPS_CHANGE,
			function () {
				const activeLayoutConfig = evDataService.getActiveLayoutConfiguration()
				const originalGroups = activeLayoutConfig.data.grouping
				const currentGroups = evDataService.getGroups()

				/*if (!areObjTheSame(currentGroups, originalGroups)) {
                autosaveLayout(evDataService, isReport);
            }*/
				onLayoutChange(
					currentGroups,
					originalGroups,
					evDataService,
					alQueueService,
					isReport
				)
			}
		)

		const columnsChangeEventIndex = evEventService.addEventListener(
			evEvents.COLUMNS_CHANGE,
			function () {
				const activeLayoutConfig = evDataService.getActiveLayoutConfiguration()
				const originalColumns = activeLayoutConfig.data.columns
				const currentColumns = evDataService.getColumns()

				/*if (!areObjTheSame(currentColumns, originalColumns)) {
                autosaveLayout(evDataService, isReport);
            }*/
				onLayoutChange(
					originalColumns,
					currentColumns,
					evDataService,
					alQueueService,
					isReport
				)
			}
		)

		const columnsSortChangeEventIndex = evEventService.addEventListener(
			evEvents.COLUMN_SORT_CHANGE,
			function () {
				const activeLayoutConfig = evDataService.getActiveLayoutConfiguration()
				var originalColumns = activeLayoutConfig.data.columns
				var currentColumns = evDataService.getColumns()

				/*if (!areObjTheSame(currentColumns, originalColumns)) {
                autosaveLayout(evDataService, isReport);
            }*/
				onLayoutChange(
					originalColumns,
					currentColumns,
					evDataService,
					alQueueService,
					isReport
				)
			}
		)

		const rceEventIndex = evEventService.addEventListener(
			evEvents.RESIZE_COLUMNS_END,
			function () {
				const activeLayoutConfig = evDataService.getActiveLayoutConfiguration()
				const originalColumns = activeLayoutConfig.data.columns
				const currentColumns = evDataService.getColumns()

				/*if (!areObjTheSame(currentColumns, originalColumns)) {
                autosaveLayout(evDataService, isReport);
            }*/
				onLayoutChange(
					originalColumns,
					currentColumns,
					evDataService,
					alQueueService,
					isReport
				)
			}
		)

		const filtersChangeEventIndex = evEventService.addEventListener(
			evEvents.FILTERS_CHANGE,
			function () {
				const activeLayoutConfig = evDataService.getActiveLayoutConfiguration()
				const originalFilters = activeLayoutConfig.data.filters
				const currentFilters = evDataService.getFilters()

				/* if (!areObjTheSame(currentFilters, originalFilters)) {
                autosaveLayout(evDataService, isReport);
            } */
				onLayoutChange(
					originalFilters,
					currentFilters,
					evDataService,
					alQueueService,
					isReport
				)
			}
		)

		const additionsChangeEventIndex = evEventService.addEventListener(
			evEvents.ADDITIONS_CHANGE,
			function () {
				const activeLayoutConfig = evDataService.getActiveLayoutConfiguration()
				const originAdditions = activeLayoutConfig.data.additions
				const currentAdditions = evDataService.getAdditions()

				/* if (!areObjTheSame(originAdditions, currentAdditions)) {
                autosaveLayout(evDataService, isReport);
            } */
				onLayoutChange(
					originAdditions,
					currentAdditions,
					evDataService,
					alQueueService,
					isReport
				)
			}
		)

		const onUpdateTableViewport = utilsHelper.debounce(function () {
			const activeLayoutConfig = evDataService.getActiveLayoutConfiguration()
			const originInterfaceLayout = activeLayoutConfig.data.interfaceLayout
			const currentInterfaceLayout = evDataService.getInterfaceLayoutToSave()

			onLayoutChange(
				originInterfaceLayout,
				currentInterfaceLayout,
				evDataService,
				alQueueService,
				isReport
			)
		}, 500)

		const utvEventIndex = evEventService.addEventListener(
			evEvents.UPDATE_TABLE_VIEWPORT,
			onUpdateTableViewport
		)

		const tfaEventIndex = evEventService.addEventListener(
			evEvents.TOGGLE_FILTER_AREA,
			function () {
				const activeLayoutConfig = evDataService.getActiveLayoutConfiguration()
				const originInterfaceLayout = activeLayoutConfig.data.interfaceLayout
				const currentInterfaceLayout = evDataService.getInterfaceLayoutToSave()

				/* if (!areObjTheSame(originInterfaceLayout, currentInterfaceLayout)) {
                autosaveLayout(evDataService, isReport);
            } */
				onLayoutChange(
					originInterfaceLayout,
					currentInterfaceLayout,
					evDataService,
					alQueueService,
					isReport
				)
			}
		)

		const evpcEventIndex = evEventService.addEventListener(
			evEvents.ENTITY_VIEWER_PAGINATION_CHANGED,
			function () {
				clearTimeout(autosaveTimeoutId)
				autosaveLayout(evDataService, isReport)
			}
		)

		let roChangeEventIndex,
			rtvChangedEventIndex,
			reoChangeEventIndex,
			viewTypeChangedEI,
			evSettingsIndex

		if (isReport) {
			roChangeEventIndex = evEventService.addEventListener(
				evEvents.REPORT_OPTIONS_CHANGE,
				function () {
					const activeLayoutConfig =
						evDataService.getActiveLayoutConfiguration()

					if (!areReportOptionsTheSame(activeLayoutConfig, evDataService)) {
						clearTimeout(autosaveTimeoutId)
						autosaveLayout(evDataService, isReport)
					}
				}
			)

			rtvChangedEventIndex = evEventService.addEventListener(
				evEvents.REPORT_TABLE_VIEW_CHANGED,
				function () {
					const activeLayoutConfig =
						evDataService.getActiveLayoutConfiguration()

					const originalColumns = activeLayoutConfig.data.columns
					const currentColumns = evDataService.getColumns()

					const originalRootGroupOptions =
						activeLayoutConfig.data.rootGroupOptions
					const currentRootGroupOptions = evDataService.getRootGroupOptions()

					const originalGroups = activeLayoutConfig.data.grouping
					const currentGroups = evDataService.getGroups()

					if (
						!areObjTheSame(originalColumns, currentColumns) ||
						!areObjTheSame(originalGroups, currentGroups) ||
						!areObjTheSame(originalRootGroupOptions, currentRootGroupOptions) ||
						!areReportOptionsTheSame(activeLayoutConfig, evDataService)
					) {
						clearTimeout(autosaveTimeoutId)
						autosaveLayout(evDataService, isReport)
					}
				}
			)

			reoChangeEventIndex = evEventService.addEventListener(
				evEvents.REPORT_EXPORT_OPTIONS_CHANGED,
				function () {
					const activeLayoutConfig =
						evDataService.getActiveLayoutConfiguration()
					const originalReportExportOptions = activeLayoutConfig.data.export
					const currentReportExportOptions = evDataService.getExportOptions()

					onLayoutChange(
						originalReportExportOptions,
						currentReportExportOptions,
						evDataService,
						alQueueService,
						isReport
					)
				}
			)

			viewTypeChangedEI = evEventService.addEventListener(
				evEvents.VIEW_TYPE_CHANGED,
				function () {
					const activeLayoutConfig =
						evDataService.getActiveLayoutConfiguration()

					const originalViewType = activeLayoutConfig.data.viewType
					const originalViewSettings = activeLayoutConfig.data.viewSettings

					const currentViewType = evDataService.getViewType()
					let currentViewSettings = null

					if (originalViewType === currentViewType) {
						if (currentViewType) {
							currentViewSettings =
								evDataService.getViewSettings(currentViewType)
						}

						/*if (!areObjTheSame(originalViewSettings, currentViewSettings)) {
                        autosaveLayout(evDataService, isReport);
                    }*/
						onLayoutChange(
							originalViewSettings,
							currentViewSettings,
							evDataService,
							alQueueService,
							isReport
						)
					} else {
						clearTimeout(autosaveTimeoutId)
						autosaveLayout(evDataService, isReport)
					}
				}
			)
		} else {
			evSettingsIndex = evEventService.addEventListener(
				evEvents.ENTITY_VIEWER_SETTINGS_CHANGED,
				function () {
					const activeLayoutConfig =
						evDataService.getActiveLayoutConfiguration()
					const originalEvSettings = activeLayoutConfig.data.ev_options
					const evSettings = evDataService.getEntityViewerOptions()

					/*if (!areObjTheSame(originalEvSettings, evSettings)) {
                    autosaveLayout(evDataService, isReport);
                }*/
					onLayoutChange(
						originalEvSettings,
						evSettings,
						evDataService,
						alQueueService,
						isReport
					)
				}
			)
		}

		changesTrackingEvents.GROUPS_CHANGE = groupsChangeEventIndex
		changesTrackingEvents.COLUMNS_CHANGE = columnsChangeEventIndex
		changesTrackingEvents.COLUMN_SORT_CHANGE = columnsSortChangeEventIndex
		changesTrackingEvents.RESIZE_COLUMNS_END = rceEventIndex
		changesTrackingEvents.FILTERS_CHANGE = filtersChangeEventIndex
		changesTrackingEvents.ADDITIONS_CHANGE = additionsChangeEventIndex
		changesTrackingEvents.UPDATE_TABLE_VIEWPORT = utvEventIndex
		changesTrackingEvents.TOGGLE_FILTER_AREA = tfaEventIndex
		changesTrackingEvents.REPORT_OPTIONS_CHANGE = roChangeEventIndex
		changesTrackingEvents.REPORT_TABLE_VIEW_CHANGED = rtvChangedEventIndex
		// Report viewer specific tracking
		changesTrackingEvents.REPORT_EXPORT_OPTIONS_CHANGED = reoChangeEventIndex
		// changesTrackingEvents.DATA_LOAD_END = dleEventIndex;
		changesTrackingEvents.ENTITY_VIEWER_PAGINATION_CHANGED = evpcEventIndex
		changesTrackingEvents.VIEW_TYPE_CHANGED = viewTypeChangedEI
		// Entity viewer specific tracking
		changesTrackingEvents.ENTITY_VIEWER_SETTINGS_CHANGED = evSettingsIndex
	}

	const removeChangesTrackingEventListeners = function (evEventService) {
		var trackingEventsListenerNames = Object.keys(changesTrackingEvents)

		for (var i = 0; i < trackingEventsListenerNames.length; i++) {
			var telName = trackingEventsListenerNames[i]

			if (
				changesTrackingEvents[telName] ||
				changesTrackingEvents[telName] === 0
			) {
				// execute only if event listener has been added
				evEventService.removeEventListener(
					telName,
					changesTrackingEvents[telName]
				)
				changesTrackingEvents[telName] = null
			}
		}
	}

	return {
		getAutosaveLayoutUserCode: getAutosaveLayoutUserCode,
		forceAutosaveLayout: forceAutosaveLayout,

		initListenersForAutosaveLayout: initListenersForAutosaveLayout,
		removeChangesTrackingEventListeners: removeChangesTrackingEventListeners,
	}
}
