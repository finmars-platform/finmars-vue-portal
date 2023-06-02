function orderSort(property, sortOrder) {
	return function (a, b) {
		if (a[property] === null || a[property] === undefined) {
			return 1 * sortOrder
		}
		if (b[property] === null || b[property] === undefined) {
			return -1 * sortOrder
		}

		if (a[property] < b[property]) {
			return -1 * sortOrder
		}

		if (a[property] > b[property]) {
			return 1 * sortOrder
		}
	}
}

var sortItems = function (items, property) {
	var sortOrder = 1
	if (property[0] === '-') {
		sortOrder = -1
		property = property.substr(1)
	}

	return items.sort(orderSort(property, sortOrder))
}

export default {
	sortItems: sortItems,
}
