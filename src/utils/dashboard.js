import * as entityReportViewers from './entityReportViewers';

/** Copying layout removing use from above filters */
export const copyRvLayoutForDashboard = function (layout) {

	if (typeof layout === 'string') {
		layout = JSON.parse(layout);

	} else {
		layout = structuredClone(layout);
	}

	layout.id = null;
	// removing use from above filters
	layout.data.filters = layout.data.filters.filter(filter => {

		return !filter.options?.use_from_above ||
			!Object.keys(filter.options.use_from_above).length;

	});

	return JSON.stringify(layout, null, 4);

}

export const updateReportOptionsWithDashInputs = function (input, evDataService) {

	let ro = evDataService.getReportOptions();

	const prop = input.key.slice(15); // e.g. portfolios, pricing_policy etc

	let inputVal = input.__val;

	if ( Array.isArray( ro[prop] ) ) {

		if ( !Array.isArray(input.__val) ) {
			inputVal = [input.__val];
		}

	} else if ( Array.isArray(input.__val) ) { // report options' property is not multi selector but value of input is an array

		inputVal = input.__val[0];

	}

	ro[prop] = inputVal;

	// evDataService.setReportOptions(ro);
	return ro;

}

export const updateFiltersWithDashInputs = function (input, evDataService) {

	let filters = evDataService.getFilters();
	let filterForInput = filters.find(filter => filter.key === input.key);

	/*if (filterForInput.value_type === input.value_type) {

		filterForInput.options.filter_values = [input.__value];

		vmE.evDataService.setFilters(filters);
		filtersChanged = true;

	} else {
		console.warn("Can not link properties with different value_type")
	}*/
	filterForInput.options.filter_values = [input.__val];

	return filters;

}

/**
 *
 * @param {Array} inputs - inputs of dashboard's component
 * @param {String} contentType
 * @param {Object} evDataService
 * @param evAttrsStore
 * @return {Array} - filters after adding filters for linked inputs
 */
export const formatFiltersForDashInputs = function (inputs, contentType, evDataService, evAttrsStore) {

	let notReportOptionsInputs = inputs.filter( input => !input.key.startsWith('reportOptions__' ) );

	let filtersList = evDataService.getFilters();
	const attrsList = evAttrsStore.getAllAttributesByContentType(contentType);

	notReportOptionsInputs.forEach(input => {

		let filterForInput = filtersList.find(filter => filter.key === input.key);

		if (!filterForInput) {

			const attr = attrsList.find(attr => attr.key === input.key);

			const filter = entityReportViewers.getEvRvAttrInFormOf('filter', attr);
			filter.options.filter_type = 'equal';
			filter.options.enabled = true;

			filtersList.push(filter);

		} else {
			filterForInput.options.filter_type = 'equal';
		}

	})

	return filtersList;

}
