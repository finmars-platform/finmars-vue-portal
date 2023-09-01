export default function () {
	var layoutData = {
		// basically its dashboard layout that we store on backend
		name: '',
		data: {
			components_types: [],
		},
	}

	var projection

	var data = {
		listLayout: null,
	}

	var tmpData = {
		// data that stored only in active session
		componentsStatuses: {},
		componentsRefreshRestriction: {},
		componentsErrors: {},
		actualRvLayouts: [], // id of layouts stored in cache that are actual
		componentsUIData: {}, // e.g. height, width of cell of component
	}

	function setData(data) {
		layoutData = data
	}

	function getData() {
		return layoutData
	}

	function setProjection(projectionData) {
		projection = projectionData
	}

	function getProjection() {
		return projection
	}

	function setAllComponentsOutputs(compsOutputs) {
		if (!layoutData.data.components) {
			layoutData.data.components = {}
		}

		layoutData.data.components = compsOutputs
	}

	function getAllComponentsOutputs() {
		if (!layoutData.data.components) {
			layoutData.data.components = {}
		}

		return layoutData.data.components
	}

	function setComponentOutput(componentId, data) {
		if (!layoutData.data.components) {
			layoutData.data.components = {}
		}

		layoutData.data.components[componentId] = data
	}

	function getComponentOutput(componentId) {
		if (!layoutData.data.components) {
			layoutData.data.components = {}
		}

		return layoutData.data.components[componentId]
	}

	function setComponentStatus(componentId, status) {
		tmpData.componentsStatuses[componentId] = status
	}

	function getComponentStatus(componentId) {
		return tmpData.componentsStatuses[componentId]
	}

	function setComponentError(componentId, error) {
		tmpData.componentsErrors[componentId] = error
	}

	function getComponentError(componentId) {
		return tmpData.componentsErrors[componentId]
	}

	function setComponentRefreshRestriction(componentId, restrictionStatus) {
		tmpData.componentsRefreshRestriction[componentId] = restrictionStatus
	}

	/*function getComponentRefreshRestriction (componentId) {
            return tmpData.componentsRefreshRestriction[componentId];
        }

        function setAllComponentsRefreshRestriction (restrictionStatus) {
            Object.keys(tmpData.componentsRefreshRestriction).forEach(function (componentId) {
                tmpData.componentsRefreshRestriction[componentId] = restrictionStatus;
            });
        }*/

	function getAllComponentsRefreshRestriction() {
		return tmpData.componentsRefreshRestriction
	}

	function setComponentUIData(componentId, uiData) {
		tmpData.componentsUIData[componentId] = uiData
	}

	function getComponentUIData(componentId) {
		return tmpData.componentsUIData[componentId]
	}

	function getComponentStatusesAll() {
		return tmpData.componentsStatuses
	}

	function getComponents() {
		return layoutData.data.components_types
	}

	function setComponents(components) {
		layoutData.data.components_types = components
	}

	function getComponentById(componentId) {
		for (var i = 0; i < layoutData.data.components_types.length; i++) {
			if (layoutData.data.components_types[i].id === componentId) {
				return layoutData.data.components_types[i]
			}
		}

		return null
	}

	function updateComponent(componentData) {
		for (var i = 0; i < layoutData.data.components_types.length; i++) {
			if (layoutData.data.components_types[i].id === componentData.id) {
				layoutData.data.components_types[i] = componentData
				break
			}
		}
	}

	function setActiveTab(tab) {
		tmpData.activeTab = tab
	}

	function getActiveTab() {
		return tmpData.activeTab
	}

	function setListLayout(listLayout) {
		data.listLayout = listLayout
	}

	function getListLayout() {
		return data.listLayout
	}

	function updateModifiedDate(modifiedDate) {
		// updating listLayout prevents synchronization error when saving settings of component inside dashboard
		var listLayout = getListLayout()
		listLayout.modified = modifiedDate

		var layout = getData()
		layout.modified = modifiedDate
	}

	function pushToActualRvLayoutsInCache(layoutId) {
		if (!tmpData.actualRvLayouts.includes(layoutId)) {
			tmpData.actualRvLayouts.push(layoutId)
		}
	}

	function getActualRvLayoutsInCache() {
		return tmpData.actualRvLayouts
	}

	function setLayoutToOpen(layoutToOpen) {
		tmpData.layoutToOpen = layoutToOpen
	}

	function getLayoutToOpen() {
		return tmpData.layoutToOpen
	}

	return {
		setData: setData,
		getData: getData,
		setListLayout: setListLayout,
		getListLayout: getListLayout,
		updateModifiedDate: updateModifiedDate,

		setProjection: setProjection,
		getProjection: getProjection,

		setAllComponentsOutputs: setAllComponentsOutputs,
		getAllComponentsOutputs: getAllComponentsOutputs,
		setComponentOutput: setComponentOutput,
		getComponentOutput: getComponentOutput,
		setComponentStatus: setComponentStatus,
		getComponentStatus: getComponentStatus,
		setComponentError: setComponentError,
		getComponentError: getComponentError,
		setComponentRefreshRestriction: setComponentRefreshRestriction,
		/* getComponentRefreshRestriction: getComponentRefreshRestriction,
            setAllComponentsRefreshRestriction: setAllComponentsRefreshRestriction, */
		getAllComponentsRefreshRestriction: getAllComponentsRefreshRestriction,
		setComponentUIData: setComponentUIData,
		getComponentUIData: getComponentUIData,
		getComponents: getComponents,
		setComponents: setComponents,
		updateComponent: updateComponent,
		getComponentById: getComponentById,

		setActiveTab: setActiveTab,
		getActiveTab: getActiveTab,

		pushToActualRvLayoutsInCache: pushToActualRvLayoutsInCache,
		getActualRvLayoutsInCache: getActualRvLayoutsInCache,

		getComponentStatusesAll: getComponentStatusesAll,

		// REFACTOR change layout from popup
		setLayoutToOpen: setLayoutToOpen,
		getLayoutToOpen: getLayoutToOpen,
	}
}
