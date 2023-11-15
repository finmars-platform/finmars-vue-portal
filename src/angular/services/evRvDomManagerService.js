import evDataHelper from '../helpers/ev-data.helper'
import localStorageService from '@/angular/shell/scripts/app/services/localStorageService'

import evEvents from '../services/entityViewerEvents'

export default function () {

// IMPORTANT: if you are changing popupMenu variables, also change them in 'entity-viewer.less'
	const popupMenuWidth = 320;
	const popupMenuOptionHeight = 33;

	function calculateContentWrapHeight(rootWrapElem, contentWrapElement, evDataService) {

		var splitPanelIsActive = evDataService.isSplitPanelActive();

		if (splitPanelIsActive) { // for root entity / report viewer

			var interfaceLayout = evDataService.getInterfaceLayout();
			//var contentWrapElementHeight = document.body.clientHeight - interfaceLayout.headerToolbar.height - interfaceLayout.splitPanel.height;
			var rootWrapElemHeight = rootWrapElem.clientHeight;
			var contentWrapElementHeight = rootWrapElemHeight - interfaceLayout.splitPanel.height;

			contentWrapElement.style.height = contentWrapElementHeight + "px";

		} else {
			contentWrapElement.style.height = "";
		}

	}

	function calculateContentWrapWidth(rootWrapElem, contentWrapElement, evDataService) {

		var vSplitPanelIsActive = evDataService.isVerticalSplitPanelActive();

		if (vSplitPanelIsActive) {

			var interfaceLayout = evDataService.getInterfaceLayout();
			var rootWrapElemWidth = rootWrapElem.clientWidth;
			var contentWrapElementWidth = rootWrapElemWidth - interfaceLayout.verticalSplitPanel.width - 1;

			contentWrapElement.style.width = contentWrapElementWidth + "px"

		} else {
			contentWrapElement.style.width = ""
		}

	}

	function calculateWorkareaWrapWidth (contentWrapElement, workareaWrapElement, evDataService) {

		var components = evDataService.getComponents();
		var contentWrapWidth = contentWrapElement.clientWidth;

		// if (components.sidebar) {
		//
		//     var interfaceLayout = evDataService.getInterfaceLayout();
		//     workareaWrapElement.style.width = (contentWrapWidth - interfaceLayout.filterArea.width) + 'px'
		//
		// } else {
		//     workareaWrapElement.style.width = contentWrapWidth + 'px'
		// }

		workareaWrapElement.style.width = contentWrapWidth + 'px'

	}

	function clearDropdowns (eventListenerFn2Args, clearDropdownsAndRowsArgs, executeContextMenuActionFn, callClearDropdownsAndRowsFn) {



		let popupsToClear = [];
		const dropdowns = document.querySelectorAll('.evDropdown');
		/* for (var i = 0; i < dropdowns.length; i = i + 1) {
			dropdowns[i].remove();
		} */

		console.log('clearDropdowns.dropdowns', dropdowns)

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
		window.removeEventListener('click', executeContextMenuActionFn);

		clearDropdownsAndRowsArgs.evDataService = null;
		clearDropdownsAndRowsArgs.evEventService = null;
		window.removeEventListener('contextmenu', callClearDropdownsAndRowsFn);
		//endregion
		/* window.removeEventListener('click', executeContextMenuAction);
		window.removeEventListener('click', executeSubtotalContextMenuAction);

		clearDropdownsAndRowsArgs.evDataService = null;
		clearDropdownsAndRowsArgs.evEventService = null;
		window.removeEventListener('contextmenu', callClearDropdownsAndRows); */
		return [eventListenerFn2Args, clearDropdownsAndRowsArgs];

	}

	//region ev rv tables menus

	function calculateMenuPosition (popup, menuPosition) {

		var bodyWidth = document.body.clientWidth;
		var bodyHeight = document.body.clientHeight;

		var menuOptionsContainer = popup.querySelector('.ev-dropdown-container');
		var submenuItem = menuOptionsContainer.querySelector('.ev-dropdown-submenu');

		if (bodyWidth <= menuPosition.positionX + popupMenuWidth) {

			popup.classList.add('ev-dropdown-opens-left');
			popup.style.right = 0;

		} else {

			if ( submenuItem && bodyWidth <= menuPosition.positionX + (popupMenuWidth * 2) ) { // multiplying by 2 because of the possibility of at least one submenu
				popup.classList.add('ev-dropdown-opens-left');
			}

			popup.style.left = menuPosition.positionX + 'px';

		}

		var firstLevelOptionsNumber = menuOptionsContainer.childElementCount;
		var menuHeight = firstLevelOptionsNumber * popupMenuOptionHeight;

		if (bodyHeight < menuPosition.positionY + menuHeight) {

			popup.classList.add('ev-dropdown-opens-top');
			popup.style.bottom = 0

		} else {
			popup.style.top = menuPosition.positionY + 'px'
		}

		//popup.style.cssText = menuPosition;

	}

	function calculateStaticMenuPosition (popup, menuElem, popupHeight) {

		var menuElemRect = menuElem.getBoundingClientRect();
		// "-24" to create more space between mouse and popup borders
		var popupTop = menuElemRect.top - 24;
		popup.style.left = (menuElemRect.left - 24) + "px"

		var bodyHeight = document.body.clientHeight;

		if (bodyHeight < popupTop + popupHeight) {

			popup.style.bottom = 0;

		} else {
			popup.style.top = popupTop + 'px'
		}

	}

	function customizePopup (popup, objectId) {

		popup.id = 'dropdown-' + objectId;
		popup.classList.add('ev-dropdown', 'fade-in', 'evDropdown');

		popup.style.position = 'absolute';

		return popup;

	}

	/**
	 * Change row before opening context menu for it
	 *
	 * @param objectId {number} - id of row of ev / rv table
	 * @param parentGroupHashId {number} - id of parent group of row of ev / rv table
	 * @param evDataService {Object} - entityViewerDataService
	 * @param isReport {Boolean}
	 * @returns {HTMLDivElement} - HTML element for context menu of row
	 */
	function prepareRowAndGetPopupMenu (objectId, parentGroupHashId, evDataService, isReport) {

		var popup = document.createElement('div');
		// Victor 2021.02.01 #75 On right mouse click row don't need selected
		/* if (isReport) {

			var objects = evDataService.getObjects();

			objects.forEach(function (item) {
				item.___is_activated = false;
				item.___is_active_object = false;

				evDataService.setObject(item);

			});

		}*/

		var obj = evDataHelper.getObject(objectId, parentGroupHashId, evDataService);

		if (obj) {

			// obj.___is_activated = true;
			obj.___context_menu_is_opened = true;
			/*if (isReport) {
				obj.___context_menu_opened = true;
			}*/

			evDataService.setObject(obj);

		}

		popup = customizePopup(popup);

		return popup;

	}

	/**
	 *
	 * @param subtotalId {number}
	 * @param type {string} - type or subtype of subtotal. Can be 'line' or 'area'
	 * @param parentGroupHashId {number}
	 * @param evDataService {Object}
	 * @returns {HTMLDivElement} - html for context menu popup
	 */
	function prepareSubtotalAndGetPopupMenu (subtotalId, type, parentGroupHashId, evDataService) {

		var popup = document.createElement('div');
		// Victor 2021.02.01 #75 On right mouse click row don't need selected
		/* if (isReport) {

			var objects = evDataService.getObjects();

			objects.forEach(function (item) {
				item.___is_activated = false;
				item.___is_active_object = false;

				evDataService.setObject(item);

			});

		}*/

		var parent = Object.assign({}, evDataService.getData(parentGroupHashId));
		// var subtotalType = obj.___subtotal_subtype ? obj.___subtotal_subtype : obj.___subtotal_type;

		if (type === 'area') {
			parent.___area_subtotal_context_menu_is_opened = true;

		} else if (type === 'line') {
			parent.___line_subtotal_context_menu_is_opened = true;
		}

		evDataService.setData(parent);

		popup = customizePopup(popup, subtotalId);

		return popup;

	}

	function preparePopupMenuType2 (objectId, classesList) {

		var popup = document.createElement('div');

		popup.id = 'dropdown-' + objectId;

		classesList = classesList || [];
		classesList = classesList.concat(["fade-in", "evDropdown"]);

		popup.classList.add(...classesList);

		popup.style.position = 'absolute';

		return popup;

	}

	function addEventListenersForPopupMenuOptions (popupMenuElem, optionClickCallback, clearDropdownsFn) {

		var colorOpts = popupMenuElem.querySelectorAll('.gPopupMenuOption');

		colorOpts.forEach(function (option) {
			option.addEventListener('click', optionClickCallback)
		});

		popupMenuElem.addEventListener('mouseleave', clearDropdownsFn);

	}

	function markRowByColor (objectId, parentGroupHashId, evDataService, evEventService, usersService, globalDataService, color) {

		var isReport = evDataService.isEntityReport();
		var obj = evDataHelper.getObject(objectId, parentGroupHashId, evDataService);

		if (isReport && obj === null) { // row is subtotal

			const markedSubtotals = evDataService.getMarkedSubtotals();

			if (color === 'undo_mark_row') {
				delete markedSubtotals[objectId];
			} else {
				markedSubtotals[objectId] = color;
			}

			evDataService.setMarkedSubtotals(markedSubtotals);
			evEventService.dispatchEvent(evEvents.REDRAW_TABLE);
			return;

		}

		/* var entityType = evDataService.getEntityType();
		var markedReportRows = localStorageService.getMarkedRows(isReport, entityType);

		if (color === 'undo_mark_row') {
			delete markedReportRows[obj.id];
		} else {
			markedReportRows[obj.id] = {
				color: color
			};
		}

		localStorageService.cacheMarkedRows(isReport, entityType, markedReportRows) */

		var entityType = evDataService.getEntityType();
		var entityViewersSettings = globalDataService.getMemberEntityViewersSettings(isReport, entityType);
		var markedReportRows = entityViewersSettings.marked_rows;

		/* var entityTypesSettings = member.group_tables[viewerType].tables_settings;

		if (!entityTypesSettings[entityType]) {
			entityTypesSettings[entityType] = {};
		}

		if (!entityTypesSettings[entityType].marked_rows) {
			entityTypesSettings[entityType].marked_rows = {};
		}

		var markedReportRows = entityTypesSettings[entityType].marked_rows; */

		if (color === 'undo_mark_row') {
			delete markedReportRows[obj.id];
		} else {
			markedReportRows[obj.id] = {
				color: color
			};
		}

		globalDataService.setMemberEntityViewersSettings(entityViewersSettings, isReport, entityType);

		var member = globalDataService.getMember();

		usersService.updateMember(member.id, member);

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE);

	}

	function removeColorMarkFromAllRows (evDataService, evEventService, usersService, globalDataService) {

		var isReport = evDataService.isEntityReport();
		var viewerType = isReport ? 'report_viewer' : 'entity_viewer';
		/* var entityType = evDataService.getEntityType();

		localStorageService.cacheMarkedRows(isReport, entityType, {});
		localStorageService.cacheRowTypeFilter(isReport, entityType, 'none'); */
		var member = globalDataService.getMember();
		var entityViewersSettings = member.data.group_tables[viewerType].entity_viewers_settings;

		if (entityViewersSettings) {

			Object.keys(entityViewersSettings).forEach(function (entityType) {

				entityViewersSettings[entityType].marked_rows = {};
				entityViewersSettings[entityType].row_type_filter = 'none'

			});

		}

		if (isReport) evDataService.setMarkedSubtotals({}); // removing color mark from all subtotal rows for specific table

		globalDataService.setMember(member);
		usersService.updateMember(member.id, member);

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE);

	}

	function createRowColorPickerMenu (clickData, evDataService, evEventService, usersService, globalDataService, clearDropdownsFn) {

		// var menuElem = clickData.actionElem;
		var menuElem = clickData.target;
		var popup = preparePopupMenuType2(clickData.___id, ['ev-dropdown-popup']);

		clearDropdownsFn();

		calculateStaticMenuPosition(popup, menuElem, 208);

		//region Color picker content div
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
		//endregion

		document.body.appendChild(popup);

		var onOptionClick = function (event) {

			var rowColor = event.currentTarget.dataset.color;
			markRowByColor(clickData.___id, clickData.___parentId, evDataService, evEventService, usersService, globalDataService, rowColor);

			clearDropdownsFn();

		};

		addEventListenersForPopupMenuOptions(popup, onOptionClick, clearDropdownsFn);

	}

	//endregion

	return {
		calculateContentWrapHeight: calculateContentWrapHeight,
		calculateContentWrapWidth: calculateContentWrapWidth,

		calculateWorkareaWrapWidth: calculateWorkareaWrapWidth,
		//region ev rv tables menus
		clearDropdowns: clearDropdowns,
		prepareRowAndGetPopupMenu: prepareRowAndGetPopupMenu,
		prepareSubtotalAndGetPopupMenu: prepareSubtotalAndGetPopupMenu,

		preparePopupMenuType2: preparePopupMenuType2,
		calculateMenuPosition: calculateMenuPosition,
		calculateStaticMenuPosition: calculateStaticMenuPosition,

		markRowByColor: markRowByColor,
		removeColorMarkFromAllRows: removeColorMarkFromAllRows,
		createRowColorPickerMenu: createRowColorPickerMenu
		//endregion
	}
}
