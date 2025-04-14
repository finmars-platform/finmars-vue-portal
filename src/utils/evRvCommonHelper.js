export function isFilterValid(filterObj) {
	if (!(filterObj.options && filterObj.options.enabled)) return false;

	const { filter_type, filter_values } = filterObj.options;

	if (filter_type === 'empty') return true;

	if (!filter_values) return false;

	if (['from_to', 'out_of_range'].includes(filter_type)) {
		return (
			(filter_values.min_value || filter_values.min_value === 0) &&
			(filter_values.max_value || filter_values.max_value === 0)
		);
	}

	return Array.isArray(filter_values) ? filter_values[0] || filter_values[0] === 0 : false;
}
