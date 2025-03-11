import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useEntityViewerStore = defineStore('entity-viewer', () => {
	const data = ref({
		requestsQueue: [],
		requestsQueueData: {},
		// needs in dashboard when user can quicly change active Objects
		// we just ignore old response data that not equal to currentRequestId
		currentRequestId: 0,

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
			page_size: 40
		},
		status: {
			data: null
		},
		allRowsSelected: false,
		// used to mark for updating group or column whose sorting has just been changed
		activeGroupTypeSort: null,
		activeColumnSort: null,
		reportOptions: {
			cost_method: 1
		},
		reportLayoutOptions: {},

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
		dataLoadEnded: false, // set to `false` by creating new instance of entityViewerDataService
		markedSubtotals: {},
		rowSettings: {},
		missingCustomFields: {
			forFilters: [],
			forColumns: []
		},
		warnAboutLayoutChangesLoss: true,
		isNewLayout: false, // does layout exist on server,
		autoRefreshState: true,
		ignoreLoadedDataMethods: {},
		componentsStatuses: {
			tableBody: false, // gTableBodyComponent
			columnArea: false // gColumnsComponent
		}
	});

	const dashboardData = ref({
		keysOfColumnsToHide: [],
		columnsTextAlign: '',
		reportDataFromDashboard: false
	});

	return {
		data,
		dashboardData
	};
});
