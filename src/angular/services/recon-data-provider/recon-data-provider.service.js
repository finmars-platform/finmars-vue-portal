import evEvents from '../entityViewerEvents'
import groupsService from './groups.service'
import objectsService from './objects.service'
import evDataHelper from '../../helpers/ev-data.helper'
import evRvCommonHelper from '../../helpers/ev-rv-common.helper'
import queryParamsHelper from '../../helpers/queryParamsHelper'

export default function (entityResolverService, reportHelper) {
	var requestData = function (evDataService) {
		return new Promise(function (resolve, reject) {
			var entityType = evDataService.getEntityType()
			var reportOptions = evDataService.getReportOptions()

			// ;
			// ;

			entityResolverService
				.getList(entityType, reportOptions)
				.then(function (data) {
					// ;

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
					// ;
				})
		})
	}

	var injectRegularFilters = function (
		requestParameters,
		entityViewerDataService,
		entityViewerEventService
	) {
		// ;

		var newRequestParametersBody = Object.assign({}, requestParameters.body)
		newRequestParametersBody['filter_settings'] = []

		var filters = entityViewerDataService.getFilters()

		var isFilterValid = function (filterItem) {
			if (filterItem.options && filterItem.options.enabled) {
				// if filter is enabled

				var filterType = filterItem.options.filter_type

				if (filterType === 'empty' || filterItem.options.exclude_empty_cells) {
					// if filter works for empty cells

					return true
				} else if (filterItem.options.filter_values) {
					// if filter values can be used for filtering (not empty)

					var filterValues = filterItem.options.filter_values

					if (filterType === 'from_to') {
						if (
							(filterValues.min_value || filterValues.min_value === 0) &&
							(filterValues.max_value || filterValues.max_value === 0)
						) {
							return true
						}
					} else if (Array.isArray(filterValues)) {
						if (filterValues[0] || filterValues[0] === 0) {
							return true
						}
					}
				}
			}

			return false
		}

		filters.forEach(function (item) {
			if (isFilterValid(item)) {
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

	var processData = function (
		entityViewerDataService,
		entityViewerEventService
	) {
		entityViewerEventService.dispatchEvent(evEvents.DATA_LOAD_START)

		entityViewerDataService.setStatusData('loaded')

		setTimeout(function () {
			createDataStructure(entityViewerDataService, entityViewerEventService)
		}, 1000)
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

					// ;

					var obj

					if (!event.___id) {
						// if there are no groups

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
						// if there are groups

						if (groupData) {
							// for closed groups

							obj = Object.assign({}, groupData) // group

							obj.___group_name = groupData.___group_name
								? groupData.___group_name
								: '-'
							obj.___group_identifier = groupData.___group_identifier
								? groupData.___group_identifier
								: '-'
							obj.___items_count = groupData.___items_count
								? groupData.___items_count
								: 0

							obj.count = data.count
							obj.next = data.next
							obj.previous = data.previous

							for (i = 0; i < step; i = i + 1) {
								if (page * step + i < obj.count) {
									obj.results[page * step + i] = data.results[i]
								}
							}
						} else {
							// if group opened for first time

							var parentGroup = entityViewerDataService.getData(
								event.parentGroupId
							)

							var parentItemIsFirst = false

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
						}
					}

					obj.results = obj.results.map(function (item, index) {
						item.___group_name = item.___group_name ? item.___group_name : '-'
						item.___group_identifier = item.___group_identifier
							? item.___group_identifier
							: '-'

						// item.___is_activated = evDataHelper.isSelected(entityViewerDataService);

						item.___file_index = index + 1 // skip head row
						item.___parentId = obj.___id
						item.___type = 'object'
						item.___index = index
						item.___id = evRvCommonHelper.getId(item)
						item.___level = obj.___level + 1

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
					if (data.status !== 404) {
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
								// if group opened for first time

								var parentGroup = entityViewerDataService.getData(
									event.parentGroupId
								)

								var parentItemIsFirst = false

								obj = Object.assign({}, data)
								obj.___group_name = event.groupName ? event.groupName : '-'
								// obj.___group_identifier = event.groupIdentifier ? event.groupIdentifier : '-';
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

						obj.results = obj.results.map(function (item) {
							item.___parentId = obj.___id
							item.___group_name = item.___group_name ? item.___group_name : '-'
							item.___group_identifier = item.___group_identifier
								? item.___group_identifier
								: '-'

							// item.___is_activated = evDataHelper.isSelected(entityViewerDataService);

							item.___level = obj.___level + 1

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
					}
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
		// ;

		var groups = evDataService.getGroups()

		var requestParameters

		var id = evRvCommonHelper.getId(item)

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

		evDataService.setRequestParameters(requestParameters)

		return requestParameters
	}

	var recursiveRequest = function (
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
					// ;

					items = evDataHelper.getGroupsByLevel(level, evDataService)

					// ;

					var recursiveRequestPromises = []

					items.forEach(function (item) {
						// ;

						recursiveRequestPromises.push(
							recursiveRequest(
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
			rootGroup.results,
			level,
			evDataService,
			evEventService
		).then(function (data) {
			console.timeEnd('Creating Data Structure')

			return data
		})
	}

	var createDataStructure = function (evDataService, evEventService) {
		evDataService.resetData()
		evDataService.resetRequestParameters()

		var defaultRootRequestParameters =
			evDataService.getActiveRequestParameters()
		var groups = evDataService.getGroups()

		if (groups.length) {
			getGroups(
				defaultRootRequestParameters,
				evDataService,
				evEventService
			).then(function () {
				initRecursiveRequestParametersCreation(
					evDataService,
					evEventService
				).then(function () {
					evEventService.dispatchEvent(evEvents.DATA_LOAD_END)
				})
			})
		} else {
			injectRegularFilters(defaultRootRequestParameters, evDataService)

			getObjects(
				defaultRootRequestParameters,
				evDataService,
				evEventService
			).then(function () {
				evEventService.dispatchEvent(evEvents.DATA_LOAD_END)
			})
		}
	}

	var updateDataStructureByRequestParameters = function (
		requestParameters,
		evDataService,
		evEventService
	) {
		// ;

		return new Promise(function (resolve, reject) {
			injectRegularFilters(requestParameters, evDataService, evEventService)

			// ;

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

					evEventService.dispatchEvent(evEvents.DATA_LOAD_END)
				})
			}

			if (requestParameters.requestType === 'groups') {
				getGroupsByRequestParameters(
					requestParameters,
					evDataService,
					evEventService
				).then(function (data) {
					resolve(data)

					evEventService.dispatchEvent(evEvents.DATA_LOAD_END)
				})
			}
		})
	}

	var sortObjects = function (
		entityViewerDataService,
		entityViewerEventService
	) {
		var level = entityViewerDataService.getGroups().length

		var unfoldedGroups = evDataHelper.getUnfoldedGroupsByLevel(
			level,
			entityViewerDataService
		)

		var activeColumnSort = entityViewerDataService.getActiveColumnSort()

		var requestsParameters = entityViewerDataService.getAllRequestParameters()

		var requestParametersForUnfoldedGroups = []

		Object.keys(requestsParameters).forEach(function (key) {
			unfoldedGroups.forEach(function (group) {
				if (group.___id === requestsParameters[key].id) {
					requestsParameters[key].event.___id = group.___id
					requestsParameters[key].event.groupName = group.___group_name
					requestsParameters[key].event.groupId = group.___group_identifier
					requestsParameters[key].event.parentGroupId = group.___parentId

					requestParametersForUnfoldedGroups.push(requestsParameters[key])
				}
			})
		})

		requestParametersForUnfoldedGroups.forEach(function (item) {
			item.body.page = 1

			if (activeColumnSort.options.sort === 'ASC') {
				item.body.ordering = activeColumnSort.key
			} else {
				item.body.ordering = '-' + activeColumnSort.key
			}

			entityViewerDataService.setRequestParameters(item)
		})

		unfoldedGroups.forEach(function (group) {
			group.results = []

			entityViewerDataService.setData(group)
		})

		var promises = []

		requestParametersForUnfoldedGroups.forEach(function (requestParameters) {
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
		entityViewerEventService
	) {
		var activeGroupSort = entityViewerDataService.getActiveGroupTypeSort()



		var groupsTypes = entityViewerDataService.getGroups()

		var level = 0

		groupsTypes.forEach(function (item, index) {
			if (activeGroupSort.key && item.key === activeGroupSort.key) {
				level = index
			} else {
				if (activeGroupSort.id && item.id === activeGroupSort.id) {
					level = index
				}
			}
		})



		var groups = evDataHelper.getGroupsByLevel(level, entityViewerDataService)

		var requestsParameters = entityViewerDataService.getAllRequestParameters()

		var requestParametersForUnfoldedGroups = []

		Object.keys(requestsParameters).forEach(function (key) {
			groups.forEach(function (group) {
				if (group.___id === requestsParameters[key].id) {
					requestsParameters[key].event.___id = group.___id
					requestsParameters[key].event.groupName = group.___group_name
					requestsParameters[key].event.groupId = group.___group_identifier
					requestsParameters[key].event.parentGroupId = group.___parentId

					requestParametersForUnfoldedGroups.push(requestsParameters[key])
				}
			})
		})

		requestParametersForUnfoldedGroups.forEach(function (item) {
			item.body.page = 1

			item.body.groups_order = activeGroupSort.options.sort.toLocaleLowerCase()

			entityViewerDataService.setRequestParameters(item)
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

		Promise.all(promises).then(function () {
			entityViewerEventService.dispatchEvent(evEvents.DATA_LOAD_END)
		})
	}

	return {
		createDataStructure: createDataStructure,
		processData: processData,
		updateDataStructure: updateDataStructure,
		sortObjects: sortObjects,
		sortGroupType: sortGroupType,
	}
}
