import stringHelper from './stringHelper'

var _getParent = function (parentId, evDataService, results) {
	var item = evDataService.getData(parentId)

	results.push(item)

	if (item.___parentId !== null) {
		_getParent(item.___parentId, evDataService, results)
	}

	return results
}

var getParents = function (parentId, evDataService) {
	var results = []

	results = _getParent(parentId, evDataService, results)

	return results
}

var getId = function (item) {
	var pattern
	var entityViewerData

	if (item.___type === 'group' || item.___type === 'placeholder_group') {
		pattern = [
			item.___parentId,
			item.___group_type_key,
			item.___group_name,
			item.___group_identifier,
		].join('')
	}

	if (item.___type === 'object' || item.___type === 'placeholder_object') {
		pattern = [item.___parentId, item.id].join('')
	}

	if (item.___type === 'subtotal') {
		if (item.___subtotal_subtype) {
			pattern = [
				item.___parentId,
				item.___type +
					'_' +
					item.___subtotal_type +
					'_' +
					item.___subtotal_subtype,
			].join('')

			// console.log('pattern', pattern);
		} else {
			pattern = [
				item.___parentId,
				item.___type + '_' + item.___subtotal_type,
			].join('')
		}
	}

	if (item.___type === 'blankline') {
		pattern = [
			item.___parentId,
			item.___type + '_' + item.___blankline_type,
		].join('')
	}

	if (item.___type === 'control') {
		pattern = [item.___parentId, item.___type].join('')
	}

	return stringHelper.toHash(pattern)
}

var isFilterValid = function (filterObj) {
	if (filterObj.options && filterObj.options.enabled) {
		// if filter is enabled

		var filterType = filterObj.options.filter_type

		if (filterType === 'empty' || filterObj.options.exclude_empty_cells) {
			// if filter works for empty cells

			return true
		} else if (filterObj.options.filter_values) {
			// if filter values can be used for filtering (not empty)

			var filterValues = filterObj.options.filter_values

			if (filterType === 'from_to' || filterType === 'out_of_range') {
				if (
					(filterValues.min_value || filterValues.min_value === 0) &&
					(filterValues.max_value || filterValues.max_value === 0)
				) {
					return true
				}
			} else if (Array.isArray(filterValues)) {
				if (filterValues[0] || filterValues[0] === 0) {
					return true
				}
			}
		}
	}

	return false
}

export default {
	getId: getId,
	getParents: getParents,

	isFilterValid: isFilterValid,
}
