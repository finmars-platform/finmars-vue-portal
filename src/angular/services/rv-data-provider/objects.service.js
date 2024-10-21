import filterService from './filter.service'
import sortService from './sort.service'
import metaHelper from '../../helpers/meta.helper'

export default function (entityResolverService) {

	/*var reportRecievedAt = null
	var items = []
	var itemsCache = []

	var reportRecievedAt = null;
	var items = [];
	var itemsCache = [];*/

	var getBackendList = function (options, entityViewerDataService) {

		var entityType = entityViewerDataService.getEntityType();
		var reportOptions = entityViewerDataService.getReportOptions();
		var globalTableSearch = entityViewerDataService.getGlobalTableSearch();
		var activeColumnSort = entityViewerDataService.getActiveColumnSort();
		console.log("getBackendList!", reportOptions)

		reportOptions.filters = entityViewerDataService.getFilters(); // for transaction report only

		reportOptions.frontend_request_options = options
		reportOptions.frontend_request_options['columns'] = entityViewerDataService.getColumns() // used for subtotals in groups, but not used for rows
		reportOptions.frontend_request_options['globalTableSearch'] = globalTableSearch

		console.log('getBackendList.activeColumnSort', activeColumnSort);

		if (activeColumnSort && activeColumnSort.options && activeColumnSort.options.sort) {
			reportOptions.frontend_request_options['items_order'] = activeColumnSort.options.sort.toLowerCase();
			reportOptions.frontend_request_options['ordering'] = activeColumnSort.key;
		}

		if (!reportOptions.frontend_request_options['filter_settings']) {

			var filters = entityViewerDataService.getFilters();

			reportOptions.frontend_request_options['filter_settings'] = []

			filters.forEach(function (item) {

				if (evRvCommonHelper.isFilterValid(item)) {

					var key = queryParamsHelper.entityPluralToSingular(item.key);

					var filterSettings = {
						key: key,
						filter_type: item.options.filter_type,
						// exclude_empty_cells: item.options.exclude_empty_cells,
						value_type: item.value_type,
						value: item.options.filter_values
					};

					reportOptions.frontend_request_options['filter_settings'].push(filterSettings);

				}

			});


		}

		return entityResolverService.getListReportItems(entityType, reportOptions).then(function (data) {

			console.log('getListReportGroups.data.items', data.items);

			// Important, needs to optimize backend reports
			// report_instance_id is saved report, so no need to recalcualte whole report
			// just regroup or refilter
			// to reset report_instance_id, just set it to null
			reportOptions.report_instance_id = data.report_instance_id;
			entityViewerDataService.setReportOptions(reportOptions);


			var result = {
				next: null,
				previous: null,
				count: data.items.length,
				results: JSON.parse(JSON.stringify(data.items))
			};

			return result

		})

	}

	/*var getFrontendList = function (entityType, options, entityViewerDataService) {

		return new Promise(function (resolve, reject) {

			var result = {
				next: null,
				previous: null,
				count: 0,
				results: []
			};

			var regularFilters = filterService.getRegularFilters(options);

			var reportOptions = entityViewerDataService.getReportOptions();
			var globalTableSearch = entityViewerDataService.getGlobalTableSearch();

			if (reportOptions.hasOwnProperty("items") && reportOptions.items.length > 0) {

				if (reportRecievedAt == null) {
					reportRecievedAt = reportOptions.recieved_at;
					itemsCache = metaHelper.recursiveDeepCopy(reportOptions.items); // do we actually need it here?
					itemsCache = reportOptions.items; // do we actually need it here?
				}

				if (reportRecievedAt !== reportOptions.recieved_at) {
					reportRecievedAt = reportOptions.recieved_at;
					itemsCache = metaHelper.recursiveDeepCopy(reportOptions.items);  // do we actually need it here?
					itemsCache = reportOptions.items;
				}


				items = itemsCache.map(function (item) {
					return item
				});


				var groupTypes = entityViewerDataService.getGroups();

				// console.log('globalTableSearch', globalTableSearch);

				items = filterService.filterTableRows(items, regularFilters, entityType);

				items = filterService.filterByGroupsFilters(items, options, groupTypes);

				if (globalTableSearch) {
					items = filterService.filterByGlobalTableSearch(items, globalTableSearch)
				}

				// Victor 2021.02.08 filter by rows colors removed to rv-data.helper.js and filter flatList
				/!*                const rowTypeFilters = entityViewerDataService.getRowTypeFilters();

                                if (rowTypeFilters) {

                                    items = filterService.filterByRowType(items, rowTypeFilters.markedRowFilters);

                                }*!/

				// console.log('groups filters length', items.length);

				// console.log('objectService.getList.options', options);
				var sortProp = options.ordering;
				var activeColumnSort = entityViewerDataService.getActiveColumnSort();

				if (activeColumnSort && activeColumnSort.options.sort === 'DESC') {
					sortProp = '-' + options.ordering;
				}

				if (options.ordering_mode === 'manual') {

					var key;

					if (sortProp[0] === '-') {
						key = sortProp.split('-')[1];
					} else {
						key = sortProp;
					}

					var columnSortData = entityViewerDataService.getColumnSortData(key)

					if (columnSortData) {

						items = sortService.sortItemsManual(items, sortProp, columnSortData);

					}

				} else {

					if (sortProp) {
						items = sortService.sortItems(items, sortProp);
					}
				}

				// console.log('sorted items, ', items);

				result.count = items.length;
				result.results = items;
			} else {
				result.count = 0;
				result.results = [];
			}

			// console.log('objectService.getList.result', result)

			resolve(result);

		});

	}*/

	var getList = function (options, entityViewerDataService) {

		return getBackendList(options, entityViewerDataService)
		// Frontend is deprecated since 2023-09-10
		// if (window.location.href.indexOf('v2=true') !== -1) {
		//     return getBackendList(entityType, options, entityViewerDataService)
		// } else {
		//     return getFrontendList(entityType, options, entityViewerDataService)
		// }

	};

	return {
		getList: getList
	}

}
