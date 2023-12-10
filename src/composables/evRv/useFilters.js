export const useGetDefaultEvRvFilterType = (valueType) => {
	const defaultTextFilterType = 'contains'
	const defaultNumberAndDateFilterType = 'equal'

	return [10, 30, 'field'].includes(valueType)
		? defaultTextFilterType
		: defaultNumberAndDateFilterType
}

/**
 *
 * @param filter {Object}
 * @param isReport {Object=}
 * @returns {Object} - changed filter
 * @memberof gFiltersHelper
 */
export const useSetEvRvFilterDefaultOptions = (filter, isReport) => {

	if (!filter.options) {
		filter.options = {}
	}

	if (!filter.options.filter_type) {
		filter.options.filter_type = metaHelper.getDefaultFilterType(filter.value_type);
	}

	if (!filter.options.filter_values) {
		filter.options.filter_values = []
	}

	if (!filter.options.hasOwnProperty('exclude_empty_cells')) {
		filter.options.exclude_empty_cells = false;
	}

	if (isReport) {

		if (!filter.options.use_from_above) {
			filter.options.use_from_above = {}
		}

	}

	return filter;

};
/**
 *
 * @param filterType {string} - filter mode
 * @param filterOptions {Object}
 * @returns {Array} - array with filterType and emptied filterOptions
 * @memberof gFiltersHelper
 */
export const useEmptyEvRvTextFilter = (filterType, filterOptions) => {

	filterOptions.filter_type = filterType;

	if (filterType === 'empty') {
		filterOptions.exclude_empty_cells = false;
	}

	filterOptions.filter_values = [];

	return [filterType, filterOptions];

};
/**
 * @param filterType {string} - filter mode
 * @param filterOptions {Object}
 * @returns {Array} - array with filterType and emptied filterOptions
 * @memberof gFiltersHelper
 */
export const useEmptyEvRvNumberFilter = (filterType, filterOptions) => {

	filterOptions.filter_type = filterType;

	if (filterType === 'from_to' || filterType === 'out_of_range') {

		filterOptions.filter_values = {}

	} else {

		if (filterType === 'empty') {
			filterOptions.exclude_empty_cells = false;
		}

		filterOptions.filter_values = [];

	}

	return [filterType, filterOptions];

};
/**
 * @param filterType {string} - filter mode
 * @param filterOptions {Object}
 * @returns {Array} - array with filterType and emptied filterOptions
 * @memberof gFiltersHelper
 */
export const useEmptyEvRvDateFilter = (filterType, filterOptions) => {

	filterOptions.filter_type = filterType;

	if (filterType === 'date_tree') {
		filterOptions.dates_tree = [];

	}
	else if (filterType === 'from_to' || filterType === 'out_of_range') {

		filterOptions.filter_values = {}

	} else {

		if (filterType === 'empty') {
			filterOptions.exclude_empty_cells = false;
		}

		filterOptions.filter_values = [];

	}

	return [filterType, filterOptions];

};
/**
 * Returns useFromAboveFilters without changing original array.
 *
 * @param filters {Array<Object>} - from entityViewerDataService
 * @returns {Array}
 * @memberof gFiltersHelper
 */
export const useFilterUseFromAboveFilters = function (filters) {

	console.log('filterUseFromAboveFilters.filters', filters)

	return filters.filter((filter, index) => {

		if (filter.options && filter.options.use_from_above && Object.keys(filter.options.use_from_above).length) {

			filter.filtersListIndex = index;
			return true;

		}

		return false;

	});

};
export const useInsertActObjIntoEvRvFilters = function (evDataService, evEventService) {

	let filtersChangedFromAbove = false;

	let filters = evDataService.getFilters();

	let useFromAboveFilters = filterUseFromAboveFilters(filters);
	const activeObjectFromAbove = evDataService.getActiveObjectFromAbove();

	console.log('insertActiveObjectDataIntoFilters.useFromAboveFilters', useFromAboveFilters)
	console.log('insertActiveObjectDataIntoFilters.activeObjectFromAbove', activeObjectFromAbove)

	useFromAboveFilters.forEach(ufaFilter => {

		let filter = filters[ufaFilter.filtersListIndex];
		let key = filter.options.use_from_above; // for old layouts

		if (typeof filter.options.use_from_above === 'object') {
			key = filter.options.use_from_above.key;
		}

		if (activeObjectFromAbove && typeof activeObjectFromAbove === 'object') {

			var value = activeObjectFromAbove[key];
			filter.options.filter_values = [value]; // example value 'Bank 1 Notes 4% USD'

			filtersChangedFromAbove = true;

		}

	});

	if (filtersChangedFromAbove) {

		evDataService.setFilters(filters);

		var entityType = evDataService.getEntityType()

		evEventService.dispatchEvent(evEvents.UPDATE_TABLE);

		// Deprecated, now everything is on backend
		// if (entityType === 'transaction-report') {
		// 	// special logic, for heavy transaction report
		// 	// backend filters enabled
		//
		// 	evEventService.dispatchEvent(evEvents.REQUEST_REPORT);
		// } else {
		// 	evEventService.dispatchEvent(evEvents.UPDATE_TABLE);
		// }

	}

	return filtersChangedFromAbove;

};
/**
 *
 * @param useFromAboveDialogPromise {Promise} - response of dialog window with use from above settings
 * @param filterOptions {Object}
 * @returns {Promise<Array>} - array with filterType and emptied filterOptions
 * @memberof gFiltersHelper
 */
export const useOpenUseFromAboveSettings = function (useFromAboveDialogPromise, filterOptions) {

	return new Promise ((resolve, reject) => {

		useFromAboveDialogPromise.then(filterData => {

			let activeFilterType = filterData.options.filter_type;

			if (filterData.options.use_from_above &&
				Object.keys(filterData.options.use_from_above).length) {

				activeFilterType = 'use_from_above';

			}

			resolve([activeFilterType, filterData.options]);

		});

	});

};
/**
 *
 * @param dateTree {Object}
 * @returns {Array} - selected dates
 */
export const useConvertDatesTreeToFlatList = function (dateTree) {

	var datesList = [];

	dateTree.map(function (yearGroup) {

		yearGroup.items.map(function (monthGroup) {

			monthGroup.items.map(function (date) {

				delete date.dayNumber;
				delete date.available;

				date = JSON.parse(angular.toJson(date));

				if (date.active) {
					datesList.push(date.value);
				}

			});

		});

	});

	return datesList;

};

/**
 * @param {Object} filter
 * @returns {Boolean} - `true` if filter is use from above filter, otherwise `false`
 */
export const useIsFilterUseFromAbove = filter => {
	return !!(filter.options.use_from_above &&
		Object.keys(filter.options.use_from_above).length);
}
