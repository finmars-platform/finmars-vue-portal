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

export const computeInputsForWatcher = function (inputs, component) {

	const matchingInputs = inputs.filter( input => input.component_id === component.uid )

	let obj = {}

	matchingInputs.forEach(input => {
		obj[input.propertyName] = {
			value_type: input.value_type,
			value: input.__val,
		}
	})

	return obj;

}
