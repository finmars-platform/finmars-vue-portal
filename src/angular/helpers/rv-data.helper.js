import localStorageService from '@/angular/shell/scripts/app/services/localStorageService'
import utilsHelper from './utils.helper'
import evRvCommonHelper from './ev-rv-common.helper'
import rvSubtotalHelper from './rv-subtotal.service'
import evDataHelper from './ev-data.helper'

var getGroupsByParent = function (parentId, evDataService) {
	var items = evDataService.getDataAsList()

	return items.filter(function (item) {
		return item.___parentId === parentId
	})
}

var calculateItemSubtotal = function (item, evDataService) {
	var columns = evDataService.getColumns()
	var groups = evDataService.getGroups()
	var level = groups.length

	// console.log('calculateItemSubtotal.item', item)

	// Reset subtotals if previously calculated

	item.subtotal = {}

	console.log('calculateItemSubtotal.item', item)

	if (item.___level === level) {
		item.subtotal = rvSubtotalHelper.calculate(item.results, columns)

		evDataService.setData(item)
	} else {
		var items = []

		var childGroups = getGroupsByParent(item.___id, evDataService)

		childGroups.forEach(function (item) {
			items.push(item.subtotal)
		})

		item.subtotal = rvSubtotalHelper.calculate(items, columns)

		evDataService.setData(item)
	}
}

var calculateSubtotals = function (evDataService) {
	var dataList = evDataService.getDataAsList()

	var groups = evDataService.getGroups()
	var level = groups.length

	// console.log('calculateSubtotals.level', level);

	for (var i = level; i >= 0; i = i - 1) {
		// console.log('calculateSubtotals.current_level', i);

		dataList.forEach(function (item) {
			if (item.___level === i) {
				calculateItemSubtotal(item, evDataService)
			}
		})
	}
}

var insertSubtotalFns = {
	line: function (subtotalObj, item) {
		subtotalObj.___id = evRvCommonHelper.getId(subtotalObj)
		subtotalObj.___subtotal_type = 'line'

		item.results.unshift(subtotalObj)
	},
	area: function (subtotalObj, item) {
		subtotalObj.___subtotal_type = 'proxyline'
		subtotalObj.___id = evRvCommonHelper.getId(subtotalObj)

		item.results.unshift(JSON.parse(JSON.stringify(subtotalObj)))

		subtotalObj.___subtotal_type = 'area'
		subtotalObj.___id = evRvCommonHelper.getId(subtotalObj)

		item.results.push(subtotalObj)
	},
	arealine: function (subtotalObj, item) {
		subtotalObj.___subtotal_type = 'arealine'

		subtotalObj.___subtotal_subtype = 'line'
		subtotalObj.___id = evRvCommonHelper.getId(subtotalObj)

		item.results.unshift(JSON.parse(JSON.stringify(subtotalObj)))

		subtotalObj.___subtotal_subtype = 'area'
		subtotalObj.___id = evRvCommonHelper.getId(subtotalObj)

		item.results.push(subtotalObj)
	},
}

var insertSubtotalsToResults = function (data, evDataService) {
	var dataList = []
	var groups = evDataService.getGroups()
	/* var rootGroupOptions = evDataService.getRootGroupOptions();
        var reportOptions = evDataService.getReportOptions();
        var subtotalsOpts = reportOptions.subtotals_options; */

	Object.keys(data).forEach(function (key) {
		dataList.push(data[key])
	})

	var subtotalObj

	// insert Grand total
	if (dataList[0].results) {
		subtotalObj = Object.assign({}, dataList[0].subtotal, {
			___group_identifier: dataList[0].___group_identifier,
			___group_name: dataList[0].___group_name,
			___type: 'subtotal',
			___parentId: dataList[0].___id,
			___level: 0,
		})

		subtotalObj.___id = evRvCommonHelper.getId(subtotalObj)
		subtotalObj.___subtotal_type = 'line'

		dataList[0].results.unshift(subtotalObj)
	}
	// < insert Grand total >

	/* if (subtotalsOpts) {

			// subtotals are on
        	if (subtotalsOpts.type) {

        		var insertSubtotal = insertSubtotalFns[subtotalsOpts.type];

        		dataList.forEach(function (item) {

        			if (item.results.length && item.___group_name !== "root" && item.___level <= groups.length) { // insert subtotals for groups but not for root group

        				subtotalObj = Object.assign({}, item.subtotal, {
							___group_name: item.___group_name,
							___type: 'subtotal',
							___parentId: item.___id,
							___level: item.___level + 1
						});

						insertSubtotal(subtotalObj, item);

					}

				});

			}
			// < subtotals are on >

		} */

	dataList.forEach(function (item) {
		if (item.results.length) {
			groups.forEach(function (group, index) {
				if (
					item.___level === index + 1 &&
					item.___level <= groups.length &&
					group.report_settings.subtotal_type
				) {
					subtotalObj = Object.assign({}, item.subtotal, {
						___group_identifier: item.___group_identifier,
						___group_name: item.___group_name,
						___type: 'subtotal',
						___parentId: item.___id,
						___level: item.___level + 1,
					})

					var insertSubtotal =
						insertSubtotalFns[group.report_settings.subtotal_type]
					insertSubtotal(subtotalObj, item)
				}
			})
		}
	})

	/* dataList.forEach(function (item) {

            if (item.results.length) {

                 if (item.___level === 0 && rootGroupOptions.subtotal_type) { // Now Grand total always on top

                    subtotalObj = Object.assign({}, item.subtotal, {
                        ___group_name: item.___group_name,
                        ___type: 'subtotal',
                        ___parentId: item.___id,
                        ___level: 0
                    });

                    switch (rootGroupOptions.subtotal_type) {
                        case "line":
                            subtotalObj.___id = evRvCommonHelper.getId(subtotalObj);
                            subtotalObj.___subtotal_type = 'line';
                            item.results.unshift(subtotalObj);
                            break;
                        case "area":
                            subtotalObj.___subtotal_type = 'area';
                            subtotalObj.___id = evRvCommonHelper.getId(subtotalObj);
                            item.results.push(subtotalObj);
                            break;
                        case "arealine":
                            subtotalObj.___subtotal_type = 'arealine';

                            subtotalObj.___subtotal_subtype = 'line';
                            subtotalObj.___id = evRvCommonHelper.getId(subtotalObj);
                            item.results.unshift(JSON.parse(JSON.stringify(subtotalObj)));

                            subtotalObj.___subtotal_subtype = 'area';
                            subtotalObj.___id = evRvCommonHelper.getId(subtotalObj);
                            item.results.push(subtotalObj);
                            break;
                    }

                }

                else {

                    groups.forEach(function (group, index) {

                        if (item.___level === index + 1 && item.___level <= groups.length) {

                            subtotalObj = Object.assign({}, item.subtotal, {
                                ___group_name: item.___group_name,
                                ___type: 'subtotal',
                                ___parentId: item.___id,
                                ___level: item.___level + 1
                            });

                            if (group.report_settings.subtotal_type === 'line') {

                                subtotalObj.___id = evRvCommonHelper.getId(subtotalObj);
                                subtotalObj.___subtotal_type = 'line';

                                item.results.unshift(subtotalObj);

                            }

                            if (group.report_settings.subtotal_type === 'area') {

                                subtotalObj.___subtotal_type = 'proxyline';
                                subtotalObj.___id = evRvCommonHelper.getId(subtotalObj);

                                item.results.unshift(JSON.parse(JSON.stringify(subtotalObj)));


                                subtotalObj.___subtotal_type = 'area';
                                subtotalObj.___id = evRvCommonHelper.getId(subtotalObj);


                                item.results.push(subtotalObj);

                            }

                            if (group.report_settings.subtotal_type === 'arealine') {

                                subtotalObj.___subtotal_type = 'arealine';


                                subtotalObj.___subtotal_subtype = 'line';
                                subtotalObj.___id = evRvCommonHelper.getId(subtotalObj);

                                item.results.unshift(JSON.parse(JSON.stringify(subtotalObj)));


                                subtotalObj.___subtotal_subtype = 'area';
                                subtotalObj.___id = evRvCommonHelper.getId(subtotalObj);

                                item.results.push(subtotalObj);


                            }


                        }

                    })

                }

            }

        }); */

	return data
}

var insertBlankLinesToResults = function (data, evDataService) {
	var dataList = []
	var groups = evDataService.getGroups()

	Object.keys(data).forEach(function (key) {
		dataList.push(data[key])
	})

	var subtotalObj

	dataList.forEach(function (item) {
		if (item.results.length) {
			groups.forEach(function (group, index) {
				if (item.___level === index + 1 && item.___level <= groups.length) {
					subtotalObj = Object.assign(
						{},
						{
							___group_identifier: item.___group_identifier,
							___group_name: item.___group_name,
							___type: 'blankline',
							___parentId: item.___id,
							___level: item.___level + 1,
						}
					)

					if (group.report_settings.blankline_type === 'area') {
						subtotalObj.___id = evRvCommonHelper.getId(subtotalObj)

						subtotalObj.___blankline_type = 'area'

						item.results.push(subtotalObj)
					}
				}
			})
		}
	})

	return data
}

var getGroupsIdsToFold = function (list, evDataService) {
	var result = []

	list.forEach(function (item) {
		if (item.___type === 'group' && item.___parentId !== null) {
			if (item.___is_open === false) {
				result.push(item.___id)
			}
		}
	})

	return result
}

var isItemInGroupsToFold = function (groupsIdsToFold, item) {
	return groupsIdsToFold.indexOf(item.___parentId) !== -1
}

var lookupProxyline = function (evDataService, list, i) {
	var result = false

	var groupsToCheck = []

	for (; i > 0; i = i - 1) {
		if (
			list[i].___type === 'subtotal' &&
			list[i].___subtotal_type === 'proxyline'
		) {
			groupsToCheck.push(list[i].___parentId)
		} else {
			if (list[i].___type !== 'group') {
				break
			}
		}
	}

	groupsToCheck.forEach(function (groupIp) {
		var item = evDataService.getData(groupIp)

		var parent = evDataService.getData(item.___parentId)

		if (parent.___is_open) {
			result = true
		}
	})

	return result
}

var getItemIndexFromList = function (item, list) {
	var itemIndex

	for (var i = 0; i < list.length; i = i + 1) {
		if (list[i].___id === item.___id) {
			itemIndex = i
			break
		}
	}

	return itemIndex
}

var handleFoldForObject = function (evDataService, item, list) {
	var result = true

	var currentGroup = evDataService.getData(item.___parentId)

	var itemIndex = getItemIndexFromList(item, list)

	var itemParent

	for (var x = itemIndex - 1; x > 0; x = x - 1) {
		itemParent = evDataService.getData(list[x].___parentId)

		if (
			list[x].___type === 'subtotal' &&
			list[x].___subtotal_type === 'proxyline'
		) {
			if (lookupProxyline(evDataService, list, x)) {
				result = true
				break
			}
		}

		if (list[x].___type === 'object') {
			result = false
			break
		}

		if (list[x].___type === 'subtotal' && list[x].___subtotal_type === 'line') {
			result = false
			break
		}

		if (
			itemParent.___is_open === false &&
			list[x].___type === 'subtotal' &&
			list[x].___subtotal_type === 'arealine' &&
			list[x].___subtotal_subtype === 'line'
		) {
			result = false
			break
		}
	}

	return result
}

var handleFoldForSubtotal = function (evDataService, item, list) {
	var result = false

	var currentGroup = evDataService.getData(item.___parentId)
	var parentGroup = evDataService.getData(currentGroup.___parentId)

	var itemIndex = getItemIndexFromList(item, list)

	if (item.___subtotal_type === 'line') {
		if (parentGroup.___is_open) {
			result = true
		}

		if (lookupProxyline(evDataService, list, itemIndex - 1)) {
			result = true
		}
	}

	if (
		item.___subtotal_type === 'arealine' &&
		item.___subtotal_subtype === 'line'
	) {
		if (parentGroup.___is_open) {
			result = true
		}

		if (lookupProxyline(evDataService, list, itemIndex - 1)) {
			result = true
		}
	}

	if (item.___subtotal_type === 'area') {
		result = false
	}

	if (
		item.___subtotal_type === 'arealine' &&
		item.___subtotal_subtype === 'area'
	) {
		result = false
	}

	if (item.___subtotal_type === 'proxyline') {
		result = true
	}

	return result
}

var removeItemsFromFoldedGroups = function (list, evDataService) {
	var result = list.concat()

	var groupsIdsToFold = getGroupsIdsToFold(list, evDataService)

	console.log('groupsIdsToFold', groupsIdsToFold)

	result = result.filter(function (item) {
		if (isItemInGroupsToFold(groupsIdsToFold, item)) {
			if (item.___type === 'subtotal') {
				return handleFoldForSubtotal(evDataService, item, list)
			}

			if (item.___type === 'object') {
				return handleFoldForObject(evDataService, item, list)
			}

			return false
		}

		return true
	})

	return result
}

var isPrimitive = function (value) {
	var propertyType = typeof value

	if (isNaN(value) && propertyType !== 'object' && !Array.isArray(value)) {
		return true
	}

	if (value === null) {
		return true
	}

	if (
		['string', 'number', 'boolean', 'undefined'].indexOf(propertyType) !== -1
	) {
		return true
	}

	return false
}

var simpleObjectCopy = function (obj) {
	var result = {}
	var propertyType = {}

	Object.keys(obj).forEach(function (key) {
		propertyType = typeof obj[key]

		if (isPrimitive(obj[key])) {
			result[key] = obj[key]
		} else if (Array.isArray(obj[key])) {
			result[key] = []

			obj[key].forEach(function (item) {
				result[key].push(Object.assign({}, item))
			})
		} else if (!Array.isArray(obj[key]) && propertyType === 'object') {
			// if object

			result[key] = Object.assign({}, obj[key]) // WARNING, Nested objects is not supported
		} else {
			result[key] = obj[key]
		}
	})

	return result
}

var getNewDataInstance = function (evDataService) {
	var sourceData = evDataService.getData()
	var result = {}

	// console.log('sourceData', evDataService.getData());
	// console.log('getNewDataInstance Object.keys(sourceData)', Object.keys(sourceData));

	Object.keys(sourceData).forEach(function (key) {
		result[key] = simpleObjectCopy(sourceData[key]) // performance issue
		// result[key] = Object.assign({}, sourceData[key])
	})

	return result
}

const getMarkedRowsAndSubtotals = function (
	color,
	evDataService,
	globalDataService
) {
	const entityType = evDataService.getEntityType()
	// const markedReportRows = localStorageService.getMarkedRows(true, entityType);
	const rvSettings = globalDataService.getMemberEntityViewersSettings(
		true,
		entityType
	)
	const markedReportRows = rvSettings.marked_rows

	const markedSubtotals = evDataService.getMarkedSubtotals()

	const markedRowsAndSubtotals = Object.keys(markedReportRows)
		.filter((key) => markedReportRows[key].color === color)
		.concat(
			Object.keys(markedSubtotals).filter(
				(key) => markedSubtotals[key] === color
			)
		)

	return markedRowsAndSubtotals
}

const filterByRowColor = function (list, evDataService, globalDataService) {
	const rowTypeFilters = evDataService.getRowTypeFilters()
	const color = rowTypeFilters.markedRowFilters

	if (color === 'none') {
		//  color filter disabled
		return list
	}

	const markedRowsAndSubtotals = getMarkedRowsAndSubtotals(
		color,
		evDataService,
		globalDataService
	)
	const notDeletedKeys = []

	list.forEach((item) => {
		if (item.___group_name === 'root') {
			// root subtotal is present always

			notDeletedKeys.push(item.___id)
		}

		const rowColored = markedRowsAndSubtotals.includes(item.id || item.___id)

		if (rowColored) {
			const parents = evRvCommonHelper.getParents(
				item.___parentId,
				evDataService
			)
			notDeletedKeys.push(item.___id)
			notDeletedKeys.push(...parents.map((parent) => parent.___id))
		}
	})

	return list.filter((item) => {
		const isSubtotalContainsMarkedRows =
			item.___subtotal_type === 'line' &&
			notDeletedKeys.includes(item.___parentId)
		const isRowColored = notDeletedKeys.includes(item.___id)

		if (isSubtotalContainsMarkedRows) {
			item.results = item.results.filter((row) =>
				notDeletedKeys.includes(row.id)
			)
		}

		return isRowColored || isSubtotalContainsMarkedRows
	})
}
// Deprecated
var getFlatStructureOld = function (evDataService, globalDataService) {
	var rootGroupOptions = evDataService.getRootGroupOptions()

	var groups = evDataService.getGroups()

	console.log('getFlatStructure.rootGroupOptions', rootGroupOptions)
	console.log('getFlatStructure.groups', groups)

	var data

	if (groups.length || rootGroupOptions.subtotal_type) {
		console.time('Calculating subtotals')

		calculateSubtotals(evDataService)

		console.timeEnd('Calculating subtotals')

		console.time('Copying data')

		data = getNewDataInstance(evDataService)

		console.log('data', data)

		console.timeEnd('Copying data')

		console.time('Inserting subtotals')

		data = insertSubtotalsToResults(data, evDataService)

		console.timeEnd('Inserting subtotals')

		console.time('Calculating blankline')

		data = insertBlankLinesToResults(data, evDataService)

		localStorage.setItem('flags', ['2,2,1,1,1,1', '2,2,1,1,1,1'])

		console.timeEnd('Calculating blankline')

		// console.log('data', data);
	} else {
		data = getNewDataInstance(evDataService)
	}

	// var rootGroup = simpleObjectCopy(evDataService.getRootGroupData()); # poor performance
	var rootGroup = Object.assign({}, evDataService.getRootGroupData())

	console.time('Converting to tree')
	console.log('Converting to tree data', data)

	var tree = utilsHelper.convertToTree(data, rootGroup)

	console.log('getFlatStructure.tree', tree)

	console.timeEnd('Converting to tree')

	// console.log('getFlatStructure.tree', tree);

	console.time('Converting tree to list')

	var list = utilsHelper.convertTreeToList(tree)

	console.timeEnd('Converting tree to list')
	console.log('Converted list length', list.length)

	// console.log('getFlatStructure.list', list);

	list = removeItemsFromFoldedGroups(list, evDataService)

	list = filterByRowColor(list, evDataService, globalDataService)

	return list
}

var getFlatStructure = function (evDataService, globalDataService) {
	var rootGroupOptions = evDataService.getRootGroupOptions()

	var groups = evDataService.getGroups()

	console.log('getFlatStructure.rootGroupOptions', rootGroupOptions)
	console.log('getFlatStructure.groups', groups)

	var data

	if (groups.length || rootGroupOptions.subtotal_type) {
		console.time('Calculating subtotals')

		calculateSubtotals(evDataService)

		console.timeEnd('Calculating subtotals')

		console.time('Copying data')

		data = getNewDataInstance(evDataService)

		console.log('getFlatStructure.data', data)
		console.log('getFlatStructure.data length', Object.keys(data).length)

		console.timeEnd('Copying data')

		console.time('Inserting subtotals')

		data = insertSubtotalsToResults(data, evDataService)
		console.timeEnd('Inserting subtotals')

		console.time('Calculating blankline')

		data = insertBlankLinesToResults(data, evDataService)

		localStorage.setItem('flags', ['2,2,1,1,1,1', '2,2,1,1,1,1'])

		console.timeEnd('Calculating blankline')

		// console.log('data', data);
	} else {
		data = getNewDataInstance(evDataService)
	}

	// var rootGroup = simpleObjectCopy(evDataService.getRootGroupData()); # poor performance
	var rootGroup = Object.assign({}, evDataService.getRootGroupData())

	console.time('Converting to tree')
	console.log('Converting to tree data', data)

	var optimize = false

	if (evDataService.getEntityType().indexOf('report') !== -1) {
		optimize = true
	}

	var tree = utilsHelper.convertToTree(data, rootGroup, optimize)
	console.log('getFlatStructure.tree', tree)

	console.timeEnd('Converting to tree')

	// console.log('getFlatStructure.tree', tree);

	console.time('Converting tree to list')

	var list = utilsHelper.convertTreeToList(tree)

	console.timeEnd('Converting tree to list')

	console.time('Filling list with data')
	var filledList = utilsHelper.fillListWithData(list, data)
	console.timeEnd('Filling list with data')

	console.log('Converted list length', filledList.length)

	// console.log('getFlatStructure.list', list);

	filledList = removeItemsFromFoldedGroups(filledList, evDataService)

	filledList = filterByRowColor(filledList, evDataService, globalDataService)

	return filledList
}

// items do not removed if folded
var getPureFlatStructure = function (evDataService, globalDataService) {
	var rootGroupOptions = evDataService.getRootGroupOptions()

	var groups = evDataService.getGroups()

	console.log('getFlatStructure.rootGroupOptions', rootGroupOptions)
	console.log('getFlatStructure.groups', groups)

	var data

	if (groups.length || rootGroupOptions.subtotal_type) {
		console.time('Calculating subtotals')

		calculateSubtotals(evDataService)

		console.timeEnd('Calculating subtotals')

		console.time('Copying data')

		data = getNewDataInstance(evDataService)

		console.log('data', data)

		console.timeEnd('Copying data')

		console.time('Inserting subtotals')

		data = insertSubtotalsToResults(data, evDataService)

		console.timeEnd('Inserting subtotals')

		console.time('Calculating blankline')

		data = insertBlankLinesToResults(data, evDataService)

		localStorage.setItem('flags', ['2,2,1,1,1,1', '2,2,1,1,1,1'])

		console.timeEnd('Calculating blankline')

		// console.log('data', data);
	} else {
		data = getNewDataInstance(evDataService)
	}

	// var rootGroup = simpleObjectCopy(evDataService.getRootGroupData()); # poor prformance
	var rootGroup = Object.assign({}, evDataService.getRootGroupData())

	console.time('Converting to tree')
	console.log('Converting to tree data', data)

	var tree = utilsHelper.convertToTree(data, rootGroup)

	console.log('getFlatStructure.tree', tree)

	console.timeEnd('Converting to tree')

	// console.log('getFlatStructure.tree', tree);

	console.time('Converting tree to list')

	var list = utilsHelper.convertTreeToList(tree)

	console.timeEnd('Converting tree to list')

	console.time('Filling list with data')
	var filledList = utilsHelper.fillListWithData(list, data)
	console.timeEnd('Filling list with data')

	console.log('Converted list length', filledList.length)

	// console.log('getFlatStructure.list', list);

	filledList = filterByRowColor(filledList, evDataService, globalDataService)

	return filledList
}

var syncLevelFold = function (evDataService) {
	// console.time('syncLevelFold');

	var groups = evDataService.getGroups()

	// console.log('syncLevelFold.groups', groups);

	if (groups.length) {
		for (var i = 0; i < groups.length; i = i + 1) {
			if (groups[i].report_settings) {
				if (groups[i].report_settings.is_level_folded === true) {
					var groupsContent = evDataHelper.getGroupsByLevel(
						i + 1,
						evDataService
					)

					// console.log('syncLevelFold.groupsContent', groupsContent);

					groupsContent.forEach(function (groupItem) {
						groupItem.___is_open = false

						var childrens = evDataHelper.getAllChildrenGroups(
							groupItem.___id,
							evDataService
						)

						// console.log('childrens', childrens);

						childrens.forEach(function (children) {
							if (children.___type === 'group') {
								var item = evDataService.getData(children.___id)

								if (item) {
									item.___is_open = false
									evDataService.setData(item)
								} else {
									children.___is_open = false
									evDataService.setData(children)
								}
							}
						})
					})

					break
				}
			}
		}
	}

	console.timeEnd('syncLevelFold')
}

var getFlatListFieldUniqueValues = function (flatList, key) {
	var result = []

	flatList.forEach(function (item) {
		if (flatList.hasOwnProperty(key)) {
			if (result.indexOf(item[key]) === -1) {
				if (item[key]) {
					result.push(item[key])
				}
			}
		}
	})

	return result
}

var calculateProjection = function (flatList, evDataService) {
	// console.time('Creating projection');

	var rowHeight = evDataService.getRowHeight()
	var offsetPx = evDataService.getVirtualScrollOffsetPx()
	var from = Math.ceil(offsetPx / rowHeight)
	var step = evDataService.getVirtualScrollStep()

	evDataService.setProjectionLastFrom(from)

	var to = from + step / 2

	// console.timeEnd('Creating projection');

	from = from - step / 2 // two rows, before viewport
	if (from < 0) {
		from = 0
	}

	return flatList.slice(from, to)
}

var getOrCreateGroupSettings = function (evDataService, group) {
	var layout = evDataService.getListLayout()
	var contentType = evDataService.getContentType()

	var parents = evRvCommonHelper.getParents(group.___parentId, evDataService)

	parents.pop() // skip root group

	var reportData = localStorageService.getReportData()

	if (!reportData[contentType]) reportData[contentType] = {}

	if (!reportData[contentType][layout.user_code]) {
		reportData[contentType][layout.user_code] = {
			groups: {},
		}
	}

	var full_path = parents.map(function (item) {
		return item.___group_name
	})

	full_path.push(group.___group_name)

	var full_path_prop = full_path.join('___') // TODO check if safe enough

	console.log('full_path', full_path)
	console.log('full_path_prop', full_path_prop)

	var groupSettings

	if (reportData[contentType][layout.user_code]['groups'][full_path_prop]) {
		groupSettings =
			reportData[contentType][layout.user_code]['groups'][full_path_prop]
	}

	if (!groupSettings) {
		groupSettings = {
			full_path: full_path,
			is_open: true,
		}

		reportData[contentType][layout.user_code]['groups'][full_path_prop] =
			groupSettings

		localStorageService.cacheReportData(reportData)
	}

	return groupSettings
}

var setGroupSettings = function (evDataService, group, groupSettings) {
	var layout = evDataService.getListLayout()
	var contentType = evDataService.getContentType()
	var groups = evDataService.getGroups()

	var reportData = localStorageService.getReportDataForLayout(
		contentType,
		layout.user_code
	)

	if (!reportData['groups']) {
		reportData['groups'] = {}
	}

	var full_path_prop = groupSettings.full_path

	if (Array.isArray(full_path_prop)) {
		full_path_prop = full_path_prop.join('___')
	}

	reportData['groups'][full_path_prop] = groupSettings

	reportData.groupsList = []

	groups.forEach((group) => {
		var groupObj = {
			key: group.key,
			report_settings: {
				is_level_folded: false,
			},
		}

		if (group.report_settings) {
			groupObj.report_settings.is_level_folded =
				!!group.report_settings.is_level_folded
		}

		/* if (group.report_settings && group.report_settings.is_level_folded) {
                reportData.fullyFoldedGroups.push(group.key);
            } */
		reportData.groupsList.push(groupObj)
	})

	localStorageService.cacheReportDataForLayout(
		contentType,
		layout.user_code,
		reportData
	)
}

var markHiddenColumnsBasedOnFoldedGroups = function (evDataService) {
	var groups = evDataService.getGroups()
	var columns = evDataService.getColumns()
	var foldedGroup = false
	var firstColWithoutGroupIndex = 0

	if (groups.length) {
		foldedGroup = groups.find(
			(group) => group.report_settings && group.report_settings.is_level_folded
		)
		firstColWithoutGroupIndex = groups.length // index of first column without group
	}

	if (foldedGroup) {
		// if there is fully folded group, hide columns without visible content

		for (var i = firstColWithoutGroupIndex; i < columns.length; i++) {
			var columnWithoutSubtotal =
				!columns[i].report_settings ||
				!columns[i].report_settings.subtotal_formula_id
			if (columnWithoutSubtotal && !columns[i].error_data)
				columns[i].isHidden = true
		}

		/* columns.forEach((column, index) => {

                var colLevel = index + 1;
                var columnWithoutSubtotal = !column.report_settings || !column.report_settings.subtotal_formula_id;
                var columnWithoutGroup = groups.length < colLevel;

                var colIsHidden = !!(columnWithoutGroup && columnWithoutSubtotal && !column.error);

                if (column.isHidden !== colIsHidden) columnsChanged = true;

                column.isHidden = colIsHidden;

            }); */
	} else {
		for (var i = firstColWithoutGroupIndex; i < columns.length; i++) {
			columns[i].isHidden = false
		}

		/*columns.forEach((column, index) => {

                var colLevel = index + 1;
                var columnWithoutGroup = groups.length < colLevel;

                if (columnWithoutGroup) {

                    // if (column.isHidden) columnsChanged = true;
                    column.isHidden = false;

                }

            });*/
	}

	evDataService.setColumns(columns)
}

export default {
	getOrCreateGroupSettings: getOrCreateGroupSettings,
	setGroupSettings: setGroupSettings,
	syncLevelFold: syncLevelFold,
	getFlatStructure: getFlatStructure,
	getFlatListFieldUniqueValues: getFlatListFieldUniqueValues,
	getPureFlatStructure: getPureFlatStructure,
	calculateProjection: calculateProjection,

	markHiddenColumnsBasedOnFoldedGroups: markHiddenColumnsBasedOnFoldedGroups,
}
