import get from 'lodash/get';
import size from 'lodash/size';
import isEmpty from 'lodash/isEmpty';
import { ITEM_PER_PAGE } from './constants';

export function prepareTableDataRequestOptions({
	currentLayout = {},
	groupIndex,
	groupValues = [],
	page = 1,
	pageSize = ITEM_PER_PAGE
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
			// globalTableSearch: '',
			groups_values: groupValues
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

function processItem(arr = [], item) {
	if (!item.children) return arr;

	arr.push({
		___group_identifier: item.___group_identifier,
		___group_type_key: item.___group_type_key,
		is_open: item.is_open,
		parents: item.parents,
		totalChildren: item.totalChildren,
		childrenLoaded: size(item.children)
	});

	if (isEmpty(item.children)) return arr;

	return Object.values(item.children).reduce((res, i) => {
		return processItem(res, i);
	}, arr);
}

export function prepareFlatListOfGroupRows(tableData) {
	return Object.values(tableData?.children || {}).reduce((res, item) => {
		return processItem(res, item);
	}, []);
}

export function calculatePageNumberForRequest({
	totalItems = 0,
	currentItemsCount = 0,
	pageSize = ITEM_PER_PAGE
}) {
	const currentPage = Math.floor(currentItemsCount / pageSize);
	const totalPages = Math.ceil(totalItems / pageSize);
	return Math.min(currentPage + 1, totalPages);
}
