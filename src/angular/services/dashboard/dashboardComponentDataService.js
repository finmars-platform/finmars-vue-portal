export default function () {
	var viewerTableData = {
		entityViewerDataService: null,
		attributeDataService: null,
		columns: null,
	}

	function setViewerTableColumns(columns) {
		viewerTableData.columns = columns
	}

	function getViewerTableColumns() {
		return viewerTableData.columns
	}

	function setEntityViewerDataService(entityViewerDataService) {
		viewerTableData.entityViewerDataService = entityViewerDataService
	}

	function getEntityViewerDataService() {
		return viewerTableData.entityViewerDataService
	}

	function setEntityViewerEventService(entityViewerEventService) {
		viewerTableData.entityViewerEventService = entityViewerEventService
	}

	function getEntityViewerEventService() {
		return viewerTableData.entityViewerEventService
	}

	function setAttributeDataService(attrDataService) {
		viewerTableData.attributeDataService = attrDataService
	}

	function getAttributeDataService() {
		return viewerTableData.attributeDataService
	}

	return {
		setEntityViewerDataService: setEntityViewerDataService,
		getEntityViewerDataService: getEntityViewerDataService,

		setEntityViewerEventService: setEntityViewerEventService,
		getEntityViewerEventService: getEntityViewerEventService,

		setAttributeDataService: setAttributeDataService,
		getAttributeDataService: getAttributeDataService,
		setViewerTableColumns: setViewerTableColumns,
		getViewerTableColumns: getViewerTableColumns,
	}
}
