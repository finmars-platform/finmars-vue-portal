import metaService from '../services/metaService'
import localStorageService from '@/angular/shell/scripts/app/services/localStorageService'

import stringHelper from './stringHelper'
import utilsHelper from './utils.helper'
import evRvCommonHelper from './ev-rv-common.helper'

var getNextPage = function (options, event, entityViewerDataService) {
	var _options = Object.assign({}, options)

	var groupData

	if (!event.___id) {
		groupData = entityViewerDataService.getRootGroupData()
	} else {
		groupData = entityViewerDataService.getData(event.___id)
	}

	if (!groupData) {
		return _options.page
	}

	// console.log('groupData', groupData);

	if (
		groupData.___parentId === null &&
		groupData.next === null &&
		groupData.results.length === 0
	) {
		_options.page = _options.page + 1
	} else {
		console.log('NOT ROOT GROUP', groupData.next)

		if (groupData.next) {
			console.log('INCREMENT PAGE')

			_options.page = _options.page + 1
		}
	}

	console.log('getNextPage._options.page', _options.page)

	return _options.page
}

var ifFirstRequestForRootGroup = function (event, evDataService) {
	var groupData

	if (!event.___id) {
		groupData = evDataService.getRootGroupData()
	} else {
		groupData = evDataService.getData(event.___id)
	}

	if (!groupData) {
		return false
	}

	return !groupData.___parentId && !groupData.results.length
}

var isFirstRequestForObjects = function (event, evDataService) {
	var groupData

	if (!event.___id) {
		groupData = evDataService.getRootGroupData()
	} else {
		groupData = evDataService.getData(event.___id)
	}

	if (!groupData) {
		return true
	}

	return false
}

var getGroupNameFromParent = function (id, parentId, evDataService) {
	var parent = evDataService.getData(parentId)

	var result = parent.results.find(function (item) {
		return item.___id === id
	})

	return result.___group_name
}

var getGroupIdentifierFromParent = function (id, parentId, evDataService) {
	var parent = evDataService.getData(parentId)

	var result = parent.results.find(function (item) {
		return item.___id === id
	})

	return result.___group_identifier
}

var _getChildrenGroups = function (parentGroupId, evDataService, results) {
	var item = evDataService.getData(parentGroupId)

	if (item && item.___type === 'group' && item.results) {
		item.results.forEach(function (child) {
			results.push(child)

			_getChildrenGroups(child.___id, evDataService, results)
		})
	}
}

var getAllChildrenGroups = function (parentGroupId, evDataService) {
	var results = []

	_getChildrenGroups(parentGroupId, evDataService, results)

	return results
}

var getObject = function (objectId, parentGroupHashId, evDataService) {
	var parent = evDataService.getData(parentGroupHashId)
	var result = null

	if (parent) {
		parent.results.forEach(function (item) {
			if (item.___id === objectId) {
				result = item
			}
		})
	}

	return result
}

var getGroupTypeId = function (groupType) {
	var pattern

	if (groupType.hasOwnProperty('key')) {
		pattern = [groupType.name, stringHelper.toHash(groupType.key)].join('')
	}

	/* if (groupType.hasOwnProperty('id')) {

            pattern = [groupType.name, stringHelper.toHash(groupType.id)].join('');

        } */

	return stringHelper.toHash(pattern)
}

var getColumnId = function (column) {
	var pattern

	if (column.hasOwnProperty('key')) {
		pattern = [column.name, stringHelper.toHash(column.key)].join('')
	}

	/* if (column.hasOwnProperty('id')) {

            pattern = [column.name, stringHelper.toHash(column.id)].join('');

        } */

	return stringHelper.toHash(pattern)
}

var getGroupTypes = function (id, parentId, evDataService) {
	var result = []

	var groups = evDataService.getGroups()

	var parentsCount = evRvCommonHelper.getParents(parentId, evDataService).length

	var groupsCount

	if (groups.length > parentsCount) {
		groupsCount = parentsCount + 1
	} else {
		groupsCount = parentsCount
	}

	for (var i = 0; i < groupsCount; i = i + 1) {
		if (groups[i].key) {
			result.push(groups[i])
		}
	}

	return result
}

var getGroupsValues = function (id, parentId, evDataService) {
	var parents = evRvCommonHelper.getParents(parentId, evDataService).reverse()

	var result = []

	for (var i = 0; i < parents.length; i = i + 1) {
		if (parents[i].___parentId !== null) {
			result.push(parents[i].___group_identifier)
		}
	}

	var currentValue = getGroupIdentifierFromParent(id, parentId, evDataService)

	result.push(currentValue)

	return result
}

var getUnfoldedGroups = function (evDataService) {
	var data = evDataService.getData()
	var keys = Object.keys(data)

	var items = []

	keys.forEach(function (key) {
		items.push(data[key])
	})

	return items.filter(function (item) {
		return item.___is_open
	})
}

var getUnfoldedGroupsByLevel = function (level, evDataService) {
	var unfoldedGroups = getUnfoldedGroups(evDataService)

	return unfoldedGroups.filter(function (group) {
		return group.___level === level
	})
}

var getGroupsByLevel = function (level, evDataService) {
	var data = evDataService.getData()

	var keys = Object.keys(data)

	var items = []

	keys.forEach(function (key) {
		items.push(data[key])
	})

	return items.filter(function (group) {
		return group.___level === level
	})
}

var removeItemsFromFoldedGroups = function (list) {
	var _list = list.concat()

	var foldedGroupsIds = []

	_list = _list.filter(function (item) {
		if (item.___type === 'group' && !item.___is_open) {
			foldedGroupsIds.push(item.___id)
		}

		if (foldedGroupsIds.indexOf(item.___parentId) !== -1) {
			return false
		}

		return true
	})

	return _list
}

const filterByRowColor = function (flatList, evDataService, globalDataService) {
	var rowTypeFilters = evDataService.getRowTypeFilters()
	var filterByColor = rowTypeFilters.markedRowFilters

	if (filterByColor === 'none') {
		//  color filter disabled
		return flatList
	}

	var entityType = evDataService.getEntityType()
	// var markedRows = localStorageService.getMarkedRows(false, entityType);
	var rvSettings = globalDataService.getMemberEntityViewersSettings(
		false,
		entityType
	)
	var markedRows = rvSettings.marked_rows

	return flatList.filter((item) => {
		if (item.___type !== 'object') return true
		// does color of row matches to filter
		return (
			markedRows.hasOwnProperty(item.id) &&
			markedRows[item.id].color === filterByColor
		)
	})
}

var getFlatStructure = function (evDataService, globalDataService) {
	var data = JSON.parse(JSON.stringify(evDataService.getData()))
	var rootGroup = JSON.parse(JSON.stringify(evDataService.getRootGroupData()))

	var tree = utilsHelper.convertToTree(data, rootGroup)

	console.log('getFlatStructure.data', data)
	console.log('getFlatStructure.rootGroup', rootGroup)
	console.log('getFlatStructure.tree', tree)

	var list = utilsHelper.convertTreeToList(tree)

	// console.log('getFlatStructure.list', list);

	list = removeItemsFromFoldedGroups(list)

	list = filterByRowColor(list, evDataService, globalDataService)

	// console.log('list', list);

	return list
}

var calculateProjection = function (flatList, evDataService) {
	console.time('Creating projection')

	var rowHeight = evDataService.getRowHeight()
	var offsetPx = evDataService.getVirtualScrollOffsetPx()
	var from = Math.ceil(offsetPx / rowHeight)
	var step = evDataService.getVirtualScrollStep()
	console.log(
		'dubugging.rowsToShow calculateProjection data',
		rowHeight,
		offsetPx,
		step
	)
	evDataService.setProjectionLastFrom(from)

	var to = from + step / 2

	console.timeEnd('Creating projection')
	from = from - step / 2 // two rows, before viewport

	if (from < 0) {
		from = 0
	}
	// console.log('View Context ' + evDataService.getViewContext() + ' flatList length', flatList.length);
	// console.log('View Context ' + evDataService.getViewContext() + ' from', from);
	// console.log('View Context ' + evDataService.getViewContext() + ' to', to);
	console.log('dubugging.rowsToShow calculateProjection from to', from, to)
	return flatList.slice(from, to)
}

var isGroupSelected = function (groupId, parentGroupId, evDataService) {
	if (isSelected(evDataService)) {
		return true
	}

	var parentGroup = evDataService.getData(parentGroupId)

	var selected = false

	parentGroup.results.forEach(function (item) {
		if (item.___id === groupId) {
			selected = item.___is_activated
		}
	})

	return selected
}

var isSelected = function (evDataService) {
	return evDataService.getSelectAllRowsState()
}

var getColumnWidth = function (column) {
	var defaultWidth = 100 + 'px'

	if (column.hasOwnProperty('id')) {
		var groupsWidth = metaService.columnsWidthGroups()

		switch (column.value_type) {
			case 10:
				return groupsWidth.groupThree
				break
			case 40:
				return groupsWidth.groupFive
				break
			case 30:
				return groupsWidth.groupFive
				break
			default:
				return defaultWidth
				break
		}
	} else if (column.hasOwnProperty('key')) {
		return defaultWidth
	}

	return undefined
}

var setColumnsDefaultWidth = function (evDataService) {
	var columns = evDataService.getColumns()

	// var groupsWidth = metaService.columnsWidthGroups();

	// var defaultWidth = 100;

	columns.forEach(function (column) {
		if (!column.style) {
			column.style = {}
		}

		if (!column.style.width) {
			/* if (column.hasOwnProperty('key')) {
                    column.style.width = defaultWidth + 'px';
                }

                if (column.hasOwnProperty('id')) {

                    switch (column.value_type) {
                        case 10:
                            column.style.width = groupsWidth.groupThree;
                            break;
                        case 20:
                            column.style.width = defaultWidth + 'px';
                            break;
                        case 40:
                            column.style.width = groupsWidth.groupFive;
                            break;
                        case 30:
                            column.style.width = groupsWidth.groupFive;
                            break;
                    }

                } */
			column.style.width = getColumnWidth(column)
		}
	})

	evDataService.setColumns(columns)
}

var updateColumnsIds = function (evDataService) {
	var columns = evDataService.getColumns()

	columns.forEach(function (item) {
		item.___column_id = getColumnId(item)
	})

	evDataService.setColumns(columns)
}

var setDefaultObjects = function (
	entityViewerDataService,
	entityViewerEventService,
	requestParameters,
	page
) {
	var obj
	var step = requestParameters.pagination.page_size
	var event = requestParameters.event
	var pageAsIndex = parseInt(page, 10) - 1
	var i

	if (!event.___id) {
		var rootGroupData = entityViewerDataService.getRootGroupData()

		obj = Object.assign({}, rootGroupData)
	} else {
		var groupData = entityViewerDataService.getData(event.___id)

		if (groupData) {
			obj = Object.assign({}, groupData)
		} else {
			obj = {
				results: [],
			}
		}
	}

	for (i = 0; i < step; i = i + 1) {
		if (pageAsIndex * step + i < obj.count) {
			if (!obj.results[pageAsIndex * step + i]) {
				obj.results[pageAsIndex * step + i] = {
					id: '___placeholder_object_' + (pageAsIndex * step + i),
					___type: 'placeholder_object',
					___parentId: obj.___id,
					___index: pageAsIndex * step + i,
				}

				obj.results[pageAsIndex * step + i].___id = evRvCommonHelper.getId(
					obj.results[pageAsIndex * step + i]
				)
			}
		}
	}

	obj.results = obj.results.filter(function (item) {
		return item.___type !== 'control'
	})

	/* var controlObj = {
            ___parentId: obj.___id,
            ___type: 'control',
            ___level: obj.___level + 1
        };

        controlObj.___id = evRvCommonHelper.getId(controlObj);

        obj.results.push(controlObj); */

	entityViewerDataService.setData(obj)
}

var deleteDefaultObjects = function (
	entityViewerDataService,
	entityViewerEventService,
	requestParameters,
	errorMessage
) {
	var obj
	var event = requestParameters.event

	if (!event.___id) {
		var rootGroupData = entityViewerDataService.getRootGroupData()

		obj = Object.assign({}, rootGroupData)
	} else {
		var groupData = entityViewerDataService.getData(event.___id)

		if (groupData) {
			obj = Object.assign({}, groupData)
		} else {
			obj = {
				results: [],
			}
		}
	}

	obj.results = obj.results.filter(function (item) {
		return item.___type !== 'control' && item.___type !== 'placeholder_object'
	})

	/* var controlObj = {
			___errorMessage: errorMessage,
			___parentId: obj.___id,
			___type: 'control',
			___level: obj.___level + 1
		};

		controlObj.___id = evRvCommonHelper.getId(controlObj);

        obj.results.push(controlObj); */

	entityViewerDataService.setData(obj)
}

var setDefaultGroups = function (
	entityViewerDataService,
	entityViewerEventService,
	requestParameters,
	page
) {
	var obj
	var step = requestParameters.pagination.page_size
	var event = requestParameters.event
	var pageAsIndex = parseInt(page, 10) - 1
	var i

	if (!event.___id) {
		var rootGroupData = entityViewerDataService.getRootGroupData()

		obj = Object.assign({}, rootGroupData)
	} else {
		var groupData = entityViewerDataService.getData(event.___id)

		if (groupData) {
			obj = Object.assign({}, groupData)
		} else {
			obj = {
				results: [],
			}
		}
	}

	console.log('setDefaultGroups obj.count', obj.count)

	for (i = 0; i < step; i = i + 1) {
		if (pageAsIndex * step + i < obj.count) {
			if (!obj.results[pageAsIndex * step + i]) {
				obj.results[pageAsIndex * step + i] = {
					id: '___placeholder_group_' + (pageAsIndex * step + i),
					___type: 'placeholder_group',
					___parentId: obj.___id,
					___index: pageAsIndex * step + i,
				}

				obj.results[pageAsIndex * step + i].___id = evRvCommonHelper.getId(
					obj.results[pageAsIndex * step + i]
				)
			}
		}
	}

	console.log('SET DEFAULT GROUPS.results', obj.results)

	obj.results = obj.results.filter(function (item) {
		return item.___type !== 'control'
	})

	var controlObj = {
		___parentId: obj.___id,
		___type: 'control',
		___level: obj.___level + 1,
	}

	controlObj.___id = evRvCommonHelper.getId(controlObj)

	obj.results.push(controlObj)

	entityViewerDataService.setData(obj)
}

var deleteDefaultGroups = function (
	entityViewerDataService,
	entityViewerEventService,
	requestParameters,
	errorMessage
) {
	var obj
	var event = requestParameters.event

	if (!event.___id) {
		var rootGroupData = entityViewerDataService.getRootGroupData()

		obj = Object.assign({}, rootGroupData)
	} else {
		var groupData = entityViewerDataService.getData(event.___id)

		if (groupData) {
			obj = Object.assign({}, groupData)
		} else {
			obj = {
				results: [],
			}
		}
	}

	obj.results = obj.results.filter(function (item) {
		return item.___type !== 'control'
	})

	var controlObj = {
		___errorMessage: errorMessage,
		___parentId: obj.___id,
		___type: 'control',
		___level: obj.___level + 1,
	}

	controlObj.___id = evRvCommonHelper.getId(controlObj)

	obj.results = obj.results.filter(function (item) {
		return item.___type !== 'placeholder_group'
	})

	obj.results.push(controlObj)

	entityViewerDataService.setData(obj)
}

var calculatePageFromOffset = function (requestParameters, evDataService) {
	var group = evDataService.getGroup(requestParameters.id)
	var resultPage

	if (!group) {
		resultPage = 1
		return resultPage
	}

	console.log('group', group)

	var rowHeight = evDataService.getRowHeight()

	var previousOffsetPx = evDataService.getVirtualScrollPreviousOffsetPx()
	var offsetPx = evDataService.getVirtualScrollOffsetPx()
	var scrollDirection = evDataService.getVirtualScrollDirection()
	var offset = Math.floor(offsetPx / rowHeight)

	var pagination = evDataService.getPagination()
	var step = pagination.page_size

	var maxPage = Math.ceil(group.count / step)

	resultPage = Math.ceil(offset / step)

	if (Math.abs(offsetPx - previousOffsetPx) < 100) {
		if (scrollDirection === 'top') {
			resultPage = Math.ceil(offset / step) - 1
		}

		if (scrollDirection === 'bottom') {
			if (offset - resultPage * step < 5) {
				resultPage = Math.ceil(offset / step) + 1
			}
		}
	}

	if (resultPage === 0 || resultPage < 0) {
		resultPage = 1
	}

	if (resultPage > maxPage) {
		resultPage = maxPage
	}

	// console.log('direction', scrollDirection);
	// console.log('offset px', offsetPx);
	// console.log('offset', offset);
	// console.log('page', resultPage);

	return resultPage
}
/**
 * Returns group type and chain of parent group types based on level
 *
 * @param {Number} level
 * @param evDataService
 * @returns {*[]}
 */
var getGroupsTypesToLevel = function (level, evDataService) {
	var groups = evDataService.getGroups()
	var group_types = []

	var to = level

	if (level >= groups.length) {
		to = groups.length - 1
	}

	for (var i = 0; i <= to; i = i + 1) {
		group_types.push(groups[i])

		// if (groups[i].hasOwnProperty('id')) {
		//     group_types.push(groups[i].id)
		// } else {
		//     group_types.push(groups[i].key)
		// }
	}

	return group_types
}

var getGroupsValuesByItem = function (item, evDataService) {
	var parents = evRvCommonHelper.getParents(item.___parentId, evDataService)
	var groups_values = []

	parents.forEach(function (parentItem) {
		if (parentItem.___parentId) {
			groups_values.push(parentItem.___group_identifier)
		}
	})

	return groups_values.reverse()
}

var separateNotGroupingColumns = function (columns, groups) {
	const notGroupingColumns = []

	columns.forEach((column) => {
		const isGroupingColumn = groups.find((group) => {
			return group.key === column.key
		})

		if (!isGroupingColumn) {
			notGroupingColumns.push(column)
		}
	})

	return notGroupingColumns
}

var importGroupsStylesFromColumns = function (groups, columns) {
	let columnStyles = {}

	columns.forEach((column) => {
		columnStyles[column.key] = column.style
	})

	groups.forEach((group) => {
		group.style = columnStyles[group.key]
	})
}

var clearLastActiveObject = function (evDataService) {
	var objects = evDataService.getObjects()

	objects.forEach(function (item) {
		item.___is_active_object = false
		evDataService.setObject(item)
	})
}

var clearObjectActiveState = function (evDataService) {
	var objects = evDataService.getObjects()

	objects.forEach(function (item) {
		item.___is_activated = false
		item.___is_active_object = false

		evDataService.setObject(item)
	})
}

// MATERIAL DESIGN ENTITY VIEWER LOGIC

var getObjectsFromSelectedGroups = function (evDataService, globalDataService) {
	var result = []

	var selectedGroups = evDataService.getSelectedGroups()
	var multiselectState = evDataService.getSelectedGroupsMultiselectState()

	console.log('getObjectsFromSelectedGroups.selectedGroups', selectedGroups)

	var controlObj = null

	if (selectedGroups.length) {
		selectedGroups.forEach(function (group) {
			var rawData = evDataService.getData(group.___id)

			if (rawData) {
				var data = JSON.parse(JSON.stringify(rawData))

				console.log('getObjectsFromSelectedGroups.data', data)

				data.results.forEach(function (item) {
					if (item.___type === 'object') {
						result.push(item)
					} else if (item.___type === 'placeholder_object') {
						result.push(item)
					} else if (item.___type === 'control') {
						// if (!multiselectState) {
						controlObj = item
						// }
					}
				})
			}
		})
	} else {
		var rawData = evDataService.getRootGroupData()

		if (rawData) {
			var data = JSON.parse(JSON.stringify(rawData))

			console.log('getObjectsFromSelectedGroups.data', data)

			data.results.forEach(function (item) {
				if (item.___type === 'object') {
					result.push(item)
				} else if (item.___type === 'placeholder_object') {
					result.push(item)
				} else if (item.___type === 'control') {
					// if (!multiselectState) {
					controlObj = item
					// }
				}
			})
		}
	}

	if (controlObj) {
		result.push(controlObj)
	}

	evDataService.setUnfilteredFlatList(result)

	result = filterByRowColor(result, evDataService, globalDataService)

	console.log('getObjectsFromSelectedGroups.result', result)

	return result
}

var getGroupsAsTree = function (evDataService) {
	var data = JSON.parse(JSON.stringify(evDataService.getData()))
	var rootGroup = JSON.parse(JSON.stringify(evDataService.getRootGroupData()))

	var tree = utilsHelper.convertToTree(data, rootGroup)

	console.log('getFlatStructure.data', data)
	console.log('getFlatStructure.rootGroup', rootGroup)
	console.log('getFlatStructure.tree', tree)

	return tree
}

export default {
	getGroupNameFromParent: getGroupNameFromParent,
	getGroupIdentifierFromParent: getGroupIdentifierFromParent,

	getAllChildrenGroups: getAllChildrenGroups,

	ifFirstRequestForRootGroup: ifFirstRequestForRootGroup,
	isFirstRequestForObjects: isFirstRequestForObjects,

	getFlatStructure: getFlatStructure,
	getUnfoldedGroups: getUnfoldedGroups,
	getUnfoldedGroupsByLevel: getUnfoldedGroupsByLevel,
	getGroupsByLevel: getGroupsByLevel,

	getObject: getObject,

	getNextPage: getNextPage,

	getGroupTypeId: getGroupTypeId,
	getColumnId: getColumnId,

	getGroupTypes: getGroupTypes,
	getGroupsValues: getGroupsValues,
	calculateProjection: calculateProjection,

	getColumnWidth: getColumnWidth,
	setColumnsDefaultWidth: setColumnsDefaultWidth,
	updateColumnsIds: updateColumnsIds,

	calculatePageFromOffset: calculatePageFromOffset,

	/* prepareRowAndGetPopupMenu: prepareRowAndGetPopupMenu,
        prepareSubtotalAndGetPopupMenu: prepareSubtotalAndGetPopupMenu,

        preparePopupMenuType2: preparePopupMenuType2,
        calculateMenuPosition: calculateMenuPosition,
        calculateStaticMenuPosition: calculateStaticMenuPosition, */

	setDefaultGroups: setDefaultGroups,
	setDefaultObjects: setDefaultObjects,
	deleteDefaultObjects: deleteDefaultObjects,
	deleteDefaultGroups: deleteDefaultGroups,

	isGroupSelected: isGroupSelected,
	isSelected: isSelected,

	getGroupsTypesToLevel: getGroupsTypesToLevel,
	getGroupsValuesByItem: getGroupsValuesByItem,

	separateNotGroupingColumns: separateNotGroupingColumns,
	importGroupsStylesFromColumns: importGroupsStylesFromColumns,

	clearLastActiveObject: clearLastActiveObject,
	clearObjectActiveState: clearObjectActiveState,

	getObjectsFromSelectedGroups: getObjectsFromSelectedGroups,
	getGroupsAsTree: getGroupsAsTree,
}
