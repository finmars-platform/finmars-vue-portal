import {useGetDefaultEvRvFilterType} from "~/composables/evRv/useFilters";

/**
 *
 * @param filter {Object}
 * @param isReport {Object=}
 * @returns {Object} - changed filter
 */
const setFilterDefaultOptions = (filter, isReport) => {

	if (!filter.options) {
		filter.options = {}
	}

	if (!filter.options.filter_type) {
		filter.options.filter_type = useGetDefaultEvRvFilterType(filter.value_type);
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
 * @param filterType {string} - filter mode. E.g. 'equal', 'selector' etc.
 * @param filterOptions {Object}
 * @returns {Array} - array with filterType and emptied filterOptions
 */
export const emptyTextFilter = (filterType, filterOptions) => {

	filterOptions.filter_type = filterType;

	if (filterType === 'empty') {
		filterOptions.exclude_empty_cells = false;
	}

	filterOptions.filter_values = [];

	return [filterType, filterOptions];

};
/**
 * @param filterType {string} - filter mode.  E.g. 'equal', 'from_to' etc.
 * @param filterOptions {Object}
 * @returns {Array} - array with filterType and emptied filterOptions
 */
export const emptyNumberFilter = (filterType, filterOptions) => {

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
 */
export const emptyDateFilter = (filterType, filterOptions) => {

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

export const mapColRowsContent = (cRowsContent) => {
	return {
		id: cRowsContent, // for text multiselector
		name: cRowsContent, // for dropdownSelect
		active: false // for date tree selector
	}
};

/**
 *
 * @param dateTree {Object}
 * @returns {Array} - selected dates
 */
export const convertDatesTreeToFlatList = function (dateTree) {

	let datesList = [];

	dateTree.map(function (yearGroup) {

		yearGroup.items.map(function (monthGroup) {

			monthGroup.items.map(function (date) {

				delete date.dayNumber;
				delete date.available;

				if (date.active) {
					datesList.push(date.value);
				}

			});

		});

	});

	return datesList;

};
