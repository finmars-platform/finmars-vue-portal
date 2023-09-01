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

		var reportOptions = entityViewerDataService.getReportOptions()
		var globalTableSearch = entityViewerDataService.getGlobalTableSearch()

		if (
			reportOptions.hasOwnProperty('items') &&
			reportOptions.items.length > 0
		) {
			if (reportRecievedAt == null) {
				reportRecievedAt = reportOptions.recieved_at
				itemsCache = metaHelper.recursiveDeepCopy(reportOptions.items) // do we actually need it here?
				itemsCache = reportOptions.items // do we actually need it here?
			}

			if (reportRecievedAt !== reportOptions.recieved_at) {
				reportRecievedAt = reportOptions.recieved_at
				itemsCache = metaHelper.recursiveDeepCopy(reportOptions.items) // do we actually need it here?
				itemsCache = reportOptions.items
			}

			items = itemsCache.map(function (item) {
				return item
			})

			var groupTypes = entityViewerDataService.getGroups()

			// ;

			items = filterService.filterTableRows(items, regularFilters, entityType)

			items = filterService.filterByGroupsFilters(items, options, groupTypes)

			if (globalTableSearch) {
				items = filterService.filterByGlobalTableSearch(
					items,
					globalTableSearch
				)
			}

			// Victor 2021.02.08 filter by rows colors removed to rv-data.helper.js and filter flatList
			/*                const rowTypeFilters = entityViewerDataService.getRowTypeFilters();

                                if (rowTypeFilters) {

                                    items = filterService.filterByRowType(items, rowTypeFilters.markedRowFilters);

                                }*/

			// ;

			// ;
			var sortProp = options.ordering
			var activeColumnSort = entityViewerDataService.getActiveColumnSort()

			if (activeColumnSort && activeColumnSort.options.sort === 'DESC') {
				sortProp = '-' + options.ordering
			}

			if (options.ordering_mode === 'manual') {
				var key

				if (sortProp[0] === '-') {
					key = sortProp.split('-')[1]
				} else {
					key = sortProp
				}

				var columnSortData = entityViewerDataService.getColumnSortData(key)

				if (columnSortData) {
					items = sortService.sortItemsManual(items, sortProp, columnSortData)
				}
			} else {
				if (sortProp) {
					items = sortService.sortItems(items, sortProp)
				}
			}

			// ;

			result.count = items.length
			result.results = items
		} else {
			result.count = 0
			result.results = []
		}

		//

		resolve(result)
	})
}

export default {
	getList: getList,
}
