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
	var injectRegularFilters = function (requestParameters, evDataService, evEventService) {

		// console.log('injectRegularFilters.requestParameters', requestParameters);

		var newRequestParametersBody = Object.assign({}, requestParameters.body);
		newRequestParametersBody['filter_settings'] = [];

		var filters = evDataService.getFilters();

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

		evDataService.setRequestParameters(requestParameters);

	};

	var getObjects = function (requestParameters, evDataService, evEventService) {

		console.log('getObjects.requestParameters', requestParameters);

		requestParameters.status = 'loading';

		evDataService.setRequestParameters(requestParameters);

		return new Promise(function (resolve, reject) {

			var entityType = evDataService.getEntityType();

			var options = requestParameters.body;
			var event = requestParameters.event;

			var page = parseInt(options.page.toString(), 10) - 1;
			var step = 10000; // TODO fix pagination problem in future
			var i;

			var requestId = evDataService.getCurrentRequestId();

			objectsService.getList(options, evDataService).then(function (data) {

				if (requestId !== evDataService.getCurrentRequestId()) {
					// do not remove
					// Seems that this response is too old, just ignore it
					// szhitenev 2023-11-16
					return
				}

				var parentGroup = evDataService.getData(requestParameters.id);
				var reportOptions = evDataService.getReportOptions();

				data.results.map(function (item, index) {

					item.___parentId = parentGroup.___id;
					item.___type = 'object';
					item.___index = index;
					item.___level = parentGroup.___level + 1;

					//# region Create an ___id
					item.___id = evRvCommonHelper.getId(item);

					// Some depricated logic,
					// right now new object will overwrite old one
					// FN-2320 2023-11-12 szhitenev
					/*var duplicateObj;

					try {
						// returns an error if a matching object is not found
						duplicateObj = evDataService.getObject(item.___id, item.___parentId);
					} catch (e) {
						console.error(e);
					}

					if (duplicateObj) {
						console.log("Error: duplicate ___id was created for an object: ", item);
						var customError = new Error("Object with an ___id " + item.___id + " already exist");
						customError.___item_data = item;

						throw customError;

					}*/

					evDataService.setData(item);
				});

				requestParameters.status = 'loaded';

				evDataService.setRequestParameters(requestParameters);

				resolve(data);

			}).catch(function (error) {

				console.error('getObjects.error', error);

				requestParameters.status = 'error';

				evDataService.setRequestParameters(requestParameters);

				reject();

			})

		});

	};

	var getGroups = function (requestParameters, evDataService, evEventService) {

		console.log('getGroups.requestParameters', requestParameters);

		requestParameters.status = 'loading';

		// var groupTypes = evDataService.getGroups();
		var matchingGTypeIndex = requestParameters.body.groups_types.length - 1;
		var groupType = requestParameters.body.groups_types[matchingGTypeIndex];

		if (groupType.options.sort) {

			requestParameters.body.groups_order = groupType.options.sort.toLocaleLowerCase();
			requestParameters.body.ordering_mode = groupType.options.sort_settings.mode;

		}

		evDataService.setRequestParameters(requestParameters);

		var requestId = evDataService.getCurrentRequestId();

		return new Promise(function (resolve, reject) {

			var entityType = evDataService.getEntityType();

			var options = requestParameters.body;
			var event = requestParameters.event;


			groupsService.getList(options, evDataService).then(function (data) {

				if (requestId !== evDataService.getCurrentRequestId()) {
					// do not remove
					// Seems that this response is too old, just ignore it
					// szhitenev 2023-11-16
					return
				}

				var reportOptions = evDataService.getReportOptions();

				// console.log('groupsService.getList.data', data)

				var parentGroup = evDataService.getData(requestParameters.id);

				data.results.map(function (item, index) {

					item.___parentId = requestParameters.id;
					item.___group_name = item.___group_name ? item.___group_name : '-';
					item.___group_identifier = item.___group_identifier ? item.___group_identifier : '-';


					item.___level = parentGroup.___level + 1;
					item.___index = index;

					item.___type = 'group';

					item.___id = evRvCommonHelper.getId(item); // order matters

					var groupSettings = rvDataHelper.getOrCreateGroupSettings(evDataService, item);

					if (groupSettings.hasOwnProperty('is_open')) {
						item.___is_open = groupSettings.is_open;
					}


					if (!parentGroup.___is_open) {

						item.___is_open = false;
						groupSettings.is_open = false;

						rvDataHelper.setGroupSettings(evDataService, item, groupSettings);

					}

					var entityType = evDataService.getEntityType();
					var viewContext = evDataService.getViewContext();

					if (viewContext === 'dashboard') {
						item.___is_open = true;
					}

					if (entityType === 'transaction-report' && viewContext === 'split_panel') {
						item.___is_open = true;
					}

					// console.log('parentGroup.___is_open', parentGroup.___is_open)
					// console.log('item.___is_open', item.___is_open)

					evDataService.setData(item);

				});

				requestParameters.status = 'loaded';

				evDataService.setRequestParameters(requestParameters);

				resolve(data);

			}).catch(function (error) {

				console.error('getGroups.error', error);

				requestParameters.status = 'error';

				evDataService.setRequestParameters(requestParameters);

				reject();

			})

		})

	};

	var createRequestParameters = function (evDataService, evEventService, item, parentRequestParameters) {

		console.log('rv.createRequestParameters.item', item);
		console.log('rv.createRequestParameters.parentRequestParameters', parentRequestParameters);

		var groups = evDataService.getGroups();

		var requestParameters;

		// var id = evRvCommonHelper.getId(item);
		var id = item.___id;

		var parentLevel = parentRequestParameters.groups_level;


		var groups_types = evDataHelper.getGroupsTypesToLevel(parentLevel, evDataService);
		var groups_values = evDataHelper.getGroupsValuesByItem(item, evDataService);


		groups_values.push(item.___group_identifier);

		if (groups.length && parentLevel < groups.length) {

			requestParameters = {
				requestType: 'groups',
				id: id,
				groups_level: parentLevel + 1, // 0 is for root
				event: {
					___id: id,
					groupName: item.___group_name,
					groupId: item.___group_identifier ? item.___group_identifier : '-',
					parentGroupId: item.___parentId
				},
				pagination: {
					page: 1,
					count: 0,
					page_size: 40,
					downloaded: 0
				},
				body: {
					groups_types: groups_types,
					page: 1,
					groups_values: groups_values,
					groups_order: 'asc'
				},
				requestedPages: [1],
				processedPages: []
			};

		} else {

			requestParameters = {
				requestType: 'objects',
				id: id,
				groups_level: parentLevel + 1, // 0 is for root
				event: {
					___id: id,
					groupName: item.___group_name,
					groupId: item.___group_identifier ? item.___group_identifier : '-',
					parentGroupId: item.___parentId
				},
				pagination: {
					page: 1,
					count: 0,
					page_size: 40,
					downloaded: 0
				},
				body: {
					groups_types: groups_types,
					page: 1,
					groups_values: groups_values,
					groups_order: 'asc'
				},
				requestedPages: [1],
				processedPages: []
			};

		}


		evDataService.setRequestParameters(requestParameters);

		return requestParameters;

	};

	function processQueue(evDataService, evEventService) {

		if (evDataService.isRequestsQueueEmpty()) {
			evEventService.dispatchEvent(evEvents.DATA_LOAD_END);
			return;
		}

		var requestParameters = evDataService.dequeueDataRequest();
		executeRequest(evDataService, evEventService, requestParameters);
	}


	function enqueueNewRequests(evDataService, evEventService, data, parentRequestParameters,) {
		// Based on the response 'data', decide what new requests to enqueue
		// Example: If 'data' contains groups, enqueue a request for each group
		data.results.forEach(item => {
			if (item.___is_open) {
				var newRequestParameters = createRequestParameters(evDataService, evEventService, item, parentRequestParameters);
				evDataService.enqueueDataRequest(newRequestParameters);
			}
		});
	}

	function executeRequest(evDataService, evEventService, requestParameters) {
		if (requestParameters.requestType === 'groups') {

			getGroups(requestParameters, evDataService, evEventService).then(function (data) {

				requestParameters.pagination.count = data.count;
				requestParameters.pagination.downloaded = requestParameters.pagination.downloaded + data.results.length;
				evDataService.setRequestParameters(requestParameters)

				enqueueNewRequests(evDataService, evEventService, data, requestParameters);

				processQueue(evDataService, evEventService)

			});

		} else {

			getObjects(requestParameters, evDataService, evEventService).then(function (data) {

				requestParameters.pagination.count = data.count;
				requestParameters.pagination.downloaded = requestParameters.pagination.downloaded + data.results.length;
				evDataService.setRequestParameters(requestParameters)

				// enqueueNewRequests(evDataService, evEventService, data, requestParameters);
				processQueue(evDataService, evEventService)

			});

		}
	}

	var createDataStructure = function (evDataService, evEventService) {
		console.log('rv.createDataStructure')

		evDataService.resetData();
		evDataService.resetRequestParameters();


		evDataService.incrementCurrentRequestId();

		var reportOptions = evDataService.getReportOptions();

		if (reportOptions) {
			reportOptions.report_instance_id = null // if clear report_instance_id then we request new Report Calculation
		}

		evDataService.setReportOptions(reportOptions);

		var defaultRootRequestParameters = evDataService.getActiveRequestParameters();

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE);
		evEventService.dispatchEvent(evEvents.DATA_LOAD_START);

		// Start the process by enqueuing the first request
		evDataService.enqueueDataRequest(defaultRootRequestParameters);

		// Begin processing the queue
		processQueue(evDataService, evEventService);


	};

	/**
	 * @function
	 *
	 * @param requestParameters
	 * @param evDataService
	 * @param evEventService
	 * @returns {Promise<unknown>}
	 */
	var updateDataStructureByRequestParameters = function (evDataService, evEventService, requestParameters) {

		// console.log('updateDataStructureByRequestParameters.requestParameters', requestParameters);

		injectRegularFilters(requestParameters, evDataService, evEventService);

		evEventService.dispatchEvent(evEvents.DATA_LOAD_START);

		evDataService.enqueueDataRequest(requestParameters);

		// Begin processing the queue
		processQueue(evDataService, evEventService);

	};

	var updateDataStructure = function (evDataService, evEventService) {

		var requestParameters = evDataService.getActiveRequestParameters();

		injectRegularFilters(requestParameters, evDataService, evEventService);

		evEventService.dispatchEvent(evEvents.DATA_LOAD_START);

		evDataService.enqueueDataRequest(requestParameters);

		// Begin processing the queue
		processQueue(evDataService, evEventService);

	};

	var sortObjects = function (evDataService, evEventService) {

		evDataService.resetOnlyItems();

		var activeColumnSort = evDataService.getActiveColumnSort();
		var level = evDataService.getGroups().length;

		var levelGroups = evDataHelper.getGroupsByLevel(level, evDataService);
		var requestsParameters = evDataService.getAllRequestParameters();
		var levelRequestParameters = [];

		Object.keys(requestsParameters).forEach(function (key) {

			levelGroups.forEach(function (group) {

				if (group.___id === requestsParameters[key].id) {

					//# region apply sorting settings
					requestsParameters[key].body.page = 1;
					requestsParameters[key].body.ordering = activeColumnSort.key;
					requestsParameters[key].body.ordering_mode = activeColumnSort.options.sort_settings.mode

					evDataService.setRequestParameters(requestsParameters[key]);
					//# endregion Apply sorting settings

					levelRequestParameters.push(requestsParameters[key]);

				}

			});

		});

		var promises = [];

		levelRequestParameters.forEach(function (requestParameters) { // get sorted content
			promises.push(getObjects(requestParameters, evDataService, evEventService));
		});

		Promise.all(promises).then(function () {
			evEventService.dispatchEvent(evEvents.DATA_LOAD_END);
		})

	};

	var sortGroupType = function (evDataService, evEventService, signalDataLoadEnd) {

		var activeGroupTypeSort = evDataService.getActiveGroupTypeSort();

		console.log('sortGroupType.activeGroupTypeSort', activeGroupTypeSort);

		var groupsTypes = evDataService.getGroups();

		// level of a parent used, because sorting applies to an array inside 'result' property of a parent
		var parentLevel = groupsTypes.findIndex(function (item) {
			return item.key === activeGroupTypeSort.key;
		});

		if (parentLevel === -1) {
			parentLevel = 0;
		}


		console.log('sortGroupType.parentLevel', parentLevel);

		var groups = evDataHelper.getGroupsByLevel(parentLevel, evDataService);

		var requestsParameters = evDataService.getAllRequestParameters();
		var requestParametersForUnfoldedGroups = [];

		Object.keys(requestsParameters).forEach(function (key) {

			groups.forEach(function (group) {

				if (group.___id === requestsParameters[key].id) {
					requestParametersForUnfoldedGroups.push(requestsParameters[key]);
				}

			})

		});

		// should be called after requestParametersForUnfoldedGroups assembled
		evDataService.resetOnlyGroups();

		groups.forEach(function (group) {

			group.results = [];

			evDataService.setData(group)

		});

		var promises = [];

		requestParametersForUnfoldedGroups.forEach(function (requestParameters) {
			promises.push(getGroups(requestParameters, evDataService, evEventService));
		});

		return new Promise(function (resolve, reject) {

			Promise.all(promises).then(function (data) {

				if (signalDataLoadEnd !== false) {
					evEventService.dispatchEvent(evEvents.DATA_LOAD_END);
				}

				resolve();

			}).catch(function (error) {
				reject(error)
			})

		})

	};

	return {
		createDataStructure: createDataStructure,
		updateDataStructure: updateDataStructure,

		sortObjects: sortObjects,
		sortGroupType: sortGroupType,

		createRequestParameters: createRequestParameters,
		updateDataStructureByRequestParameters: updateDataStructureByRequestParameters,
	}

}
