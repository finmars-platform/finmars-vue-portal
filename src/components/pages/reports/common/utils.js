import get from 'lodash/get';
import size from 'lodash/size';

const itemsPerPage = 40;

export function prepareTableDataRequestOptions({
	currentLayout = {},
	groupIndex,
	groupValues = [],
	page = 1,
	pageSize = itemsPerPage
}) {
	const options = {
		frontend_request_options: {
			columns: get(currentLayout.value, ['data', 'columns'], []),
			filter_settings: get(currentLayout.value, ['data', 'filters'], []).map((item) => ({
				key: item.key,
				filter_type: item.options.filter_type,
				value_type: item.value_type,
				value: item.options.filter_values
			})),
			globalTableSearch: '',
			group_values: groupValues
		},
		page,
		page_size: pageSize
	};

	const groups = get(currentLayout, ['data', 'grouping'], []);
	console.log('GR SIZE => ', size(groups));
	options.frontend_request_options.groups_types =
		size(groups) > 0 ? groups.slice(0, groupIndex + 2) : [];

	return options;
}
