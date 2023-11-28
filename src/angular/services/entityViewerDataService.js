import stringHelper from '../helpers/stringHelper'
import metaHelper from '../helpers/meta.helper.js'

var getDefaultInterfaceLayout = function () {
	var sidebarWidth = 160
	var sidebarHeight = document.body.clientHeight

	var headerToolbarHeight = 64
	var headerToolbarWidth = document.body.clientWidth - sidebarWidth

	// var groupingAreaHeight = 88;
	var groupingAreaHeight = 98
	var columnAreaHeight = 50
	// var progressBarHeight = 4;
	var filterAreaWidth = 239
	var filterAreaLeft = document.body.clientWidth - filterAreaWidth

	return {
		/*sidebar: {
                left: 0,
                top: 0,
                width: sidebarWidth,
                height: sidebarHeight
            },*/
		headerToolbar: {
			left: sidebarWidth,
			top: 0,
			width: headerToolbarWidth,
			height: headerToolbarHeight,
		},
		topPart: {
			height: 50,
		},
		mainContent: {
			height: 0,
		},
		/*groupingArea: {
                collapsed: false,
                left: sidebarWidth,
                top: headerToolbarHeight,
                height: groupingAreaHeight
            },*/
		columnArea: {
			collapsed: false,
			left: sidebarWidth,
			top: headerToolbarHeight + groupingAreaHeight,
			height: columnAreaHeight,
		},
		/*progressBar: {
                height: progressBarHeight
            },*/
		filterArea: {
			left: filterAreaLeft,
			top: headerToolbarHeight,
			width: filterAreaWidth,
		},
		verticalSplitPanel: {
			width: 0,
		},
		splitPanel: {
			height: 0,
		},
		evLeftPanel: {
			width: 230,
		},
	}
}

var getDefaultRootGroup = function () {
	var rootHash = stringHelper.toHash('root')

	var obj = {}
	obj.count = 0
	obj.next = null
	obj.previous = null
	obj.results = []
	obj.___group_name = 'root'
	obj.___is_open = true
	obj.___id = rootHash
	obj.___parentId = null
	obj.___type = 'group'
	obj.___level = 0

	return obj
}

var emptyUseFromAboveFilters = function (filters) {
	if (filters && Array.isArray(filters)) {
		filters.forEach(function (filter) {
			if (
				filter.options.use_from_above &&
				Object.keys(filter.options.use_from_above).length > 0
			) {
				filter.options.filter_values = []
			}
		})
	}
}
/** @module entityViewerDataService */
export default function (reportHelper) {

	var data = {
		columns: [],
		groups: [],
		rootGroupOptions: {
			subtotal_type: false
		},
		filters: [],
		rowTypeFilters: {
			markedRowFilters: 'none'
		},
		useFromAboveFilters: [],
		pagination: {
			page_size: 60
		},
		status: {
			data: null
		},
		allRowsSelected: false,
		// used to mark for updating group or column whose sorting has just been changed
		activeGroupTypeSort: null,
		activeColumnSort: null,

		//# region properties for split panel
		rootEntityViewer: false,
		splitPanelIsActive: false,
		verticalSplitPanelIsActive: false,
		splitPanelDefaultLayout: {}, // serves to manage default layout inside split panel
		splitPanelLayoutToOpen: null, // Only for frontend. Do not send to server.
		rootWrapElemData: null, // used by split panel inside iframe
		additions: {},
		//# endregion

		report: {},
		export: {},
		data: {},
		sourceData: {},
		layoutToOpen: null,
		listLayout: {},
		virtualScroll: {
			reserveTop: 10,
			reserveBottom: 20,
			requestThreshold: 20,
			lastRequestOffset: 0,
			rowHeight: 24,
			offset: 0, // current position
			offsetPx: 0,
			limit: 0, // total rows
			step: 60, // rows to render
			direction: null
		},
		viewContext: '', // can be: reconciliation_viewer, dashboard, entity_viewer, reconciliation_viewer, split_panel
		viewType: 'report_viewer',
		viewSettings: {},
		lastViewSettings: {},
		ev_options: {},
		activeLayoutConfiguration: {}, // used to check layout for changes
		interfaceLayout: null,
		requestParameters: {},
		activeRequestParametersId: null,
		lastClickInfo: {},
		unfilteredFlatList: [],
		flatList: [],
		projection: [],
		activeObject: null,
		activeObjectsCount: 0,
		dataLoadEnded: false,
		markedSubtotals: {},
		rowSettings: {},
		missingCustomFields: {
			forFilters: [],
			forColumns: [],
		},
		warnAboutLayoutChangesLoss: true,
		isNewLayout: false, // does layout exist on server,
		autoRefreshState: true,
		ignoreLoadedDataMethods: {},
	};

	var dashboardData = {
		keysOfColumnsToHide: [],
		columnsTextAlign: '',
		reportDataFromDashboard: false
	};

	data.interfaceLayout = getDefaultInterfaceLayout();

	var rootHash = stringHelper.toHash('root');
	var defaultRootGroup = getDefaultRootGroup();

	setData(defaultRootGroup);
	setActiveRequestParametersId(defaultRootGroup.___id);

	function getInterfaceLayout() {
		return data.interfaceLayout;
	}

	function setInterfaceLayout(interfaceLayout) {
		data.interfaceLayout = interfaceLayout;
	}

	/**
	 *
	 * @param {Object} [interfaceLayout]
	 * @returns {Object} - interface layout with only properties that user changes
	 * @memberOf module:entityViewerDataService
	 */
	var getInterfaceLayoutToSave = function (interfaceLayout) {

		if (interfaceLayout === undefined) {
			interfaceLayout = getInterfaceLayout();
		}

		var interfaceLayoutToSave = {};

		// interfaceLayoutToSave.groupingArea = {};
		// if (interfaceLayout.groupingArea) {
		//     interfaceLayoutToSave.groupingArea.collapsed = interfaceLayout.groupingArea.collapsed;
		//     interfaceLayoutToSave.groupingArea.height = interfaceLayout.groupingArea.height;
		// }
		interfaceLayoutToSave.columnArea = {};
		// interfaceLayoutToSave.columnArea.collapsed = interfaceLayout.columnArea.collapsed;
		if (interfaceLayout.columnArea) {
			interfaceLayoutToSave.columnArea.height = interfaceLayout.columnArea.height;
		}

		interfaceLayoutToSave.splitPanel = interfaceLayout.splitPanel;

		return interfaceLayoutToSave;

	};

	function toggleRightSidebar(collapse) {

		var interfaceLayout = getInterfaceLayout();

		if (collapse || interfaceLayout.filterArea.width === 239) {

			interfaceLayout.filterArea.width = 74;
			interfaceLayout.filterArea.collapsed = true;

		} else {

			interfaceLayout.filterArea.width = 239;
			interfaceLayout.filterArea.collapsed = false;

		}

		setInterfaceLayout(interfaceLayout);

	}

	function setRootEntityViewer(isRootEntityViewer) {
		data.rootEntityViewer = isRootEntityViewer;
	}

	function isRootEntityViewer() {
		return data.rootEntityViewer;
	}

	function setUseFromAbove(useFromAbove) {
		data.useFromAbove = useFromAbove;
	}

	function getUseFromAbove() {
		return data.useFromAbove;
	}

	function setSplitPanelStatus(status) {
		data.splitPanelIsActive = status;
	}

	function isSplitPanelActive() {
		return data.splitPanelIsActive;
	}

	function setVerticalSplitPanelStatus(status) {
		data.verticalSplitPanelIsActive = status;
	}

	function isVerticalSplitPanelActive() {
		return data.verticalSplitPanelIsActive;
	}

	function setEntityType(entityType) {
		data.entityType = entityType;
	}

	function getEntityType() {
		return data.entityType;
	}

	function setContentType(entityType) {
		data.contentType = entityType;
	}

	function getContentType() {
		return data.contentType;
	}

	/**
	 *
	 * @param isReport {Boolean}
	 * @memberOf module:entityViewerDataService
	 */
	function setIsReport(isReport) {
		data.isReport = isReport;
	}

	/**
	 *
	 * @returns {Boolean}
	 * @memberOf module:entityViewerDataService
	 */
	function isEntityReport() {
		return data.isReport;
	}

	function setColumns(columns) {

		if (columns) {
			data.columns = columns;
		} else {
			console.error("Set columns error", columns);
			data.columns = [];
		}
	}

	function getColumns() {
		if (!Array.isArray(data.columns)) {
			return [];
		}

		return data.columns;
	}

	function setAttributesFromAbove(attributes) {
		return data.attributesFromAbove = attributes
	}

	function getAttributesFromAbove() {
		return data.attributesFromAbove
	}

	function setGroups(groups) {

		if (groups) {
			data.groups = groups;
		} else {
			console.error("Set groups error", groups);
			data.groups = [];
		}
	}

	function getGroups() {
		if (!Array.isArray(data.groups)) {
			return [];
		}

		return data.groups;
	}

	function setRootGroupOptions(options) {
		data.rootGroupOptions = options;
	}

	function getRootGroupOptions() {
		return data.rootGroupOptions;
	}

	function setFilters(filters) {

		if (filters) {
			data.filters = filters;

		} else {
			data.filters = [];
		}

	}

	function getFilters() {
		return data.filters;
	}

	function setRowTypeFilters(filtersData) {
		data.rowTypeFilters = filtersData;
	}

	function getRowTypeFilters() {
		return data.rowTypeFilters;
	}

	function getPagination() {
		return data.pagination
	}

	function setPagination(pagination) {

		if (pagination) {
			data.pagination = pagination;
		}

	}

	function setAdditions(additions) {
		data.additions = additions;
	}

	function getAdditions() {

		if (!data.additions) {
			return {};
		}

		return data.additions
	}

	function setVerticalAdditions(additions) {
		data.verticalAdditions = additions;
	}

	function getVerticalAdditions() {

		if (!data.verticalAdditions) {
			return {};
		}

		return data.verticalAdditions
	}

	function setEditorTemplateUrl(templateUrl) {
		data.editorTemplateUrl = templateUrl;
	}

	function getEditorTemplateUrl() {
		return data.editorTemplateUrl;
	}

	function setComponents(components) {
		data.components = components;
	}

	function getComponents() {
		return data.components;
	}

	function setReportOptions(options) {


		// if (options.report_instance_id) {
		//     console.log("setReportOptions.report_instance_id is set %", options.report_instance_id);
		// } else {
		//     console.log("setReportOptions.report_instance_id is cleared");
		//     console.trace();
		// }

		data.reportOptions = options;
	}

	function getReportOptions() {
		return data.reportOptions
	}

	function setReportLayoutOptions(options) {
		data.reportLayoutOptions = options;
	}

	function getReportLayoutOptions() {
		return data.reportLayoutOptions;
	}

	/**
	 * Store dates of report when using dates from report above
	 *
	 * @param {String|null=} dateFrom
	 * @param {String=} dateTo
	 * @memberof module:entityViewerDataService
	 */
	function stashReportDates(dateFrom, dateTo) {

		const entityType = getEntityType();
		const datesProps = reportHelper.getDateProperties(entityType);

		// if dates were not passed as arguments take them from reportOptions
		if (dateFrom === undefined && dateTo === undefined) {

			const reportOptions = getReportOptions();

			var dateFromProp = datesProps[0];
			var dateToProp = datesProps[1];

			if (dateFromProp) {
				dateFrom = reportOptions[dateFromProp];
			}

			dateTo = reportOptions[dateToProp];

		}

		let datesData = {
			dateTo: {
				key: datesProps[1],
				value: dateTo
			}
		};

		if (datesProps[0]) { // balance-report does not have dateFrom

			datesData.dateFrom = {
				key: datesProps[0],
				value: dateFrom
			}

		}

		data.reportDatesData = datesData;

	}

	/**
	 * @returns {{dateFrom?: Object, dateTo: Object}|undefined}
	 * @memberof module:entityViewerDataService
	 * */
	function getStashedReportDates() {
		return data.reportDatesData || {};
	}

	function applyStashedReportDates(reportOptions) {

		const datesData = getStashedReportDates();

		if (Object.keys(datesData).length) {
			if (datesData.dateFrom) {
				reportOptions[datesData.dateFrom.key] = datesData.dateFrom.value;
			}

			reportOptions[datesData.dateTo.key] = datesData.dateTo.value;

		} else {
			console.error("No dates have been stashed");
		}

		return reportOptions;

	}

	function setStatusData(status) {
		data.status.data = status
	}

	function getStatusData() {
		return data.status.data;
	}

	function getSelectAllRowsState() {
		return data.allRowsSelected;
	}

	function setSelectAllRowsState(state) {
		data.allRowsSelected = state;
	}

	function setProjection(projection) {
		data.projection = projection
	}

	function setProjectionLastFrom(from) {
		data.projection_last_from = from
	}

	function getProjectionLastFrom() {
		return data.projection_last_from;
	}

	function getProjection() {
		return data.projection;
	}

	function setFlatList(flatList) {
		data.flatList = flatList;
	}

	function getFlatList() {
		return data.flatList;
	}

	function setUnfilteredFlatList(unfilteredFlatList) {
		data.unfilteredFlatList = unfilteredFlatList;
	}

	function getUnfilteredFlatList() {
		return data.unfilteredFlatList;
	}

	function updateItemInFlatList(item) {

		// data.flatList.forEach(function (row) {
		//
		//     if (row.___id === item.___id) {
		//         row = item;
		//     }
		//
		// })


		data.flatList = data.flatList.map(function (row) {

			if (row.___id === item.___id) {
				return item
			}

			return row
		})

	}

	function setData(obj) {
		data.data[obj.___id] = obj;
	}

	function setAllData(data) {
		data.data = data;
	}

	function setSourceData(obj) {
		data.sourceData[obj.___id] = obj;
	}

	function getSourceData(hashId) {

		if (hashId) {
			return data.sourceData[hashId];
		}

		return data.sourceData;
	}

	function setObject(obj) {

		// console.log('setData.obj', obj);

		data.data[obj.___id] = obj;

		// if (data.data[obj.___parentId] && data.data[obj.___parentId].results && data.data[obj.___parentId].results.length) {
		//
		//     data.data[obj.___parentId].results = data.data[obj.___parentId].results.map(function (item, index) {
		//
		//         if (item.___id === obj.___id) {
		//             item = obj;
		//         }
		//
		//         return item
		//
		//     })
		//
		// } else {
		//     throw Error('Trying to set not existing object')
		// }

	}

	function getObject(objectId) {

		/*if (data.data[parentId] && data.data[parentId].results && data.data[parentId].results.length) {

            var result;

            data.data[parentId].results.forEach(function (item) {

                if (item.___id === objectId) {
                    result = item
                }

            });

            return result;

        } else {
            throw Error('Object does not exist')
        }*/
		return data.data[objectId];
	}

	function getObjects() {

		var dataAtList = getDataAsList();

		var result = []

		result = dataAtList.filter(function (item) {
			return item.___type === 'object';
		})

		// var groups = getDataAsList();
		//
		// var result = [];
		//
		// groups.forEach(function (group) {
		//
		//     group.results.forEach(function (item) {
		//
		//         result.push(item)
		//
		//     });
		//
		// });

		return result;

	}

	function getData(hashId) {

		if (hashId) {
			return data.data[hashId];
		}

		return data.data;
	}

	function getRootGroup() {

		var rootHash = stringHelper.toHash('root');

		return data.data[rootHash];

	}

	function getGroup(hashId) {
		return data.data[hashId];
	}

	function getDataAsList() {

		var keys = Object.keys(data.data);

		var result = [];
		var i;
		var keysLen = keys.length;

		for (i = 0; i < keysLen; i = i + 1) {
			result.push( data.data[keys[i]] );
		}

		return result;

	}

	function  resetOnlyItems() {

		var list = getDataAsList()

		list.forEach(function (item) {
			if (item.___type === 'object') {
				delete data.data[item.___id]
			}
		})

	}

	function resetOnlyGroups() {

		var list = getDataAsList()

		list.forEach(function (item) {
			if (item.___type === 'group' && item.___parentId != null) { // except root group
				delete data.data[item.___id]
			}
		})

	}

	function resetObjectsOfGroup(groupId) {
		var list = getDataAsList();

		list.forEach(function (item) {
			if (item.___type === 'object' && item.___parentId === groupId) { // except root group
				delete data.data[item.___id];
			}
		})
	}

	function resetData() {

		data.data = {};

		var rootHash = stringHelper.toHash('root');
		var defaultRootGroup = getDefaultRootGroup();

		console.log('defaultRootGroup', defaultRootGroup);

		setData(defaultRootGroup);

	}

	function getRootGroupData() {
		return data.data[rootHash]
	}

	function setLastClickInfo(click) {
		data.lastClickInfo = click;
	}

	function getLastClickInfo() {
		return data.lastClickInfo;
	}


	function setRequestParameters(requestParameters) {

		data.requestParameters[requestParameters.id] = requestParameters;

	}

	function resetRequestParameters() { // resets number of row's pages
		data.requestParameters = {};
	}

	function getRequestParametersAsList() {

		var keys = Object.keys(data.requestParameters);

		var result = [];
		var i;
		var keysLen = keys.length;

		for (i = 0; i < keysLen; i = i + 1) {
			result[i] = data.requestParameters[keys[i]]
		}

		return result;

	}

	function isRequestParametersExist(id) {

		if (data.requestParameters[id]) {
			return true;
		}

		return false

	}

	function getRequestParameters(id) {

		if (data.requestParameters[id]) {
			return data.requestParameters[id]
		} else {

			var groups = getGroups();

			var defaultParameters = {};

			if (groups.length) {

				defaultParameters = {
					requestType: 'groups',
					id: id,
					groups_level: 1, // 0 is for root
					event: {
						___id: id,
						groupName: 'root',  // seems its ___group_name
						groupId: 'root', // seems its ___group_identifier
						parentGroupId: null
					},
					body: {
						groups_types: [groups[0]],
						page: 1,
						groups_values: [],
						groups_order: 'asc',
						page_size: 60
					},
					pagination: {
						page: 1,
						page_size: data.pagination.page_size,
						count: 1
					},
					requestedPages: [1],
					processedPages: []
				};

			} else {

				defaultParameters = {
					requestType: 'objects',
					id: id,
					groups_level: 1, // 0 is for root
					event: {
						groupName: null,
						groupId: null,
						parentGroupId: null
					},
					body: {
						groups_types: [],
						page: 1,
						groups_values: [],
						groups_order: 'asc',
						page_size: 60
					},
					pagination: {
						page: 1,
						page_size: data.pagination.page_size,
						count: 1
					},
					requestedPages: [1],
					processedPages: []
				};

			}

			return defaultParameters;
		}
	}

	function getAllRequestParameters() {
		return data.requestParameters;
	}

	function getActiveRequestParameters() {

		if (data.activeRequestParametersId) {
			return getRequestParameters(data.activeRequestParametersId);
		}

	}

	function setActiveRequestParametersId(id) {
		data.activeRequestParametersId = id;
	}

	function resetTableContent(isReport) {

		resetData();
		resetRequestParameters();
		data.flatList = [];
		data.projection = [];

		var rootGroup = getRootGroupData();

		setActiveRequestParametersId(rootGroup.___id);

		if (!isReport) setSelectedGroups([]);

		console.log('resetTableContent.data', data);

	}


	// Activated Row just for selection purpose
	// Active Object for Split panel,

	function setActiveObjectRow(obj) {
		data.activeObjectRow = obj;
	}

	function getActiveObjectRow() {
		return data.activeObjectRow;
	}

	function setActiveObject(obj) {
		data.activeObject = obj
	}

	function setActiveObjectFromAbove(obj) {
		data.activeObjectFromAbove = obj
	}

	function getActiveObjectFromAbove() {
		return data.activeObjectFromAbove;
	}

	/* function clearActiveObject() {

        var activeObject = getActiveObject();

        if (activeObject) {
            activeObject.___is_activated = false;
            setObject(activeObject);
        }

    } */

	/* function setActiveObjectAction(action) {
        data.activeObjectAction = action;
    }

    function getActiveObjectAction() {
        return data.activeObjectAction;
    }

    function setActiveObjectActionData(actionData) {
        data.activeObjectActionData = actionData;
    }

    function getActiveObjectActionData() {
        return data.activeObjectActionData;
    } */

	function getActiveObject() {
		return data.activeObject;
	}

	function clearColumnSort(column) {

		column.options.sort = null;
		column.options.sort_settings = {
			mode: null
		};

		setColumnSortData(column.key, null);

	}

	function setActiveColumnSort(column) {

		var columns = getColumns();

		columns.forEach(function (col) {

			if (col.key === column.key) {
				return;
			}

			/*if (!col.options) col.options = {};
            if (!col.options.sort_settings) col.options.sort_settings = {};*/

			clearColumnSort(col);

		})

		data.activeColumnSort = column;

	}

	function getActiveColumnSort() {
		return data.activeColumnSort;
	}

	function setActiveGroupTypeSort(group) {
		data.activeGroupTypeSort = group;
	}

	/**
	 *
	 * @param actionData {Object|null}
	 * @param {String} actionData.actionKey - edit, delete etc
	 * @param {Object=} actionData.object - data about table row targeted for action
	 * @param {string|number=} actionData.id - e.g. transactionType.id, price history error id, etc.
	 * @memberof module:entityViewerDataService
	 */
	function setRowsActionData(actionData) {
		data.rowsActionData = actionData;
	}

	/**
	 *
	 * @returns {{actionKey: String, [object]: Object, [id]: string|number} | any}
	 * @memberof module:entityViewerDataService
	 */
	function getRowsActionData() {
		return data.rowsActionData;
	}

	function getActiveGroupTypeSort() {
		return data.activeGroupTypeSort;
	}

	function setRowHeight(height) {
		return data.virtualScroll.rowHeight = height;
	}

	function getRowHeight() {
		return data.virtualScroll.rowHeight;
	}

	function getRequestThreshold() {
		return data.virtualScroll.requestThreshold;
	}

	function setLastRequestOffset(offset) {
		return data.virtualScroll.lastRequestOffset = offset;
	}

	function getLastRequestOffset() {
		return data.virtualScroll.lastRequestOffset;
	}

	function getVirtualScrollStep() {
		return data.virtualScroll.step;
	}

	function setVirtualScrollStep(step) {
		return data.virtualScroll.step = step;
	}

	function getVirtualScrollDirection() {
		return data.virtualScroll.direction;
	}

	function setVirtualScrollDirection(direction) {
		return data.virtualScroll.direction = direction;
	}

	function setVirtualScrollOffset(offset) {
		data.virtualScroll.offset = offset;
	}

	function getVirtualScrollOffset() {
		return data.virtualScroll.offset;
	}

	function setVirtualScrollPreviousOffsetPx(offset) {
		data.virtualScroll.previosOffsetPx = offset
	}

	function getVirtualScrollPreviousOffsetPx() {
		return data.virtualScroll.previosOffsetPx;
	}


	function setVirtualScrollOffsetPx(offset) {
		data.virtualScroll.offsetPx = offset
	}

	function getVirtualScrollOffsetPx() {
		return data.virtualScroll.offsetPx;
	}


	function getVirtualScrollReserveTop() {
		return data.virtualScroll.reserveTop;
	}

	function getVirtualScrollReserveBottom() {
		return data.virtualScroll.reserveBottom;
	}

	function setVirtualScrollLimit(limit) {
		data.virtualScroll.limit = limit;
	}

	function getVirtualScrollLimit() {
		return data.virtualScroll.limit;
	}

	function setExportOptions(exportOptions) {
		data.export = exportOptions;
	}

	function getExportOptions() {
		return data.export;
	}

	function setListLayout(listLayout) {
		data.listLayout = listLayout;
	}

	function getListLayout() {
		return data.listLayout;
	}

	function setIsNewLayoutState(state) {
		data.isNewLayout = state;
	}

	function isLayoutNew() {
		return data.isNewLayout;
	}

	function setActiveLayoutConfiguration(options) {

		if (options && options.layoutConfig) {
			data.activeLayoutConfiguration = options.layoutConfig;

		} else {

			var listLayout = metaHelper.recursiveDeepCopy(getListLayout());
			// var interfaceLayout = getInterfaceLayout();

			listLayout.data.interfaceLayout = getInterfaceLayoutToSave();

			/*if (isRootEntityViewer()) {
                listLayout.data.additions = JSON.parse(JSON.stringify(getAdditions()));
            }*/
			listLayout.data.additions = JSON.parse(JSON.stringify(getAdditions()));

			if (options) {

				if (options.isReport) {

					listLayout.data.reportOptions = metaHelper.recursiveDeepCopy(getReportOptions());
					listLayout.data.reportLayoutOptions = metaHelper.recursiveDeepCopy(getReportLayoutOptions());
					listLayout.data.rootGroupOptions = metaHelper.recursiveDeepCopy(getRootGroupOptions());

					if (getExportOptions()) {
						listLayout.data.export = metaHelper.recursiveDeepCopy(getExportOptions());
					}

					var viewType = getViewType();
					var viewSettings = getViewSettings(viewType);

					listLayout.data.viewType = viewType;
					listLayout.data.viewSettings = {};

					if (viewSettings) {
						listLayout.data.viewSettings[viewType] = getViewSettings(viewType);
					}

					/* delete listLayout.data.reportOptions.items;
                    delete listLayout.data.reportOptions.item_complex_transactions;
                    delete listLayout.data.reportOptions.item_counterparties;
                    delete listLayout.data.reportOptions.item_responsibles;
                    delete listLayout.data.reportOptions.item_strategies3;
                    delete listLayout.data.reportOptions.item_strategies2;
                    delete listLayout.data.reportOptions.item_strategies1;
                    delete listLayout.data.reportOptions.item_portfolios;
                    delete listLayout.data.reportOptions.item_instruments;
                    delete listLayout.data.reportOptions.item_instrument_pricings;
                    delete listLayout.data.reportOptions.item_instrument_accruals;
                    delete listLayout.data.reportOptions.item_currency_fx_rates;
                    delete listLayout.data.reportOptions.item_currencies;
                    delete listLayout.data.reportOptions.item_accounts; */
					listLayout.data.reportOptions = reportHelper.cleanReportOptionsFromTmpProps(listLayout.data.reportOptions);

				} else {
					listLayout.data.pagination = getPagination();
				}

			}

			data.activeLayoutConfiguration = listLayout;

		}

	}

	function getActiveLayoutConfiguration() {
		return data.activeLayoutConfiguration;
	}

	function getLayoutCurrentConfiguration(isReport) {

		let listLayout = metaHelper.recursiveDeepCopy(getListLayout());

		listLayout.data.columns = getColumns();
		listLayout.data.grouping = getGroups();
		listLayout.data.filters = getFilters();

		listLayout.data.columns.forEach(column => delete column.frontOptions);
		listLayout.data.grouping.forEach(group => delete group.frontOptions);

		listLayout.data.rowSettings = getRowSettings();
		listLayout.data.additions = getAdditions();

		// var interfaceLayout = getInterfaceLayout();

		listLayout.data.interfaceLayout = getInterfaceLayoutToSave();

		if (isReport) {

			emptyUseFromAboveFilters(listLayout.data.filters);

			listLayout.data.reportOptions = metaHelper.recursiveDeepCopy(getReportOptions());
			listLayout.data.reportLayoutOptions = metaHelper.recursiveDeepCopy(getReportLayoutOptions());

			var viewContext = getViewContext();

			if (viewContext === 'split_panel' && listLayout.data.reportLayoutOptions.useDateFromAbove) {
				listLayout.data.reportOptions = applyStashedReportDates(listLayout.data.reportOptions);
			}

			listLayout.data.rootGroupOptions = metaHelper.recursiveDeepCopy(getRootGroupOptions());

			if (getExportOptions()) {
				listLayout.data.export = metaHelper.recursiveDeepCopy(getExportOptions());
			}

			var viewType = getViewType();
			var viewSettings = getViewSettings(viewType);

			listLayout.data.viewType = viewType;
			listLayout.data.viewSettings = {};

			if (viewSettings) {
				listLayout.data.viewSettings[viewType] = viewSettings;
			}

			/* delete listLayout.data.reportOptions.items;
            delete listLayout.data.reportOptions.item_complex_transactions;
            delete listLayout.data.reportOptions.item_counterparties;
            delete listLayout.data.reportOptions.item_responsibles;
            delete listLayout.data.reportOptions.item_strategies3;
            delete listLayout.data.reportOptions.item_strategies2;
            delete listLayout.data.reportOptions.item_strategies1;
            delete listLayout.data.reportOptions.item_portfolios;
            delete listLayout.data.reportOptions.item_instruments;
            delete listLayout.data.reportOptions.item_instrument_pricings;
            delete listLayout.data.reportOptions.item_instrument_accruals;
            delete listLayout.data.reportOptions.item_currency_fx_rates;
            delete listLayout.data.reportOptions.item_currencies;
            delete listLayout.data.reportOptions.item_accounts; */
			listLayout.data.reportOptions = reportHelper.cleanReportOptionsFromTmpProps(listLayout.data.reportOptions);

		} else {

			listLayout.data.pagination = getPagination();
			listLayout.data.ev_options = getEntityViewerOptions();

		}

		return listLayout;
	}

	function setLayoutCurrentConfiguration(activeListLayout, uiService, isReport) {

		var listLayout;

		if (activeListLayout) {

			listLayout = Object.assign({}, activeListLayout);

		} else {

			var defaultList = uiService.getListLayoutTemplate(isReport);

			listLayout = {};
			listLayout.data = Object.assign({}, defaultList[0].data);

		}

		if (!listLayout.id) {
			setIsNewLayoutState(true);
		}

		if (listLayout.data.interfaceLayout) {

			var interfaceLayout = getInterfaceLayout();
			interfaceLayout = Object.assign(interfaceLayout, listLayout.data.interfaceLayout);

			if (interfaceLayout.columnArea && interfaceLayout.columnArea.height === 70) { // need for work of the old layouts
				interfaceLayout.columnArea.height = 50;
			}

			setInterfaceLayout(interfaceLayout);

		}

		if (isReport) {

			var reportOptions = getReportOptions();
			var reportLayoutOptions = getReportLayoutOptions();
			var rootGroupOptions = getRootGroupOptions();

			var newReportOptions = Object.assign({}, reportOptions, listLayout.data.reportOptions);
			var newReportLayoutOptions = Object.assign({}, reportLayoutOptions, listLayout.data.reportLayoutOptions);
			var newRootGroupOptions = Object.assign({}, rootGroupOptions, listLayout.data.rootGroupOptions);

			setReportOptions(newReportOptions);
			setReportLayoutOptions(newReportLayoutOptions);
			setRootGroupOptions(newRootGroupOptions);

			setExportOptions(listLayout.data.export);

			var viewType = listLayout.data.viewType;

			if (viewType) {
				setViewType(viewType);

				if (listLayout.data.viewSettings && listLayout.data.viewSettings[viewType]) {
					setViewSettings(viewType, listLayout.data.viewSettings[viewType]);
				}
			}

			listLayout.data.grouping = listLayout.data.grouping.map( groupType => {

				if (!groupType.report_settings) {
					groupType.report_settings = {};
				}

				if (typeof groupType.report_settings.is_level_folded !== 'boolean') {
					groupType.report_settings.is_level_folded = true;
				}

				return groupType;

			})

			listLayout.data.filters = emptyUseFromAboveFilters(listLayout.data.filters);

		}
		else {

			setPagination(listLayout.data.pagination);

			var entityViewerOptions = listLayout.data.ev_options;

			if (!entityViewerOptions) {

				entityViewerOptions = {
					// complex_transaction_filters: ['ignored', 'locked', 'partially_visible'],
					entity_filters: ['enabled', 'disabled', 'active', 'inactive']
				}

				// } else if (!entityViewerOptions.complex_transaction_filters) {
				//
				//     entityViewerOptions.complex_transaction_filters = ['ignored', 'locked', 'partially_visible'];
				//
				//
				// } else if (!entityViewerOptions.entity_filters){
			} else if (!entityViewerOptions.entity_filters) {

				entityViewerOptions.entity_filters = ['enabled', 'disabled', 'active', 'inactive'];
			}

			setEntityViewerOptions(entityViewerOptions);

		}

		listLayout.data.columns = listLayout.data.columns.map(column => {
			if (!column.options) column.options = {}
			if (!column.options.sort_settings) column.options.sort_settings = {}
			return column;
		})

		listLayout.data.grouping = listLayout.data.grouping.map(group => {
			if (!group.options) group.options = {}
			if (!group.options.sort_settings) group.options.sort_settings = {}
			return group;
		})

		setColumns(listLayout.data.columns);
		setGroups(listLayout.data.grouping);

		setFilters(listLayout.data.filters);

		/*if (isRootEntityViewer()) {
            setAdditions(listLayout.data.additions);
        }*/
		setAdditions(listLayout.data.additions);

		setListLayout(listLayout);

		const setActiveColumnGroupSort = async (columnOrGroup) => {

			if (!columnOrGroup.options.sort) {
				return;
			}

			var columnWithGroup = !!listLayout.data.grouping.find(group => group.key === columnOrGroup.key);

			if (columnWithGroup) {
				setActiveGroupTypeSort(columnOrGroup);

			} else {
				setActiveColumnSort(columnOrGroup);
			}

			if (columnOrGroup.options.sort_settings.mode === 'manual') {

				const {results} = await uiService.getColumnSortDataList({
					filters: {
						user_code: columnOrGroup.options.sort_settings.layout_user_code
					}
				});

				if (results.length) {

					const layout = results[0];
					setColumnSortData(columnOrGroup.key, layout.data);

				}

			}

		};

		data.columns.forEach(setActiveColumnGroupSort);
		data.groups.forEach(setActiveColumnGroupSort);

		listLayout.data.components = {
			filterArea: true,
			topPart: true,
			columnArea: true,
			viewer: true,
			// sidebar: true,
			// groupingArea: true,
			columnAreaHeader: true,
			splitPanel: true,
			addEntityBtn: true,
			fieldManagerBtn: true,
			layoutManager: true,
			autoReportRequest: false
		};

		if (isReport) {
			listLayout.data.components.groupingArea = false
		}

		setComponents(listLayout.data.components);
		setEditorTemplateUrl('views/additions-editor-view.html');

	}

	function setSplitPanelDefaultLayout(layoutData) {
		data.splitPanelDefaultLayout = layoutData;
	}

	function getSplitPanelDefaultLayout() {
		return data.splitPanelDefaultLayout;
	}

	/**
	 * Set layout to open inside split panel not by default.
	 *
	 * @param layoutName {number} - id of layout
	 */
	function setSplitPanelLayoutToOpen(layoutName) {
		data.splitPanelLayoutToOpen = layoutName;
	}

	/**
	 * Get layout to open inside split panel not by default.
	 *
	 * @returns {number|void} - id of layout to open
	 */
	function getSplitPanelLayoutToOpen() {
		var splitPanelActiveLayoutName = data.splitPanelLayoutToOpen;
		data.splitPanelLayoutToOpen = false;
		return splitPanelActiveLayoutName;
	}

	function setRootWrapElemData(elemData) {
		data.rootWrapElemData = elemData;
	}

	function getRootWrapElemData() {
		return data.rootWrapElemData;
	}

	function setViewType(viewType) {
		return data.viewType = viewType;
	}

	function getViewType() {
		return data.viewType;
	}


	// That prop used only during user session and do not saved in layout
	function setUserRequestedAction(action) {
		return data.userRequestedAction = action;
	}

	function getUserRequestedAction() {
		return data.userRequestedAction;
	}


	function setAutoRefreshState(state) {
		return data.autoRefreshState = state;
	}

	function getAutoRefreshState() {
		return data.autoRefreshState;
	}


	function setViewSettings(viewType, settings) {

		data.lastViewSettings[viewType] = JSON.parse(JSON.stringify(data.viewSettings));

		return data.viewSettings[viewType] = settings;
	}

	function getViewSettings(viewType) {
		return data.viewSettings[viewType];
	}

	function getLastViewSettings(viewType) {
		return data.lastViewSettings[viewType];
	}

	function setViewContext(vContext) {
		data.viewContext = vContext;
	}

	function getViewContext() {
		return data.viewContext;
	}

	function setEntityViewerOptions(evOptions) {
		data.ev_options = evOptions;
	}

	function getEntityViewerOptions() {
		return data.ev_options;
	}

	function setCurrentMember(member) {
		data.currentMember = member;
	}

	function getCurrentMember() {
		return data.currentMember
	}

	function setReconciliationData(reconData) {
		data.reconciliation = reconData
	}

	function getReconciliationData() {
		return data.reconciliation
	}

	function setReconciliationFile(parsedFile) {
		data.reconciliationParsedFile = parsedFile
	}

	function getReconciliationFile() {
		return data.reconciliationParsedFile;
	}

	function setReconciliationDataService(service) {
		data.reconciliationDataService = service
	}

	function getReconciliationDataService() {
		return data.reconciliationDataService
	}

	function setReconciliationEventService(service) {
		data.reconciliationEventService = service
	}

	function getReconciliationEventService() {
		return data.reconciliationEventService
	}

	function setReconciliationImportConfig(config) {
		data.reconImportConfig = config
	}

	function getReconciliationImportConfig() {
		return data.reconImportConfig;
	}

	function setParentDataService(dataService) {
		data.parentDataService = dataService
	}

	function getParentDataService() {
		return data.parentDataService
	}

	function setParentEventService(eventService) {
		data.parentEventService = eventService
	}

	function getParentEventService() {
		return data.parentEventService
	}

	function setDataLoadStatus(isEnded) {
		data.dataLoadEnded = isEnded;
	}

	function didDataLoadEnd() {
		return data.dataLoadEnded;
	}

	// START: Methods for dashboard
	function setKeysOfColumnsToHide(keys) {
		dashboardData.keysOfColumnsToHide = keys;
	}

	function getKeysOfColumnsToHide() {
		if (!Array.isArray(dashboardData.keysOfColumnsToHide)) {
			return [];
		}

		return dashboardData.keysOfColumnsToHide
	}

	function setColumnsTextAlign(alignDirection) {
		dashboardData.columnsTextAlign = alignDirection;
	}

	function getColumnsTextAlign() {
		return dashboardData.columnsTextAlign;
	}

	function isReportDateFromDashboard() {
		return dashboardData.reportDataFromDashboard;
	}

	function setReportDateFromDashboardProp(fromDashboard) {
		dashboardData.reportDataFromDashboard = fromDashboard;
	}

	// END: Methods for dashboard

	function setMissingPrices(prices) {
		data.missingPrices = prices;
	}

	function getMissingPrices() {
		return data.missingPrices;
	}

	function setMarkedSubtotals(markedSubtotals) {
		data.markedSubtotals = markedSubtotals;
	}

	function getMarkedSubtotals() {
		return data.markedSubtotals;
	}

	function setCrossEntityAttributeExtensions(items) {
		data.crossEntityAttributeExtensions = items;
	}

	function getCrossEntityAttributeExtensions() {
		return data.crossEntityAttributeExtensions;
	}

	function setColumnSortData(key, item) {

		if (!data.columnSortData) {
			data.columnSortData = {}
		}

		data.columnSortData[key] = item;
	}

	/**
	 * Contains sorting data loaded from server (e.g. manual sorting). Used for groupType and column sorting.
	 *
	 * @param {String} key - key of column
	 * @returns {*|null}
	 */
	function getColumnSortData(key) {

		if (data.columnSortData && data.columnSortData.hasOwnProperty(key)) {
			return data.columnSortData[key];
		}

		return null;
	}

	function setRowSettings(rowSettings) {
		data.rowSettings = rowSettings;
	}

	function getRowSettings() {
		return data.rowSettings || {};
	}

	function setMissingCustomFields(options) {

		if (!options) {
			data.missingCustomFields = {
				forFilters: [],
				forColumns: [],
			};
		}

		if (options.forFilters) {
			data.missingCustomFields.forFilters = options.forFilters;
		}

		if (options.forColumns) {
			data.missingCustomFields.forColumns = options.forColumns;
		}
	}

	function getMissingCustomFields() {
		return data.missingCustomFields;
	}

	/**
	 * Setting status to false allows to skip layout changes loss warning once
	 *
	 * @param status {boolean}
	 * @memberOf module:entityViewerDataService
	 */
	function setLayoutChangesLossWarningState(status) {
		data.warnAboutLayoutChangesLoss = status;
	}

	/**
	 * If warnAboutLayoutChangesLoss === false, turns warning back on before returning false
	 *
	 *@memberOf module:entityViewerDataService
	 */
	function isLayoutChangesLossWarningNeeded() {

		if (!data.warnAboutLayoutChangesLoss) {

			data.warnAboutLayoutChangesLoss = true;
			return false;

		}

		return data.warnAboutLayoutChangesLoss;

	}

	// MATERIAL DESIGN ENTITY VIEWER LOGIC

	function setSelectedGroups(groups) {

		if (!groups || !Array.isArray(groups)) {
			data.selectedGroups = [];

		} else {
			data.selectedGroups = groups;
		}

	}

	function getSelectedGroups() {
		return data.selectedGroups || [];
	}

	function setSelectedGroupsMultiselectState(state) {
		data.selectedGroupsMultiselectState = state
	}

	function getSelectedGroupsMultiselectState() {
		return data.selectedGroupsMultiselectState;
	}

	function setGlobalTableSearch(query) {
		data.globalTableSearch = query
	}

	function getGlobalTableSearch() {
		return data.globalTableSearch;
	}

	function setRenderTime(time) {
		data.renderTime = time
	}

	function getRenderTime() {
		return data.renderTime;
	}


	return {

		setRootEntityViewer: setRootEntityViewer,
		isRootEntityViewer: isRootEntityViewer,

		setEntityType: setEntityType,
		getEntityType: getEntityType,

		setContentType: setContentType,
		getContentType: getContentType,

		setIsReport: setIsReport,
		isEntityReport: isEntityReport,

		setColumns: setColumns,
		getColumns: getColumns,

		setGroups: setGroups,
		getGroups: getGroups,

		setRootGroupOptions: setRootGroupOptions,
		getRootGroupOptions: getRootGroupOptions,

		setFilters: setFilters,
		getFilters: getFilters,

		setAttributesFromAbove: setAttributesFromAbove,
		getAttributesFromAbove: getAttributesFromAbove,

		getPagination: getPagination,
		setPagination: setPagination,

		setAdditions: setAdditions,
		getAdditions: getAdditions,

		setVerticalAdditions: setVerticalAdditions,
		getVerticalAdditions: getVerticalAdditions,

		setEditorTemplateUrl: setEditorTemplateUrl,
		getEditorTemplateUrl: getEditorTemplateUrl,

		setComponents: setComponents,
		getComponents: getComponents,

		setReportOptions: setReportOptions,
		getReportOptions: getReportOptions,
		setReportLayoutOptions: setReportLayoutOptions,
		getReportLayoutOptions: getReportLayoutOptions,
		stashReportDates: stashReportDates,
		getStashedReportDates: getStashedReportDates,
		applyStashedReportDates: applyStashedReportDates,

		setStatusData: setStatusData,
		getStatusData: getStatusData,

		setProjection: setProjection,
		getProjection: getProjection,

		setProjectionLastFrom: setProjectionLastFrom,
		getProjectionLastFrom: getProjectionLastFrom,

		setFlatList: setFlatList,
		getFlatList: getFlatList,
		setUnfilteredFlatList: setUnfilteredFlatList,
		getUnfilteredFlatList: getUnfilteredFlatList,

		updateItemInFlatList: updateItemInFlatList,

		getSelectAllRowsState: getSelectAllRowsState,
		setSelectAllRowsState: setSelectAllRowsState,

		getGroup: getGroup,
		setData: setData,
		setAllData: setAllData,
		resetOnlyItems: resetOnlyItems,
		resetObjectsOfGroup: resetObjectsOfGroup,
		resetOnlyGroups: resetOnlyGroups,
		resetData: resetData,
		getData: getData,
		getDataAsList: getDataAsList,
		getRootGroup: getRootGroup,

		setObject: setObject,
		getObject: getObject,
		getObjects: getObjects,

		getRootGroupData: getRootGroupData,

		setLastClickInfo: setLastClickInfo,
		getLastClickInfo: getLastClickInfo,

		isRequestParametersExist: isRequestParametersExist,
		setRequestParameters: setRequestParameters,
		getRequestParameters: getRequestParameters,
		getRequestParametersAsList: getRequestParametersAsList,

		getActiveRequestParameters: getActiveRequestParameters,
		setActiveRequestParametersId: setActiveRequestParametersId,

		resetRequestParameters: resetRequestParameters,
		getAllRequestParameters: getAllRequestParameters,

		resetTableContent: resetTableContent,

		setActiveObjectFromAbove: setActiveObjectFromAbove,
		getActiveObjectFromAbove: getActiveObjectFromAbove,

		setActiveObject: setActiveObject,
		getActiveObject: getActiveObject,
		// clearActiveObject: clearActiveObject,
		/* setActiveObjectAction: setActiveObjectAction,
        getActiveObjectAction: getActiveObjectAction,

        setActiveObjectActionData: setActiveObjectActionData,
        getActiveObjectActionData: getActiveObjectActionData, */

		setRowsActionData: setRowsActionData,
		getRowsActionData: getRowsActionData,

		getRowHeight: getRowHeight,
		setRowHeight: setRowHeight,
		getRequestThreshold: getRequestThreshold,
		getVirtualScrollStep: getVirtualScrollStep,
		setVirtualScrollStep: setVirtualScrollStep,

		setLastRequestOffset: setLastRequestOffset,
		getLastRequestOffset: getLastRequestOffset,

		setVirtualScrollOffsetPx: setVirtualScrollOffsetPx,
		getVirtualScrollOffsetPx: getVirtualScrollOffsetPx,

		setVirtualScrollPreviousOffsetPx: setVirtualScrollPreviousOffsetPx,
		getVirtualScrollPreviousOffsetPx: getVirtualScrollPreviousOffsetPx,

		setActiveColumnSort: setActiveColumnSort,
		getActiveColumnSort: getActiveColumnSort,
		setColumnSortData: setColumnSortData,
		getColumnSortData: getColumnSortData,

		setActiveGroupTypeSort: setActiveGroupTypeSort,
		getActiveGroupTypeSort: getActiveGroupTypeSort,

		setVirtualScrollOffset: setVirtualScrollOffset,
		getVirtualScrollOffset: getVirtualScrollOffset,

		getVirtualScrollReserveTop: getVirtualScrollReserveTop,
		getVirtualScrollReserveBottom: getVirtualScrollReserveBottom,

		setVirtualScrollLimit: setVirtualScrollLimit,
		getVirtualScrollLimit: getVirtualScrollLimit,

		getVirtualScrollDirection: getVirtualScrollDirection,
		setVirtualScrollDirection: setVirtualScrollDirection,

		getInterfaceLayout: getInterfaceLayout,
		setInterfaceLayout: setInterfaceLayout,
		getInterfaceLayoutToSave: getInterfaceLayoutToSave,

		toggleRightSidebar: toggleRightSidebar,

		setExportOptions: setExportOptions,
		getExportOptions: getExportOptions,

		setListLayout: setListLayout,
		getListLayout: getListLayout,
		setIsNewLayoutState: setIsNewLayoutState,
		isLayoutNew: isLayoutNew,
		getActiveLayoutConfiguration: getActiveLayoutConfiguration,
		setActiveLayoutConfiguration: setActiveLayoutConfiguration,
		getLayoutCurrentConfiguration: getLayoutCurrentConfiguration,
		setLayoutCurrentConfiguration: setLayoutCurrentConfiguration,
		setLayoutChangesLossWarningState: setLayoutChangesLossWarningState,
		isLayoutChangesLossWarningNeeded: isLayoutChangesLossWarningNeeded,

		setSplitPanelStatus: setSplitPanelStatus,
		isSplitPanelActive: isSplitPanelActive,
		setVerticalSplitPanelStatus: setVerticalSplitPanelStatus,
		isVerticalSplitPanelActive: isVerticalSplitPanelActive,
		setSplitPanelDefaultLayout: setSplitPanelDefaultLayout,
		getSplitPanelDefaultLayout: getSplitPanelDefaultLayout,
		setSplitPanelLayoutToOpen: setSplitPanelLayoutToOpen,
		getSplitPanelLayoutToOpen: getSplitPanelLayoutToOpen,
		setRootWrapElemData: setRootWrapElemData,
		getRootWrapElemData: getRootWrapElemData,

		setActiveObjectRow: setActiveObjectRow,
		getActiveObjectRow: getActiveObjectRow,

		setUseFromAbove: setUseFromAbove,
		getUseFromAbove: getUseFromAbove,

		setViewType: setViewType,
		getViewType: getViewType,

		setUserRequestedAction: setUserRequestedAction,
		getUserRequestedAction: getUserRequestedAction,

		setAutoRefreshState: setAutoRefreshState,
		getAutoRefreshState: getAutoRefreshState,

		setViewSettings: setViewSettings,
		getViewSettings: getViewSettings,

		getLastViewSettings: getLastViewSettings,

		setViewContext: setViewContext,
		getViewContext: getViewContext,

		setEntityViewerOptions: setEntityViewerOptions,
		getEntityViewerOptions: getEntityViewerOptions,

		setCurrentMember: setCurrentMember,
		getCurrentMember: getCurrentMember,

		setReconciliationData: setReconciliationData,
		getReconciliationData: getReconciliationData,

		setReconciliationDataService: setReconciliationDataService,
		getReconciliationDataService: getReconciliationDataService,

		setReconciliationEventService: setReconciliationEventService,
		getReconciliationEventService: getReconciliationEventService,

		setReconciliationImportConfig: setReconciliationImportConfig,
		getReconciliationImportConfig: getReconciliationImportConfig,

		setReconciliationFile: setReconciliationFile,
		getReconciliationFile: getReconciliationFile,

		setParentDataService: setParentDataService,
		getParentDataService: getParentDataService,

		setParentEventService: setParentEventService,
		getParentEventService: getParentEventService,

		setDataLoadStatus: setDataLoadStatus,
		didDataLoadEnd: didDataLoadEnd,

		setMissingPrices: setMissingPrices,
		getMissingPrices: getMissingPrices,

		setRowTypeFilters: setRowTypeFilters,
		getRowTypeFilters: getRowTypeFilters,

		setMarkedSubtotals: setMarkedSubtotals,
		getMarkedSubtotals: getMarkedSubtotals,

		setCrossEntityAttributeExtensions: setCrossEntityAttributeExtensions,
		getCrossEntityAttributeExtensions: getCrossEntityAttributeExtensions,

		setRowSettings: setRowSettings,
		getRowSettings: getRowSettings,

		setMissingCustomFields: setMissingCustomFields,
		getMissingCustomFields: getMissingCustomFields,

		setSelectedGroupsMultiselectState: setSelectedGroupsMultiselectState,
		getSelectedGroupsMultiselectState: getSelectedGroupsMultiselectState,

		dashboard: {
			setKeysOfColumnsToHide: setKeysOfColumnsToHide,
			getKeysOfColumnsToHide: getKeysOfColumnsToHide,
			setColumnsTextAlign: setColumnsTextAlign,
			getColumnsTextAlign: getColumnsTextAlign,
			setReportDateFromDashboardProp: setReportDateFromDashboardProp,
			isReportDateFromDashboard: isReportDateFromDashboard
		},

		getSelectedGroups: getSelectedGroups,
		setSelectedGroups: setSelectedGroups,

		setGlobalTableSearch: setGlobalTableSearch,
		getGlobalTableSearch: getGlobalTableSearch,

		setRenderTime: setRenderTime,
		getRenderTime: getRenderTime

	}
}
