/**
 * Module contains different useful functions
 * @module UtilsHelper
 */

// import metaHelper from './meta.helper';

function debounce(func, wait, immediate) {
	var timeout
	return function () {
		var context = this,
			args = arguments
		var later = function () {
			timeout = null
			if (!immediate) func.apply(context, args)
		}
		var callNow = immediate && !timeout
		clearTimeout(timeout)
		timeout = setTimeout(later, wait)
		if (callNow) func.apply(context, args)
	}
}

/* function throttle(fn, wait) {
        var time = Date.now();
        return function () {
            if ((time + wait - Date.now()) < 0) {
                fn();
                time = Date.now();
            }
        }
    } */
/**
 *
 * @param fn {Function}
 * @param wait {number} - milliseconds to wait
 * @param [options] {Object}
 * @param {boolean} [options.trailing=true] - execute fn on its last call after wait time
 * @returns {(function(): void)|*}
 */
function throttle(fn, wait, options) {
	var time = Date.now()
	var timeout = null
	options = options || {}

	return function () {
		var waitRemains = time + wait - Date.now()

		if (waitRemains < 0) {
			if (timeout) {
				clearTimeout(timeout)
				timeout = null
			}
			fn()
			time = Date.now()
		} else if (options.trailing !== false && !timeout && waitRemains > 0) {
			timeout = setTimeout(function () {
				timeout = null
				fn()
				time = Date.now()
			}, waitRemains)
		}
	}
}

function floor10(value, exp) {
	return decimalAdjust('floor', value, exp)
}

function flattenTree(root, key) {
	var flatten = [Object.assign({}, root)]
	// delete flatten[0][key];

	if (root[key] && root[key].length > 0) {
		return flatten.concat(
			root[key]
				.map(function (child) {
					return flattenTree(child, key)
				})
				.reduce(function (a, b) {
					return a.concat(b)
				}, [])
		)
	}

	return flatten
}

function insertItemInNode(list, map, node, data) {
	var index = 0

	data[node.___parentId].results.forEach(function (item, i) {
		if (item && item.___id === node.___id) {
			index = i
		}
	})

	list[map[node.___parentId]].results[index] = node
}

function convertToTree(data, rootGroup, optimize) {
	var list = []

	var dataOrderReference = {} // Only need for keep tracking on original item index
	var referenceItem

	Object.keys(data).forEach(function (key) {
		dataOrderReference[key] = {
			results: [],
		}

		if (data[key].results) {
			data[key].results.forEach(function (item) {
				referenceItem = { ___id: item.___id }

				dataOrderReference[key].results.push(referenceItem)
			})
		}
	})

	rootGroup.results.forEach(function (item) {
		if (!data[item.___id]) {
			if (item.___type === 'group' || item.___type === 'placeholder_group') {
				data[item.___id] = item
			}
		}
	})

	var originalKeys = Object.keys(data)

	originalKeys.forEach(function (key) {
		if (
			data[key].___type === 'group' ||
			data[key].___type === 'placeholder_group'
		) {
			if (data[key].hasOwnProperty('results')) {
				data[key].results.forEach(function (item) {
					if (!data[item.___id]) {
						data[item.___id] = item
					}
				})
			}
		}
	})

	var extendedKeys = Object.keys(data)

	//
	// performance update
	extendedKeys.forEach(function (key) {
		if (optimize) {
			// minimal amount of meta-fields (some issues will occur in Entity Viewer if remove them)
			list.push({
				___id: data[key].___id,
				___parentId: data[key].___parentId,
				___level: data[key].___level,
				___type: data[key].___type,
				___subtotal_type: data[key].___subtotal_type,
				___items_count: data[key].___items_count,
				___group_name: data[key].___group_name,
				___is_open: data[key].___is_open,
				___is_selected: data[key].___is_selected,
				___has_selected_child: data[key].___has_selected_child,
				___group_identifier: data[key].___group_identifier,
			})
		} else {
			list.push(data[key])
		}
	})

	var map = {},
		node,
		roots = [],
		i
	for (i = 0; i < extendedKeys.length; i += 1) {
		map[list[i].___id] = i
		list[i].results = []
	}
	for (i = 0; i < list.length; i += 1) {
		node = list[i]

		if (node.___parentId !== null) {
			if (node.___type === 'group' || node.___type === 'placeholder_group') {
				insertItemInNode(list, map, node, dataOrderReference)
			}

			if (
				node.___type === 'object' ||
				node.___type === 'placeholder_object' ||
				node.___type === 'control'
			) {
				list[map[node.___parentId]].results.push(node)
			}

			if (node.___type === 'blankline' && node.___blankline_type === 'area') {
				list[map[node.___parentId]].results.push(node)
			}

			if (
				node.___type === 'subtotal' &&
				node.___subtotal_type === 'proxyline'
			) {
				list[map[node.___parentId]].results.unshift(node)
			}

			if (node.___type === 'subtotal' && node.___subtotal_type === 'line') {
				list[map[node.___parentId]].results.unshift(node)
			}

			if (node.___type === 'subtotal' && node.___subtotal_type === 'area') {
				list[map[node.___parentId]].results.push(node)
			}

			if (node.___type === 'subtotal' && node.___subtotal_type === 'arealine') {
				if (node.___subtotal_subtype === 'line') {
					list[map[node.___parentId]].results.unshift(node)
				}

				if (node.___subtotal_subtype === 'area') {
					list[map[node.___parentId]].results.push(node)
				}
			}
		} else {
			roots.push(node)
		}
	}

	return roots[0]
}

function convertTreeToList(tree) {
	return flattenTree(tree, 'results')
}

function fillListWithData(list, data) {
	// ;

	list = list.map(function (item) {
		return data[item.___id]
	})

	return list
}

function toNextLevel(item, result) {
	if (item.hasOwnProperty('results')) {
		result[item.___id] = item

		item.results.forEach(function (child) {
			toNextLevel(child, result)
		})
	}
}

function convertTreeToTreeList(tree) {
	var resultAsObj = {}
	var result = []

	toNextLevel(tree, resultAsObj)

	// ;

	Object.keys(resultAsObj).forEach(function (key) {
		result.push(resultAsObj[key])
	})

	// ;

	return result
}

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

const sortItems = function (items, property) {
	var sortOrder = 1
	if (property[0] === '-') {
		sortOrder = -1
		property = property.substr(1)
	}

	return items.sort(orderSort(property, sortOrder))
}

// comparator for orderBy which set empty item last
const emptyLastComparator = (v1, v2) => {
	// If we don't get strings, just compare by index
	if (v1.type !== 'string' || v2.type !== 'string') {
		return v1.index < v2.index ? -1 : 1
	}

	if (v1.value === '') {
		return 1
	}

	if (v2.value === '') {
		return -1
	}

	return v1.value.toLowerCase() < v2.value.toLowerCase() ? -1 : 1
}

export default {
	floor10: floor10,
	debounce: debounce,
	throttle: throttle,
	convertToTree: convertToTree,
	convertTreeToList: convertTreeToList,
	fillListWithData: fillListWithData,
	convertTreeToTreeList: convertTreeToTreeList,

	sortItems: sortItems,
	emptyLastComparator: emptyLastComparator,
}
