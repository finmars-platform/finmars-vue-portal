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

var filterTableRows = function (flatList, regularFilters, groupsList) {
	var filteredOutGroupsIds = []
	var match

	return flatList.filter(function (flItem) {
		match = true

		var item = flItem
		var useFilterExprs = true

		if (
			flItem.___parentId &&
			filteredOutGroupsIds.indexOf(flItem.___parentId) !== -1
		) {
			// if item is a part of filtered out group

			useFilterExprs = false
			match = false
		} else {
			if (flItem.___type === 'group') {
				item = {}
				var groupIndex = flItem.___level - 1
				var groupData = groupsList[groupIndex]
				item[groupData['key']] = flItem.___group_name
			} else if (flItem.___type === 'control') {
				useFilterExprs = false
			}
		}

		if (useFilterExprs) {
			var rf

			for (rf = 0; rf < regularFilters.length; rf++) {
				var keyProperty = regularFilters[rf].key
				var valueType = regularFilters[rf].value_type
				var filterType = regularFilters[rf].filter_type
				var excludeEmptyCells = regularFilters[rf].exclude_empty_cells
				var filterValue = regularFilters[rf].value

				if (keyProperty !== 'ordering') {
					var valueFromTable = null

					// Check is it a dynamic attribute
					if (keyProperty.indexOf('attributes.') === 0) {
						var dynamicAttrKey = keyProperty.slice(11)

						for (var da = 0; da < flItem.attributes.length; da++) {
							var dynamicAttributeData = flItem.attributes[da]

							if (
								dynamicAttributeData.attribute_type_object.user_code ===
								dynamicAttrKey
							) {
								if (
									dynamicAttributeData.attribute_type_object.value_type === 30
								) {
									if (dynamicAttributeData.classifier_object) {
										valueFromTable = JSON.parse(
											JSON.stringify(
												dynamicAttributeData.classifier_object.name
											)
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
					// < Check is it a dynamic attribute >

					if (
						(item.hasOwnProperty(keyProperty) && item[keyProperty]) ||
						valueFromTable
					) {
						// check if cell that is used to filter row is not empty

						if (filterType === 'empty') {
							// prevent pass of cells with values
							match = false
							break
						}

						if (checkForEmptyRegularFilter(filterValue, filterType)) {
							var filterArgument = JSON.parse(JSON.stringify(filterValue))

							if (valueType === 'field' && flItem.___type !== 'group') {
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

							if (
								valueType === 10 ||
								valueType === 30 ||
								valueType === 'field'
							) {
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
										filterArgument.min_value = new Date(
											filterArgument.min_value
										)
										filterArgument.max_value = new Date(
											filterArgument.max_value
										)
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
						if (excludeEmptyCells && flItem.___type !== 'group') {
							// if user choose to hide empty cells
							match = false
							break
						} else {
							match = true
						}
					}
				}
			}
		}

		if (flItem.___type === 'group' && !match) {
			filteredOutGroupsIds.push(flItem.___id)
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
			} else if (doesStringContainsSubstrings(valueToFilter, filterBy)) {
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

export default {
	filterTableRows: filterTableRows,
}
