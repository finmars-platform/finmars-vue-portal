import get from 'lodash/get';

const itemsPerPage = 40;

export function prepareTableDataRequestOptions({
	currentLayout = {},
	group,
	groupValues = [],
	page = 1,
	pageSize = itemsPerPage
}) {
	const options = {
		columns: get(currentLayout.value, ['data', 'columns'], []),
		filter_settings: get(currentLayout.value, ['data', 'filters'], []).map((item) => ({
			key: item.key,
			filter_type: item.options.filter_type,
			value_type: item.value_type,
			value: item.options.filter_values
		})),
		globalTableSearch: '',
		page,
		page_size: pageSize
	};

	const groups = get(currentLayout, ['data', 'grouping'], []);
	const groupIndex = groups.findIndex((gr) => gr.key === group?.key);
	if (group && groupIndex > -1) {
		// TODO
	}

	if (groupIndex === -1 || !group) {
		return {
			...options,
			groups_types: groups,
			groupValues
		};
	}
}
