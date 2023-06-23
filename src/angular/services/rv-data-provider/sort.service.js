import metaHelper from '../../helpers/meta.helper'

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

var sortItemsManual = function (items, property, columnSortData) {
	var result = []
	var missedItems = []

	var orderedItems = {}

	var key
	var isReverse = false

	if (property[0] === '-') {
		key = property.split('-')[1]
		isReverse = true
	} else {
		key = property
	}

	var item_value
	var manual_sort_value
	var manual_sort_order
	var matched

	for (var i = 0; i < items.length; i = i + 1) {
		item_value = items[i][key]

		if (key === '___group_name' && !item_value) {
			// when sorting groups
			item_value = '-'
		}

		matched = false

		for (var x = 0; x < columnSortData.items.length; x = x + 1) {
			manual_sort_value = columnSortData.items[x].value
			manual_sort_order = columnSortData.items[x].order

			if (item_value === manual_sort_value) {
				matched = true

				if (orderedItems[manual_sort_order]) {
					orderedItems[manual_sort_order].push(items[i])
				} else {
					orderedItems[manual_sort_order] = [items[i]]
				}
			}
		}

		if (matched === false) {
			missedItems.push(items[i])
		}
	}

	var orderNumsList = Object.keys(orderedItems).sort()

	orderNumsList.forEach(function (orderKey) {
		result.push(...orderedItems[orderKey])
	})

	missedItems = metaHelper.textWithDashSort(missedItems, key)

	result = result.concat(missedItems)

	if (isReverse) {
		result = result.reverse()
	}

	return result
}

export default {
	sortItems: sortItems,
	sortItemsManual: sortItemsManual,
}
