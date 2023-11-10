import evEvents from '../entityViewerEvents'
// import groupsService from './groups.service'
// import objectsService from './objects.service'
import evDataHelper from '../../helpers/ev-data.helper'
import evRvCommonHelper from '../../helpers/ev-rv-common.helper'
import rvDataHelper from '../../helpers/rv-data.helper'
import queryParamsHelper from '../../helpers/queryParamsHelper'

export default function (
	entityResolverService,
	pricesCheckerService,
	reportHelper,
	groupsService,
	objectsService,
) {
	var requestData = function (evDataService) {

		return new Promise(function (resolve, reject) {

			var entityType = evDataService.getEntityType();
			var reportOptions = evDataService.getReportOptions();

			// console.log('requestData.entityType', entityType);
			// console.log('requestData.reportOptions', reportOptions);

			entityResolverService.getList(entityType, reportOptions).then(function (data) {

				// console.log('requestData.data', data);

				// Checkout finmarsOngoingRequests
				// need to ensure that each copy of report will modify own data;
				data = JSON.parse(JSON.stringify(data))

				if (!data.hasOwnProperty('non_field_errors')) {

					var reportOptions = evDataService.getReportOptions();

					reportOptions = Object.assign({}, reportOptions, data);

					evDataService.setReportOptions(reportOptions);

					if (data.hasOwnProperty('task_status') && data.task_status !== 'SUCCESS') {

						setTimeout(function () {
							resolve(requestData(evDataService));
						}, 500)

					} else {

						resolve(data);

					}
				}

			}).catch(function (reason) {

				// console.log('here?');

			})
		})


	};

	var injectRegularFilters = function (requestParameters, entityViewerDataService, entityViewerEventService) {

		// console.log('injectRegularFilters.requestParameters', requestParameters);

		var newRequestParametersBody = Object.assign({}, requestParameters.body);
		newRequestParametersBody['filter_settings'] = [];

		var filters = entityViewerDataService.getFilters();

		filters.forEach(function (item) {

			if (evRvCommonHelper.isFilterValid(item)) {

				var key = queryParamsHelper.entityPluralToSingular(item.key);

				var filterSettings = {
					key: key,
					filter_type: item.options.filter_type,
					exclude_empty_cells: item.options.exclude_empty_cells,
					value_type: item.value_type,
					value: item.options.filter_values
				};

				newRequestParametersBody['filter_settings'].push(filterSettings);

			}

		});

		requestParameters.body = newRequestParametersBody;

		entityViewerDataService.setRequestParameters(requestParameters);

	};

	var requestReport = function (entityViewerDataService, entityViewerEventService) {

		entityViewerEventService.dispatchEvent(evEvents.DATA_LOAD_START);

		var entityType = entityViewerDataService.getEntityType();
		var reportOptions = entityViewerDataService.getReportOptions();

		reportOptions = reportHelper.cleanReportOptionsFromTmpProps(reportOptions);
		reportOptions.filters = entityViewerDataService.getFilters(); // for transaction report only

		reportOptions.task_id = null;

		if (entityType === 'pl-report') {
			reportOptions.date_field = 'accounting_date';
		}

		entityViewerDataService.setReportOptions(reportOptions);

		// console.log('requestReport started');

		entityViewerDataService.setStatusData('loading');

		requestData(entityViewerDataService, entityViewerEventService).then(function (data) {

			var reportOptions = entityViewerDataService.getReportOptions();
			var entityType = entityViewerDataService.getEntityType();

			reportOptions = Object.assign({}, reportOptions);

			reportOptions.recieved_at = new Date().getTime();

			console.log('reportOptions', reportOptions);

			if (reportOptions.items && reportOptions.items.length) {

				var attributeExtensions = entityViewerDataService.getCrossEntityAttributeExtensions();

				reportOptions.items = reportHelper.injectIntoItemsV2(reportOptions.items, reportOptions, entityType);
				reportOptions.items = reportHelper.extendAttributes(reportOptions.items, attributeExtensions);

				reportOptions.items = reportHelper.calculateMarketValueAndExposurePercents(reportOptions.items, reportOptions);

				entityViewerDataService.setUnfilteredFlatList(reportOptions.items);


			}

			entityViewerDataService.setReportOptions(reportOptions);

			entityViewerDataService.setStatusData('loaded');

			createDataStructure(entityViewerDataService, entityViewerEventService)

		});


		// Price checker below

		if (entityType !== 'transaction-report') {

			pricesCheckerService.check(reportOptions).then(function (data) {

				data.items = data.items.map(function (item) {

					if (item.type === 'missing_principal_pricing_history' || item.type === 'missing_accrued_pricing_history') {

						data.item_instruments.forEach(function (instrument) {

							if (item.id === instrument.id) {
								item.instrument_object = instrument;
							}

						})

					}


					if (item.type === 'fixed_calc' || item.type === 'stl_cur_fx' || item.type === 'missing_instrument_currency_fx_rate') {

						data.item_currencies.forEach(function (currency) {

							if (item.transaction_currency_id === currency.id) {
								item.currency_object = currency;
							}

							if (item.id === currency.id) {
								item.currency_object = currency;
							}

						})

					}

					return item

				});

				entityViewerDataService.setMissingPrices(data);

				entityViewerEventService.dispatchEvent(evEvents.MISSING_PRICES_LOAD_END)

			});

		}
	};


	var getObjects = function (requestParameters, entityViewerDataService, entityViewerEventService) {

		console.log('getObjects.requestParameters', requestParameters);

		requestParameters.status = 'loading';

		entityViewerDataService.setRequestParameters(requestParameters);

		return new Promise(function (resolve, reject) {

			var entityType = entityViewerDataService.getEntityType();

			var options = requestParameters.body;
			var event = requestParameters.event;

			var page = parseInt(options.page.toString(), 10) - 1;
			var step = 10000; // TODO fix pagination problem in future
			var i;


			objectsService.getList(options, entityViewerDataService).then(function (data) {

				var parentGroup = entityViewerDataService.getData(requestParameters.id);

				data.results.map(function (item, index) {

					item.___parentId = parentGroup.___id;
					item.___type = 'object';
					item.___index = index;
					item.___level = parentGroup.___level + 1;

					//# region Create an ___id
					item.___id = evRvCommonHelper.getId(item);

					var duplicateObj;

					try {
						// returns an error if a matching object is not found
						duplicateObj = entityViewerDataService.getObject(item.___id, item.___parentId);
					} catch (e) {
						console.error(e);
					}

					if (duplicateObj) {
						console.log("Error: duplicate ___id was created for an object: ", item);
						var customError = new Error("Object with an ___id " + item.___id + " already exist");
						customError.___item_data = item;

						throw customError;

					}

					entityViewerDataService.setData(item);
				});

				requestParameters.status = 'loaded';

				entityViewerDataService.setRequestParameters(requestParameters);

				resolve();

			}).catch(function (error) {

				console.error('getObjects.error', error);

				requestParameters.status = 'error';

				entityViewerDataService.setRequestParameters(requestParameters);

				reject();

			})

		});

	};

	var getGroups = function (requestParameters, entityViewerDataService, entityViewerEventService) {

		console.log('getGroups.requestParameters', requestParameters);

		requestParameters.status = 'loading';

		// var groupTypes = entityViewerDataService.getGroups();
		var matchingGTypeIndex = requestParameters.body.groups_types.length - 1;
		var groupType = requestParameters.body.groups_types[matchingGTypeIndex];

		if (groupType.options.sort) {

			requestParameters.body.groups_order = groupType.options.sort.toLocaleLowerCase();
			requestParameters.body.ordering_mode = groupType.options.sort_settings.mode;

		}

		entityViewerDataService.setRequestParameters(requestParameters);

		return new Promise(function (resolve, reject) {

			var entityType = entityViewerDataService.getEntityType();

			var options = requestParameters.body;
			var event = requestParameters.event;

			var page = Number(options.page) - 1;
			// var pagination = entityViewerDataService.getPagination();
			var step = 10000; // TODO fix pagination problem in future
			var i;

			groupsService.getList(options, entityViewerDataService).then(function (data) {

				// console.log('groupsService.getList.data', data)

				var parentGroup = entityViewerDataService.getData(requestParameters.id);

				data.results.map(function (item, index) {

					item.___parentId = requestParameters.id;
					item.___group_name = item.___group_name ? item.___group_name : '-';
					item.___group_identifier = item.___group_identifier ? item.___group_identifier : '-';


					item.___level = parentGroup.___level + 1;
					item.___index = index;

					item.___type = 'group';

					item.___id = evRvCommonHelper.getId(item); // order matters

					var groupSettings = rvDataHelper.getOrCreateGroupSettings(entityViewerDataService, item);

					if (groupSettings.hasOwnProperty('is_open')) {
						item.___is_open = groupSettings.is_open;
					}

					if (!parentGroup.___is_open) {

						item.___is_open = false;
						groupSettings.is_open = false;

						rvDataHelper.setGroupSettings(entityViewerDataService, item, groupSettings);

					}

					var entityType = entityViewerDataService.getEntityType();
					var viewContext = entityViewerDataService.getViewContext();

					if (entityType === 'transaction-report' && viewContext === 'split_panel') {
						item.___is_open = true;
					}

					// console.log('parentGroup.___is_open', parentGroup.___is_open)
					// console.log('item.___is_open', item.___is_open)

					entityViewerDataService.setData(item);

					if (item.___is_open) { // Request Data for group if open. TODO refactor it, I dont like it, probably will be issues on large data sets

						// TODO discuss
						// What I propose
						// We need to have ONE GENERAL queue list for all requests
						// E.G. if we know that user has 70k transactions
						// We need to prevent him to do more then 10 requests on level

						if (!entityViewerDataService.isRequestParametersExist(item.___id)) {

							var newRequestParameters = createRequestParameters(item, item.___level - 1, entityViewerDataService, entityViewerEventService,)

							// console.log('rvDataProvider_cascade_download.item', item);
							// console.log('rvDataProvider_cascade_download.requestParameters', newRequestParameters);

							updateDataStructureByRequestParameters(newRequestParameters, entityViewerDataService, entityViewerEventService).then(function () {

								entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE);

							})

						}

					}

				});

				requestParameters.status = 'loaded';

				entityViewerDataService.setRequestParameters(requestParameters);

				resolve();

			}).catch(function (error) {

				console.error('getGroups.error', error);

				requestParameters.status = 'error';

				entityViewerDataService.setRequestParameters(requestParameters);

				reject();

			})

		})

	};

	var getObjectsByRequestParameters = function (requestParameters, entityViewerDataService, entityViewerEventService) {

		return getObjects(requestParameters, entityViewerDataService, entityViewerEventService)

	};

	var getGroupsByRequestParameters = function (requestParameters, entityViewerDataService, entityViewerEventService) {

		return getGroups(requestParameters, entityViewerDataService, entityViewerEventService)

	};

	var createRequestParameters = function (item, level, evDataService, evEventService, createdIdsList = []) {

		console.log('createRequestParameters.item', item);

		var groups = evDataService.getGroups();

		var requestParameters;

		// var id = evRvCommonHelper.getId(item);
		var id = item.___id;

		if (createdIdsList.includes(id)) {

			console.log("Error: duplicated id was created for an item: ", item);
			var customError = new Error("Item with an ___id " + item.___id + " already exist");
			customError.___item_data = item;

			throw customError;

		}

		createdIdsList.push(id);

		var groups_types = evDataHelper.getGroupsTypesToLevel(level + 1, evDataService);
		var groups_values = evDataHelper.getGroupsValuesByItem(item, evDataService);


		groups_values.push(item.___group_identifier);

		if (groups.length && level + 1 < groups.length) {

			requestParameters = {
				requestType: 'groups',
				id: id,
				groups_level: level + 1, // 0 is for root
				event: {
					___id: id,
					groupName: item.___group_name,
					groupId: item.___group_identifier ? item.___group_identifier : '-',
					parentGroupId: item.___parentId
				},
				body: {
					groups_types: groups_types,
					page: 1,
					groups_values: groups_values,
					groups_order: 'asc'
				}
			};

		} else {

			requestParameters = {
				requestType: 'objects',
				id: id,
				groups_level: level + 1, // 0 is for root
				event: {
					___id: id,
					groupName: item.___group_name,
					groupId: item.___group_identifier ? item.___group_identifier : '-',
					parentGroupId: item.___parentId
				},
				body: {
					groups_types: groups_types,
					page: 1,
					groups_values: groups_values,
					groups_order: 'asc'
				}
			};

		}


		evDataService.setRequestParameters(requestParameters);

		return requestParameters;

	};

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
	var recursiveRequest = function (parentId, level, evDataService, evEventService, createdIdsList) {

		return new Promise(function RecursiveRequestPromise(resolve, reject) {

			var promises = [];
			var requestParameters;

			var dataList = evDataService.getDataAsList();

			var items = []

			dataList.forEach(function (dataItem) {

				if (dataItem.___parentId === parentId) {
					items.push(dataItem)
				}

			})

			items.forEach(function (item) {

				requestParameters = createRequestParameters(item, level, evDataService, evEventService, createdIdsList);
				promises.push(updateDataStructureByRequestParameters(requestParameters, evDataService, evEventService));

			});


			Promise.all(promises).then(function (data) {

				var groups = evDataService.getGroups();

				level = level + 1;

				if (level < groups.length) {

					// console.log('to next level!', level);

					items = evDataHelper.getGroupsByLevel(level, evDataService)
						.filter(item => item.___parentId === parentId);
					// console.log('recursiveRequest.items', items);

					var recursiveRequestPromises = [];

					items.forEach(function (item) {

						// console.log('item!', item.___group_name);

						recursiveRequestPromises.push(recursiveRequest(item.___id, level, evDataService, evEventService, createdIdsList));

					});

					Promise.all(recursiveRequestPromises).then(function (data) {
						resolve(data);
					})


				} else { //

					resolve([])
				}

			});

		})

	};

	var initRecursiveRequestParametersCreation = function (evDataService, evEventService, createdIdsList) {

		console.time('Creating Data Structure');

		var rootGroup = evDataService.getRootGroupData();
		var level = 0;

		return recursiveRequest(rootGroup.___id, level, evDataService, evEventService, createdIdsList).then(function () {
			console.timeEnd('Creating Data Structure');
		})

	};

	var createdIdsList = []; // WTF VERY BAD PATTERN, never do it again

	var createDataStructure = function (evDataService, evEventService) {
		// console.log('createDataStructure')

		evDataService.resetData();
		evDataService.resetRequestParameters();
		var createdIdsList = [];

		var defaultRootRequestParameters = evDataService.getActiveRequestParameters();
		var groupTypes = evDataService.getGroups();
		var activeColumnSort = evDataService.getActiveColumnSort();

		evEventService.dispatchEvent(evEvents.DATA_LOAD_START);

		if (groupTypes.length) {
			console.log('createDataStructure 1', defaultRootRequestParameters)

			// get children groups for the rootGroup
			getGroups(defaultRootRequestParameters, evDataService, evEventService).then(function () {
				/*
				 * Get children groups for every group level
				 *
				 * injectRegularFilters() will be called inside updateDataStructureByRequestParameters()
				 * that is inside recursiveRequest()
				 * that is inside initRecursiveRequestParametersCreation()
				 */
				initRecursiveRequestParametersCreation(evDataService, evEventService, createdIdsList).then(function () {
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
						sortObjects(evDataService, evEventService);
					} else {
						evEventService.dispatchEvent(evEvents.DATA_LOAD_END);
					}


				})

			});

		} else {

			console.log('createDataStructure 3', defaultRootRequestParameters)

			injectRegularFilters(defaultRootRequestParameters, evDataService);

			getObjects(defaultRootRequestParameters, evDataService, evEventService).then(function () {
				console.log('createDataStructure 4', defaultRootRequestParameters)

				if (activeColumnSort) {
					sortObjects(evDataService, evEventService);

				} else {
					evEventService.dispatchEvent(evEvents.DATA_LOAD_END);
				}

			})

		}


	};

	/**
	 * @function
	 *
	 * @param requestParameters
	 * @param evDataService
	 * @param evEventService
	 * @returns {Promise<unknown>}
	 */
	var updateDataStructureByRequestParameters = function (requestParameters, evDataService, evEventService) {

		// console.log('updateDataStructureByRequestParameters.requestParameters', requestParameters);

		evEventService.dispatchEvent(evEvents.DATA_LOAD_START);

		return new Promise(function (resolve, reject) {

			injectRegularFilters(requestParameters, evDataService, evEventService);

			// console.log('requestParameters.requestType', requestParameters.requestType);

			if (requestParameters.requestType === 'objects') {

				getObjectsByRequestParameters(requestParameters, evDataService, evEventService).then(function (data) {
					resolve(data)

					evEventService.dispatchEvent(evEvents.DATA_LOAD_END);

				})

			}

			if (requestParameters.requestType === 'groups') {

				getGroupsByRequestParameters(requestParameters, evDataService, evEventService).then(function (data) {
					resolve(data)

					evEventService.dispatchEvent(evEvents.DATA_LOAD_END);
				})
			}

		})

	};

	var updateDataStructure = function (evDataService, evEventService) {

		var requestParameters = evDataService.getActiveRequestParameters();

		injectRegularFilters(requestParameters, evDataService, evEventService);

		evEventService.dispatchEvent(evEvents.DATA_LOAD_START);

		if (requestParameters.requestType === 'objects') {

			getObjectsByRequestParameters(requestParameters, evDataService, evEventService).then(function (data) {

				evEventService.dispatchEvent(evEvents.DATA_LOAD_END); // backend logic

			})

		}

		if (requestParameters.requestType === 'groups') {

			getGroupsByRequestParameters(requestParameters, evDataService, evEventService).then(function (data) {

				evEventService.dispatchEvent(evEvents.DATA_LOAD_END); // backend logic

			})
		}


	};

	var sortObjects = function (entityViewerDataService, entityViewerEventService) {

		entityViewerDataService.resetOnlyItems();

		var activeColumnSort = entityViewerDataService.getActiveColumnSort();
		var level = entityViewerDataService.getGroups().length;

		var levelGroups = evDataHelper.getGroupsByLevel(level, entityViewerDataService);
		var requestsParameters = entityViewerDataService.getAllRequestParameters();
		var levelRequestParameters = [];

		Object.keys(requestsParameters).forEach(function (key) {

			levelGroups.forEach(function (group) {

				if (group.___id === requestsParameters[key].id) {

					//# region apply sorting settings
					requestsParameters[key].body.page = 1;
					requestsParameters[key].body.ordering = activeColumnSort.key;
					requestsParameters[key].body.ordering_mode = activeColumnSort.options.sort_settings.mode

					entityViewerDataService.setRequestParameters(requestsParameters[key]);
					//# endregion Apply sorting settings

					levelRequestParameters.push(requestsParameters[key]);

				}

			});

		});

		var promises = [];

		levelRequestParameters.forEach(function (requestParameters) { // get sorted content
			promises.push(getObjects(requestParameters, entityViewerDataService, entityViewerEventService));
		});

		Promise.all(promises).then(function () {
			entityViewerEventService.dispatchEvent(evEvents.DATA_LOAD_END);
		})

	};

	var sortGroupType = function (entityViewerDataService, entityViewerEventService, signalDataLoadEnd) {

		var activeGroupTypeSort = entityViewerDataService.getActiveGroupTypeSort();

		console.log('sortGroupType.activeGroupTypeSort', activeGroupTypeSort);

		var groupsTypes = entityViewerDataService.getGroups();

		// level of a parent used, because sorting applies to an array inside 'result' property of a parent
		var parentLevel = groupsTypes.findIndex(function (item) {
			return item.key === activeGroupTypeSort.key;
		});

		if (parentLevel === -1) {
			parentLevel = 0;
		}


		console.log('sortGroupType.parentLevel', parentLevel);

		var groups = evDataHelper.getGroupsByLevel(parentLevel, entityViewerDataService);

		var requestsParameters = entityViewerDataService.getAllRequestParameters();
		var requestParametersForUnfoldedGroups = [];

		Object.keys(requestsParameters).forEach(function (key) {

			groups.forEach(function (group) {

				if (group.___id === requestsParameters[key].id) {
					requestParametersForUnfoldedGroups.push(requestsParameters[key]);
				}

			})

		});

		// should be called after requestParametersForUnfoldedGroups assembled
		entityViewerDataService.resetOnlyGroups();

		groups.forEach(function (group) {

			group.results = [];

			entityViewerDataService.setData(group)

		});

		var promises = [];

		requestParametersForUnfoldedGroups.forEach(function (requestParameters) {
			promises.push(getGroups(requestParameters, entityViewerDataService, entityViewerEventService));
		});

		return new Promise(function (resolve, reject) {

			Promise.all(promises).then(function (data) {

				if (signalDataLoadEnd !== false) {
					entityViewerEventService.dispatchEvent(evEvents.DATA_LOAD_END);
				}

				resolve();

			}).catch(function (error) {
				reject(error)
			})

		})

	};

	return {
		createDataStructure: createDataStructure,
		requestReport: requestReport,
		updateDataStructure: updateDataStructure,

		sortObjects: sortObjects,
		sortGroupType: sortGroupType,

		createRequestParameters: createRequestParameters,
		updateDataStructureByRequestParameters: updateDataStructureByRequestParameters,
	}

}
