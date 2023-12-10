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
