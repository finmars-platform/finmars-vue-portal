/**
 * Report Viewer Data Provider Groups Service.
 * @module ReportViewerDataProviderGroupsService
 */

import filterService from './filter.service'
import sortService from './sort.service'

/**
 * Check if group already exists
 * @param {object} resultGroup - group for a check.
 * @param {object[]} result - groups that already exists
 * @return {boolean} return true if group exists
 * @memberof module:ReportViewerDataProviderGroupsService
 */
function groupAlreadyExist(resultGroup, result) {
	var exist = false

	result.forEach(function (item) {
		if (item.___group_identifier === resultGroup.___group_identifier) {
			exist = true
		}
	})

	return exist
}

/**
 * Get list of unique groups
 * @param {object[]} items - collection of items
 * @param {object} group - group type on which grouping is based
 * @return {object[]} return list of unique groups
 * @memberof module:ReportViewerDataProviderGroupsService
 */
var getUniqueGroups = function (items, group) {
	var result = []

	var resultGroup

	console.log('recon heere?')

	items.forEach(function (item) {
		resultGroup = {
			___group_name: null,
			___group_identifier: null,
			___items_count: 0,
		}

		var item_value = item[group.key]

		if (item_value !== null && item_value !== undefined && item_value !== '-') {
			resultGroup.___group_identifier = item_value.toString()
			resultGroup.___group_name = item_value.toString()
		}

		// console.log('resultGroup', resultGroup);

		if (!groupAlreadyExist(resultGroup, result)) {
			result.push(resultGroup)
		}
	})

	return result
}

/**
 * Get list of groups
 * @param {string} entityType - string value of entity name (e.g. instrument-type)
 * @param {object} options - set of specific options
 * @param {object} entityViewerDataService - global data service
 * @return {boolean} return list of groups
 * @memberof module:ReportViewerDataProviderGroupsService
 */
var getList = function (entityType, options, entityViewerDataService) {
	return new Promise(function (resolve, reject) {
		var result = {
			next: null,
			previous: null,
			count: 0,
			results: [],
		}

		var regularFilters = filterService.getRegularFilters(options)

		var groups = []

		var items = JSON.parse(
			JSON.stringify(entityViewerDataService.getReconciliationData())
		)

		if (items && items.length > 0) {
			var groupTypes = entityViewerDataService.getGroups()

			items = filterService.filterTableRows(items, regularFilters)
			items = filterService.filterByGroupsFilters(items, options, groupTypes)

			var group = options.groups_types[options.groups_types.length - 1]

			var groups = getUniqueGroups(items, group)

			// console.log('getUniqueGroups groups', groups);

			if (options.groups_order === 'desc') {
				groups = sortService.sortItems(groups, '-___group_name')
			} else {
				groups = sortService.sortItems(groups, '___group_name')
			}

			result.count = groups.length
			result.results = groups
		} else {
			result.count = 0
			result.results = []
		}

		// console.log('get groups', JSON.parse(JSON.stringify(result)));

		resolve(result)
	})
}

export default {
	getList: getList,
}
