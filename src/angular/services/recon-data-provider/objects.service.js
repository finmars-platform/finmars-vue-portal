import filterService from './filter.service'
import sortService from './sort.service'
import metaHelper from '../../helpers/meta.helper'

var reportRecievedAt = null
var items = []
var itemsCache = []

var getList = function (entityType, options, entityViewerDataService) {
	return new Promise(function (resolve, reject) {
		var result = {
			next: null,
			previous: null,
			count: 0,
			results: [],
		}

		var regularFilters = filterService.getRegularFilters(options)

		var items = JSON.parse(
			JSON.stringify(entityViewerDataService.getReconciliationData())
		)

		if (items && items.length > 0) {
			var groupTypes = entityViewerDataService.getGroups()

			items = filterService.filterTableRows(items, regularFilters)

			items = filterService.filterByGroupsFilters(items, options, groupTypes)

			if (options.ordering) {
				items = sortService.sortItems(items, options.ordering)
			}

			result.count = items.length
			result.results = items
		} else {
			result.count = 0
			result.results = []
		}

		console.log('ReconDataProvider.Objects.getList', result)

		resolve(result)
	})
}

export default {
	getList: getList,
}
