import evEvents from '../entityViewerEvents'
import groupsService from './groups.service'
import objectsService from './objects.service'
import evDataHelper from '../../helpers/ev-data.helper'
import evRvCommonHelper from '../../helpers/ev-rv-common.helper'
import rvDataHelper from '../../helpers/rv-data.helper'
import queryParamsHelper from '../../helpers/queryParamsHelper'

export default function (
	entityResolverService,
	pricesCheckerService,
	reportHelper
) {
	var requestData = function (evDataService) {
		return new Promise(function (resolve, reject) {
			var entityType = evDataService.getEntityType()
			var reportOptions = evDataService.getReportOptions()

			// console.log('requestData.entityType', entityType);
			// console.log('requestData.reportOptions', reportOptions);

			entityResolverService
				.getList(entityType, reportOptions)
				.then(function (data) {
					// console.log('requestData.data', data);

					if (!data.hasOwnProperty('non_field_errors')) {
						var reportOptions = evDataService.getReportOptions()

						reportOptions = Object.assign({}, reportOptions, data)

						evDataService.setReportOptions(reportOptions)

						if (
							data.hasOwnProperty('task_status') &&
							data.task_status !== 'SUCCESS'
						) {
							setTimeout(function () {
								resolve(requestData(evDataService))
							}, 500)
						} else {
							resolve(data)
						}
					}
				})
				.catch(function (reason) {
					// console.log('here?');
				})
		})
	}

	var injectRegularFilters = function (
		requestParameters,
		entityViewerDataService,
		entityViewerEventService
	) {
		// console.log('injectRegularFilters.requestParameters', requestParameters);

		var newRequestParametersBody = Object.assign({}, requestParameters.body)
		newRequestParametersBody['filter_settings'] = []

		var filters = entityViewerDataService.getFilters()

		/* var isFilterValid = function (filterItem) {

            if (filterItem.options && filterItem.options.enabled) { // if filter is enabled

                var filterType = filterItem.options.filter_type;

                if (filterType === 'empty' ||
                    filterItem.options.exclude_empty_cells) { // if filter works for empty cells

                    return true;

                } else if (filterItem.options.filter_values) { // if filter values can be used for filtering (not empty)

                    var filterValues = filterItem.options.filter_values;

                    if (filterType === 'from_to' || filterType === 'out_of_range') {

                        if ((filterValues.min_value || filterValues.min_value === 0) &&
                            (filterValues.max_value || filterValues.max_value === 0)) {
                            return true;
                        }

                    } else if (Array.isArray(filterValues)) {

                        if (filterValues[0] || filterValues[0] === 0) {
                            return true;
                        }

                    }
                }

            }

            return false;
        }; */

		filters.forEach(function (item) {
			if (evRvCommonHelper.isFilterValid(item)) {
				var key = queryParamsHelper.entityPluralToSingular(item.key)

				var filterSettings = {
					key: key,
					filter_type: item.options.filter_type,
					exclude_empty_cells: item.options.exclude_empty_cells,
					value_type: item.value_type,
					value: item.options.filter_values,
				}

				newRequestParametersBody['filter_settings'].push(filterSettings)
			}
		})

		requestParameters.body = newRequestParametersBody

		entityViewerDataService.setRequestParameters(requestParameters)
	}

	var requestReport = function (
		entityViewerDataService,
		entityViewerEventService
	) {
		entityViewerEventService.dispatchEvent(evEvents.DATA_LOAD_START)

		var entityType = entityViewerDataService.getEntityType()
		var reportOptions = entityViewerDataService.getReportOptions()

		//# region Delete report options items">
		/* delete reportOptions.items;
        delete reportOptions.custom_fields;
        delete reportOptions.custom_fields_object;
        delete reportOptions.item_complex_transactions;
        delete reportOptions.item_counterparties;
        delete reportOptions.item_responsibles;
        delete reportOptions.item_strategies3;
        delete reportOptions.item_strategies2;
        delete reportOptions.item_strategies1;
        delete reportOptions.item_portfolios;
        delete reportOptions.item_instruments;
        delete reportOptions.item_instrument_pricings;
        delete reportOptions.item_instrument_accruals;
        delete reportOptions.item_currency_fx_rates;
        delete reportOptions.item_currencies;
        delete reportOptions.item_accounts; */
		reportOptions = reportHelper.cleanReportOptionsFromTmpProps(reportOptions)
		reportOptions.filters = entityViewerDataService.getFilters() // for transaction report only
		//# endregion

		reportOptions.task_id = null

		if (entityType === 'pl-report') {
			reportOptions.date_field = 'accounting_date'
		}

		entityViewerDataService.setReportOptions(reportOptions)

		// console.log('requestReport started');

		entityViewerDataService.setStatusData('loading')

		requestData(entityViewerDataService, entityViewerEventService).then(
			function (data) {
				var reportOptions = entityViewerDataService.getReportOptions()
				var entityType = entityViewerDataService.getEntityType()

				reportOptions = Object.assign({}, reportOptions)

				reportOptions.recieved_at = new Date().getTime()

				console.log('reportOptions', reportOptions)

				if (reportOptions.items && reportOptions.items.length) {
					var attributeExtensions =
						entityViewerDataService.getCrossEntityAttributeExtensions()

					reportOptions.items = reportHelper.injectIntoItemsV2(
						reportOptions.items,
						reportOptions,
						entityType
					)

					// reportOptions.items = reportHelper.injectIntoItems(reportOptions.items, reportOptions, entityType);
					// reportOptions.items = reportHelper.injectIntoItems(reportOptions.items, reportOptions);
					// reportOptions.items = reportHelper.convertItemsToFlat(reportOptions.items);
					reportOptions.items = reportHelper.extendAttributes(
						reportOptions.items,
						attributeExtensions
					)

					// Report options.items - origin table without filtering and grouping. Save to entityViewerDataService.
					reportOptions.items =
						reportHelper.calculateMarketValueAndExposurePercents(
							reportOptions.items,
							reportOptions
						)

					entityViewerDataService.setUnfilteredFlatList(reportOptions.items)
				}

				entityViewerDataService.setReportOptions(reportOptions)

				entityViewerDataService.setStatusData('loaded')

				createDataStructure(entityViewerDataService, entityViewerEventService)
			}
		)

		// Price checker below

		if (entityType !== 'transaction-report') {
			pricesCheckerService.check(reportOptions).then(function (data) {
				data.items = data.items.map(function (item) {
					if (
						item.type === 'missing_principal_pricing_history' ||
						item.type === 'missing_accrued_pricing_history'
					) {
						data.item_instruments.forEach(function (instrument) {
							if (item.id === instrument.id) {
								item.instrument_object = instrument
							}
						})
					}

					if (
						item.type === 'fixed_calc' ||
						item.type === 'stl_cur_fx' ||
						item.type === 'missing_instrument_currency_fx_rate'
					) {
						data.item_currencies.forEach(function (currency) {
							if (item.transaction_currency_id === currency.id) {
								item.currency_object = currency
							}

							if (item.id === currency.id) {
								item.currency_object = currency
							}
						})
					}

					return item
				})

				entityViewerDataService.setMissingPrices(data)

				entityViewerEventService.dispatchEvent(evEvents.MISSING_PRICES_LOAD_END)
			})
		}
	}

	var getObjects = function (
		requestParameters,
		entityViewerDataService,
		entityViewerEventService
	) {
		requestParameters.status = 'loading'

		entityViewerDataService.setRequestParameters(requestParameters)

		return new Promise(function (resolve, reject) {
			var entityType = entityViewerDataService.getEntityType()

			var options = requestParameters.body
			var event = requestParameters.event

			var page = parseInt(options.page.toString(), 10) - 1
			var step = 10000 // TODO fix pagination problem in future
			var i

			objectsService
				.getList(entityType, options, entityViewerDataService)
				.then(function (data) {
					var groupData = entityViewerDataService.getData(event.___id)

					var obj

					if (!event.___id) {
						var rootGroupData = entityViewerDataService.getRootGroupData()

						obj = Object.assign({}, rootGroupData)

						obj.count = data.count
						obj.next = data.next
						obj.previous = data.previous
						obj.results = data.results

						// for (i = 0; i < step; i = i + 1) {
						//     if (page * step + i < obj.count) {
						//         obj.results[page * step + i] = data.results[i];
						//     }
						// }
					} else {
						if (groupData) {
							obj = Object.assign({}, groupData)

							obj.___group_name = groupData.___group_name
								? groupData.___group_name
								: '-'
							obj.___group_identifier = groupData.___group_identifier
								? groupData.___group_identifier
								: '-'

							obj.count = data.count
							obj.next = data.next
							obj.previous = data.previous
							obj.results = data.results
							// for (i = 0; i < step; i = i + 1) {
							//     if (page * step + i < obj.count) {
							//         obj.results[page * step + i] = data.results[i];
							//     }
							// }
						} else {
							var parentGroup = entityViewerDataService.getData(
								event.parentGroupId
							)

							obj = Object.assign({}, data)

							obj.___group_name = event.groupName ? event.groupName : '-'
							obj.___group_identifier = event.groupId ? event.groupId : '-'

							obj.___is_open = true
							// obj.___is_activated = evDataHelper.isGroupSelected(event.___id, event.parentGroupId, entityViewerDataService);

							obj.___parentId = event.parentGroupId
							obj.___type = 'group'
							obj.___id = event.___id
							obj.___level = evRvCommonHelper.getParents(
								event.parentGroupId,
								entityViewerDataService
							).length

							var groupSettings = rvDataHelper.getOrCreateGroupSettings(
								entityViewerDataService,
								obj
							)

							console.log(
								'groupSettings.getObjects',
								JSON.parse(JSON.stringify(groupSettings))
							)

							if (groupSettings.hasOwnProperty('is_open')) {
								obj.___is_open = groupSettings.is_open
							}

							if (!parentGroup.___is_open) {
								obj.___is_open = false
								groupSettings.is_open = false

								rvDataHelper.setGroupSettings(
									entityViewerDataService,
									obj,
									groupSettings
								)
							}
						}
					}

					obj.results = obj.results.map(function (item, index) {
						item.___group_name = item.___group_name ? item.___group_name : '-'
						item.___group_identifier = item.___group_identifier
							? item.___group_identifier
							: '-'

						// item.___is_activated = evDataHelper.isSelected(entityViewerDataService);

						item.___parentId = obj.___id
						item.___type = 'object'
						item.___index = index
						item.___level = obj.___level + 1

						//# region Create an ___id
						item.___id = evRvCommonHelper.getId(item)

						var duplicateObj

						try {
							duplicateObj = entityViewerDataService.getObject(
								item.___id,
								item.___parentId
							) // returns an error if a matching object is not found
						} catch (e) {}

						if (duplicateObj) {
							console.log(
								'Error: duplicate ___id was created for an object: ',
								item
							)
							var customError = new Error(
								'Object with an ___id ' + item.___id + ' already exist'
							)
							customError.___item_data = item

							throw customError
						}
						//# endregion

						return item
					})

					entityViewerDataService.setData(obj)

					requestParameters.status = 'loaded'

					entityViewerDataService.setRequestParameters(requestParameters)

					resolve(obj)
				})
		})
	}

	var getGroups = function (
		requestParameters,
		entityViewerDataService,
		entityViewerEventService
	) {
		requestParameters.status = 'loading'

		// var groupTypes = entityViewerDataService.getGroups();
		var matchingGTypeIndex = requestParameters.body.groups_types.length - 1
		var groupType = requestParameters.body.groups_types[matchingGTypeIndex]

		if (groupType.options.sort) {
			requestParameters.body.groups_order =
				groupType.options.sort.toLocaleLowerCase()
			requestParameters.body.ordering_mode =
				groupType.options.sort_settings.mode
		}

		entityViewerDataService.setRequestParameters(requestParameters)

		return new Promise(function (resolve, reject) {
			var entityType = entityViewerDataService.getEntityType()

			var options = requestParameters.body
			var event = requestParameters.event

			var page = Number(options.page) - 1
			// var pagination = entityViewerDataService.getPagination();
			var step = 10000 // TODO fix pagination problem in future
			var i

			groupsService
				.getList(entityType, options, entityViewerDataService)
				.then(function (data) {
					var obj = {}

					if (!event.___id) {
						var rootGroupData = entityViewerDataService.getRootGroupData()

						obj = Object.assign({}, rootGroupData)

						obj.count = data.count
						obj.next = data.next
						obj.previous = data.previous
						for (i = 0; i < step; i = i + 1) {
							if (page * step + i < obj.count) {
								obj.results[page * step + i] = data.results[i]
							}
						}
					} else {
						var groupData = entityViewerDataService.getData(event.___id)

						if (groupData) {
							obj = Object.assign({}, groupData)

							obj.___group_name = groupData.___group_name
								? groupData.___group_name
								: '-'
							obj.___group_identifier = groupData.___group_identifier
								? groupData.___group_identifier
								: '-'

							obj.count = data.count
							obj.next = data.next
							obj.previous = data.previous

							for (i = 0; i < step; i = i + 1) {
								if (page * step + i < obj.count) {
									obj.results[page * step + i] = data.results[i]
								}
							}
						} else {
							var parentGroup = entityViewerDataService.getData(
								event.parentGroupId
							)

							obj = Object.assign({}, data)
							obj.___group_name = event.groupName ? event.groupName : '-'
							obj.___group_identifier = event.groupId ? event.groupId : '-'
							obj.___is_open = true

							// obj.___is_activated = evDataHelper.isGroupSelected(event.___id, event.parentGroupId, entityViewerDataService);

							obj.___parentId = event.parentGroupId
							obj.___type = 'group'
							obj.___id = event.___id
							obj.___level = evRvCommonHelper.getParents(
								event.parentGroupId,
								entityViewerDataService
							).length

							var groupSettings = rvDataHelper.getOrCreateGroupSettings(
								entityViewerDataService,
								obj
							)

							if (groupSettings.hasOwnProperty('is_open')) {
								obj.___is_open = groupSettings.is_open
							}

							if (!parentGroup.___is_open) {
								obj.___is_open = false
								groupSettings.is_open = false

								rvDataHelper.setGroupSettings(
									entityViewerDataService,
									obj,
									groupSettings
								)
							}
						}
					}

					var groups = entityViewerDataService.getGroups()
					var parents = []

					if (obj.___parentId !== null) {
						parents = evRvCommonHelper.getParents(
							obj.___parentId,
							entityViewerDataService
						)
					}

					parents.push(obj)
					// generate data for group's children
					obj.results = obj.results.map(function (item, index) {
						item.___parentId = obj.___id
						item.___group_name = item.___group_name ? item.___group_name : '-'
						item.___group_identifier = item.___group_identifier
							? item.___group_identifier
							: '-'

						// item.___is_activated = evDataHelper.isSelected(entityViewerDataService);

						item.___level = obj.___level + 1
						item.___index = index

						if (groups.length >= parents.length) {
							item.___type = 'group'
						} else {
							item.___type = 'object'
						}

						item.___id = evRvCommonHelper.getId(item)

						return item
					})

					entityViewerDataService.setData(obj)

					requestParameters.status = 'loaded'

					entityViewerDataService.setRequestParameters(requestParameters)

					resolve(obj)
				})
		})
	}

	var getObjectsByRequestParameters = function (
		requestParameters,
		entityViewerDataService,
		entityViewerEventService
	) {
		return getObjects(
			requestParameters,
			entityViewerDataService,
			entityViewerEventService
		)
	}

	var getGroupsByRequestParameters = function (
		requestParameters,
		entityViewerDataService,
		entityViewerEventService
	) {
		return getGroups(
			requestParameters,
			entityViewerDataService,
			entityViewerEventService
		)
	}

	var createRequestParameters = function (
		item,
		level,
		evDataService,
		evEventService
	) {
		// console.log('createRequestParameters.item', item);

		var groups = evDataService.getGroups()

		var requestParameters

		var id = evRvCommonHelper.getId(item)
		console.log(
			'teseting1224.createRequestParameters createdIdsList.length',
			createdIdsList.length
		)
		if (createdIdsList.includes(id)) {
			console.log(
				'teseting1224.createRequestParameters duplicate id Error',
				testObj[id]
			)
			console.log('Error: duplicated id was created for an item: ', item)
			var customError = new Error(
				'Item with an ___id ' + item.___id + ' already exist'
			)
			customError.___item_data = item

			throw customError
		}

		createdIdsList.push(id)

		var groups_types = evDataHelper.getGroupsTypesToLevel(
			level + 1,
			evDataService
		)
		var groups_values = evDataHelper.getGroupsValuesByItem(item, evDataService)

		groups_values.push(item.___group_identifier)

		if (groups.length && level + 1 < groups.length) {
			requestParameters = {
				requestType: 'groups',
				id: id,
				groups_level: level + 1, // 0 is for root
				event: {
					___id: id,
					groupName: item.___group_name,
					groupId: item.___group_identifier ? item.___group_identifier : '-',
					parentGroupId: item.___parentId,
				},
				body: {
					groups_types: groups_types,
					page: 1,
					groups_values: groups_values,
					groups_order: 'asc',
				},
			}
		} else {
			requestParameters = {
				requestType: 'objects',
				id: id,
				groups_level: level + 1, // 0 is for root
				event: {
					___id: id,
					groupName: item.___group_name,
					groupId: item.___group_identifier ? item.___group_identifier : '-',
					parentGroupId: item.___parentId,
				},
				body: {
					groups_types: groups_types,
					page: 1,
					groups_values: groups_values,
					groups_order: 'asc',
				},
			}
		}

		testObj[id] = {
			requestParameters: requestParameters,
			item: item,
		}

		evDataService.setRequestParameters(requestParameters)

		return requestParameters
	}

	/**
	 * @function
	 * Calls method updateDataStructureByRequestParameters for groups, its children and objects
	 * @see updateDataStructureByRequestParameters
	 *
	 * @param {string} parentId - if of parent of items
	 * @param { [Object] } items - groups or objects to format and add inside data
	 * @param {number} level - group level of items
	 * @param {Object} evDataService
	 * @param {Object} evEventService
	 * @returns {Promise<[]>} - returns arrays of nested promises for called methods updateDataStructureByRequestParameters
	 */
	var recursiveRequest = function (
		parentId,
		items,
		level,
		evDataService,
		evEventService
	) {
		return new Promise(function RecursiveRequestPromise(resolve, reject) {
			var promises = []
			var requestParameters

			items.forEach(function (item) {
				requestParameters = createRequestParameters(
					item,
					level,
					evDataService,
					evEventService
				)
				promises.push(
					updateDataStructureByRequestParameters(
						requestParameters,
						evDataService,
						evEventService
					)
				)
			})

			Promise.all(promises).then(function (data) {
				var groups = evDataService.getGroups()

				level = level + 1

				if (level < groups.length) {
					// console.log('to next level!', level);

					items = evDataHelper
						.getGroupsByLevel(level, evDataService)
						.filter((item) => item.___parentId === parentId)
					// console.log('recursiveRequest.items', items);

					var recursiveRequestPromises = []

					items.forEach(function (item) {
						// console.log('item!', item.___group_name);

						recursiveRequestPromises.push(
							recursiveRequest(
								item.___id,
								item.results,
								level,
								evDataService,
								evEventService
							)
						)
					})

					Promise.all(recursiveRequestPromises).then(function (data) {
						resolve(data)
					})
				} else {
					//

					resolve([])
				}
			})
		})
	}

	var initRecursiveRequestParametersCreation = function (
		evDataService,
		evEventService
	) {
		console.time('Creating Data Structure')

		var rootGroup = evDataService.getRootGroupData()
		var level = 0

		return recursiveRequest(
			rootGroup.___id,
			rootGroup.results,
			level,
			evDataService,
			evEventService
		).then(function () {
			console.timeEnd('Creating Data Structure')
		})
	}

	var createdIdsList = []
	var testObj = {}

	var createDataStructure = function (evDataService, evEventService) {
		// console.log('createDataStructure')

		evDataService.resetData()
		evDataService.resetRequestParameters()
		createdIdsList = []
		testObj = {}

		var defaultRootRequestParameters =
			evDataService.getActiveRequestParameters()
		var groupTypes = evDataService.getGroups()
		var activeColumnSort = evDataService.getActiveColumnSort()

		evEventService.dispatchEvent(evEvents.DATA_LOAD_START)

		if (groupTypes.length) {
			console.log('createDataStructure 1', defaultRootRequestParameters)

			// get children groups for the rootGroup
			getGroups(
				defaultRootRequestParameters,
				evDataService,
				evEventService
			).then(function () {
				/*
				 * Get children groups for every group level
				 *
				 * injectRegularFilters() will be called inside updateDataStructureByRequestParameters()
				 * that is inside recursiveRequest()
				 * that is inside initRecursiveRequestParametersCreation()
				 */
				initRecursiveRequestParametersCreation(
					evDataService,
					evEventService
				).then(function () {
					console.log('createDataStructure 2', defaultRootRequestParameters)

					// var activeGroupTypeSort = evDataService.getActiveGroupTypeSort();

					/*
                    if (sortByGroupType) {

                        sortGroupType(evDataService, evEventService, false).then(function () {

                            if (activeColumnSort) {
                                sortObjects(evDataService, evEventService);

                            } else {
                                evEventService.dispatchEvent(evEvents.DATA_LOAD_END);
                            }

                        });

                    }

                    if (activeColumnSort) {
                        sortObjects(evDataService, evEventService);
                    }

                    if (!sortByGroupType && !activeColumnSort) {
                        evEventService.dispatchEvent(evEvents.DATA_LOAD_END);
                    }
                    */
					if (activeColumnSort) {
						sortObjects(evDataService, evEventService)
					} else {
						evEventService.dispatchEvent(evEvents.DATA_LOAD_END)
					}
				})
			})
		} else {
			console.log('createDataStructure 3', defaultRootRequestParameters)

			injectRegularFilters(defaultRootRequestParameters, evDataService)

			getObjects(
				defaultRootRequestParameters,
				evDataService,
				evEventService
			).then(function () {
				console.log('createDataStructure 4', defaultRootRequestParameters)

				if (activeColumnSort) {
					sortObjects(evDataService, evEventService)
				} else {
					evEventService.dispatchEvent(evEvents.DATA_LOAD_END)
				}
			})
		}
	}

	/**
	 * @function
	 *
	 * @param requestParameters
	 * @param evDataService
	 * @param evEventService
	 * @returns {Promise<unknown>}
	 */
	var updateDataStructureByRequestParameters = function (
		requestParameters,
		evDataService,
		evEventService
	) {
		// console.log('updateDataStructureByRequestParameters.requestParameters', requestParameters);

		return new Promise(function (resolve, reject) {
			injectRegularFilters(requestParameters, evDataService, evEventService)

			// console.log('requestParameters.requestType', requestParameters.requestType);

			if (requestParameters.requestType === 'objects') {
				getObjectsByRequestParameters(
					requestParameters,
					evDataService,
					evEventService
				).then(function (data) {
					resolve(data)
				})
			}

			if (requestParameters.requestType === 'groups') {
				getGroupsByRequestParameters(
					requestParameters,
					evDataService,
					evEventService
				).then(function (data) {
					resolve(data)
				})
			}
		})
	}

	var updateDataStructure = function (evDataService, evEventService) {
		return new Promise(function (resolve, reject) {
			var requestParameters = evDataService.getActiveRequestParameters()

			injectRegularFilters(requestParameters, evDataService, evEventService)

			if (requestParameters.requestType === 'objects') {
				getObjectsByRequestParameters(
					requestParameters,
					evDataService,
					evEventService
				).then(function (data) {
					resolve(data)
				})
			}

			if (requestParameters.requestType === 'groups') {
				getGroupsByRequestParameters(
					requestParameters,
					evDataService,
					evEventService
				).then(function (data) {
					resolve(data)
				})
			}
		})
	}

	var sortObjects = function (
		entityViewerDataService,
		entityViewerEventService
	) {
		var activeColumnSort = entityViewerDataService.getActiveColumnSort()
		var level = entityViewerDataService.getGroups().length

		var levelGroups = evDataHelper.getGroupsByLevel(
			level,
			entityViewerDataService
		)
		var requestsParameters = entityViewerDataService.getAllRequestParameters()
		var levelRequestParameters = []

		Object.keys(requestsParameters).forEach(function (key) {
			levelGroups.forEach(function (group) {
				if (group.___id === requestsParameters[key].id) {
					//# region apply sorting settings
					requestsParameters[key].body.page = 1

					/*if (activeColumnSort.options.sort === 'ASC') {
                        requestsParameters[key].body.ordering = activeColumnSort.key
                    } else if (activeColumnSort.options.sort === 'DESC') {
                        requestsParameters[key].body.ordering = '-' + activeColumnSort.key
                    }*/
					requestsParameters[key].body.ordering = activeColumnSort.key
					requestsParameters[key].body.ordering_mode =
						activeColumnSort.options.sort_settings.mode

					entityViewerDataService.setRequestParameters(requestsParameters[key])
					//# endregion Apply sorting settings

					levelRequestParameters.push(requestsParameters[key])
				}
			})
		})

		levelGroups.forEach(function (group) {
			// delete current content of groups, before adding sorted one

			group.results = []

			entityViewerDataService.setData(group)
		})

		var promises = []

		levelRequestParameters.forEach(function (requestParameters) {
			// get sorted content
			promises.push(
				getObjects(
					requestParameters,
					entityViewerDataService,
					entityViewerEventService
				)
			)
		})

		Promise.all(promises).then(function () {
			entityViewerEventService.dispatchEvent(evEvents.DATA_LOAD_END)
		})
	}

	var sortGroupType = function (
		entityViewerDataService,
		entityViewerEventService,
		signalDataLoadEnd
	) {
		var activeGroupTypeSort = entityViewerDataService.getActiveGroupTypeSort()

		console.log('sortGroupType.activeGroupTypeSort', activeGroupTypeSort)

		var groupsTypes = entityViewerDataService.getGroups()

		// level of a parent used, because sorting applies to an array inside 'result' property of a parent
		var parentLevel = groupsTypes.findIndex(function (item) {
			return item.key === activeGroupTypeSort.key
		})

		if (parentLevel === -1) {
			parentLevel = 0
		}

		console.log('sortGroupType.parentLevel', parentLevel)

		var groups = evDataHelper.getGroupsByLevel(
			parentLevel,
			entityViewerDataService
		)

		var requestsParameters = entityViewerDataService.getAllRequestParameters()
		var requestParametersForUnfoldedGroups = []

		Object.keys(requestsParameters).forEach(function (key) {
			groups.forEach(function (group) {
				if (group.___id === requestsParameters[key].id) {
					requestParametersForUnfoldedGroups.push(requestsParameters[key])
				}
			})
		})

		groups.forEach(function (group) {
			group.results = []

			entityViewerDataService.setData(group)
		})

		var promises = []

		requestParametersForUnfoldedGroups.forEach(function (requestParameters) {
			promises.push(
				getGroups(
					requestParameters,
					entityViewerDataService,
					entityViewerEventService
				)
			)
		})

		return new Promise(function (resolve, reject) {
			Promise.all(promises)
				.then(function (data) {
					if (signalDataLoadEnd !== false) {
						entityViewerEventService.dispatchEvent(evEvents.DATA_LOAD_END)
					}

					resolve()
				})
				.catch(function (error) {
					reject(error)
				})
		})
	}

	return {
		createDataStructure: createDataStructure,
		requestReport: requestReport,
		updateDataStructure: updateDataStructure,
		sortObjects: sortObjects,
		sortGroupType: sortGroupType,
	}
}
