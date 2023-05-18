import queryParamsHelper from '../../helpers/queryParamsHelper'

var isActiveAndValid = function (filter) {
	if (filter.options && filter.options.enabled) {
		// if filter is enabled

		var filterType = filter.options.filter_type

		if (filterType === 'empty' || filter.options.exclude_empty_cells) {
			// if filter works for empty cells

			return true
		} else if (filter.options.filter_values) {
			// if filter values can be used for filtering (not empty)

			var filterValues = filter.options.filter_values

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

// method needed to prevent removal of all rows in case of using filter with empty value but active excludeEmptyCells
var checkForEmptyRegularFilter = function (regularFilterValue, filterType) {
	// Need null's checks for filters of data type number

	if (filterType === 'from_to' || filterType === 'out_of_range') {
		if (
			(regularFilterValue.min_value || regularFilterValue.min_value === 0) &&
			(regularFilterValue.max_value || regularFilterValue.max_value === 0)
		) {
			return true
		}
	} else if (Array.isArray(regularFilterValue)) {
		if (regularFilterValue[0] || regularFilterValue[0] === 0) {
			return true
		}
	}

	return false
}

var filterTableRows = function (items, regularFilters, entityType) {
	var match

	console.log('filterTableRows.regularFilters', regularFilters)

	return items.filter(function (item, tableRowIndex) {
		match = true

		var k
		for (k = 0; k < regularFilters.length; k++) {
			var keyProperty = regularFilters[k].key
			var valueType = regularFilters[k].value_type
			var filterType = regularFilters[k].filter_type
			var excludeEmptyCells = regularFilters[k].exclude_empty_cells
			var filterValue = regularFilters[k].value

			if (keyProperty !== 'ordering') {
				if (item.hasOwnProperty(keyProperty) && item[keyProperty]) {
					// check if cell used to filter row is not empty

					/*if (entityType === 'balance-report' || entityType === 'pl-report') {
                            if (keyProperty === 'name' || keyProperty.indexOf('instrument') !== -1) {
                                if (item.item_type !== 1) { // item_type 1 == "instrument"
                                    match = false;
                                    break;
                                }
                            }
                        }*/

					if (filterType === 'empty') {
						// prevent pass of cells with values
						match = false
						break
					}

					if (checkForEmptyRegularFilter(filterValue, filterType)) {
						var valueFromTable = JSON.parse(JSON.stringify(item[keyProperty]))
						var filterArgument = JSON.parse(JSON.stringify(filterValue))

						if (valueType === 10 || valueType === 30) {
							if (filterType !== 'multiselector') {
								valueFromTable = valueFromTable.toLowerCase()
								filterArgument = filterArgument[0].toLowerCase()
							}
						}

						if (valueType === 20) {
							if (filterType !== 'from_to' && filterType !== 'out_of_range') {
								filterArgument = filterArgument[0]
							}

							// Compare position number of item with maximum allowed
							/*if (filterType === 'top_n') {
                                    valueFromTable = tableRowIndex;
                                }

                                if (filterType === 'bottom_n') {
                                    valueFromTable = tableRowIndex;
                                    filterArgument = items.length - 1 - filterArgument // calculate how much items from beginning should be skipped
                                }*/
							// < Compare position number of item with maximum allowed >
						}

						if (valueType === 40) {
							switch (filterType) {
								case 'equal':
								case 'not_equal':
									valueFromTable = new Date(valueFromTable).toDateString()
									filterArgument = new Date(filterArgument[0]).toDateString()
									break

								case 'from_to':
								case 'out_of_range':
									valueFromTable = new Date(valueFromTable)
									filterArgument.min_value = new Date(filterArgument.min_value)
									filterArgument.max_value = new Date(filterArgument.max_value)
									break

								case 'date_tree':
									valueFromTable = new Date(valueFromTable)
									// filterArgument is array of strings
									break

								default:
									valueFromTable = new Date(valueFromTable)
									filterArgument = new Date(filterArgument[0])
									break
							}
						}

						/* TODO delete as deprecated
                            if (valueType === 100) {
                               valueFromTable = valueFromTable;
                               filterArgument = filterArgument[0];
                            } */

						match = filterValueFromTable(
							valueFromTable,
							filterArgument,
							filterType
						)

						if (!match) {
							break
						}
					}
				} else {
					if (excludeEmptyCells) {
						// if user choose to hide empty cells
						match = false
						break
					} else {
						if (
							keyProperty === 'name' ||
							keyProperty.indexOf('instrument') !== -1
						) {
							if (item.item_type !== 1) {
								// item_type 1 == "instrument"
								match = false
								break
							}
						} else {
							match = true
						}
					}
				}
			}
		}

		return match
	})
}

var doesStringContainsSubstrings = function (valueToFilter, filterByString) {
	var filterSubstrings = filterByString.split(' ')

	for (var i = 0; i < filterSubstrings.length; i++) {
		var substring = filterSubstrings[i]

		if (valueToFilter.indexOf(substring) < 0) {
			return false
		}
	}

	return true
}

var filterValueFromTable = function (valueToFilter, filterBy, operationType) {
	switch (operationType) {
		case 'contains':
			/*if (valueToFilter.indexOf(filterBy) !== -1) {
                    return true;
                }*/

			if (/^".*"$/.test(filterBy)) {
				// if string inside of double quotes

				var formattedFilterBy = filterBy.replace(/^"|"$/g, '') // removing first and last double quotes

				if (valueToFilter.indexOf(formattedFilterBy) > -1) {
					return true
				}

				// } else if (valueToFilter.indexOf(filterBy) !== -1) {
				//     return true;
				// }
			} else if (doesStringContainsSubstrings(valueToFilter, filterBy)) {
				return true
			}

			break

		case 'contains_has_substring':
			if (/^".*"$/.test(filterBy)) {
				// if string inside of double quotes

				var formattedFilterBy = filterBy.replace(/^"|"$/g, '') // removing first and last double quotes

				if (valueToFilter.indexOf(formattedFilterBy) > -1) {
					return true
				}
			} else if (valueToFilter.indexOf(filterBy) !== -1) {
				return true
			}

			break

		case 'does_not_contains':
			if (valueToFilter.indexOf(filterBy) === -1) {
				return true
			}
			break

		case 'equal':
		case 'selector':
			if (valueToFilter === filterBy) {
				return true
			}
			break

		case 'not_equal':
			if (valueToFilter !== filterBy) {
				return true
			}
			break

		case 'greater':
			if (valueToFilter > filterBy) {
				return true
			}
			break

		case 'greater_equal':
			if (valueToFilter >= filterBy) {
				return true
			}
			break

		case 'less':
			if (valueToFilter < filterBy) {
				return true
			}
			break

		case 'less_equal':
			if (valueToFilter <= filterBy) {
				return true
			}

			break

		/* case 'top_n':
                if (valueToFilter < filterBy) {
                    return true;
                }
                break;

            case 'bottom_n':
                if (valueToFilter > filterBy) {
                    return true;
                }
                break; */

		case 'from_to':
			var minValue = filterBy.min_value
			var maxValue = filterBy.max_value

			if (valueToFilter >= minValue && valueToFilter <= maxValue) {
				return true
			}

			break

		case 'out_of_range':
			var minValue = filterBy.min_value
			var maxValue = filterBy.max_value

			if (valueToFilter <= minValue || valueToFilter >= maxValue) {
				return true
			}

			break

		case 'multiselector':
			if (filterBy.includes(valueToFilter)) {
				return true
			}

			break

		case 'date_tree':
			var d
			for (d = 0; d < filterBy.length; d++) {
				if (
					valueToFilter.toDateString() === new Date(filterBy[d]).toDateString()
				) {
					return true
				}
			}
			break

		default:
			return false

			break
	}
}

var getFilterMatch = function (item, key, value) {
	var item_value = item[key]
	var match = true

	if (item_value === null || item_value === undefined) {
		if (value !== '-') {
			match = false
		}
	} else {
		if (item_value.toString().toLowerCase() !== value.toLowerCase()) {
			match = false
		}
	}

	// console.log('match', match);

	return match
}

var convertNameKeyToUserCodeKey = function (key) {
	var result = key

	var pieces = key.split('.')

	var last_key
	if (pieces.length > 1) {
		last_key = pieces[pieces.length - 1]
		if (['short_name', 'name', 'public_name'].indexOf(last_key) !== -1) {
			pieces.pop()

			pieces.push('user_code')

			result = pieces.join('.')
		}
	}

	return result
}

var filterByGroupsFilters = function (items, options, groupTypes) {
	var i

	if (groupTypes.length && options.groups_values.length) {
		var match

		var key
		var converted_key
		var value

		items = items.filter(function (item) {
			match = true

			for (i = 0; i < options.groups_values.length; i = i + 1) {
				key = options.groups_types[i].key

				// console.log('key', key)

				value = options.groups_values[i]

				converted_key = convertNameKeyToUserCodeKey(key)

				match = getFilterMatch(item, converted_key, value)

				if (match === false) {
					break
				}
			}

			return match
		})
	}

	return items
}

/* const filterByRowType = function (items, color) {

        if (color === 'none') {
            return items;
        }

		var entityType = evDataService.getEntityType();
		var markedReportRows = localStorageService.getMarkedRows(true, entityType);

        const result = items.filter((item) => {

            const id = item.id;

            return markedReportRows[id] && markedReportRows[id].color === color;

        });

        return result;

    }; */

var getRegularFilters = function (options) {
	var result = {}

	if (options.hasOwnProperty('filter_settings')) {
		result = options.filter_settings
	} else {
		Object.keys(options).filter(function (key) {
			if (
				[
					'groups_order',
					'groups_types',
					'groups_values',
					'page',
					'page_size',
				].indexOf(key) === -1
			) {
				result[key] = options[key]
			}
		})
	}

	// console.log("filter getRegularFilters result", result);
	return result
}

var convertTableFiltersToRegularFilters = function (filters) {
	var result = []

	filters.forEach(function (filter) {
		if (isActiveAndValid(filter)) {
			var key = queryParamsHelper.entityPluralToSingular(filter.key)

			var filterSettings = {
				key: key,
				filter_type: filter.options.filter_type,
				exclude_empty_cells: filter.options.exclude_empty_cells,
				value_type: filter.value_type,
				value: filter.options.filter_values,
			}

			result.push(filterSettings)
		}
	})

	return result
}

var filterByGlobalTableSearch = function (items, query) {
	var match

	var keys

	var pieces = query.split(' ')

	pieces = pieces.map(function (piece) {
		return piece.toLowerCase()
	})

	items = items.filter(function (item) {
		match = false

		keys = Object.keys(item)

		keys.forEach(function (key) {
			if (item[key] !== null && item[key] !== undefined) {
				pieces.forEach(function (piece) {
					if (item[key].toString().toLowerCase().indexOf(piece) !== -1) {
						match = true
					}
				})
			}
		})

		return match
	})

	return items
}

export default {
	filterTableRows: filterTableRows,
	filterByGroupsFilters: filterByGroupsFilters,
	// filterByRowType: filterByRowType,
	getRegularFilters: getRegularFilters,
	convertTableFiltersToRegularFilters: convertTableFiltersToRegularFilters,
	filterByGlobalTableSearch: filterByGlobalTableSearch,
}
