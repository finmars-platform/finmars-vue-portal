import evEvents from '../entityViewerEvents'
import groupsService from '../ev-data-provider/groups.service'
import objectsService from '../ev-data-provider/objects.service'
import evDataHelper from '../../helpers/ev-data.helper'
import evRvCommonHelper from '../../helpers/ev-rv-common.helper'

var injectEntityViewerOptions = function (entityViewerDataService) {
	var requestParameters = entityViewerDataService.getActiveRequestParameters();

	requestParameters.body['ev_options'] = entityViewerDataService.getEntityViewerOptions();

	entityViewerDataService.setRequestParameters(requestParameters);
};

var injectGlobalTableSearch = function (entityViewerDataService) {
	var requestParameters = entityViewerDataService.getActiveRequestParameters();

	requestParameters.body['global_table_search'] = ''

	var query = entityViewerDataService.getGlobalTableSearch();

	if (query) {
		requestParameters.body['global_table_search'] = query
	}

	entityViewerDataService.setRequestParameters(requestParameters);
};

var injectRegularFilters = function (entityViewerDataService) {

	var requestParameters = entityViewerDataService.getActiveRequestParameters();

	var newRequestParametersBody = Object.assign({}, requestParameters.body);
	// newRequestParametersBody['filter_settings'] = [];
	newRequestParametersBody['filter_settings'] = {frontend: [], backend: []};

	var filtersData = entityViewerDataService.getFilters();

	/* var isFilterValid = function (filterItem) {

		if (filterItem.options && filterItem.options.enabled) { // if filter is enabled

			var filterType = filterItem.options.filter_type;

			if (filterType === 'empty' ||
				filterItem.options.exclude_empty_cells) { // if filter works for empty cells

				return true;

			} else if (filterItem.options.filter_values) { // if filter values can be used for filtering (not empty)

				var filterValues = filterItem.options.filter_values;

				if (filterType === 'from_to') {

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
	};

	filters.forEach(function (item) {

		if (isFilterValid(item)) {

			var filterSettings = {
				key: item.key,
				filter_type: item.options.filter_type,
				exclude_empty_cells: item.options.exclude_empty_cells,
				value_type: item.value_type,
				value: item.options.filter_values
			};

			if (item.options.is_frontend_filter) {
				filterSettings.is_frontend_filter = true;
			}

			//newRequestParametersBody = Object.assign(newRequestParametersBody, filterSettings);
			newRequestParametersBody['filter_settings'].push(filterSettings);

		}

	}); */

	var formatFilter = function (filter, filterType) {

		if (evRvCommonHelper.isFilterValid(filter)) {

			var filterSettings = {
				key: filter.key,
				filter_type: filter.options.filter_type,
				exclude_empty_cells: filter.options.exclude_empty_cells,
				value_type: filter.value_type,
				value: filter.options.filter_values
			};
			//newRequestParametersBody = Object.assign(newRequestParametersBody, filterSettings);
			newRequestParametersBody['filter_settings'][filterType].push(filterSettings);

		}

	};

	/* TO DELETE: if frontend filters will be applied outside of ev-data-provider files
	filtersData.frontend.forEach(function (filter) {
		formatFilter(filter, 'frontend');
	});
	*/

	filtersData.backend.forEach(function (filter) {
		formatFilter(filter, 'backend');
	});

	requestParameters.body = newRequestParametersBody;

	entityViewerDataService.setRequestParameters(requestParameters);

};

var deserializeObjects = function (entityViewerDataService, entityViewerEventService, attributeDataService, data, requestParameters, page) {

	var step = requestParameters.pagination.page_size;
	var pageAsIndex = parseInt(page, 10) - 1;
	var event = requestParameters.event;

	var obj;
	var i;

	if (!event.___id) {

		var rootGroupData = entityViewerDataService.getRootGroupData();

		obj = Object.assign({}, rootGroupData);

		obj.___items_count = data.count;

		obj.count = data.count;
		obj.next = data.next;
		obj.previous = data.previous;

		for (i = 0; i < step; i = i + 1) {
			if (pageAsIndex * step + i < obj.count) {
				obj.results[pageAsIndex * step + i] = data.results[i];
			}
		}

	}
	else {

		var groupData = entityViewerDataService.getData(event.___id);

		console.log('groupData', groupData);

		if (groupData) {

			obj = Object.assign({}, groupData);

			obj.___group_name = groupData.___group_name ? groupData.___group_name : '-';
			obj.___group_id = groupData.___group_id ? groupData.___group_id : '-';
			obj.___group_identifier = groupData.___group_identifier ? groupData.___group_identifier : '-';
			// obj.___items_count = groupData.___items_count ? groupData.___items_count : 0;
			obj.___items_count = data.count;

			obj.count = data.count;
			obj.next = data.next;
			obj.previous = data.previous;

			for (i = 0; i < step; i = i + 1) {
				if (pageAsIndex * step + i < obj.count) {
					obj.results[pageAsIndex * step + i] = data.results[i];
				}
			}

		}
		else {

			obj = Object.assign({}, data);
			obj.___group_name = event.groupName ? event.groupName : '-';
			obj.___group_id = event.groupId ? event.groupId : '-';
			obj.___group_identifier = event.groupIdentifier ? event.groupIdentifier : '-';
			// obj.___items_count = event.itemsCount ? event.itemsCount : 0;
			obj.___items_count = data.count;
			obj.___is_open = true;
			obj.___is_activated = evDataHelper.isGroupSelected(event.___id, event.parentGroupId, entityViewerDataService);

			obj.___parentId = event.parentGroupId;
			obj.___type = 'group';
			obj.___id = event.___id;
			obj.___level = evRvCommonHelper.getParents(event.parentGroupId, entityViewerDataService).length;

		}


	}

	obj.results = obj.results.filter(function (item) {
		if (item && item.___type !== 'control') {
			return true;
		}

		return false;
	});

	obj.results = obj.results.map(function (item, index) {

		if (item.___type !== 'placeholder_object') {

			item.___group_name = item.___group_name ? item.___group_name : '-';
			item.___group_identifier = item.___group_identifier ? item.___group_identifier : '-';
			item.___items_count = item.___items_count ? item.___items_count : 0;
			item.___group_id = item.___group_id ? item.___group_id : '-';
			item.___is_activated = evDataHelper.isSelected(entityViewerDataService);

			item.___parentId = obj.___id;
			item.___type = 'object';

			item.___level = obj.___level + 1;
			item.___index = index;
			item.___id = evRvCommonHelper.getId(item);

		}

		return item
	});

	/*var controlObj = {
				___parentId: obj.___id,
				___type: 'control',
				___level: obj.___level + 1
		};

		controlObj.___id = evRvCommonHelper.getId(controlObj);

		obj.results.push(controlObj);*/

	console.log('attributeDataService', attributeDataService);

	var attribute_type_map = {};
	var entityType = entityViewerDataService.getEntityType()

	console.log('entityType', entityType);

	var attrs = attributeDataService.getDynamicAttributesByEntityType(entityType);

	attrs.forEach(function (item) {

		attribute_type_map[item.id] = item

	})

	console.log('attribute_type_map', attribute_type_map);

	obj.results.forEach(function (item) {

		if (item.attributes) {
			item.attributes.forEach(function (attr) {

				attr.attribute_type_object = attribute_type_map[attr.attribute_type]

			})
		}

		entityViewerDataService.setData(item); // Important to set it object in data propr, consider refactor EV later

	})

	console.log('obj', obj);

	entityViewerDataService.setData(obj);

};

var deserializeGroups = function (entityViewerDataService, entityViewerEventService, data, requestParameters, page) {

	var step = requestParameters.pagination.page_size;
	var pageAsIndex = parseInt(page, 10) - 1;
	var event = requestParameters.event;

	var obj;
	var i;

	if (!event.___id) {

		var rootGroupData = entityViewerDataService.getRootGroupData();

		obj = Object.assign({}, rootGroupData);

		obj.___items_count = data.count;

		obj.count = data.count;
		obj.next = data.next;
		obj.previous = data.previous;
		obj.___is_open = true;
		for (i = 0; i < step; i = i + 1) {
			if (pageAsIndex * step + i < obj.count) {
				obj.results[pageAsIndex * step + i] = data.results[i];
			}
		}

		console.log('obj', obj);


	}
	else {

		var groupData = entityViewerDataService.getData(event.___id);

		if (groupData) {

			obj = Object.assign({}, groupData);

			obj.___group_name = groupData.___group_name ? groupData.___group_name : '-';
			obj.___group_identifier = groupData.___group_identifier ? groupData.___group_identifier : '-';
			obj.___items_count = groupData.___items_count ? groupData.___items_count : 0;
			// obj.___items_count = data.count;
			obj.___group_id = groupData.___group_id ? groupData.___group_id : '-';

			obj.count = data.count;
			obj.next = data.next;
			obj.previous = data.previous;
			obj.___is_open = true;

			for (i = 0; i < step; i = i + 1) {
				if (pageAsIndex * step + i < obj.count) {
					obj.results[pageAsIndex * step + i] = data.results[i];
				}
			}


		}
		else {

			obj = Object.assign({}, data);
			obj.___group_name = event.groupName ? event.groupName : '-';
			obj.___group_identifier = event.groupIdentifier ? event.groupIdentifier : '-';
			// obj.___items_count = event.itemsCount ? event.itemsCount : 0;
			obj.___items_count = data.count;
			obj.___group_id = event.groupId ? event.groupId : '-';
			// obj.___group_identifier = event.groupId;
			obj.___is_open = true;
			obj.___is_activated = evDataHelper.isGroupSelected(event.___id, event.parentGroupId, entityViewerDataService);

			obj.___parentId = event.parentGroupId;
			obj.___type = 'group';
			obj.___id = event.___id;
			obj.___level = evRvCommonHelper.getParents(event.parentGroupId, entityViewerDataService).length;

		}
	}

	/* obj.results = obj.results.filter(function (item) {
			if (item && item.___type !== 'control') {
					return true;
			}

			return false;
	}); */

	var groupTypes = entityViewerDataService.getGroups();
	var parents = [];

	if (obj.___parentId !== null) {
		parents = evRvCommonHelper.getParents(obj.___parentId, entityViewerDataService);
	}

	parents.push(obj);

	// evDataHelper.setDefaultGroups(obj);
	obj.results = obj.results.filter(function (item) {
		return item.___type !== 'control';
	});

	obj.results = obj.results.map(function (item, index) {

		if (item.___type !== 'placeholder_group') {

			item.___parentId = obj.___id;
			item.___group_name = item.___group_name ? item.___group_name : '-';
			item.___group_identifier = item.___group_identifier ? item.___group_identifier : '-';
			item.___items_count = item.___items_count ? item.___items_count : 0;
			item.___group_id = item.___group_id ? item.___group_id : '-';


			item.___is_activated = evDataHelper.isSelected(entityViewerDataService);


			item.___level = obj.___level + 1;

			if (groupTypes.length >= parents.length) {
				item.___type = 'group';
			} else {
				item.___type = 'object';
			}

			item.___id = evRvCommonHelper.getId(item);

			item.___index = index;

			entityViewerDataService.setData(item); // Important to set it object in data propr, consider refactor EV later

		}

		return item;
	});

	/* var controlObj = {
			___parentId: obj.___id,
			___type: 'control',
			___level: obj.___level + 1
	};

	controlObj.___id = evRvCommonHelper.getId(controlObj);

	obj.results.push(controlObj); */

	console.log('DESERIALIZE GROUPS', obj.results);

	entityViewerDataService.setData(obj);

};

var getObjects = function (requestParameters, entityViewerDataService, entityViewerEventService, attributeDataService) {

	entityViewerEventService.dispatchEvent(evEvents.DATA_LOAD_START);

	return new Promise(function (resolve, reject) {

		var promises = [];

		var entityType = entityViewerDataService.getEntityType();

		var pagination = entityViewerDataService.getPagination();
		var itemsPerPage = pagination.page_size;

		var activeColumnSort = entityViewerDataService.getActiveColumnSort();

		var pagesToRequest = requestParameters.requestedPages.filter(function (page) {

			return requestParameters.processedPages.indexOf(page) === -1

		});

		//if (requestParameters.body.frontend_filter_changed) {
		pagesToRequest.forEach(function (pageToRequest) {

			promises.push(new Promise(function (resolveLocal) {

				var options = Object.assign({}, requestParameters.body);

				/* options.filter_settings = options.filter_settings.filter(function (optionsFilter) {
						if (!optionsFilter.is_frontend_filter) {
								return true;
						}

						return false;
				}); */
				options.filter_settings = options.filter_settings.backend;

				options.page = pageToRequest;
				options.page_size = itemsPerPage;
				options.is_enabled = 'any';

				if (activeColumnSort) {
					if (activeColumnSort.options.sort === 'ASC') {
						options.ordering = activeColumnSort.key
					} else {
						options.ordering = '-' + activeColumnSort.key
					}
				}


				if (options.groups_types) {

					options.groups_types = options.groups_types.map(function (groupType) {

						return groupType.key;

					})

				}

				// evDataHelper.setDefaultObjects(entityViewerDataService, entityViewerEventService, requestParameters, pageToRequest);

				requestParameters.pagination.page = pageToRequest;
				entityViewerDataService.setRequestParameters(requestParameters);

				// entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE);

				objectsService.getFilteredList(entityType, options).then(function (data) {

					// console.log('requestParameters', requestParameters);

					requestParameters.pagination.count = data.count;
					requestParameters.processedPages.push(pageToRequest);

					entityViewerDataService.setRequestParameters(requestParameters);

					deserializeObjects(entityViewerDataService, entityViewerEventService, attributeDataService, data, requestParameters, pageToRequest);

					if (requestParameters.loadAll) {

						if (requestParameters.pagination.page * requestParameters.pagination.page_size >= requestParameters.pagination.count) {

							requestParameters.loadAll = false;


							entityViewerDataService.setRequestParameters(requestParameters);

							var errorMessage = 'Something went wrong. Please try again later.';

							evDataHelper.deleteDefaultObjects(entityViewerDataService, entityViewerEventService, requestParameters, errorMessage);

							// entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE);

						} else {

							requestParameters.body.page = requestParameters.body.page + 1;
							requestParameters.pagination.page = requestParameters.pagination.page + 1;
							requestParameters.requestedPages.push(requestParameters.body.page);

							entityViewerDataService.setRequestParameters(requestParameters);
							entityViewerDataService.setActiveRequestParametersId(requestParameters.id);

							entityViewerEventService.dispatchEvent(evEvents.UPDATE_TABLE);

						}

					}

					resolveLocal();

				})
					.catch(function (data) {

						console.log('data', data);

						console.log('error getFilteredList request requestParameters', requestParameters);

						requestParameters.loadAll = false;

						requestParameters.body.page = requestParameters.body.page - 1;
						requestParameters.requestedPages.pop();
						requestParameters.pagination.page = requestParameters.pagination.page - 1;

						entityViewerDataService.setRequestParameters(requestParameters);

						var errorMessage = 'Something went wrong. Please try again later.';

						evDataHelper.deleteDefaultObjects(entityViewerDataService, entityViewerEventService, requestParameters, errorMessage);

						// entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE);

						resolveLocal()


					})

			}));

		});


		Promise.all(promises).then(function () {

			entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE);
			resolve();

		})
		//};
	});

};

var getGroups = function (requestParameters, entityViewerDataService, entityViewerEventService) {

	entityViewerEventService.dispatchEvent(evEvents.DATA_LOAD_START);

	return new Promise(function (resolve, reject) {

		var promises = [];

		var entityType = entityViewerDataService.getEntityType();

		var pagesToRequest = requestParameters.requestedPages.filter(function (page) {

			return requestParameters.processedPages.indexOf(page) === -1

		});

		console.log('pagesToRequest', pagesToRequest);

		var pagination = entityViewerDataService.getPagination();
		var itemsPerPage = pagination.page_size;

		pagesToRequest.forEach(function (pageToRequest) {

			promises.push(new Promise(function (resolveLocal) {

				var options = Object.assign({}, requestParameters.body);

				/* options.filter_settings = options.filter_settings.filter(function (optionsFilter) {
						if (!optionsFilter.is_frontend_filter) {
								return true;
						}


						return false;
				}); */
				options.filter_settings = options.filter_settings.backend;

				options.page = pageToRequest;
				options.page_size = itemsPerPage;
				options.is_enabled = 'any';

				options.groups_types = options.groups_types.map(function (groupType) {

					return groupType.key;

				})

				var groupType = options.groups_types[options.groups_types.length - 1];

				// evDataHelper.setDefaultGroups(entityViewerDataService, entityViewerEventService, requestParameters, pageToRequest);

				requestParameters.pagination.page = pageToRequest;
				entityViewerDataService.setRequestParameters(requestParameters);

				// entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE);

				groupsService.getFilteredList(entityType, options).then(function (data) {

					console.log('get groups', data);

					requestParameters.pagination.count = data.count;
					requestParameters.processedPages.push(pageToRequest);

					entityViewerDataService.setRequestParameters(requestParameters);


					data.results = data.results.map(function (item) {

						var result = {};

						result.___group_name = item.group_name;
						result.___group_identifier = item.group_identifier;
						result.___items_count = item.items_count;
						result.___group_type_key = groupType.key; // TODO assign ___group_type_key from a 'item' after backend starts to return it


						return result
					});

					deserializeGroups(entityViewerDataService, entityViewerEventService, data, requestParameters, pageToRequest);

					// entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE);

					resolveLocal();

					if (requestParameters.loadAll) {

						requestParameters.body.page = requestParameters.body.page + 1;
						requestParameters.pagination.page = requestParameters.pagination.page + 1;
						requestParameters.requestedPages.push(requestParameters.body.page);

						entityViewerDataService.setRequestParameters(requestParameters);
						entityViewerDataService.setActiveRequestParametersId(requestParameters.id);

						entityViewerEventService.dispatchEvent(evEvents.UPDATE_TABLE);

					}

				})
					.catch(function (data) {

						console.log('error request requestParameters', requestParameters);

						requestParameters.loadAll = false;

						requestParameters.body.page = requestParameters.body.page - 1;
						requestParameters.requestedPages.pop();
						requestParameters.pagination.page = requestParameters.pagination.page - 1;

						entityViewerDataService.setRequestParameters(requestParameters);

						var errorMessage = 'Something went wrong. Please try again later.';

						evDataHelper.deleteDefaultGroups(entityViewerDataService, entityViewerEventService, requestParameters, errorMessage);

						// entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE);

						resolveLocal()


					})

			}))
		});

		Promise.all(promises).then(function () {
			entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE);
			resolve();
		})

	})

};

var updateDataStructure = function (entityViewerDataService, entityViewerEventService, attributeDataService) {

	console.time('Updating data structure');
	injectEntityViewerOptions(entityViewerDataService);
	injectRegularFilters(entityViewerDataService);
	injectGlobalTableSearch(entityViewerDataService)

	var requestParameters = entityViewerDataService.getActiveRequestParameters();

	console.log('updateDataStructure.requestParameters', JSON.parse(JSON.stringify(requestParameters)));

	if (requestParameters.requestType === 'objects') {

		getObjects(requestParameters, entityViewerDataService, entityViewerEventService, attributeDataService)
			.then(function () {
				entityViewerEventService.dispatchEvent(evEvents.DATA_LOAD_END);
			})

	}

	if (requestParameters.requestType === 'groups') {

		getGroups(requestParameters, entityViewerDataService, entityViewerEventService).then(function () {

			entityViewerEventService.dispatchEvent(evEvents.DATA_LOAD_END);

		})

	}

	console.timeEnd('Updating data structure');

};

var sortObjects = function (entityViewerDataService, entityViewerEventService, attributeDataService) {

	var level = entityViewerDataService.getGroups().length;
	var lastGroups = evDataHelper.getGroupsByLevel(level, entityViewerDataService);

	var requestsParameters = entityViewerDataService.getAllRequestParameters();
	var requestParametersForLastGroups = [];

	entityViewerDataService.setProjection([]);
	entityViewerDataService.setFlatList([]);

	Object.keys(requestsParameters).forEach(function (key) {

		lastGroups.forEach(function (group) {

			entityViewerDataService.resetObjectsOfGroup(group.___id);

			if (group.___id === requestsParameters[key].id) {
				requestParametersForLastGroups.push(requestsParameters[key]);
			}

		})

	});
	/*selectedGroups.forEach(function (group) {

			var reqParamKey = requestparametersKeys.find(function (key) {
					return group.___id === requestsParameters[key].id
			})

			if (reqParamKey) {
					requestParametersForLastGroups.push( requestsParameters[reqParamKey] );
			}

	})*/

	requestParametersForLastGroups.forEach(function (item) {

		item.body.page = 1;

		/* if (activeColumnSort.options.sort === 'ASC') {
			item.body.ordering = activeColumnSort.key
		} else {
			item.body.ordering = '-' + activeColumnSort.key
		} */

		item.processedPages = [];

		entityViewerDataService.setRequestParameters(item);

	});

	// unfoldedGroups.forEach(function (group) {
	lastGroups.forEach(function (group) {

		group.results = [];

		entityViewerDataService.setData(group)

	});

	var promises = [];

	requestParametersForLastGroups.forEach(function (requestParameters) {

		promises.push(getObjects(requestParameters, entityViewerDataService, entityViewerEventService, attributeDataService))

	});

	Promise.all(promises).then(function () {

		entityViewerEventService.dispatchEvent(evEvents.DATA_LOAD_END);

	})

};

var sortGroupType = function (entityViewerDataService, entityViewerEventService) {

	var activeGroupSort = entityViewerDataService.getActiveGroupTypeSort();

	console.log('sortGroupType.activeGroupSort', activeGroupSort);

	var groupsTypes = entityViewerDataService.getGroups();

	var level = 0;

	groupsTypes.forEach(function (item, index) {

		if (activeGroupSort.key && item.key === activeGroupSort.key) {
			level = index;

		} else {

			if (activeGroupSort.id && item.id === activeGroupSort.id) {
				level = index;
			}

		}

	});

	console.log('sortGroupType.level', level);

	var groups = evDataHelper.getGroupsByLevel(level, entityViewerDataService);

	var requestsParameters = entityViewerDataService.getAllRequestParameters();

	var requestParametersForUnfoldedGroups = [];

	Object.keys(requestsParameters).forEach(function (key) {

		groups.forEach(function (group) {

			if (group.___id === requestsParameters[key].id) {

				// requestsParameters[key].event.___id = group.___id;
				// requestsParameters[key].event.groupName = group.___group_name;
				// requestsParameters[key].event.groupIdentifier = group.___group_identifier;
				// requestsParameters[key].event.groupId = group.___group_id;
				// requestsParameters[key].event.parentGroupId = group.___parentId;

				requestParametersForUnfoldedGroups.push(requestsParameters[key]);
			}


		})

	});

	requestParametersForUnfoldedGroups.forEach(function (item) {

		item.body.page = 1;

		item.body.groups_order = activeGroupSort.options.sort.toLocaleLowerCase();
		item.processedPages = [];

		entityViewerDataService.setRequestParameters(item);

	});

	groups.forEach(function (group) {

		group.results = [];

		entityViewerDataService.setData(group)

	});

	var promises = [];

	requestParametersForUnfoldedGroups.forEach(function (requestParameters) {

		promises.push(getGroups(requestParameters, entityViewerDataService, entityViewerEventService))

	});

	Promise.all(promises).then(function () {

		entityViewerEventService.dispatchEvent(evEvents.DATA_LOAD_END);

	});

};

export default {
	updateDataStructure: updateDataStructure,
	sortObjects: sortObjects,
	sortGroupType: sortGroupType
}
