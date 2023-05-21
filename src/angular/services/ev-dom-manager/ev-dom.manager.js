import evDataHelper from '../../helpers/ev-data.helper'
import utilsHelper from '../../helpers/utils.helper'
import evRvCommonHelper from '../../helpers/ev-rv-common.helper'
import metaHelper from '../../helpers/meta.helper'
import evEvents from '../../services/entityViewerEvents'

import EvRvDomManagerService from '../evRvDomManagerService'
var evRvDomManagerService = new EvRvDomManagerService()

import metaService from '../../services/metaService'

var requestGroups = function (
	groupHashId,
	parentGroupHashId,
	evDataService,
	evEventService
) {
	var currentGroupName = evDataHelper.getGroupNameFromParent(
		groupHashId,
		parentGroupHashId,
		evDataService
	)
	var currentGroupIdentifier = evDataHelper.getGroupIdentifierFromParent(
		groupHashId,
		parentGroupHashId,
		evDataService
	)

	var pagination = evDataService.getPagination()

	var event = {
		parentGroupId: parentGroupHashId,
		groupId: groupHashId,
		groupName: currentGroupName,
		groupIdentifier: currentGroupIdentifier,
	}

	var requestParameters = {
		requestType: 'groups',
		id: groupHashId,
		pagination: {
			page: 1,
			page_size: pagination.page_size,
			count: 1,
		},
		event: {
			___id: groupHashId,
			parentGroupId: parentGroupHashId,
			groupId: groupHashId,
			groupName: currentGroupName,
			groupIdentifier: currentGroupIdentifier,
		},
		body: {
			groups_types: evDataHelper.getGroupTypes(
				groupHashId,
				parentGroupHashId,
				evDataService
			),
			groups_values: evDataHelper.getGroupsValues(
				groupHashId,
				parentGroupHashId,
				evDataService
			),
			page_size: pagination.page_size,
			page: 1,
		},
		requestedPages: [1],
		processedPages: [],
	}

	console.log('requestParameters', requestParameters)

	evDataService.setRequestParameters(requestParameters)
	evDataService.setLastClickInfo(event)
	evDataService.setActiveRequestParametersId(requestParameters.id)

	evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
}

var requestObjects = function (
	groupHashId,
	parentGroupHashId,
	evDataService,
	evEventService
) {
	console.log('Request objects')

	var requestParameters = evDataService.getRequestParameters(groupHashId)

	var groupTypes = evDataHelper.getGroupTypes(
		groupHashId,
		parentGroupHashId,
		evDataService
	)
	var groupValues = evDataHelper.getGroupsValues(
		groupHashId,
		parentGroupHashId,
		evDataService
	)
	var pagination = evDataService.getPagination()

	var currentGroupName = evDataHelper.getGroupNameFromParent(
		groupHashId,
		parentGroupHashId,
		evDataService
	)
	var currentGroupIdentifier = evDataHelper.getGroupIdentifierFromParent(
		groupHashId,
		parentGroupHashId,
		evDataService
	)

	if (!requestParameters) {
		requestParameters = {}
	}

	requestParameters.requestType = 'objects'
	requestParameters.id = groupHashId

	requestParameters.event = {
		___id: groupHashId,
		parentGroupId: parentGroupHashId,
		groupId: groupHashId,

		groupName: currentGroupName,
		groupIdentifier: currentGroupIdentifier,
	}

	requestParameters.requestedPages = [1]

	requestParameters.body = {
		groups_types: groupTypes,
		groups_values: groupValues,
		page_size: pagination.page_size,
		page: 1,
	}

	evDataService.setRequestParameters(requestParameters)
	evDataService.setActiveRequestParametersId(requestParameters.id)

	evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
}

/* var foldChildGroups = function (parentGroupId, evDataService) {

        var childrens = evDataHelper.getAllChildrenGroups(parentGroupId, evDataService);

        var item;

        childrens.forEach(function (children) {

            if (children.___type === 'group') {

                item = evDataService.getData(children.___id);

                if (item) {
                    item.___is_open = false;
                    evDataService.setData(item);
                } else {
                    children.___is_open = false;
                    evDataService.setData(children);
                }


            }

        })

    }; */

/* var clearObjectActiveState = function (evDataService, evEventService) {

        var objects = evDataService.getObjects();

        objects.forEach(function (item) {
            item.___is_activated = false;
            item.___is_active_object = false;

            evDataService.setObject(item);
        });

    }; */

/* var clearGroupActiveState = function (evDataService, evEventService) {

        var groups = evDataService.getDataAsList();

        groups.forEach(function (item) {
            item.___is_activated = false;
            evDataService.setData(item);
        });

    }; */

var handleShiftSelection = function (evDataService, evEventService, clickData) {
	var lastActiveRow = evDataService.getActiveObjectRow()

	console.log('lastActiveRow', lastActiveRow)

	if (!lastActiveRow) {
		if (clickData.___type === 'object') {
			var obj = Object.assign(
				{},
				evDataHelper.getObject(
					clickData.___id,
					clickData.___parentId,
					evDataService
				)
			)

			obj.___is_activated = !obj.___is_activated
			evDataService.setObject(obj)
			evDataService.setActiveObjectRow(obj)
		} else if (clickData.___type === 'group') {
			var group = evDataService.getData(clickData.___id)

			if (group) {
				group.___is_activated = !group.___is_activated

				evDataService.setActiveObjectRow({
					___id: clickData.___id,
					___parentId: clickData.___parentId,
				})

				evDataService.setData(group)
			} else {
				var objGroup = Object.assign(
					{},
					evDataHelper.getObject(
						clickData.___id,
						clickData.___parentId,
						evDataService
					)
				)

				objGroup.___is_activated = !objGroup.___is_activated
				evDataService.setObject(objGroup)
			}
		}
	} else {
		var list = evDataService.getFlatList()

		var activeObjectIndex
		var currentObjectIndex

		var from, to

		list.forEach(function (item, index) {
			if (item.___id === lastActiveRow.___id) {
				activeObjectIndex = index
			}

			if (item.___id === clickData.___id) {
				currentObjectIndex = index
			}
		})

		if (currentObjectIndex > activeObjectIndex) {
			from = activeObjectIndex
			to = currentObjectIndex
		} else {
			from = currentObjectIndex
			to = activeObjectIndex
		}

		var activated_ids = []

		list.forEach(function (item, index) {
			if (index >= from && index <= to) {
				activated_ids.push(item.___id)
			}
		})

		console.log('activated_ids', activated_ids)

		// clearGroupActiveState(evDataService, evEventService);
		evDataHelper.clearObjectActiveState(evDataService, evEventService)

		list.forEach(function (object) {
			if (activated_ids.indexOf(object.___id) !== -1) {
				group = evDataService.getData(object.___parentId)

				if (group) {
					group.___is_activated = true
					evDataService.setData(group)
				}

				object.___is_activated = true
				evDataService.setObject(object)
			}
		})
	}

	evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
}

var areAllRowsActive = function (evDataService) {
	var selGroups = evDataService.getSelectedGroups()
	var allItemsCount = 0

	selGroups.forEach(function (group) {
		allItemsCount += group.___items_count
	})

	var flatList = evDataService.getFlatList()
	var loadedObjects = flatList.length - 1 // -1 because of control at the end

	if (loadedObjects !== allItemsCount) return false

	var inactiveRowDoesNotExist = !!!flatList.find(
		(item) => item.___type === 'object' && !item.___is_activated
	)

	return inactiveRowDoesNotExist
}

/* var handleGroupClick = function (clickData, evDataService, evEventService) {

        var group = evDataService.getData(clickData.___id);
        var obj;

        if (!group) {
            obj = Object.assign({}, evDataHelper.getObject(clickData.___id, clickData.___parentId, evDataService));
        }

        var isFoldButtonPressed = clickData.target.classList.contains('ev-fold-button');

        if (isFoldButtonPressed) {

            if (group && group.___is_open) {

                group.___is_open = false;

                evDataService.setData(group);

                foldChildGroups(group.___id, evDataService);

                evEventService.dispatchEvent(evEvents.REDRAW_TABLE)

            } else {

                var parents = evRvCommonHelper.getParents(clickData.___parentId, evDataService);
                var groups = evDataService.getGroups();

                if (group) { // initialized only first data request

                    group.___is_open = true;

                    evDataService.setData(group);

                }

                if (parents.length < groups.length) {

                    requestGroups(clickData.___id, clickData.___parentId, evDataService, evEventService);

                } else {

                    requestObjects(clickData.___id, clickData.___parentId, evDataService, evEventService)
                }

            }

        } else {

            if (clickData.isShiftPressed) {

                handleShiftSelection(evDataService, evEventService, clickData);

            }

            if (clickData.isCtrlPressed && !clickData.isShiftPressed) {

                if (group) {
                    group.___is_activated = true;
                    evDataService.setData(group);
                    evDataService.setActiveObjectRow(group);
                } else {

                    var obj = evDataHelper.getObject(clickData.___id, clickData.___parentId, evDataService);
                    obj.___is_activated = true;
                    evDataService.setObject(obj);
                    evDataService.setActiveObjectRow(obj);

                }

                evEventService.dispatchEvent(evEvents.REDRAW_TABLE);
            }

            if (!clickData.isCtrlPressed && !clickData.isShiftPressed) {

                var state;

                if (group) {
                    state = group.___is_activated;
                } else {
                    state = obj.___is_activated
                }

                clearGroupActiveState(evDataService, evEventService);
                evDataHelper.clearObjectActiveState(evDataService, evEventService);

                if (group) {
                    group.___is_activated = !state;
                    evDataService.setData(group);
                    evDataService.setActiveObjectRow(group);
                } else {
                    obj.___is_activated = !state;
                    evDataService.setObject(obj);
                    evDataService.setActiveObjectRow(obj);
                }


                evEventService.dispatchEvent(evEvents.REDRAW_TABLE);
            }


        }


    }; */

var handleObjectClick = function (clickData, evDataService, evEventService) {
	var obj = Object.assign(
		{},
		evDataHelper.getObject(
			clickData.___id,
			clickData.___parentId,
			evDataService
		)
	)

	if (clickData.isCtrlPressed && !clickData.isShiftPressed) {
		obj.___is_activated = !obj.___is_activated

		if (!obj.___is_activated) {
			obj.___is_active_object = false
		}

		evDataService.setObject(obj)
		evDataService.setActiveObjectRow(obj)

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
	} else if (!clickData.isCtrlPressed && clickData.isShiftPressed) {
		handleShiftSelection(evDataService, evEventService, clickData)
	} else if (!clickData.isShiftPressed && !clickData.isCtrlPressed) {
		evDataHelper.clearObjectActiveState(evDataService, evEventService)

		obj.___is_activated = !obj.___is_activated
		obj.___is_active_object = !obj.___is_active_object

		evDataService.setObject(obj)

		if (obj.___is_active_object || obj.___is_activated) {
			obj.___is_activated = true // in case of click on highlighted by ctrl or shift row

			evDataService.setActiveObject(obj)

			evDataService.setActiveObjectRow(obj)
			evEventService.dispatchEvent(evEvents.ACTIVE_OBJECT_CHANGE)
		} else {
			evDataService.setActiveObject(null)
			evDataService.setActiveObjectRow(null)
		}

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
	}

	var allRowsAreActive = areAllRowsActive(evDataService)
	evDataService.setSelectAllRowsState(allRowsAreActive)

	evEventService.dispatchEvent(evEvents.ROW_ACTIVATION_CHANGE)
}

// DEPRECATED OLD VERSION
// var handleControlClick = function (clickData, evDataService, evEventService) {
//
//     var groupHashId = clickData.___parentId;
//
//     var requestParameters = evDataService.getRequestParameters(groupHashId);
//
//     if (!requestParameters.body.page) {
//         requestParameters.body.page = 1;
//         requestParameters.requestedPages = [1]
//     }
//
//     var isLoadMoreButtonPressed = clickData.target.classList.contains('load-more');
//     var isLoadAllButtonPressed = clickData.target.classList.contains('load-all');
//
//     if (isLoadMoreButtonPressed) {
//
//         requestParameters.body.page = requestParameters.body.page + 1;
//         requestParameters.pagination.page = requestParameters.pagination.page + 1;
//         requestParameters.requestedPages.push(requestParameters.body.page);
//
//         evDataService.setRequestParameters(requestParameters);
//         evDataService.setActiveRequestParametersId(requestParameters.id);
//
//     }
//
//     if (isLoadAllButtonPressed) {
//
//         requestParameters.loadAll = true;
//
//         requestParameters.body.page = requestParameters.body.page + 1;
//         requestParameters.pagination.page = requestParameters.pagination.page + 1;
//         requestParameters.requestedPages.push(requestParameters.body.page);
//
//         evDataService.setRequestParameters(requestParameters);
//
//     }
//
//     evEventService.dispatchEvent(evEvents.UPDATE_TABLE);
//
// };

var handleControlClick = function (clickData, evDataService, evEventService) {
	var selectedGroups = evDataService.getSelectedGroups()

	if (selectedGroups && selectedGroups.length) {
		selectedGroups.forEach(function (selectedGroup) {
			console.log('selectedGroup', selectedGroup)

			var groupHashId = selectedGroup.___id

			var requestParameters = evDataService.getRequestParameters(groupHashId)

			var total_pages = Math.ceil(
				requestParameters.pagination.count /
					requestParameters.pagination.page_size
			)

			if (requestParameters.body.page < total_pages) {
				if (!requestParameters.body.page) {
					requestParameters.body.page = 1
					requestParameters.requestedPages = [1]
				}

				var isLoadMoreButtonPressed =
					clickData.target.classList.contains('load-more')
				var isLoadAllButtonPressed =
					clickData.target.classList.contains('load-all')

				if (isLoadMoreButtonPressed) {
					requestParameters.body.page = requestParameters.body.page + 1
					requestParameters.pagination.page =
						requestParameters.pagination.page + 1
					requestParameters.requestedPages.push(requestParameters.body.page)

					evDataService.setRequestParameters(requestParameters)
					evDataService.setActiveRequestParametersId(requestParameters.id)
				}

				if (isLoadAllButtonPressed) {
					requestParameters.loadAll = true

					requestParameters.body.page = requestParameters.body.page + 1
					requestParameters.pagination.page =
						requestParameters.pagination.page + 1
					requestParameters.requestedPages.push(requestParameters.body.page)

					evDataService.setRequestParameters(requestParameters)
				}
			}
		})
	} else {
		var groupHashId = clickData.___parentId

		var requestParameters = evDataService.getRequestParameters(groupHashId)

		var total_pages = Math.ceil(
			requestParameters.pagination.count /
				requestParameters.pagination.page_size
		)

		if (requestParameters.body.page < total_pages) {
			if (!requestParameters.body.page) {
				requestParameters.body.page = 1
				requestParameters.requestedPages = [1]
			}

			var isLoadMoreButtonPressed =
				clickData.target.classList.contains('load-more')
			var isLoadAllButtonPressed =
				clickData.target.classList.contains('load-all')

			if (isLoadMoreButtonPressed) {
				requestParameters.body.page = requestParameters.body.page + 1
				requestParameters.pagination.page =
					requestParameters.pagination.page + 1
				requestParameters.requestedPages.push(requestParameters.body.page)

				evDataService.setRequestParameters(requestParameters)
				evDataService.setActiveRequestParametersId(requestParameters.id)
			}

			if (isLoadAllButtonPressed) {
				requestParameters.loadAll = true

				requestParameters.body.page = requestParameters.body.page + 1
				requestParameters.pagination.page =
					requestParameters.pagination.page + 1
				requestParameters.requestedPages.push(requestParameters.body.page)

				evDataService.setRequestParameters(requestParameters)
			}
		}
	}
	evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
}

var getClickData = function (event) {
	var clickData = {}
	var rowElem = event.target.closest('.g-row')

	clickData.isShiftPressed = event.shiftKey
	clickData.isCtrlPressed = event.ctrlKey
	clickData.target = event.target

	if (rowElem) {
		if (clickData.target.classList.contains('openLinkInNewTab')) {
			clickData.___type = 'hyperlink'
		} else {
			clickData.___type = rowElem.dataset.type
			clickData.___id = rowElem.dataset.objectId
			clickData.___parentId = rowElem.dataset.parentGroupHashId

			/* if (event.target.classList.contains('ev-fold-button')) {
                    clickData.isFoldButtonPressed = true;
                }

                if (rowElem.dataset.subtotalType) {
                    clickData.___subtotal_type = rowElem.dataset.subtotalType;
                }

                if (rowElem.dataset.subtotalSubtype) {
                    clickData.___subtotal_subtype = rowElem.dataset.subtotalSubtype;
                } */
		}

		if (clickData.target.classList.contains('gTableActionBtn')) {
			// clickData.actionElem = clickedActionBtn;
			clickData.actionType = clickData.target.dataset.clickActionType
		}
	}

	console.log('clickData', clickData)

	return clickData
}

var initEventDelegation = function (
	elem,
	evDataService,
	evEventService,
	usersService,
	globalDataService
) {
	elem.addEventListener('click', function (event) {
		var clickData = getClickData(event)

		var entityType = evDataService.getEntityType()

		console.log('clickData', clickData)
		console.log('detail', event.detail)

		var selection = window.getSelection().toString()

		console.log('selection', selection)
		if (clickData.___type === 'hyperlink') {
			metaHelper.openLinkInNewTab(event)
		} else if (event.detail === 2) {
			// double click handler

			if (clickData.___type === 'object') {
				var objectId = clickData.___id
				var parentGroupHashId = clickData.___parentId

				var obj = evDataHelper.getObject(
					objectId,
					parentGroupHashId,
					evDataService
				)

				// var dropdownAction = 'edit';

				evDataService.setActiveObject(obj)
				// evDataService.setActiveObjectAction(dropdownAction);

				if (entityType === 'complex-transaction') {
					evDataService.setRowsActionData({
						actionKey: 'view_transaction',
						object: obj,
					})
				} else {
					evDataService.setRowsActionData({ actionKey: 'edit', object: obj })
				}

				evEventService.dispatchEvent(evEvents.ACTIVE_OBJECT_CHANGE)
				evEventService.dispatchEvent(evEvents.ROWS_ACTION_FIRED)

				var allRowsAreActive = areAllRowsActive(evDataService)
				evDataService.setSelectAllRowsState(allRowsAreActive)

				evEventService.dispatchEvent(evEvents.ROW_ACTIVATION_CHANGE)
			}
		} else if (clickData.isShiftPressed) {
			if (event.detail === 1) {
				/* if (clickData.___type === 'group') {

                        handleGroupClick(clickData, evDataService, evEventService);

                    } */

				if (clickData.___type === 'control') {
					handleControlClick(clickData, evDataService, evEventService)
				}

				if (clickData.___type === 'object') {
					handleObjectClick(clickData, evDataService, evEventService)
				}
			}
		} else if (!selection.length) {
			if (event.detail === 1) {
				/*if (clickData.___type === 'group') {
                        handleGroupClick(clickData, evDataService, evEventService);
                    } else*/
				if (clickData.actionType) {
					switch (clickData.actionType) {
						case 'open_row_color_picker':
							event.stopPropagation()
							evRvDomManagerService.createRowColorPickerMenu(
								clickData,
								evDataService,
								evEventService,
								usersService,
								globalDataService,
								clearDropdowns
							)

							break

						case 'open_context_menu':
							const gRowElem = event.target.closest('.g-row')

							if (gRowElem) {
								const objectId = clickData.___id
								const parentGroupHashId = clickData.___parentId
								const contextMenuPosition = {
									positionX: event.pageX,
									positionY: event.pageY,
								}

								event.stopPropagation()

								createPopupMenu(
									objectId,
									parentGroupHashId,
									evDataService,
									evEventService,
									usersService,
									globalDataService,
									contextMenuPosition
								)
							}

							break
					}
				} else if (clickData.___type === 'control') {
					handleControlClick(clickData, evDataService, evEventService)
				} else if (clickData.___type === 'object') {
					handleObjectClick(clickData, evDataService, evEventService)
				}
			}
		}
	})
}

var clearContextMenuRow = function (evDataService) {
	var objects = evDataService.getObjects()

	var contextMenuItem = objects.find((obj) => obj.___context_menu_is_opened)

	if (contextMenuItem) {
		contextMenuItem.___context_menu_is_opened = false
		evDataService.setObject(contextMenuItem)
	}
}

var clearRowWithContextMenu = function (
	evDataService,
	evEventService,
	redrawTable
) {
	clearContextMenuRow(evDataService)
	if (redrawTable) evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
}

/*  var popupsToClear = [];

    var clearDropdowns = function () {

        var dropdowns = document.querySelectorAll('.ev-dropdown');

        dropdowns.forEach(dropdown => {
            // remove popup after animation
            if (!popupsToClear.includes(dropdown.id)) {

                dropdown.classList.add("fade-out");

                popupsToClear.push(dropdown.id);
                var dropdownIndex = popupsToClear.length - 1;

                setTimeout(function () {

                    dropdown.parentElement.removeChild(dropdown);
                    popupsToClear.splice(dropdownIndex, 1);

                }, 200); // duration of animation

            }

        });

        //<editor-fold desc="Remove dropdown related listeners">
        for (const prop in eventListenerFn2Args) {
            eventListenerFn2Args[prop] = null;
        }
        window.removeEventListener('click', executeContextMenuAction);

        clearDropdownsAndRowsArgs.evDataService = null;
        clearDropdownsAndRowsArgs.evEventService = null;
        window.removeEventListener('contextmenu', callClearDropdownsAndRows);
        //</editor-fold>


    }; */
var clearDropdowns = function () {
	;[eventListenerFn2Args, clearDropdownsAndRowsArgs] =
		evRvDomManagerService.clearDropdowns(
			eventListenerFn2Args,
			clearDropdownsAndRowsArgs,
			executeContextMenuAction,
			callClearDropdownsAndRows
		)
}

var clearDropdownsAndRows = function (
	evDataService,
	evEventService,
	redrawTable
) {
	clearRowWithContextMenu(evDataService, evEventService, redrawTable)
	clearDropdowns()
}

/** Used to pass data into callClearDropdownsAndRows inside event listener */
var clearDropdownsAndRowsArgs = {
	evDataService: null,
	evEventService: null,
}
/**
 * Used to call clearDropdownsAndRows() with arguments inside event listeners
 */
var callClearDropdownsAndRows = function () {
	clearDropdownsAndRows(
		clearDropdownsAndRowsArgs.evDataService,
		clearDropdownsAndRowsArgs.evEventService,
		true
	)
}

/**
 * transfer data into event listener callback ( executeContextMenuAction() )
 *
 * @type {Object} eventListenerFn2Args
 * eventListenerFn2Args.evDataService {Object|null}
 * eventListenerFn2Args.evEventService {Object|null}
 * eventListenerFn2Args.usersService {Object|null}
 * eventListenerFn2Args.globalDataService {Object|null}
 */
var eventListenerFn2Args = {
	evDataService: null,
	evEventService: null,
}

function executeContextMenuAction(event) {
	var objectId = event.target.dataset.objectId
	var parentGroupHashId = event.target.dataset.parentGroupHashId
	var dropdownAction = event.target.dataset.evDropdownAction

	var evDataService = eventListenerFn2Args.evDataService,
		evEventService = eventListenerFn2Args.evEventService,
		usersService = eventListenerFn2Args.usersService,
		globalDataService = eventListenerFn2Args.globalDataService

	var dropdownActionData = {}

	if (dropdownAction === 'mark_row') {
		var color = event.target.dataset.evDropdownActionDataColor

		if (objectId && color && parentGroupHashId) {
			evRvDomManagerService.markRowByColor(
				objectId,
				parentGroupHashId,
				evDataService,
				evEventService,
				usersService,
				globalDataService,
				color
			)
		}

		clearDropdownsAndRows(evDataService, evEventService, true)
	} else if (dropdownAction === 'toggle_row') {
		var obj = evDataHelper.getObject(objectId, parentGroupHashId, evDataService)
		var activeObjChanged = false

		if (obj.___is_activated) {
			if (obj.___is_active_object) {
				evDataService.setActiveObjectRow(null)
				evDataService.setActiveObject(null)
				activeObjChanged = true
			}

			obj.___is_activated = false
			obj.___is_active_object = false

			// evDataService.setActiveObject(null);
		} else {
			// clearObjectActiveState(evDataService);
			// evDataHelper.clearLastActiveObject(evDataService);

			obj.___is_activated = true

			// evDataService.setActiveObject(obj);
			// evDataService.setActiveObjectRow(obj);
		}

		evDataService.setObject(obj)

		clearDropdownsAndRows(evDataService, evEventService, true)

		if (activeObjChanged)
			evEventService.dispatchEvent(evEvents.ACTIVE_OBJECT_CHANGE)

		var allRowsAreActive = areAllRowsActive(evDataService)
		evDataService.setSelectAllRowsState(allRowsAreActive)

		evEventService.dispatchEvent(evEvents.ROW_ACTIVATION_CHANGE)
	} else {
		if (event.target.dataset.hasOwnProperty('evDropdownActionDataId')) {
			dropdownActionData.id = event.target.dataset.evDropdownActionDataId
		}

		if (objectId && dropdownAction && parentGroupHashId) {
			dropdownActionData.actionKey = dropdownAction
			/* var obj = evDataHelper.getObject(objectId, parentGroupHashId, evDataService);

                if (!obj) {
                    obj = {}
                } */
			dropdownActionData.object =
				evDataHelper.getObject(objectId, parentGroupHashId, evDataService) || {}

			// obj.event = event;
			dropdownActionData.event = event

			console.log('dropdownActionData', dropdownActionData)

			// evDataService.setActiveObject(obj);
			/* evDataService.setActiveObjectAction(dropdownAction);
                evDataService.setActiveObjectActionData(dropdownActionData); */
			evDataService.setRowsActionData(dropdownActionData)

			// evEventService.dispatchEvent(evEvents.ACTIVE_OBJECT_CHANGE);
			evEventService.dispatchEvent(evEvents.ROWS_ACTION_FIRED)

			clearDropdownsAndRows(evDataService, evEventService, true)
		}
	}

	if (!event.target.classList.contains('ev-dropdown-option')) {
		clearDropdownsAndRows(evDataService, evEventService, true)
	}

	for (const prop in eventListenerFn2Args) {
		eventListenerFn2Args[prop] = null
	}
}

var addEventListenerForContextMenu = function (
	evDataService,
	evEventService,
	usersService,
	globalDataService
) {
	eventListenerFn2Args.evDataService = evDataService
	eventListenerFn2Args.evEventService = evEventService
	eventListenerFn2Args.usersService = usersService
	eventListenerFn2Args.globalDataService = globalDataService

	window.addEventListener('click', executeContextMenuAction)

	clearDropdownsAndRowsArgs.evDataService = evDataService
	clearDropdownsAndRowsArgs.evEventService = evEventService
	window.addEventListener('contextmenu', callClearDropdownsAndRows)
}

var generateContextMenu = function (
	obj,
	objectId,
	parentGroupHashId,
	evDataService
) {
	var viewContext = evDataService.getViewContext()
	var entityType = evDataService.getEntityType()

	var innerHTMLString = '<div class="ev-dropdown-container">'

	var toggleRowName = obj.___is_activated ? 'Unselect row' : 'Select row'

	innerHTMLString =
		innerHTMLString +
		'<div class="ev-dropdown-option"' +
		' data-ev-dropdown-action="toggle_row"' +
		' data-object-id="' +
		objectId +
		'"' +
		' data-parent-group-hash-id="' +
		parentGroupHashId +
		'">' +
		toggleRowName +
		'</div>'

	if (viewContext === 'reconciliation_viewer') {
		innerHTMLString =
			innerHTMLString +
			'<div class="ev-dropdown-option"' +
			' data-ev-dropdown-action="recon_view_bank_file_line"' +
			' data-object-id="' +
			objectId +
			'"' +
			' data-parent-group-hash-id="' +
			parentGroupHashId +
			'">View Line</div>'

		innerHTMLString =
			innerHTMLString +
			'<div class="ev-dropdown-option"' +
			' data-ev-dropdown-action="recon_book_selected"' +
			' data-object-id="' +
			objectId +
			'"' +
			' data-parent-group-hash-id="' +
			parentGroupHashId +
			'">Book</div>'

		innerHTMLString =
			innerHTMLString +
			'<div class="ev-dropdown-option"' +
			' data-ev-dropdown-action="recon_hide"' +
			' data-object-id="' +
			objectId +
			'"' +
			' data-parent-group-hash-id="' +
			parentGroupHashId +
			'">Hide</div>'
	} else {
		innerHTMLString =
			innerHTMLString +
			'<div class="ev-dropdown-option"' +
			' data-ev-dropdown-action="edit"' +
			' data-object-id="' +
			objectId +
			'"' +
			' data-parent-group-hash-id="' +
			parentGroupHashId +
			'">Edit</div>'

		if (!obj.is_deleted) {
			innerHTMLString =
				innerHTMLString +
				'<div class="ev-dropdown-option"' +
				' data-ev-dropdown-action="delete"' +
				' data-object-id="' +
				objectId +
				'"' +
				' data-parent-group-hash-id="' +
				parentGroupHashId +
				'">Delete</div>'
		}

		if (entityType === 'price-history') {
			innerHTMLString =
				innerHTMLString +
				'<div class="ev-dropdown-option"' +
				' data-ev-dropdown-action="edit_instrument"' +
				' data-object-id="' +
				objectId +
				'"' +
				' data-parent-group-hash-id="' +
				parentGroupHashId +
				'">Edit Instrument</div>'
		}

		if (entityType === 'complex-transaction') {
			innerHTMLString =
				innerHTMLString +
				'<div class="ev-dropdown-option"' +
				' data-ev-dropdown-action="view_transaction"' +
				' data-object-id="' +
				objectId +
				'"' +
				' data-parent-group-hash-id="' +
				parentGroupHashId +
				'">View Transaction</div>' +
				'<div class="ev-dropdown-option"' +
				' data-ev-dropdown-action="lock_transaction"' +
				' data-object-id="' +
				objectId +
				'"' +
				' data-parent-group-hash-id="' +
				parentGroupHashId +
				'">Lock Transaction</div>' +
				'<div class="ev-dropdown-option"' +
				' data-ev-dropdown-action="unlock_transaction"' +
				' data-object-id="' +
				objectId +
				'"' +
				' data-parent-group-hash-id="' +
				parentGroupHashId +
				'">Unlock Transaction</div>' +
				'<div class="ev-dropdown-option"' +
				' data-ev-dropdown-action="ignore_transaction"' +
				' data-object-id="' +
				objectId +
				'"' +
				' data-parent-group-hash-id="' +
				parentGroupHashId +
				'">Ignore Transaction</div>' +
				'<div class="ev-dropdown-option"' +
				' data-ev-dropdown-action="activate_transaction"' +
				' data-object-id="' +
				objectId +
				'"' +
				' data-parent-group-hash-id="' +
				parentGroupHashId +
				'">Activate Transaction</div>'
		}

		if (entityType === 'instrument') {
			innerHTMLString =
				innerHTMLString +
				'<div class="ev-dropdown-option"' +
				' data-ev-dropdown-action="deactivate_instrument"' +
				' data-object-id="' +
				objectId +
				'"' +
				' data-parent-group-hash-id="' +
				parentGroupHashId +
				'">Deactivate</div>' +
				'<div class="ev-dropdown-option"' +
				' data-ev-dropdown-action="activate_instrument"' +
				' data-object-id="' +
				objectId +
				'"' +
				' data-parent-group-hash-id="' +
				parentGroupHashId +
				'">Activate</div>'
		}

		if (
			['complex-transaction', 'price-history', 'currency-history'].indexOf(
				entityType
			) === -1
		) {
			if (obj.is_deleted) {
				innerHTMLString =
					innerHTMLString +
					'<div class="ev-dropdown-option"' +
					' data-ev-dropdown-action="restore_deleted"' +
					' data-object-id="' +
					objectId +
					'"' +
					' data-parent-group-hash-id="' +
					parentGroupHashId +
					'">Restore</div>'
			}
		}
	}

	innerHTMLString = innerHTMLString + '</div>'

	return innerHTMLString
}

var createPopupMenu = function (
	objectId,
	parentGroupHashId,
	evDataService,
	evEventService,
	usersService,
	globalDataService,
	menuPosition
) {
	// var entityType = evDataService.getEntityType();

	clearDropdownsAndRows(evDataService, evEventService)

	/*var dropdownWidth = 320;
        var dropdownOptionHeight = 24;
        var popup = document.createElement('div');

        // clearActivated(evDataService);

        var obj = evDataHelper.getObject(objectId, parentGroupHashId, evDataService);

        obj.___is_activated = true;

        evDataService.setObject(obj);

        popup.id = 'dropdown-' + objectId;
        popup.classList.add('ev-dropdown');

        popup.style.width = dropdownWidth + 'px';
        popup.style.cssText = menuPosition;
        popup.style.position = 'absolute';*/

	var popup = evRvDomManagerService.prepareRowAndGetPopupMenu(
		objectId,
		parentGroupHashId,
		evDataService,
		false
	)
	var obj = evDataHelper.getObject(objectId, parentGroupHashId, evDataService)

	// var innerHTMLString = '';
	// var viewContext = evDataService.getViewContext();

	if (obj) {
		popup.innerHTML = generateContextMenu(
			obj,
			objectId,
			parentGroupHashId,
			evDataService
		)

		evRvDomManagerService.calculateMenuPosition(popup, menuPosition)

		document.body.appendChild(popup)

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)

		addEventListenerForContextMenu(
			evDataService,
			evEventService,
			usersService,
			globalDataService
		)
	}
}

var initContextMenuEventDelegation = function (
	elem,
	evDataService,
	evEventService,
	usersService,
	globalDataService
) {
	var entityType = evDataService.getEntityType()

	if (!metaService.isReport(entityType)) {
		/* function executeContextMenuAction(event) {

                var objectId = event.target.dataset.objectId;
                var parentGroupHashId = event.target.dataset.parentGroupHashId;
                var dropdownAction = event.target.dataset.evDropdownAction;

                if (objectId && dropdownAction && parentGroupHashId) {

                    var obj = evDataHelper.getObject(objectId, parentGroupHashId, evDataService);

                    if (!obj) {
                        obj = {}
                    }

                    obj.event = event;

                    evDataService.setActiveObject(obj);
                    evDataService.setActiveObjectAction(dropdownAction);

                    evEventService.dispatchEvent(evEvents.ACTIVE_OBJECT_CHANGE);

                    clearDropdowns();

                } else {

                    if (!event.target.classList.contains('ev-dropdown-option')) {
                        clearDropdowns();
                    }

                }

            } */

		elem.addEventListener(
			'contextmenu',
			function (ev) {
				var objectId
				var parentGroupHashId

				if (ev.target.offsetParent.classList.contains('ev-viewport')) {
					objectId = ev.target.dataset.objectId
					parentGroupHashId = ev.target.dataset.parentGroupHashId
				} else {
					if (ev.target.offsetParent.classList.contains('g-row')) {
						objectId = ev.target.offsetParent.dataset.objectId
						parentGroupHashId = ev.target.offsetParent.dataset.parentGroupHashId
					}
				}

				console.log('initContextMenuEventDelegation.event', ev)

				console.log('initContextMenuEventDelegation.objectId', objectId)

				if (objectId) {
					ev.preventDefault()
					ev.stopPropagation()

					//var contextMenuPosition = 'top: ' + ev.pageY + 'px; ' + 'left: ' + ev.pageX + 'px';
					var contextMenuPosition = {
						positionX: ev.pageX,
						positionY: ev.pageY,
					}

					createPopupMenu(
						objectId,
						parentGroupHashId,
						evDataService,
						evEventService,
						usersService,
						globalDataService,
						contextMenuPosition
					)

					return false
				}
			},
			false
		)

		/* window.addEventListener('contextmenu', function () {
                clearDropdowns();
            }); */

		/* window.addEventListener('click', function (event) {

                if (!event.target.classList.contains('viewer-table-toggle-contextmenu-btn')) {

                    var objectId = event.target.dataset.objectId;
                    var parentGroupHashId = event.target.dataset.parentGroupHashId;
                    var dropdownAction = event.target.dataset.evDropdownAction;

                    if (objectId && dropdownAction && parentGroupHashId) {

                        var obj = evDataHelper.getObject(objectId, parentGroupHashId, evDataService);

                        if (!obj) {
                            obj = {}
                        }

                        obj.event = event;

                        evDataService.setActiveObject(obj);
                        evDataService.setActiveObjectAction(dropdownAction);

                        evEventService.dispatchEvent(evEvents.ACTIVE_OBJECT_CHANGE);

                        clearDropdowns();

                    } else {

                        if (!event.target.classList.contains('ev-dropdown-option')) {
                            clearDropdowns();
                        }

                    }

                }

            });*/
	}
}

var calculatePaddingTop = function (evDataService) {
	return evDataService.getVirtualScrollOffsetPx()
}

var calculateTotalHeight = function (evDataService) {
	// var unfoldedGroups = evDataHelper.getUnfoldedGroups(evDataService);
	//
	// var count = 0;
	//
	// unfoldedGroups.forEach(function (group) {
	//     count = count + group.results.length + 1; // 1 for control row
	// });
	//
	// var rowHeight = evDataService.getRowHeight();
	//
	// var extraHeight = 10 * rowHeight;
	//
	// return Math.floor(rowHeight * count) + extraHeight;

	var count = evDataService.getFlatList().length

	var rowHeight = evDataService.getRowHeight()

	var extraHeight = 10 * rowHeight

	return Math.floor(rowHeight * count) + extraHeight
}

/*var calculateContentWrapHeight = function (rootWrapElem, contentWrapElement, evDataService) { // Works only for contentWrap that is not from split panel

        var splitPanelIsActive = evDataService.isSplitPanelActive();

        if (splitPanelIsActive) {
            var interfaceLayout = evDataService.getInterfaceLayout();
            //var contentWrapElementHeight = document.body.clientHeight - interfaceLayout.headerToolbar.height - interfaceLayout.splitPanel.height;
            var rootWrapElemHeight = rootWrapElem.clientHeight;
            var contentWrapElementHeight = rootWrapElemHeight - interfaceLayout.splitPanel.height;

            contentWrapElement.style.height = contentWrapElementHeight + "px";
        } else {
            contentWrapElement.style.height = "";
        }

    };*/

var calculateScroll = function (elements, evDataService, evScrollManager) {
	evScrollManager.setViewportElem(elements.viewportElem) // .ev-viewport
	evScrollManager.setContentElem(elements.contentElem) // .ev-content
	evScrollManager.setContentWrapElem(elements.contentWrapElem)
	evScrollManager.setLeftPanelElem(elements.leftPanelElem)

	/* if (elements.rootWrapElem) { // split panel inside iframe does not have access to rootWrapElem
            evScrollManager.setRootWrapElem(elements.rootWrapElem);
        } */

	var interfaceLayout = evDataService.getInterfaceLayout()
	var components = evDataService.getComponents()

	var contentWrapElemHeight = evScrollManager.getContentWrapElemHeight()
	var contentWrapElemWidth = evScrollManager.getContentWrapElemWidth()

	//var viewportTop = interfaceLayout.headerToolbar.height + interfaceLayout.groupingArea.height + interfaceLayout.columnArea.height + interfaceLayout.progressBar.height;
	//var viewportWidth = document.body.clientWidth - interfaceLayout.sidebar.width - interfaceLayout.filterArea.width;
	var viewportTop
	var viewportWidth

	var viewportHeight

	// if (components.sidebar) {
	//     viewportWidth = contentWrapElemWidth - interfaceLayout.filterArea.width;
	// } else {
	//     viewportWidth = contentWrapElemWidth;
	// }

	// console.log("Calculate scroll", interfaceLayout.evLeftPanel.width);

	viewportWidth = contentWrapElemWidth

	viewportWidth = viewportWidth - interfaceLayout.evLeftPanel.width

	// viewportTop = interfaceLayout.progressBar.height;
	viewportTop = 0

	if (components.topPart) {
		viewportTop = viewportTop + interfaceLayout.topPart.height
	}

	if (components.filterArea) {
		viewportTop = viewportTop + interfaceLayout.filterArea.height
	}

	var leftPanelHeight = Math.floor(contentWrapElemHeight - viewportTop) // should be calculated before adding column area height to viewportTop
	evScrollManager.setLeftPanelElemHeight(leftPanelHeight)

	if (components.columnArea) {
		viewportTop = viewportTop + interfaceLayout.columnArea.height
	}

	/* if (components.groupingArea) {
            viewportTop = viewportTop + interfaceLayout.groupingArea.height;
        } */

	viewportHeight = Math.floor(contentWrapElemHeight - viewportTop)
	viewportHeight = window.innerHeight - viewportTop
	/* if (!isRootEntityViewer) {

            if (components.groupingArea) {
                viewportTop = viewportTop + interfaceLayout.groupingArea.height
            }

            if (components.columnArea) {
                viewportTop = viewportTop + interfaceLayout.columnArea.height
            }

            //viewportTop = interfaceLayout.groupingArea.height + interfaceLayout.columnArea.height + interfaceLayout.progressBar.height;
            viewportHeight = Math.floor(contentWrapElemHeight - viewportTop);

        } else {

            viewportHeight = Math.floor(document.body.clientHeight - viewportTop - interfaceLayout.splitPanel.height);

        } */

	evScrollManager.setViewportHeight(viewportHeight)

	if (viewportWidth) {
		evScrollManager.setViewportWidth(viewportWidth)
	}

	var paddingTop = calculatePaddingTop(evDataService)
	var totalHeight = calculateTotalHeight(evDataService)

	evScrollManager.setContentElemHeight(totalHeight)
	// evScrollManager.setContentElemPaddingTop(paddingTop);
}

var calculateVirtualStep = function (elements, evDataService, evScrollManager) {
	var viewportHeight
	// var isRootEntityViewer = evDataService.isRootEntityViewer();
	var components = evDataService.getComponents()
	var contentWrapElemHeight = evScrollManager.getContentWrapElemHeight()
	var rowHeight = evDataService.getRowHeight()
	var interfaceLayout = evDataService.getInterfaceLayout()
	var viewportTop

	/*if (isRootEntityViewer) {
			viewportTop = interfaceLayout.headerToolbar.height + interfaceLayout.groupingArea.height + interfaceLayout.columnArea.height;
			viewportHeight = Math.floor(document.body.clientHeight - viewportTop - interfaceLayout.splitPanel.height);

        } else {
			// viewportTop = interfaceLayout.groupingArea.height + interfaceLayout.columnArea.height + interfaceLayout.progressBar.height;
			viewportTop = interfaceLayout.groupingArea.height + interfaceLayout.columnArea.height;
			viewportHeight = Math.floor(contentWrapElemHeight - viewportTop);
        }

		viewportHeight = Math.floor(document.body.clientHeight - viewportTop - interfaceLayout.splitPanel.height); */
	viewportTop = 0

	if (components.topPart) {
		viewportTop = viewportTop + interfaceLayout.topPart.height
	}

	if (components.filterArea) {
		viewportTop = viewportTop + interfaceLayout.filterArea.height
	}

	if (components.columnArea) {
		viewportTop = viewportTop + interfaceLayout.columnArea.height
	}

	viewportHeight = Math.floor(contentWrapElemHeight - viewportTop)

	console.log(
		'View context: ' + evDataService.getViewContext() + '. viewportHeight',
		viewportHeight
	)
	console.log(
		'View context: ' +
			evDataService.getViewContext() +
			'. contentWrapElemHeight',
		contentWrapElemHeight
	)

	var step = Math.round(viewportHeight / rowHeight)

	evDataService.setVirtualScrollStep(step)
}

var addScrollListener = function (
	elements,
	evDataService,
	evEventService,
	evScrollManager
) {
	var viewportElem = elements.viewportElem
	var contentWrapElem = elements.contentWrapElem

	var columnBottomRow

	// var lastScrollTop = 0;
	// var direction;

	var paddingTop

	var scrollYHandler = utilsHelper.throttle(function () {
		var rowHeight = evDataService.getRowHeight()
		var from = Math.ceil(viewportElem.scrollTop / rowHeight)
		var lastFrom = evDataService.getProjectionLastFrom()

		evDataService.setVirtualScrollOffsetPx(viewportElem.scrollTop)

		var step = evDataService.getVirtualScrollStep()
		var halfstep = step / 2

		// Example
		// step = 200 rendered rows
		// Users see 100 rows before Viewport, N rows in viewport and step - 100 - N after viewport
		// Render happened, we render rows from 0 to 99, because we start from 0
		// halfstep - (halfstep / 4) = 75, that means, we will render next step as
		// from 0 - to 175 (+- 100)
		// And so on

		// If we scroll upwards
		// lets start lastFrom = 500
		// it means we render from 300 and to 599
		// step threshold is still 75
		// lets scroll to from = 400
		// 500 - 400 = 100 its bigger then 75
		// lastFrom = 400 now,
		// It means we render from 300 to 499

		if (from < lastFrom) {
			if (Math.abs(from - lastFrom) > halfstep - halfstep / 4) {
				evEventService.dispatchEvent(evEvents.UPDATE_PROJECTION)
			}
		} else {
			if (Math.abs(lastFrom - from) > halfstep - halfstep / 4) {
				evEventService.dispatchEvent(evEvents.UPDATE_PROJECTION)
			}
		}

		calculateScroll(elements, evDataService, evScrollManager)
	}, 100)

	var scrollXHandler = function () {
		if (!columnBottomRow) {
			columnBottomRow = contentWrapElem.querySelector('.g-column-bottom-row')
		}

		columnBottomRow.style.left = -viewportElem.scrollLeft + 'px'
	}

	viewportElem.addEventListener('scroll', scrollYHandler)
	viewportElem.addEventListener('scroll', scrollXHandler)
}

export default {
	requestGroups: requestGroups,
	requestObjects: requestObjects,

	initEventDelegation: initEventDelegation,
	initContextMenuEventDelegation: initContextMenuEventDelegation,
	createPopupMenu: createPopupMenu,
	/*calculateContentWrapHeight: calculateContentWrapHeight,
        calculateContentWrapWidth: calculateContentWrapWidth,*/
	calculateVirtualStep: calculateVirtualStep,
	calculateScroll: calculateScroll,
	addScrollListener: addScrollListener,
}
