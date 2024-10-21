import evRvCommonHelper from '../../helpers/ev-rv-common.helper'
/**
 *
 * @param groupItem {Object} - data of group from table
 * @param groupsList {Array<Object>} - array of groups from entityViewerDataService
 * @returns {Object}
 */
var getGroupDataForFiltering = function (groupItem, groupsList) {
	var formattedGroupItem = { ___type: 'group' }

	var groupIndex = groupItem.___level - 1
	var groupData = groupsList[groupIndex]

	formattedGroupItem[groupData['key']] = groupItem.___group_name

	return formattedGroupItem
}

/**
 * Needed to prevent removal of all rows in case of using filter with empty value but active excludeEmptyCells
 *
 * @param regularFilterValue {Object|Array}
 * @param filterType {string}
 * @returns {boolean}
 */
var filterValueIsNotEmpty = function (regularFilterValue, filterType) {
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

var filterTableItem = function (item, regularFilters) {
	var rf

	for (rf = 0; rf < regularFilters.length; rf++) {
		var keyProperty = regularFilters[rf].key
		var valueType = regularFilters[rf].value_type
		var filterType = regularFilters[rf].filter_type
		// var excludeEmptyCells = regularFilters[rf].exclude_empty_cells
		var filterValue = regularFilters[rf].value

		if (keyProperty === 'ordering') {
			return true
		}

		var valueFromTable = null

		//region Get valueFromTable for dynamic attribute
		if (item.___type !== 'group' && keyProperty.startsWith('attributes.')) {
			var dynamicAttrKey = keyProperty.slice(11) // slice off '.attributes'

			for (var da = 0; da < item.attributes.length; da++) {
				var dynamicAttributeData = item.attributes[da]

				if (
					dynamicAttributeData.attribute_type_object.user_code ===
					dynamicAttrKey
				) {
					if (dynamicAttributeData.attribute_type_object.value_type === 30) {
						if (dynamicAttributeData.classifier_object) {
							valueFromTable = JSON.parse(
								JSON.stringify(dynamicAttributeData.classifier_object.name)
							)
						} else {
							valueFromTable = ''
						}

						break
					} else {
						switch (valueType) {
							case 10:
								valueFromTable = JSON.parse(
									JSON.stringify(dynamicAttributeData.value_string)
								)
								break
							case 20:
								valueFromTable = JSON.parse(
									JSON.stringify(dynamicAttributeData.value_float)
								)
								break
							case 40:
								valueFromTable = JSON.parse(
									JSON.stringify(dynamicAttributeData.value_date)
								)
								break
						}

						break
					}
				}
			}
		}
		//endregion

		if (
			(item.hasOwnProperty(keyProperty) && item[keyProperty]) ||
			valueFromTable
		) {
			// check whether attribute value is empty

			if (filterType === 'empty') {
				// prevents pass of cells with values
				return false
			}

			if (filterValueIsNotEmpty(filterValue, filterType)) {
				var filterArgument = JSON.parse(JSON.stringify(filterValue))

				if (valueType === 'field' && item.___type !== 'group') {
					// Find value for relation field

					var relationFieldData = item[keyProperty + '_object']

					if (relationFieldData.name) {
						valueFromTable = JSON.parse(
							JSON.stringify(relationFieldData.short_name)
						)
					} else if (keyProperty === 'price_download_scheme') {
						valueFromTable = JSON.parse(
							JSON.stringify(relationFieldData.user_code)
						)
					}

					/*if (relationFieldData.display_name) {
                            valueFromTable = JSON.parse(JSON.stringify(relationFieldData.display_name));
                        } else {
                            valueFromTable = JSON.parse(JSON.stringify(relationFieldData.name));
                        }*/
				} else if (!valueFromTable) {
					valueFromTable = JSON.parse(JSON.stringify(item[keyProperty]))
				}

				if (valueType === 10 || valueType === 30 || valueType === 'field') {
					if (filterType !== 'multiselector') {
						valueFromTable = valueFromTable.toLowerCase()
						filterArgument = filterArgument[0].toLowerCase()
					}
				} else if (valueType === 20) {
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
				} else if (valueType === 40) {
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
				} else if (valueType === 50) {
					if (filterArgument[0]) {
						if (filterArgument[0] === 'False') {
							filterArgument = false
						} else {
							filterArgument = true
						}
					}
				}

				var passes = filterValueFromTable(
					valueFromTable,
					filterArgument,
					filterType
				)

				if (!passes) return false
			}
		} else {
			// attribute value is empty

			// var hideEmptyCells = excludeEmptyCells && item.___type !== 'group'
			var hideEmptyCells = item.___type !== 'group'

			if (hideEmptyCells) return false
		}
	}

	return true
}

var filterTableRows = function (flatList, regularFilters, groupsList) {
	// var filteredOutGroupsIds = [];
	var match

	return flatList.filter(function (flItem) {
		match = true

		var item = flItem
		// var useFilterExprs = true;

		/* if (flItem.___parentId && filteredOutGroupsIds.includes(flItem.___parentId)) { // if item is a part of filtered out group

                useFilterExprs = false;
                match = false;

            } else {

                if (flItem.___type === 'group') {

                    item = getGroupDataForFiltering(flItem, groupsList);

                } else if (flItem.___type === 'control') {

                    useFilterExprs = false;

                }

            } */
		if (flItem.___type === 'group') {
			item = getGroupDataForFiltering(flItem, groupsList)
		} else if (flItem.___type === 'control') {
			return match
		}

		/* var rf;

            for (rf = 0; rf < regularFilters.length; rf++) {

                var keyProperty = regularFilters[rf].key;
                var valueType = regularFilters[rf].value_type;
                var filterType = regularFilters[rf].filter_type;
                var excludeEmptyCells = regularFilters[rf].exclude_empty_cells;
                var filterValue = regularFilters[rf].value;

                if (keyProperty === 'ordering') {
                    break;
                }

                var valueFromTable = null;

                //region Get valueFromTable for dynamic attribute
                if (keyProperty.startsWith("attributes.")) {

                    var dynamicAttrKey = keyProperty.slice(11); // slice off '.attributes'

                    for (var da = 0; da < flItem.attributes.length; da++) {

                        var dynamicAttributeData = flItem.attributes[da];

                        if (dynamicAttributeData.attribute_type_object.user_code === dynamicAttrKey) {

                            if (dynamicAttributeData.attribute_type_object.value_type === 30) {

                                if (dynamicAttributeData.classifier_object) {
                                    valueFromTable = JSON.parse(JSON.stringify(dynamicAttributeData.classifier_object.name));
                                } else {
                                    valueFromTable = '';
                                }

                                break;

                            }
                            else {

                                switch (valueType) {
                                    case 10:
                                        valueFromTable = JSON.parse(JSON.stringify(dynamicAttributeData.value_string));
                                        break;
                                    case 20:
                                        valueFromTable = JSON.parse(JSON.stringify(dynamicAttributeData.value_float));
                                        break;
                                    case 40:
                                        valueFromTable = JSON.parse(JSON.stringify(dynamicAttributeData.value_date));
                                        break;
                                }

                                break;

                            }

                        }

                    }

                }
                //endregion

                if ((item.hasOwnProperty(keyProperty) && item[keyProperty]) || valueFromTable) { // check whether cell that is used to filter row is not empty

                    if (filterType === 'empty') { // prevent pass of cells with values
                        match = false;
                        break;
                    }

                    if (filterValueIsNotEmpty(filterValue, filterType)) {

                        var filterArgument = JSON.parse(JSON.stringify(filterValue));

                        if (valueType === 'field' && flItem.___type !== 'group') { // Find value for relation field

                            var relationFieldData = item[keyProperty + '_object'];

                            if (relationFieldData.name) {
                                valueFromTable = JSON.parse(JSON.stringify(relationFieldData.short_name));

                            } else if (keyProperty === 'price_download_scheme') {
                                valueFromTable = JSON.parse(JSON.stringify(relationFieldData.user_code));

                            }

                            /!*if (relationFieldData.display_name) {
                                valueFromTable = JSON.parse(JSON.stringify(relationFieldData.display_name));
                            } else {
                                valueFromTable = JSON.parse(JSON.stringify(relationFieldData.name));
                            }*!/

                        } else if (!valueFromTable) {

                            valueFromTable = JSON.parse(JSON.stringify(item[keyProperty]));

                        }

                        if (valueType === 10 ||
                            valueType === 30 ||
                            valueType === 'field') {

                            if (filterType !== 'multiselector') {
                                valueFromTable = valueFromTable.toLowerCase();
                                filterArgument = filterArgument[0].toLowerCase();
                            }

                        }

                        if (valueType === 20) {

                            if (filterType !== 'from_to' && filterType !== 'out_of_range') {
                                filterArgument = filterArgument[0];
                            }

                            // Compare position number of item with maximum allowed
                            /!*if (filterType === 'top_n') {
                                valueFromTable = tableRowIndex;
                            }

                            if (filterType === 'bottom_n') {
                                valueFromTable = tableRowIndex;
                                filterArgument = items.length - 1 - filterArgument // calculate how much items from beginning should be skipped
                            }*!/
                            // < Compare position number of item with maximum allowed >

                        }

                        if (valueType === 40) {

                            switch (filterType) {
                                case 'equal':
                                case 'not_equal':
                                    valueFromTable = new Date(valueFromTable).toDateString();
                                    filterArgument = new Date(filterArgument[0]).toDateString();
                                    break;
                                case 'from_to':
                                case 'out_of_range':
                                    valueFromTable = new Date(valueFromTable);
                                    filterArgument.min_value = new Date(filterArgument.min_value);
                                    filterArgument.max_value = new Date(filterArgument.max_value);
                                    break;
                                case 'date_tree':
                                    valueFromTable = new Date(valueFromTable);
                                    // filterArgument is array of strings
                                    break;
                                default:
                                    valueFromTable = new Date(valueFromTable);
                                    filterArgument = new Date(filterArgument[0]);
                                    break;
                            }

                        }

                        match = filterValueFromTable(valueFromTable, filterArgument, filterType);

                        if (!match) {
                            break;
                        }

                    }

                }
                else {

                    var hideEmptyCells = excludeEmptyCells && flItem.___type !== 'group';

                    if (hideEmptyCells) {
                        match = false;
                        break;
                    } else {
                        match = true;
                    }

                }

            }

            if (flItem.___type === 'group' && !match) {
                filteredOutGroupsIds.push(flItem.___id);
            } */
		match = filterTableItem(item, regularFilters)

		return match
	})
}

/* Do not delete

    /!**
     * Filter entity viewer tree of groups using frontend filters.
     *
     * @param tree {Object} - entity viewer groups
     * @param evDataService {Object} - entityViewerDataService
     * @returns {Object} - filtered tree
     * @memberof module:ev-data-provider/filterService
     *!/
    var filterTableTree = function (tree, evDataService) {

        var {frontend: frontFiltersList} = evDataService.getFilters();
        var regularFilters = convertIntoRegularFilters(frontFiltersList);

        var groupsList = evDataService.getGroups();

        tree.results = tree.results.filter((group, index) => {

            if (group.___type === 'group') {

                var item = getGroupDataForFiltering(group, groupsList);
                var passes = filterTableItem(item, regularFilters);

                if (passes && group.results.length) {

                    tree.results[index] = filterTableTree(group, evDataService);

                }

                return passes;

            }

            return true;

        });

        return tree;

    };*/

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

		/*case 'top_n':
                if (valueToFilter < filterBy) {
                    return true;
                }
                break;

            case 'bottom_n':
                if (valueToFilter > filterBy) {
                    return true;
                }
                break;*/

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
			if (filterBy.indexOf(valueToFilter) !== -1) {
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
	}

	return false
}

// removing rows with load buttons or "Data is loaded text" for removed by filters groups

var convertIntoRegularFilters = function (filtersList) {
	var regularFilters = []

	filtersList.forEach(function (filter) {
		if (
			filter.options &&
			filter.options.enabled &&
			evRvCommonHelper.isFilterValid(filter)
		) {
			var filterOptions = {
				key: filter.key,
				filter_type: filter.options.filter_type,
				// exclude_empty_cells: filter.options.exclude_empty_cells,
				value_type: filter.value_type,
				value: filter.options.filter_values,
			}

			regularFilters.push(filterOptions)
		}
	})

	return regularFilters
}

/** @module ev-data-provider/filterService */
export default {
	filterTableRows: filterTableRows,
	// filterTableTree: filterTableTree,

	convertIntoRegularFilters: convertIntoRegularFilters,
}
