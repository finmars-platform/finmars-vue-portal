import utilsHelper from '../../helpers/utils.helper'
import evEvents from '../../services/entityViewerEvents'
import evDataHelper from '../../helpers/ev-data.helper'
import rvDataHelper from '../../helpers/rv-data.helper'
import evRvCommonHelper from '../../helpers/ev-rv-common.helper'
import metaHelper from '../../helpers/meta.helper'

import RvScrollManager from './rv-scroll.manager'

export default function (
	toastNotificationService,
	transactionTypeService,
	priceHistoryService,
	uiService,
	evRvDomManagerService,
	rvDataProviderService
) {

	const rvScrollManager = new RvScrollManager();

	var calculateTotalHeight = function (evDataService) {

		var viewContext = evDataService.getViewContext();

		var count = evDataService.getFlatList().filter(function (item) {

			if (item.___type === 'subtotal' && item.___subtotal_type === 'proxyline') {
				return false;
			}

			return true;

		}).length;

		var rowHeight = evDataService.getRowHeight();

		var extraHeight = 10 * rowHeight;

		if (viewContext === 'dashboard') {
			extraHeight = 2;
		}

		return Math.floor(rowHeight * count) + extraHeight;

	};

	var addScrollListener = function (elements, evDataService, evEventService) {

		var offset;
		var rowHeight = evDataService.getRowHeight();
		var viewportElem = elements.viewportElem;
		var contentWrapElem = elements.contentWrapElem;

		var columnBottomRows;

		var scrollYHandler = utilsHelper.throttle(function () {

			var rowHeight = evDataService.getRowHeight();
			var from = Math.ceil(viewportElem.scrollTop / rowHeight);
			var lastFrom = evDataService.getProjectionLastFrom();

			evDataService.setVirtualScrollOffsetPx(viewportElem.scrollTop);

			var step = evDataService.getVirtualScrollStep();
			var halfstep = step / 2;

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

			if (Math.abs(from - lastFrom) > (halfstep / 8)) {
				evEventService.dispatchEvent(evEvents.UPDATE_PROJECTION);
			}

			calculateScroll(elements, evDataService)

		}, 100);


		var scrollXHandler = function () {

			if (!columnBottomRows) {
				columnBottomRows = contentWrapElem.querySelectorAll('.g-column-bottom-row'); // Victor 2020.12.16 While old and new design work together
			}

			columnBottomRows.forEach(row => {

				row.style.left = -viewportElem.scrollLeft + 'px';

			})

		};

		viewportElem.removeEventListener('scroll', scrollYHandler);
		viewportElem.removeEventListener('scroll', scrollXHandler);

		viewportElem.addEventListener('scroll', scrollYHandler);

		viewportElem.addEventListener('scroll', scrollXHandler);

	};

	var getClickData = function (event) {

		var clickData = {};
		var rowElem = event.target.closest('.g-row');

		clickData.isShiftPressed = event.shiftKey;
		clickData.isCtrlPressed = event.ctrlKey;
		clickData.target = event.target;

		if (rowElem) {

			var targetElem = event.target;

			if (clickData.target.classList.contains('openLinkInNewTab')) {

				clickData.___type = 'hyperlink'

			} else {

				clickData.___type = rowElem.dataset.type;
				clickData.___id = rowElem.dataset.objectId;
				clickData.___parentId = rowElem.dataset.parentGroupHashId;

				if (rowElem.dataset.subtotalType) {
					clickData.___subtotal_type = rowElem.dataset.subtotalType;
				}

				if (rowElem.dataset.subtotalSubtype) {
					clickData.___subtotal_subtype = rowElem.dataset.subtotalSubtype;
				}

			}

			if (targetElem.classList.contains('ev-fold-button')) {

				clickData.isFoldButtonPressed = true;

				clickData.___parentId = targetElem.dataset.objectId;

			} else if (targetElem.classList.contains('gTableActionBtn')) {
				// clickData.actionElem = clickedActionBtn;
				clickData.actionType = targetElem.dataset.clickActionType;
			} else if (targetElem.classList.contains('inline-retry-button')) {
				clickData.isRetryButtonPressed = true;
				clickData.___parentId = targetElem.dataset.objectId;
			}
			/* else {

                var clickedActionBtn = targetElem.closest(".gTableActionBtn");

                if (clickedActionBtn) {

                    clickData.actionElem = clickedActionBtn;
                    clickData.actionType = clickedActionBtn.dataset.clickActionType;

                }

            } */

			/* if (targetElem.parentElement.classList.contains("gRowColorPicker")) {

                clickData.isRowColorPickerPressed = true
                clickData.actionElem = targetElem.parentElement

            } */

		}

		console.log('clickData', clickData);

		return clickData;

	};

	var foldChildGroups = function (parentGroupId, evDataService) {

		var childrens = evDataHelper.getAllChildrenGroups(parentGroupId, evDataService);

		console.log('foldChildGroups.childrens', childrens);

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

	};

	var toggleColumnsVisibilityAfterGroupsFolding = function (evDataService, evEventService) {

		// var groups = evDataService.getGroups();
		var columns = evDataService.getColumns();

		var columnsVisibilityList = columns.map(column => column.isHidden);
		var columnsVisibilityChanged = false;
		/* var columnsChanged = false;
        var foldedLevel;

        for (var groupLevel = 1; groupLevel <= groups.length; groupLevel++) {

            var unfoldedGroupRowsList = evDataHelper.getUnfoldedGroupsByLevel(groupLevel, evDataService);

            if (!unfoldedGroupRowsList.length) {

                foldedLevel = groupLevel;
                break;

            }

        }*/
		rvDataHelper.markHiddenColumnsBasedOnFoldedGroups(evDataService);

		columns = evDataService.getColumns();

		//<editor-fold desc="Check whether hidden columns changed">
		for (var i = 0; i < columns.length; i++) {

			var columnVisibility = columnsVisibilityList[i];

			if (columnVisibility !== columns[i].isHidden) {
				columnsVisibilityChanged = true;
				break;
			}

		}
		//</editor-fold>

		if (columnsVisibilityChanged) evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE);

	};

	var handleFoldButtonClick = function (clickData, evDataService, evEventService) {

		var group = evDataService.getData(clickData.___parentId);

		console.log('group', group);

		if (group) { // initialized only first data request

			var groups = evDataService.getGroups();

			// console.log('group.___is_open', group.___is_open);

			console.log('handleFoldButtonClick.group type', groups[group.___level - 1])

			groups[group.___level - 1].report_settings.is_level_folded = false;

			var groupSettings = rvDataHelper.getOrCreateGroupSettings(evDataService, group);
			var foldingEvent = group.___is_open ? evEvents.GROUPS_LEVEL_FOLD : evEvents.GROUPS_LEVEL_UNFOLD;

			if (group.___is_open) {

				group.___is_open = false;

				groupSettings.is_open = group.___is_open;
				/*rvDataHelper.setGroupSettings(evDataService, group, groupSettings);

                evDataService.setData(group);*/

				// console.log('folld?');

				foldChildGroups(group.___id, evDataService);

			} else {

				group.___is_open = true;

				groupSettings.is_open = group.___is_open;

				if (!evDataService.isRequestParametersExist(group.___id)) {

					var requestParameters = rvDataProviderService.createRequestParameters(group, group.___level - 1, evDataService, evEventService,)

					console.log('handleFoldButtonClick.group', group);
					console.log('handleFoldButtonClick.requestParameters', requestParameters);

					rvDataProviderService.updateDataStructureByRequestParameters(requestParameters, evDataService, evEventService).then(function () {

						evEventService.dispatchEvent(evEvents.REDRAW_TABLE);

					})

				}

			}

			var unfoldedGroupRowsList = evDataHelper.getUnfoldedGroupsByLevel(group.___level, evDataService);

			if (!unfoldedGroupRowsList.length) { // Mark changed group and groups after it as folded

				for (var i = group.___level - 1; i < groups.length; i++) {
					groups[i].report_settings.is_level_folded = true;
				}

			}
			// toggleColumnsVisibilityAfterGroupsFolding(evDataService, evEventService);

			evDataService.setData(group);
			evDataService.setGroups(groups);
			rvDataHelper.setGroupSettings(evDataService, group, groupSettings);

			evEventService.dispatchEvent(foldingEvent, {updateScope: true});
			evEventService.dispatchEvent(evEvents.REDRAW_TABLE);

		}

		// console.log('group', group);

	};

	var handleRetryButtonClick = function (clickData, evDataService, evEventService) {

		var group = evDataService.getData(clickData.___parentId);

		console.log('handleRetryButtonClick.group', group);

		if (group) { // initialized only first data request

			var requestParameters;

			if (!evDataService.isRequestParametersExist(group.___id)) {

				requestParameters = rvDataProviderService.createRequestParameters(group, group.___level - 1, evDataService, evEventService,)

			} else {
				requestParameters = evDataService.getRequestParameters(group.___id)
			}

			console.log('handleRetryButtonClick.requestParameters', requestParameters);

			rvDataProviderService.updateDataStructureByRequestParameters(requestParameters, evDataService, evEventService).then(function () {

				evEventService.dispatchEvent(evEvents.REDRAW_TABLE);

			})


		}

		// console.log('group', group);

	};

	var handleShiftSelection = function (evDataService, evEventService, clickData) {

		var lastActiveRow = evDataService.getActiveObjectRow();

		console.log('lastActiveRow', lastActiveRow);

		if (!lastActiveRow) {

			if (clickData.___type === 'object') {

				var obj = Object.assign({}, evDataHelper.getObject(clickData.___id, clickData.___parentId, evDataService));

				obj.___is_activated = !obj.___is_activated;
				evDataService.setObject(obj);
				evDataService.setActiveObjectRow(obj);

			} else {

				var parent = Object.assign({}, evDataService.getData(clickData.___parentId));
				var subtotal_type;

				if (clickData.___subtotal_subtype) {
					subtotal_type = clickData.___subtotal_subtype;
				} else {
					subtotal_type = clickData.___subtotal_type;
				}

				if (subtotal_type === 'area') {
					parent.___is_area_subtotal_activated = !parent.___is_area_subtotal_activated;
				}

				if (subtotal_type === 'line') {
					parent.___is_line_subtotal_activated = !parent.___is_line_subtotal_activated;
				}

				evDataService.setActiveObjectRow({
					___id: clickData.___id,
					___parentId: clickData.___parentId
				});

				evDataService.setData(parent);

			}

		} else {

			var list = evDataService.getFlatList();

			var activeObjectIndex;
			var currentObjectIndex;

			var from, to;

			list.forEach(function (item, index) {

				if (item.___id === lastActiveRow.___id) {
					activeObjectIndex = index;
				}

				if (item.___id === clickData.___id) {
					currentObjectIndex = index;
				}


			});


			if (currentObjectIndex > activeObjectIndex) {

				from = activeObjectIndex;
				to = currentObjectIndex;

			} else {

				from = currentObjectIndex;
				to = activeObjectIndex;

			}

			var activated_ids = [];

			var activated_area_subtotals = []; // parentIds
			var activated_line_subtotals = []; // parentIds

			list.forEach(function (item, index) {

				if (index >= from && index <= to) {

					activated_ids.push(item.___id);

					if (item.___type === 'subtotal') {

						// console.log('item', item);
						// console.log('index', index);

						if (item.___subtotal_subtype) {

							if (item.___subtotal_subtype === 'area') {
								activated_area_subtotals.push(item.___parentId)
							}

							if (item.___subtotal_subtype === 'line') {
								activated_line_subtotals.push(item.___parentId)
							}

						} else {

							if (item.___subtotal_type === 'area') {
								activated_area_subtotals.push(item.___parentId)
							}

							if (item.___subtotal_type === 'line') {
								activated_line_subtotals.push(item.___parentId)
							}

						}

					}

				}

			});

			// console.log('activated_ids', activated_ids);
			// console.log('activated_area_subtotals', activated_area_subtotals);
			// console.log('activated_line_subtotals', activated_line_subtotals);

			// var objects = evDataService.getObjects();

			clearSubtotalActiveState(evDataService);
			evDataHelper.clearObjectActiveState(evDataService);

			list.forEach(function (object) {

				if (activated_ids.indexOf(object.___id) !== -1) {

					parent = evDataService.getData(object.___parentId);

					if (activated_area_subtotals.indexOf(parent.___id) !== -1) {
						parent.___is_area_subtotal_activated = true;
					}

					if (activated_line_subtotals.indexOf(parent.___id) !== -1) {
						parent.___is_line_subtotal_activated = true;
					}

					evDataService.setData(parent);

					object.___is_activated = true;
					evDataService.setObject(object);

				}

			});

		}

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE);

	};

	var clearSubtotalActiveState = function (evDataService) {

		var items = evDataService.getDataAsList();

		items.forEach(function (item) {
			item.___is_area_subtotal_activated = false;
			item.___is_line_subtotal_activated = false;
			evDataService.setData(item);
		})

	};

	/*var clearObjectActiveState = function (evDataService) {

        var objects = evDataService.getObjects();

        objects.forEach(function (item) {
            item.___is_activated = false;
            item.___is_active_object = false;

            evDataService.setObject(item);

        });

    };*/

	var clearContextMenuRow = function (evDataService) {

		var objects = evDataService.getObjects();
		var groupOfSubtotal = null;

		var contextMenuItem = objects.find(obj => {

			if (obj.___type === 'group') {

				var group = evDataService.getData(obj.___id);

				if (group.___line_subtotal_context_menu_is_opened || group.___area_subtotal_context_menu_is_opened) {

					groupOfSubtotal = {...{}, ...group};
					return true;

				}

				return false;

			} else {
				return !!obj.___context_menu_is_opened;
			}

		});

		if (contextMenuItem) {

			if (groupOfSubtotal) { // for subtotals

				groupOfSubtotal.___line_subtotal_context_menu_is_opened = false;
				groupOfSubtotal.___area_subtotal_context_menu_is_opened = false;

				evDataService.setData(groupOfSubtotal);

			} else {
				contextMenuItem.___context_menu_is_opened = false;
				evDataService.setObject(contextMenuItem);
			}

		}

	};

	var clearRowWithContextMenu = function (evDataService, evEventService, redrawTable) {

		clearContextMenuRow(evDataService);
		if (redrawTable) evEventService.dispatchEvent(evEvents.REDRAW_TABLE);

	};

	var areAllRowsActive = function (evDataService) {

		var flatList = evDataService.getFlatList();

		for (var item of flatList) {

			if (item.___type === "subtotal") {

				if (item.___level > 0) { // not grandtotal

					var subtotalType = item.___subtotal_subtype ? item.___subtotal_subtype : item.___subtotal_type;
					var parent = evDataService.getData(item.___parentId);

					if (subtotalType === 'area' && !parent.___is_area_subtotal_activated) {
						return false;
					}

					if (subtotalType === 'line' && !parent.___is_line_subtotal_activated) {
						return false;
					}

				}

			} else if (item.___type === "object") {

				if (!item.___is_activated) {
					return false;
				}

			}

		}

		return true;

	};

	var handleSubtotalClick = function (clickData, evDataService, evEventService) {

		var parent = Object.assign({}, evDataService.getData(clickData.___parentId));
		//console.log("click group handleSubtotalClick data", clickData, parent);
		var subtotal_type;
		var activeObjRow = evDataService.getActiveObjectRow();
		var isActiveObject = activeObjRow && activeObjRow.___id === clickData.___id && activeObjRow.___parentId === clickData.___parentId;

		// const isAllRowsCheckboxChecked = parent.___is_area_subtotal_activated && parent.___is_line_subtotal_activated;

		if (!clickData.isCtrlPressed && clickData.isShiftPressed) {

			handleShiftSelection(evDataService, evEventService, clickData);

		} else if (clickData.isCtrlPressed && !clickData.isShiftPressed) {

			if (clickData.___subtotal_subtype) {
				subtotal_type = clickData.___subtotal_subtype;
			} else {
				subtotal_type = clickData.___subtotal_type;
			}

			if (subtotal_type === 'area') {
				parent.___is_area_subtotal_activated = !parent.___is_area_subtotal_activated;
			} else if (subtotal_type === 'line') {
				parent.___is_line_subtotal_activated = !parent.___is_line_subtotal_activated;
			}

			/* evDataService.setActiveObjectRow({
                ___id: clickData.___id,
                ___parentId: clickData.___parentId
            }); */

			if (isActiveObject && !parent.___is_area_subtotal_activated && !parent.___is_line_subtotal_activated) {
				evDataService.setActiveObjectRow(null);
			}

			evDataService.setData(parent);

			evEventService.dispatchEvent(evEvents.REDRAW_TABLE);

		} else if (!clickData.isCtrlPressed && !clickData.isShiftPressed) {

			clearSubtotalActiveState(evDataService);
			evDataHelper.clearObjectActiveState(evDataService);

			parent.___is_area_subtotal_activated = false;
			parent.___is_line_subtotal_activated = false;

			if (clickData.___subtotal_subtype) {
				subtotal_type = clickData.___subtotal_subtype
			} else {
				subtotal_type = clickData.___subtotal_type
			}

			/* if (subtotal_type === 'area') {

                var subtotalIsActive = isAllRowsCheckboxChecked || !parent.___is_area_subtotal_activated;
                parent.___is_area_subtotal_activated = subtotalIsActive;
                parent.___is_line_subtotal_activated = false;

            } else if (subtotal_type === 'line') {

                var subtotalIsActive = isAllRowsCheckboxChecked || !parent.___is_line_subtotal_activated;
                parent.___is_line_subtotal_activated = subtotalIsActive;
                parent.___is_area_subtotal_activated = false;

            } */

			// if (!parent.___is_area_subtotal_activated && !parent.___is_line_subtotal_activated) {
			if (isActiveObject) {

				if (subtotal_type === 'area') {
					parent.___is_area_subtotal_activated = false;

				} else if (subtotal_type === 'line') {
					parent.___is_line_subtotal_activated = false;

				}

				evDataService.setActiveObject(null);
				evDataService.setActiveObjectRow(null);

			} else if (parent.___level > 0) {

				if (subtotal_type === 'area') {
					parent.___is_area_subtotal_activated = true;

				} else if (subtotal_type === 'line') {
					parent.___is_line_subtotal_activated = true;

				}

				var groups = evDataService.getGroups();
				var groupsActiveObj = Object.assign({}, parent);

				delete groupsActiveObj.next;
				delete groupsActiveObj.previous;
				delete groupsActiveObj.count;
				delete groupsActiveObj.results;
				delete groupsActiveObj.subtotal;

				var parents = evRvCommonHelper.getParents(clickData.___parentId, evDataService);
				parents.reverse();
				parents.splice(0, 1); // removing root group

				//console.log("click group groups, parents", groups, parents);

				for (var i = 0; i < parents.length; i++) {
					groupsActiveObj[groups[i].key] = parents[i].___group_name;
				}

				evDataService.setActiveObject(groupsActiveObj);
				evDataService.setActiveObjectRow({
					___id: clickData.___id,
					___parentId: clickData.___parentId
				});
				//console.log("click group set group activeobj", groupsActiveObj);
			}

			evDataService.setData(parent);

			evEventService.dispatchEvent(evEvents.ACTIVE_OBJECT_CHANGE);
			evEventService.dispatchEvent(evEvents.REDRAW_TABLE);

		}

		var allRowsAreActive = areAllRowsActive(evDataService);

		evDataService.setSelectAllRowsState(allRowsAreActive);
		evEventService.dispatchEvent(evEvents.ROW_ACTIVATION_CHANGE);

	};

	var handleObjectClick = function (clickData, evDataService, evEventService) {

		var obj = Object.assign({}, evDataHelper.getObject(clickData.___id, clickData.___parentId, evDataService));

		if (clickData.isCtrlPressed && !clickData.isShiftPressed) {

			obj.___is_activated = !obj.___is_activated;

			if (!obj.___is_activated) {
				obj.___is_active_object = false;
			}

			evDataService.setObject(obj);
			evDataService.setActiveObjectRow(obj);

			evEventService.dispatchEvent(evEvents.REDRAW_TABLE);

		} else if (!clickData.isCtrlPressed && clickData.isShiftPressed) {
			handleShiftSelection(evDataService, evEventService, clickData);
		} else if (!clickData.isCtrlPressed && !clickData.isShiftPressed) {

			clearSubtotalActiveState(evDataService);
			evDataHelper.clearObjectActiveState(evDataService);

			obj.___is_activated = !obj.___is_activated;
			obj.___is_active_object = !obj.___is_active_object;

			evDataService.setObject(obj);

			if (obj.___is_active_object || obj.___is_activated) {
				obj.___is_activated = true; // in case of click on highlighted by ctrl or shift row

				evDataService.setActiveObject(obj);
				evDataService.setActiveObjectRow(obj);
				evEventService.dispatchEvent(evEvents.ACTIVE_OBJECT_CHANGE);

			} else {
				evDataService.setActiveObject(null);
				evDataService.setActiveObjectRow(null);
			}

			evEventService.dispatchEvent(evEvents.REDRAW_TABLE);

		}

		var allRowsAreActive = areAllRowsActive(evDataService);

		evDataService.setSelectAllRowsState(allRowsAreActive); // Victor #111 every click must clear 'all select' checkbox
		evEventService.dispatchEvent(evEvents.ROW_ACTIVATION_CHANGE);

	};

	var updateDataFromCellEdit = function (obj, column, evDataService, evEventService) {

		var reportOptions = evDataService.getReportOptions();

		if (column.key === 'instrument_principal_price') {

			priceHistoryService.getList({
				filters: {
					instrument: obj['instrument.id'],
					pricing_policy: reportOptions.pricing_policy,
					date_after: reportOptions.report_date
				}
			}).then(function (data) {

				var item;

				if (data.results.length) {

					item = data.results[0];

					item.principal_price = obj[column.key];

					priceHistoryService.update(item.id, item).then(function (data) {

						toastNotificationService.success("Price History updated");

					})

				} else {

					item = {
						pricing_policy: reportOptions.pricing_policy,
						date_after: reportOptions.report_date,
						instrument: obj['instrument.id'],
						accrued_price: 0,
						principal_price: obj[column.key]
					};

					priceHistoryService.create(item).then(function (data) {

						toastNotificationService.success("Price History created");

					})


				}


			});


		}

		if (column.key === 'instrument_accrued_price') {

			priceHistoryService.getList({
				filters: {
					instrument: obj['instrument.id'],
					pricing_policy: reportOptions.pricing_policy,
					date_after: reportOptions.report_date
				}
			}).then(function (data) {

				var item;

				if (data.results.length) {

					item = data.results[0];

					item.accrued_price = obj[column.key];

					priceHistoryService.update(item.id, item).then(function (data) {

						toastNotificationService.success("Price History updated");

					})

				} else {

					item = {
						pricing_policy: reportOptions.pricing_policy,
						date_after: reportOptions.report_date,
						instrument: obj['instrument.id'],
						accrued_price: obj[column.key],
						principal_price: 0
					};

					priceHistoryService.create(item).then(function (data) {

						toastNotificationService.success("Price History created");

					})


				}


			});


		}


	};

	var handleCellEdit = function (cellElem, clickData, obj, column, columnNumber, evDataService, evEventService) {

		console.log('column', column);

		cellElem.classList.add('g-cell-input');
		cellElem.innerHTML = '<input value="" autofocus>';

		var input = cellElem.querySelector('input');

		input.focus();

		input.value = obj[column.key];

		input.addEventListener('blur', function (event) {

			event.preventDefault();
			event.stopPropagation();

			if (obj[column.key] !== input.value) {

				if (!obj.___modified_cells) {
					obj.___modified_cells = []
				}

				obj.___modified_cells.push({
					oldValue: obj[column.key],
					newValue: input.value,
					columnNumber: columnNumber,
					column: column
				});
			}

			obj[column.key] = input.value;
			evDataService.setObject(obj);

			updateDataFromCellEdit(obj, column, evDataService, evEventService);

			evEventService.dispatchEvent(evEvents.REDRAW_TABLE);

		});

		input.addEventListener("keyup", function (event) {

			if (event.keyCode === 13) {

				event.preventDefault();
				event.stopPropagation();

				if (obj[column.key] !== input.value) {

					if (!obj.___modified_cells) {
						obj.___modified_cells = []
					}

					obj.___modified_cells.push({
						oldValue: obj[column.key],
						newValue: input.value,
						columnNumber: columnNumber,
						column: column
					});
				}

				obj[column.key] = input.value;
				evDataService.setObject(obj);

				updateDataFromCellEdit(obj, column, evDataService, evEventService);

				evEventService.dispatchEvent(evEvents.REDRAW_TABLE);
			}
		});


	};

	var getSubtotalDataFromRow = function (gRowElem) {

		var subtotalType = gRowElem.dataset.subtotalType;
		var subtotalData = null;

		if (subtotalType) {

			subtotalData = {type: subtotalType};

			if (subtotalType === 'arealine') subtotalData.subType = gRowElem.dataset.subtotalSubtype;

		}

		return subtotalData;

	}

	var initEventDelegation = async function (elem, evDataService, evEventService, usersService, globalDataService) {

		const ttypes = await getAllTTypes();
		const contextMenu = await getContextMenu();

		elem.addEventListener('click', function (event) {

			var clickData = getClickData(event);

			console.log('initEventDelegation.clickData', clickData);
			console.log('initEventDelegation.event', event);

			if (clickData.___type === 'hyperlink') {

				metaHelper.openLinkInNewTab(event);

			} else if (event.detail === 2) { // double click handler

				var cellElem;

				// TODO make recursive get parent of g-cell
				/* if (event.target.classList.contains('g-cell')) {
                    cellElem = event.target
                } else if (event.target.parentElement.classList.contains('g-cell')) {
                    cellElem = event.target.parentElement;

                } else if (event.target.parentElement.parentElement.classList.contains('g-cell')) {
                    cellElem = event.target.parentElement.parentElement;
                } */

				cellElem = event.target.closest('.g-cell-wrap');

				if (cellElem) {

					var obj = Object.assign({}, evDataHelper.getObject(clickData.___id, clickData.___parentId, evDataService));
					var columns = evDataService.getColumns();
					var columnNumber = parseInt(cellElem.dataset.column, 10);

					var column = columns[columnNumber - 1];

					if (['instrument_principal_price', 'instrument_accrued_price'].indexOf(column.key) !== -1) {

						handleCellEdit(cellElem, clickData, obj, column, columnNumber, evDataService, evEventService)

					}

				}

			} else if (event.detail === 1) { // click

				if (clickData.isFoldButtonPressed) {
					handleFoldButtonClick(clickData, evDataService, evEventService);

				} else if (clickData.isRetryButtonPressed) {

					handleRetryButtonClick(clickData, evDataService, evEventService);

				} else if (clickData.actionType) {

					switch (clickData.actionType) {

						case 'open_row_color_picker':

							event.stopPropagation();
							evRvDomManagerService.createRowColorPickerMenu(clickData, evDataService, evEventService, usersService, globalDataService, clearDropdowns);

							break;

						case 'open_context_menu':

							const gRowElem = event.target.closest('.g-row');

							if (gRowElem) {

								const objectId = clickData.___id;
								const subtotalData = getSubtotalDataFromRow(gRowElem);
								const parentGroupHashId = clickData.___parentId;
								const contextMenuPosition = {positionX: event.pageX, positionY: event.pageY};

								event.stopPropagation();

								if (subtotalData) { // for subtotal rows
									createPopupMenuForSubtotal(objectId, subtotalData, parentGroupHashId, evDataService, evEventService, usersService, globalDataService, contextMenuPosition);

								} else {
									createPopupMenu(objectId, contextMenu, ttypes, parentGroupHashId, evDataService, evEventService, usersService, globalDataService, contextMenuPosition);
								}

							}
							// createPopupMenu(objectId, contextMenu, ttypes, parentGroupHashId, evDataService, evEventService, contextMenuPosition)

							break;

						/* TO DELETE: 2021-01-17
                        case 'open_subtotal_position_options':

                            event.stopPropagation();
                            createSubtotalSettingsMenu(clickData, evDataService, evEventService);

                            break; */

					}

				} else {

					var selection = window.getSelection().toString();

					console.log('selection', selection);

					if (clickData.isShiftPressed) {

						switch (clickData.___type) {

							case 'object':
								handleObjectClick(clickData, evDataService, evEventService);
								break;

							case 'subtotal':
								handleSubtotalClick(clickData, evDataService, evEventService);
								break;
						}

					} else if (!selection.length) {

						switch (clickData.___type) {

							case 'object':
								handleObjectClick(clickData, evDataService, evEventService);
								break;

							case 'subtotal':
								handleSubtotalClick(clickData, evDataService, evEventService);
								break;
						}

					}

				}

			}

		});

		elem.addEventListener('contextmenu', function (ev) {

			var objectId;
			var parentGroupHashId;
			/** @type {{type: string, subType: string=}|null} */
			var subtotalData = null;

			if (ev.target.offsetParent.classList.contains('ev-viewport')) {

				objectId = ev.target.dataset.objectId;
				parentGroupHashId = ev.target.dataset.parentGroupHashId;

			} else {

				var gRowElem = ev.target.closest('.g-row');

				if (gRowElem) {

					objectId = gRowElem.dataset.objectId;
					parentGroupHashId = gRowElem.dataset.parentGroupHashId;

					/* var subtotalType = gRowElem.dataset.subtotalType;

                    if (subtotalType) {

                        subtotalData = {type: subtotalType};

                        if (subtotalType === 'arealine') subtotalData.subType = gRowElem.dataset.subtotalSubtype;

                    } */
					subtotalData = getSubtotalDataFromRow(gRowElem);

					/*if (gRowElem.dataset.subtotalType) {

                        subtotalType = gRowElem.dataset.subtotalType;

                    }*/

				}

			}

			if (objectId) {

				ev.preventDefault();
				ev.stopPropagation();

				var contextMenuPosition = {positionX: ev.pageX, positionY: ev.pageY};

				if (subtotalData) { // for subtotal rows
					createPopupMenuForSubtotal(objectId, subtotalData, parentGroupHashId, evDataService, evEventService, usersService, globalDataService, contextMenuPosition);

				} else {
					createPopupMenu(objectId, contextMenu, ttypes, parentGroupHashId, evDataService, evEventService, usersService, globalDataService, contextMenuPosition);
				}

				return false;

			}

		}, false);

	};

	/* var calculatePaddingTop = function (evDataService) {

        var scrollOffsetPx = evDataService.getVirtualScrollOffsetPx();

        return scrollOffsetPx;

    }; */

	/* var calculateContentWrapHeight = function (rootWrapElem, contentWrapElement, evDataService) { // Works only for contentWrap that is not from split panel

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

    }; */

	var calculateScroll = function (elements, evDataService) {

		rvScrollManager.setViewportElem(elements.viewportElem); // .ev-viewport
		rvScrollManager.setContentElem(elements.contentElem); // .ev-content
		rvScrollManager.setContentWrapElem(elements.contentWrapElem);

		/* if (elements.rootWrapElem) { // split panel inside iframe does not have access to rootWrapElem
            rvScrollManager.setRootWrapElem(elements.rootWrapElem);
        } */

		var isRootEntityViewer = evDataService.isRootEntityViewer();
		var viewContext = evDataService.getViewContext();

		var interfaceLayout = evDataService.getInterfaceLayout();
		var components = evDataService.getComponents();

		var contentWrapElemHeight = rvScrollManager.getContentWrapElemHeight();
		var contentWrapElemWidth = rvScrollManager.getContentWrapElemWidth();

		var viewportTop;
		var viewportWidth;

		var viewportHeight;

		// console.log('calculateScroll components', components);
		// console.log('calculateScroll contentWrapElemWidth', contentWrapElemWidth);

		viewportWidth = contentWrapElemWidth;

		// console.log('viewportWidth', viewportWidth);

		// viewportTop = interfaceLayout.progressBar.height;
		viewportTop = 0;

		if (components.topPart) {
			viewportTop = viewportTop + interfaceLayout.topPart.height
		}

		if (components.filterArea) {
			viewportTop = viewportTop + interfaceLayout.filterArea.height
		}

		if (components.columnArea) {
			viewportTop = viewportTop + interfaceLayout.columnArea.height
		}
		/* if (components.groupingArea) {
            viewportTop = viewportTop + interfaceLayout.groupingArea.height;
        } */
		viewportHeight = Math.floor(contentWrapElemHeight - viewportTop);

		var isRootTitle = 'isRoot'
		if (isRootEntityViewer) {
			isRootTitle = 'isRoot'
		} else {
			isRootTitle = 'isChild'
		}

		// if (!isRootEntityViewer) {
		//     viewportHeight = viewportHeight - 15; // TODO To show horizontal scroll. Find why
		// }

		// console.log(isRootTitle +  ' calculateScroll.contentWrapElemHeight ' + contentWrapElemHeight);
		// console.log(isRootTitle +  ' calculateScroll.viewportTop ' + viewportTop);
		// console.log(isRootTitle +  ' calculateScroll.viewportHeight ' + viewportHeight);
		// console.log('calculateScroll.viewportWidth', viewportWidth);


		rvScrollManager.setViewportHeight(viewportHeight);

		if (viewportWidth) {
			rvScrollManager.setViewportWidth(viewportWidth);
		}

		// var paddingTop = calculatePaddingTop(evDataService);
		var totalHeight = calculateTotalHeight(evDataService);

		//rvScrollManager.setRootEntityContentWrapElemHeight(viewportHeight);
		rvScrollManager.setContentElemHeight(totalHeight);
		// rvScrollManager.setContentElemPaddingTop(paddingTop);

		// There is another method that calculates contentElemWidth. That is resizeScrollableArea() form gColumnResizerComponent.js
		var areaWidth = 0;
		var i;
		var columnMargins = 16;
		var dropNewFieldWidth = 400;
		if (viewContext === 'dashboard') {
			dropNewFieldWidth = 105;
		}

		var columns = evDataService.getColumns();

		for (i = 0; i < columns.length; i = i + 1) {

			var columnWidth = parseInt(columns[i].style.width.split('px')[0], 10);

			areaWidth = areaWidth + columnWidth + columnMargins;
		}

		var resultWidth = areaWidth + dropNewFieldWidth;

		if (resultWidth > contentWrapElemWidth) {
			rvScrollManager.setContentElemWidth(resultWidth);
		}

		// console.log('resultWidth', resultWidth);

	};

	// var calculateScroll = function (elements, evDataService) {
	//
	//     rvScrollManager.setViewportElem(elements.viewportElem);
	//     rvScrollManager.setContentElem(elements.contentElem);
	//     rvScrollManager.setContentWrapElem(elements.contentWrapElem);
	//
	//     var isRootEntityViewer = evDataService.isRootEntityViewer();
	//
	//     var interfaceLayout = evDataService.getInterfaceLayout();
	//
	//     var contentWrapElemHeight = rvScrollManager.getContentWrapElemHeight();
	//
	//     var viewportTop = interfaceLayout.headerToolbar.height + interfaceLayout.groupingArea.height + interfaceLayout.columnArea.height + interfaceLayout.progressBar.height;
	//     var viewportWidth = document.body.clientWidth - interfaceLayout.sidebar.width - interfaceLayout.filterArea.width;
	//
	//     var viewportHeight;
	//
	//     if (isRootEntityViewer) {
	//
	//         viewportHeight = Math.floor(document.body.clientHeight - viewportTop - interfaceLayout.splitPanel.height);
	//
	//     } else {
	//
	//         viewportTop = interfaceLayout.groupingArea.height + interfaceLayout.columnArea.height + interfaceLayout.progressBar.height;
	//         viewportHeight = Math.floor(contentWrapElemHeight - viewportTop);
	//
	//     };
	//
	//     // console.log('calculateScroll.viewportHeight', viewportHeight);
	//     // console.log('calculateScroll.viewportWidth', viewportWidth);
	//
	//     rvScrollManager.setViewportHeight(viewportHeight);
	//     if (viewportWidth) {
	//         rvScrollManager.setViewportWidth(viewportWidth);
	//     }
	//
	//     var paddingTop = calculatePaddingTop(evDataService);
	//     var totalHeight = calculateTotalHeight(evDataService);
	//
	//     rvScrollManager.setContentElemHeight(totalHeight);
	//     rvScrollManager.setContentElemPaddingTop(paddingTop);
	//
	// };

	/*  var popupsToClear = [];

    var clearDropdowns = function () {

        var dropdowns = document.querySelectorAll('.evDropdown');

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

        //region Remove dropdown related listeners
        for (const prop in eventListenerFn2Args) {
            eventListenerFn2Args[prop] = null;
        }
        window.removeEventListener('click', executeContextMenuAction);
        window.removeEventListener('click', executeSubtotalContextMenuAction);

        clearDropdownsAndRowsArgs.evDataService = null;
        clearDropdownsAndRowsArgs.evEventService = null;
        window.removeEventListener('contextmenu', callClearDropdownsAndRows);
        //endregion

    }; */

	var clearDropdowns = function () {
		[eventListenerFn2Args, clearDropdownsAndRowsArgs] = evRvDomManagerService.clearDropdowns(eventListenerFn2Args, clearDropdownsAndRowsArgs, executeContextMenuAction, callClearDropdownsAndRows);
		window.removeEventListener('click', executeSubtotalContextMenuAction);
	};

	/**
	 *
	 * @param {Object} evDataService
	 * @param {Object} evEventService
	 * @param {Boolean=} redrawTable
	 */
	var clearDropdownsAndRows = function (evDataService, evEventService, redrawTable) {

		clearRowWithContextMenu(evDataService, evEventService, redrawTable);

		clearDropdowns();

	};

	/** Used to pass data into callClearDropdownsAndRows inside event listener */
	var clearDropdownsAndRowsArgs = {
		evDataService: null,
		evEventService: null
	}

	/**
	 * Used to call clearDropdownsAndRows() with arguments inside event listeners
	 */
	var callClearDropdownsAndRows = function (event) {
		clearDropdownsAndRows(clearDropdownsAndRowsArgs.evDataService, clearDropdownsAndRowsArgs.evEventService, true);
	};

	/*var getTransactionTypesMenu = function (ttypes, objectId, parentGroupHashId) {

        var result = '';

        result = result + '<div class="ev-dropdown-option ev-dropdown-menu-holder"><div class="ev-dropdown-submenu">';

        result = result + '<div class="ev-dropdown-option" ' +
            ' data-ev-dropdown-action="book_transaction"' +
            ' data-object-id="' + objectId + '"' +
            ' data-parent-group-hash-id="' + parentGroupHashId + '">Open Booking Manager </div>';

        ttypes.forEach(function (item) {

            result = result + '<div class="ev-dropdown-option" ' +
                ' data-ev-dropdown-action="book_transaction_specific"' +
                ' data-ev-dropdown-action-data-id="' + item.id + '"' +
                ' data-object-id="' + objectId + '"' +
                ' data-parent-group-hash-id="' + parentGroupHashId + '">' + item.name + '</div>';

        });

        result = result + '</div></div>';

        console.log('getTransactionTypesMenu result', result);

        return result

    };*/

	/**
	 * Insert options into context menu popup of subtotal
	 *
	 * @param result {HTMLElement} - html of popup
	 * @param evDataService {Object}
	 * @param type {string} - type or subtype of subtotal. Can be 'line' or 'area'.
	 * @param groupId {number}
	 * @param parentGroupHashId {number}
	 * @returns {HTMLElement} - html of popup
	 */
	var composeContextMenuForSubtotal = function (result, evDataService, type, groupId, parentGroupHashId) {

		var parent = evDataService.getData(parentGroupHashId)
		var isActivated;

		if (type === 'line') {
			isActivated = parent.___is_line_subtotal_activated;

		} else if (type === 'area') {
			isActivated = parent.___is_area_subtotal_activated;
		}

		var toggleRowName = isActivated ? 'Unselect row' : 'Select row';

		result = result +
			`<div class="ev-dropdown-option"
				  data-ev-dropdown-action="toggle_row"
				  data-object-id="${groupId}"
				  data-parent-group-hash-id="${parentGroupHashId}">${toggleRowName}</div>`;

		return result;

	};

	var checkContextMenuOptionVisibility = function (obj, option) {

		if (obj['instrument.id'] && option.action === 'edit_instrument') {
			return true;
		}

		if (obj['account.id'] && option.action === 'edit_account') {
			return true;
		}

		if (obj['portfolio.id'] && option.action === 'edit_portfolio') {
			return true;
		}

		if (obj['instrument.id'] && option.action === 'edit_price') {
			return true;
		}

		if (obj['currency.id'] && option.action === 'edit_fx_rate') {
			return true;
		}

		if (obj['item_type'] === 1 && obj['instrument.pricing_currency.id'] && option.action === 'edit_pricing_currency') { // item_type = 1 - instrument
			return true;
		}

		if (obj['item_type'] === 1 && obj['instrument.accrued_currency.id'] && option.action === 'edit_accrued_currency') { // item_type = 1 - instrument
			return true;
		}


		if (obj['item_type'] === 1 && option.action === 'edit_pricing_currency_price') { // item_type = 1 - instrument
			return true;
		}

		if (obj['item_type'] === 1 && option.action === 'edit_accrued_currency_fx_rate') { // item_type = 1 - instrument
			return true;
		}

		if (obj['item_type'] === 2 && option.action === 'edit_currency') { // item_type = 2 - currency
			return true;
		}

		if (option.action === 'book_transaction_specific') {
			return true;
		}

		if (option.action === 'book_transaction') {
			return true;
		}

		if ((obj['complex_transaction.id'] || obj['complex_transaction']) && option.action === 'rebook_transaction') {
			return true;
		}

		if (option.action === 'open_layout') {
			return true;
		}

		if (option.action === 'mark_row') {
			return true;
		}

		if (option.action === 'toggle_row') {
			return true;
		}

		return false;
	};

	var getContextMenuTtypeId = function (ttypes, option) {

		var result = null;

		console.log('option.action_data', option.action_data);
		console.log('option.ttypes', ttypes);

		for (var i = 0; i < ttypes.length; i++) {

			if (ttypes[i].user_code === option.action_data) {
				result = ttypes[i].id;
				break;
			}
		}

		console.log('option.result', result);

		return result

	};

	var getContextMenuActionLink = function (evDataService, option, obj) {

		var result = '';

		console.log('getContextMenuActionLink.option', option);

		var urlMap = {

			'reports.balancereport': 'reports/balance',
			'reports.plreport': 'reports/profit-and-lost',
			'reports.transactionreport': 'reports/transaction',

			'portfolios.portfolio': 'data/portfolios',
			'accounts.account': 'data/accounts',
			'accounts.accounttype': 'data/account-types',
			'counterparties.counterparty': 'data/counterparty',
			'counterparties.responsible': 'data/responsibles',
			'instruments.instrument': 'data/instruments',
			'instruments.instrumenttype': 'data/instrument-types',
			'instruments.pricingpolicy': 'data/pricing-policy',
			'currencies.currency': 'data/currency',
			'strategies.strategy1': 'data/strategy/1',
			'strategies.strategy2': 'data/strategy/3',
			'strategies.strategy3': 'data/strategy/3',
			'transactions.complextransaction': 'data/complex-transactions',
			'transactions.transactiontype': 'data/transaction-types',
		};

		result = window.location.href.split("#!")[0];

		result = result + '#!/';
		result = result + urlMap[option.action_data.content_type];
		result = result + '?layout=' + option.action_data.name;


		if (obj) {
			Object.keys(obj).forEach(function (key) {

				var propType = typeof obj[key];

				if (['string', 'number', 'boolean'].indexOf(propType) !== -1) {
					result = result + '&' + key + '=' + encodeURI(obj[key]);
				}

			});
		}

		return result


	};

	var generateContextMenuItems = function (parentOption, evDataService, ttypes, obj, objectId, parentGroupHashId) {

		var result = '<div class="ev-dropdown-submenu">';

		parentOption.items.forEach(function (item) {

			result = composeContextMenuItem(result, item, evDataService, ttypes, obj, objectId, parentGroupHashId);

		});

		result = result + '</div>';

		return result

	};

	var composeContextMenuItem = function (result, item, evDataService, ttypes, obj, objectId, parentGroupHashId) {

		if (checkContextMenuOptionVisibility(obj, item)) {

			var ttype_specific_attr = '';
			var additional_text = '';
			var is_disabled = '';

			if (item.action === 'book_transaction_specific') {

				item.id = getContextMenuTtypeId(ttypes, item);

				if (item.id) {
					ttype_specific_attr = ' data-ev-dropdown-action-data-id="' + item.id + '"'
				} else {
					additional_text = ' (Not Found)';
					is_disabled = 'disabled-context-menu';
				}

			} else if (item.action === 'mark_row') {
				ttype_specific_attr = ' data-ev-dropdown-action-data-color="' + item.action_data + '"'

			} else if (item.action === 'toggle_row') {
				item.name = obj.___is_activated ? 'Unselect row' : 'Select row';
			}

			if (item.action === 'open_layout') {

				result = result +
					'<div class="ev-dropdown-option' + (item.items ? ' ev-dropdown-menu-holder' : '') + '">' +
					'<a href="' + getContextMenuActionLink(evDataService, item, obj) + '"' +
					' target="_blank"' +
					' data-ev-dropdown-action="' + item.action + '"' +
					' data-object-id="' + objectId + '"' +
					' data-parent-group-hash-id="' + parentGroupHashId + '">' +
					'<span>' + item.name + '</span>' +
					'</a>';

				if (item.items && item.items.length) {

					result = result + generateContextMenuItems(item, evDataService, ttypes, obj, objectId, parentGroupHashId)

				}

				result = result + '</div>';

			} else {

				result = result + '<div class="ev-dropdown-option ' + is_disabled + (item.items ? ' ev-dropdown-menu-holder' : '') + '"' +
					' data-ev-dropdown-action="' + item.action + '"' +

					ttype_specific_attr +

					' data-object-id="' + objectId + '"' +
					' data-parent-group-hash-id="' + parentGroupHashId + '">' + item.name + additional_text;

				if (item.items && item.items.length) {

					result = result + generateContextMenuItems(item, evDataService, ttypes, obj, objectId, parentGroupHashId)

				}

				result = result + '</div>';

			}


		}

		return result;
	};

	var generateContextMenu = function (evDataService, menu, ttypes, obj, objectId, parentGroupHashId) {

		var result = '<div class="ev-dropdown-container">';

		menu.root.items.forEach(function (item) {
			result = composeContextMenuItem(result, item, evDataService, ttypes, obj, objectId, parentGroupHashId);
		});

		result = result + '</div>';

		return result;

	};

	var generateContextMenuForSubtotal = function (evDataService, subtotalType, groupId, parentGroupHashId) {

		var result = '<div class="ev-dropdown-container">';

		result = composeContextMenuForSubtotal(result, evDataService, subtotalType, groupId, parentGroupHashId);

		result = result + '</div>';

		return result;

	};
	/**
	 * transfer data into event listener callback ( executeContextMenuAction() or executeSubtotalContextMenuAction() )
	 *
	 * @type {Object} eventListenerFn2Args
	 * eventListenerFn2Args.evDataService {Object|null}
	 * eventListenerFn2Args.evEventService {Object|null}
	 * eventListenerFn2Args.usersService {Object|null}
	 * eventListenerFn2Args.globalDataService {Object|null}
	 * eventListenerFn2Args.subtotalType {string|null} - type or subtype of subtotal. Can be 'line' or 'area'.
	 */
	var eventListenerFn2Args = {
		evDataService: null,
		evEventService: null,
		subtotalType: null
	}

	function executeContextMenuAction(event) {

		var objectId = event.target.dataset.objectId,
			parentGroupHashId = event.target.dataset.parentGroupHashId,
			dropdownAction = event.target.dataset.evDropdownAction,
			evDataService = eventListenerFn2Args.evDataService,
			evEventService = eventListenerFn2Args.evEventService,
			usersService = eventListenerFn2Args.usersService,
			globalDataService = eventListenerFn2Args.globalDataService;

		var dropdownActionData = {};

		if (event.target.dataset.hasOwnProperty('evDropdownActionDataId')) {
			dropdownActionData.id = event.target.dataset.evDropdownActionDataId;
		}

		if (dropdownAction === 'mark_row') {

			var color = event.target.dataset.evDropdownActionDataColor;

			if (objectId && color && parentGroupHashId) {

				evRvDomManagerService.markRowByColor(objectId, parentGroupHashId, evDataService, evEventService, usersService, globalDataService, color);
				/* var obj = evDataHelper.getObject(objectId, parentGroupHashId, evDataService);
                var markedReportRows = localStorage.getItem("marked_report_rows");

                if (markedReportRows) {
                    markedReportRows = JSON.parse(markedReportRows);
                } else {
                    markedReportRows = {};
                }

                if (color === 'undo_mark_row') {
                    delete markedReportRows[obj.id]
                } else {
                    markedReportRows[obj.id] = {
                        color: color
                    };
                }

                localStorage.setItem("marked_report_rows", JSON.stringify(markedReportRows));

                evEventService.dispatchEvent(evEvents.REDRAW_TABLE); */

			}

			clearDropdownsAndRows(evDataService, evEventService, true);

		} else if (dropdownAction === 'toggle_row') {

			var obj = evDataHelper.getObject(objectId, parentGroupHashId, evDataService);
			var activeObjChanged = false;

			if (obj.___is_activated) {

				if (obj.___is_active_object) {

					evDataService.setActiveObject(null);
					evDataService.setActiveObjectRow(null);
					activeObjChanged = true;

				}

				obj.___is_activated = false;
				obj.___is_active_object = false;

			} else {

				// evDataHelper.clearLastActiveObject(evDataService);
				// clearObjectActiveState(evDataService);
				obj.___is_activated = true;

				// evDataService.setActiveObject(obj);
				// evDataService.setActiveObjectRow(obj);

			}

			evDataService.setObject(obj);

			/* evEventService.dispatchEvent(evEvents.REDRAW_TABLE);
            clearDropdowns(); */
			clearDropdownsAndRows(evDataService, evEventService, true);

			if (activeObjChanged) evEventService.dispatchEvent(evEvents.ACTIVE_OBJECT_CHANGE);

			var allRowsAreActive = areAllRowsActive(evDataService);
			evDataService.setSelectAllRowsState(allRowsAreActive);
			evEventService.dispatchEvent(evEvents.ROW_ACTIVATION_CHANGE);

		} else {

			if (objectId && dropdownAction && parentGroupHashId) {

				dropdownActionData.actionKey = dropdownAction;
				/* var obj = evDataHelper.getObject(objectId, parentGroupHashId, evDataService);

                if (!obj) {
                    obj = {}
                } */
				dropdownActionData.object = evDataHelper.getObject(objectId, parentGroupHashId, evDataService) || {};

				// obj.event = event;
				dropdownActionData.event = event;

				/* evDataService.setActiveObject(obj);
                evDataService.setActiveObjectAction(dropdownAction);
                evDataService.setActiveObjectActionData(dropdownActionData); */
				evDataService.setRowsActionData(dropdownActionData);

				// evEventService.dispatchEvent(evEvents.ACTIVE_OBJECT_CHANGE);
				evEventService.dispatchEvent(evEvents.ROWS_ACTION_FIRED);

				// clearDropdowns();
				clearDropdownsAndRows(evDataService, evEventService, true);

			}
		}

		if (!event.target.classList.contains('ev-dropdown-option')) {
			clearDropdownsAndRows(evDataService, evEventService, true);
		}
		//
		for (const prop in eventListenerFn2Args) {
			eventListenerFn2Args[prop] = null;
		}

	}

	function executeSubtotalContextMenuAction(event) {

		var targetElem = event.target;
		// var groupId = targetElem.dataset.objectId;
		var parentGroupHashId = targetElem.dataset.parentGroupHashId;
		var subtotalId = targetElem.dataset.objectId;
		var dropdownAction = targetElem.dataset.evDropdownAction;

		var evDataService = eventListenerFn2Args.evDataService;
		var evEventService = eventListenerFn2Args.evEventService;
		var subtotalType = eventListenerFn2Args.subtotalType;

		if (dropdownAction === 'toggle_row') {

			var group = evDataService.getData(parentGroupHashId);
			if (group) group = {...{}, ...group};

			var activatedProperty = (subtotalType === 'line') ? '___is_line_subtotal_activated' : '___is_area_subtotal_activated';

			/* if (group.___is_activated) {

                group.___is_activated = false;
                group.___is_active_object = false;

                evDataService.setData(group);

            } else {

                // clearSubtotalActiveState(evDataService);
                group.___is_activated = true;
                group.___is_active_object = true;

                evDataService.setData(group);

            } */
			group[activatedProperty] = !group[activatedProperty];
			evDataService.setData(group);

			var activeObjRow = evDataService.getActiveObjectRow();

			if (activeObjRow && activeObjRow.___id === subtotalId && activeObjRow.___parentId === parentGroupHashId) {

				evDataService.setActiveObjectRow(null);
				evDataService.setActiveObject(null);

				evEventService.dispatchEvent(evEvents.ACTIVE_OBJECT_CHANGE);

			}

			/* evEventService.dispatchEvent(evEvents.REDRAW_TABLE);
            clearDropdowns(); */
			clearDropdownsAndRows(evDataService, evEventService, true);

			var allRowsAreActive = areAllRowsActive(evDataService);
			evDataService.setSelectAllRowsState(allRowsAreActive);
			evEventService.dispatchEvent(evEvents.ROW_ACTIVATION_CHANGE);

		}

		if (!event.target.classList.contains('ev-dropdown-option')) {
			clearDropdownsAndRows(evDataService, evEventService, true);
		}
		//
		for (const prop in eventListenerFn2Args) {
			eventListenerFn2Args[prop] = null;
		}

	}

	/**
	 *
	 * @param evDataService {Object}
	 * @param evEventService {Object}
	 * @param usersService {Object}
	 * @param globalDataService {Object}
	 * @param type {any=} - Type or subtype of subtotal Can be 'line' or 'area'.
	 */
	var addEventListenersForContextMenu = function (evDataService, evEventService, usersService, globalDataService, type) {

		eventListenerFn2Args.evDataService = evDataService;
		eventListenerFn2Args.evEventService = evEventService;
		eventListenerFn2Args.usersService = usersService;
		eventListenerFn2Args.globalDataService = globalDataService;

		if (type) {

			eventListenerFn2Args.subtotalType = type;
			window.addEventListener('click', executeSubtotalContextMenuAction);

		} else {
			window.addEventListener('click', executeContextMenuAction);
		}

		clearDropdownsAndRowsArgs.evDataService = evDataService;
		clearDropdownsAndRowsArgs.evEventService = evEventService;
		window.addEventListener('contextmenu', callClearDropdownsAndRows);

	};

	var createPopupMenu = function (objectId, contextMenu, ttypes, parentGroupHashId, evDataService, evEventService, usersService, globalDataService, menuPosition) {

		clearDropdownsAndRows(evDataService, evEventService);

		var popup = evRvDomManagerService.prepareRowAndGetPopupMenu(objectId, parentGroupHashId, evDataService, true);
		var obj = evDataHelper.getObject(objectId, parentGroupHashId, evDataService);

		if (obj) {

			popup.innerHTML = generateContextMenu(evDataService, contextMenu, ttypes, obj, objectId, parentGroupHashId);

			evRvDomManagerService.calculateMenuPosition(popup, menuPosition);

			document.body.appendChild(popup);

			addEventListenersForContextMenu(evDataService, evEventService, usersService, globalDataService);

		}

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE);

	};

	/**
	 *
	 * @param groupId {Number}
	 * @param subtotalData {{type: string, subType: string=}}
	 * @param parentGroupHashId {Number}
	 * @param evDataService {Object}
	 * @param evEventService {Object}
	 * @param usersService {Object}
	 * @param globalDataService {Object}
	 * @param menuPosition {{positionX: number, positionY: number}} - coordinates of mouse click on row
	 */
	var createPopupMenuForSubtotal = function (groupId, subtotalData, parentGroupHashId, evDataService, evEventService, usersService, globalDataService, menuPosition) {

		clearDropdownsAndRows(evDataService, evEventService);

		var parent = evDataService.getData(parentGroupHashId);
		var type = subtotalData.type === 'arealine' ? subtotalData.subType : subtotalData.type;

		var popup = evRvDomManagerService.prepareSubtotalAndGetPopupMenu(groupId, type, parentGroupHashId, evDataService);

		if (parent) {

			popup.innerHTML = generateContextMenuForSubtotal(evDataService, type, groupId, parentGroupHashId);

			evRvDomManagerService.calculateMenuPosition(popup, menuPosition);

			document.body.appendChild(popup);

			addEventListenersForContextMenu(evDataService, evEventService, usersService, globalDataService, type);

		}

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE);

	};
	// var createSubtotalPopupMenu

	var getAllTTypes = function () {

		return new Promise(function (resolve, reject) {

			var ttypes = [];
			var options = {
				pageSize: 1000,
				page: 1
			};

			var getTTypePage = function () {

				transactionTypeService.getListLight(options).then(function (data) {

					ttypes = ttypes.concat(data.results);

					if (data.next) {

						options.page += 1;
						getTTypePage();

					} else {

						resolve(ttypes);

					}

				}).catch(function (error) {
					reject(error);
				});
			}

			getTTypePage();

		});

	};

	var getContextMenu = async function () {

		let contextMenu;

		const contextMenuData = await uiService.getContextMenuLayoutList({
			filters: {
				type: "report_context_menu"
			}
		});

		if (contextMenuData.results.length) {

			var contextMenuLayout = contextMenuData.results[0];
			contextMenu = contextMenuLayout.data.menu

		} else {
			contextMenu = {
				root: {
					items: [
						{
							name: 'Edit Instrument',
							action: 'edit_instrument'
						},
						{
							name: 'Edit Account',
							action: 'edit_account'
						},
						{
							name: 'Edit Portfolio',
							action: 'edit_portfolio'
						},
						{
							name: 'Edit Price',
							action: 'edit_price'
						},
						{
							name: 'Edit FX Rate',
							action: 'edit_fx_rate'
						},
						{
							name: 'Edit Pricing FX Rate',
							action: 'edit_pricing_currency'
						},
						{
							name: 'Edit Accrued FX Rate',
							action: 'edit_accrued_currency'
						},
						{
							name: 'Edit Currency',
							action: 'edit_currency'
						},
						{
							name: 'Open Book Manager',
							action: 'book_transaction'
						}
					]
				}
			};
		}

		const selectRowMenuItem = { // required item in first position
			name: 'Select/Unselect row',
			action: 'toggle_row'
		};

		contextMenu.root.items.unshift(selectRowMenuItem);

		return contextMenu;

	};

	/*    var initContextMenuEventDelegation = async function (elem, evDataService, evEventService) {

            const contextMenu = await getContextMenu();
            const ttypes = await getAllTTypes();

            elem.addEventListener('contextmenu', function (ev) {

                        var objectId;
                        var parentGroupHashId;
                        /!** @type {{type: string, subType: string=}|null} *!/
                        var subtotalData = null;

                        if (ev.target.offsetParent.classList.contains('ev-viewport')) {

                            objectId = ev.target.dataset.objectId;
                            parentGroupHashId = ev.target.dataset.parentGroupHashId;

                        } else {

                            var gRowElem = ev.target.closest('.g-row');

                            if (gRowElem) {

                                objectId = gRowElem.dataset.objectId;
                                parentGroupHashId = gRowElem.dataset.parentGroupHashId;

                                var subtotalType = gRowElem.dataset.subtotalType;
                                if (subtotalType) {

                                    subtotalData = {type: subtotalType};

                                    if (subtotalType === 'arealine') subtotalData.subType = gRowElem.dataset.subtotalSubtype;

                                }

                                /!*if (gRowElem.dataset.subtotalType) {

                                    subtotalType = gRowElem.dataset.subtotalType;

                                }*!/

                            }

                        }

                        console.log('initContextMenuEventDelegation.event', ev);

                        console.log('initContextMenuEventDelegation.objectId', objectId);

                        if (objectId) {

                            ev.preventDefault();
                            ev.stopPropagation();

                            var contextMenuPosition = {positionX: ev.pageX, positionY: ev.pageY};

                            if (subtotalData) {
                                createPopupMenuForSubtotal(objectId, subtotalData, parentGroupHashId, evDataService, evEventService, contextMenuPosition);

                            } else {
                                createPopupMenu(objectId, contextMenu, ttypes, parentGroupHashId, evDataService, evEventService, contextMenuPosition);
                            }

                            return false;

                        }

                    }, false);

        }; */

	/* var addEventListenersForPopupMenuOptions = function (popupMenuElem, optionClickCallback) {

        var colorOpts = popupMenuElem.querySelectorAll('.gPopupMenuOption');

        colorOpts.forEach(function (option) {
             option.addEventListener('click', optionClickCallback)
        });

        popupMenuElem.addEventListener('mouseleave', clearDropdowns);

    };

    var createRowColorPickerMenu = function (clickData, evDataService, evEventService) {

        // var menuElem = clickData.actionElem;
        var menuElem = clickData.target;
        var popup = evRvDomManagerService.preparePopupMenuType2(clickData.___id, ['ev-dropdown-popup']);

        clearDropdowns();

        evRvDomManagerService.calculateStaticMenuPosition(popup, menuElem, 208);

        //<editor-fold desc="Color picker content div">
        popup.innerHTML = '<div class="ev-dropdown-content g-row-color-picker-content">' +
                '<button class="g-row-color-picker-option gPopupMenuOption" data-color="undo_mark_row">' +
                    '<span class="material-icons">label_outline</span>' +
                '</button>' +
                '<button class="g-row-color-picker-option red gPopupMenuOption" data-color="red">' +
                    '<span class="material-icons">label</span>' +
                '</button>' +
                '<button class="g-row-color-picker-option yellow gPopupMenuOption" data-color="yellow">' +
                    '<span class="material-icons">label</span>' +
                '</button>' +
                '<button class="g-row-color-picker-option green gPopupMenuOption" data-color="green">' +
                    '<span class="material-icons">label</span>' +
                '</button>' +
            '</div>'
        //</editor-fold>

        document.body.appendChild(popup);

        var onOptionClick = function (event) {

            var rowColor = event.currentTarget.dataset.color;
            markRowByColor(clickData.___id, clickData.___parentId, evDataService, evEventService, rowColor);

            clearDropdowns();

        };

        addEventListenersForPopupMenuOptions(popup, onOptionClick);

    }; */

	/* var createSubtotalSettingsMenu = function (clickData, evDataService, evEventService) {

        var menuElem = clickData.actionElem;
        var popup = evRvDomManagerService.preparePopupMenuType2(clickData.___id, ['ev-dropdown-popup', 'ev-dropdown2']);
        var reportOptions = evDataService.getReportOptions();

        var getOptionCheckbox = function (subtotalsType) {

            if (reportOptions.subtotals_options && subtotalsType === reportOptions.subtotals_options.type) {

                return '<span class="material-icons g-menu-opt-check-icon">done</span>';

            }

            return '';

        };

        clearDropdowns();

        evRvDomManagerService.calculateStaticMenuPosition(popup, menuElem, 195);

        //<editor-fold desc="Subtotals options popup content">
        popup.innerHTML = '<div class="ev-dropdown-content">' +
            '<button class="ev-dropdown-menu-option gPopupMenuOption" data-subtotals-type="line">' +
                getOptionCheckbox('line') + 'Top' +
            '</button>' +
            '<button class="ev-dropdown-menu-option gPopupMenuOption" data-subtotals-type="area">' +
                getOptionCheckbox('area') + 'Bottom' +
            '</button>' +
            '<button class="ev-dropdown-menu-option gPopupMenuOption" data-subtotals-type="arealine">' +
                getOptionCheckbox('arealine') + 'Top and Bottom' +
            '</button>' +
        '</div>'
        //</editor-fold>

        document.body.appendChild(popup);

        var onOptionClick = function (event) {

            var subtotalsType = event.currentTarget.dataset.subtotalsType;
            var reportOptions = evDataService.getReportOptions();
            var subtotalsOpts = reportOptions.subtotals_options || {};

            if (subtotalsOpts.type === subtotalsType) {
                subtotalsOpts.type = false

            } else {
                subtotalsOpts.type = subtotalsType
            }

            reportOptions.subtotals_options = subtotalsOpts
            evDataService.setReportOptions(reportOptions);

            evEventService.dispatchEvent(evEvents.REDRAW_TABLE);
            evEventService.dispatchEvent(evEvents.REPORT_OPTIONS_CHANGE);

            clearDropdowns();

        };

        addEventListenersForPopupMenuOptions(popup, onOptionClick);

    }; */

	return {
		initEventDelegation: initEventDelegation,
		addScrollListener: addScrollListener,
		createPopupMenu: createPopupMenu,
		// initContextMenuEventDelegation: initContextMenuEventDelegation, // context menu listener transferred to initEventDelegation
		clearDropdowns: clearDropdowns,
		calculateTotalHeight: calculateTotalHeight,
		//calculateContentWrapHeight: calculateContentWrapHeight,
		calculateScroll: calculateScroll,
	}

}
