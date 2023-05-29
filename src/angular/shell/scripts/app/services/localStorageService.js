// export default function (globalDataService) {

/* let UMuM = ''; // <user.id>_<masterUser.id>_<member.id>
	const noUMuMErrorMessage = "No user, master user or/and member set";

	let setUMuM = function (userId, masterUserId, memberId) {

		if ((userId || userId === 0) &&
			(masterUserId || masterUserId === 0) &&
			(memberId || memberId === 0)) {

			UMuM = userId + '_' + masterUserId + '_' + memberId;

		}

	}; */

const setGlobalDataService = function (globalDataServiceReference) {}

const getPropertyForStoring = function () {
	let errorsList = []

	const user = globalDataService.getUser()
	if (!user) errorsList.push(new Error('No user set'))

	const masterUser = globalDataService.getMasterUser()
	if (!masterUser) errorsList.push(new Error('No masterUser set'))

	const member = globalDataService.getMember()
	if (!member) errorsList.push(new Error('No member set'))

	if (errorsList.length) {
		const lastError = errorsList.pop()
		if (errorsList.length) console.error(...errorsList)

		throw lastError
	}

	return user.id + '_' + masterUser.id + '_' + member.id
}

const getCache = () => {
	// let cache = localStorage.getItem(UMuM);
	const propName = getPropertyForStoring()
	let cache = localStorage.getItem(propName)

	if (cache) {
		cache = JSON.parse(cache)
	} else {
		cache = {}
	}

	return cache
}

const cacheData = function (objPath, item, cache) {
	if (!cache) {
		cache = getCache()
	}

	let objPlace = cache
	let lastProp = objPath.pop()

	for (let i = 0; i < objPath.length; i++) {
		let prop = objPath[i]
		if (!objPlace[prop]) {
			objPlace[prop] = {}
		}

		objPlace = objPlace[prop]
	}

	objPlace[lastProp] = item

	return cache
}

const getCachePropVal = function (objPath, cache) {
	if (!cache) {
		cache = getCache()
	}

	let objPlace = cache

	for (let i = 0; i < objPath.length; i++) {
		let prop = objPath[i]

		if (!objPlace[prop]) {
			return null
		}

		objPlace = objPlace[prop]
	}

	return objPlace
}

const removeFromCache = (objPath, cache) => {
	if (!cache) {
		cache = getCache()
	}

	let objPlace = cache
	let lastProp = objPath.pop()
	let propertyExist = true

	for (let i = 0; i < objPath.length; i++) {
		let prop = objPath[i]

		if (!objPlace[prop]) {
			propertyExist = false
			break
		}

		objPlace = objPlace[prop]
	}

	if (propertyExist) {
		delete objPlace[lastProp]
	}

	return cache
}

const cacheDefaultLayout = function (layout) {
	const defLayoutDataPath = ['layouts', 'defaultLayouts', layout.content_type]
	const cachedLayoutsList = ['layouts', 'layoutsList']
	const layoutPath = ['layouts', 'layoutsList', layout.id]

	let defaultLayoutData = {
		content_type: layout.content_type,
		id: layout.id,
		name: layout.name,
		user_code: layout.user_code,
	}

	/* if (UMuM) {

			const cachedLayouts = getCachePropVal(cachedLayoutsList);

			if (cachedLayouts && typeof cachedLayouts === 'object') {

				Object.keys(cachedLayouts).forEach(layoutId => {

					if (cachedLayouts[layoutId].content_type === layout.content_type) {
						cachedLayouts[layoutId].is_default = false;
					}

				});

			}

			let cache = cacheData(cachedLayoutsList, cachedLayouts);

			cacheData(defLayoutDataPath, defaultLayoutData, cache);
			cacheData(layoutPath, layout, cache);

			localStorage.setItem(UMuM, JSON.stringify(cache));

		} else {
			throw new Error("No current master user set");
		} */

	const propName = getPropertyForStoring()

	const cachedLayouts = getCachePropVal(cachedLayoutsList)

	if (cachedLayouts && typeof cachedLayouts === 'object') {
		Object.keys(cachedLayouts).forEach((layoutId) => {
			if (cachedLayouts[layoutId].content_type === layout.content_type) {
				cachedLayouts[layoutId].is_default = false
			}
		})
	}

	let cache = cacheData(cachedLayoutsList, cachedLayouts)
	cacheData(defLayoutDataPath, defaultLayoutData, cache)
	cacheData(layoutPath, layout, cache)

	localStorage.setItem(propName, JSON.stringify(cache))
}

const getDefaultLayout = (contentType) => {
	let objPath = ['layouts', 'defaultLayouts', contentType]
	const propName = getPropertyForStoring()

	if (propName) {
		let defaultLayoutData = getCachePropVal(objPath)

		if (!defaultLayoutData || !defaultLayoutData.id) {
			return null
		}

		let defaultLayout = getCachedLayout(defaultLayoutData.id)

		return defaultLayout
	}
}

const cacheAutosaveLayout = function (layout) {
	const autosaveLayoutPath = ['layouts', 'autosaveLayouts', layout.content_type]
	const layoutPath = ['layouts', 'layoutsList', layout.id]

	let autosaveLayoutData = {
		content_type: layout.content_type,
		id: layout.id,
		name: layout.name,
		user_code: layout.user_code,
		is_default: layout.is_default,
	}

	const propName = getPropertyForStoring()

	let cache = cacheData(autosaveLayoutPath, autosaveLayoutData)
	cache = cacheData(layoutPath, layout, cache)

	localStorage.setItem(propName, JSON.stringify(cache))
}

const getAutosaveLayout = (contentType) => {
	const propName = getPropertyForStoring()

	if (propName) {
		// check for availability of user, masterUser, member

		let objPath = ['layouts', 'autosaveLayouts', contentType]

		let autosaveLayoutData = getCachePropVal(objPath)

		if (!autosaveLayoutData || !autosaveLayoutData.id) {
			return null
		}

		let autosaveLayout = getCachedLayout(autosaveLayoutData.id)

		return autosaveLayout
	}
}

const cacheLayout = function (layout) {
	let objPath = ['layouts', 'layoutsList', layout.id]
	const propName = getPropertyForStoring()

	let cache = cacheData(objPath, layout)
	localStorage.setItem(propName, JSON.stringify(cache))
	/* if (UMuM) {
			let cache = cacheData(objPath, layout);
			localStorage.setItem(UMuM, JSON.stringify(cache));

		} else {
			throw new Error("No current master user set");
		} */
}

const getCachedLayout = (layoutId) => {
	/* let objPath = ['layouts', 'layoutsList', layoutId];

		if (UMuM) {
			return getCachePropVal(objPath);
		} */
	if (getPropertyForStoring()) {
		// check for availability of user, masterUser, member

		let objPath = ['layouts', 'layoutsList', layoutId]
		return getCachePropVal(objPath)
	}
}

const deleteLayoutFromCache = function (layoutId) {
	const propName = getPropertyForStoring()

	let layoutPath = ['layouts', 'layoutsList', layoutId]
	let cache = getCache()
	let layoutToDelete = getCachePropVal(layoutPath, cache)

	// clear content_type default layout
	if (layoutToDelete && layoutToDelete.is_default) {
		let defLayoutPath = [
			'layouts',
			'defaultLayouts',
			layoutToDelete.content_type,
		]
		cache = removeFromCache(defLayoutPath, cache)
	}

	cache = removeFromCache(layoutPath, cache)
	// localStorage.setItem(UMuM, JSON.stringify(cache));
	localStorage.setItem(propName, JSON.stringify(cache))
}

const cacheReportData = function (reportData) {
	/*if (UMuM) {

			const storageKey = UMuM + '_report_data';

			localStorage.setItem(storageKey, JSON.stringify(reportData));

		} else {
			throw(noUMuMErrorMessage);
		}*/

	const propName = getPropertyForStoring()

	const storageKey = propName + '_report_data'

	localStorage.setItem(storageKey, JSON.stringify(reportData))
}

const getReportData = function () {
	/* if (UMuM) {

			const storageKey = UMuM + '_report_data';
			const storageValue = localStorage.getItem(storageKey);
			let reportData = {};

			if (storageValue) reportData = JSON.parse(storageValue);

			return reportData;

		} else {
			throw(noUMuMErrorMessage);
		} */

	const propName = getPropertyForStoring()

	const storageKey = propName + '_report_data'
	const storageValue = localStorage.getItem(storageKey)
	let reportData = {}

	if (storageValue) reportData = JSON.parse(storageValue)

	return reportData
}

const getReportDataForLayout = function (contentType, layoutUserCode) {
	const reportData = getReportData()

	if (reportData[contentType] && reportData[contentType][layoutUserCode]) {
		return reportData[contentType][layoutUserCode]
	}

	return {}
}

const cacheReportDataForLayout = function (
	contentType,
	layoutUserCode,
	reportData
) {
	const reportsData = getReportData()

	if (!reportsData[contentType]) {
		reportsData[contentType] = {}
	}

	if (!reportsData[contentType][layoutUserCode]) {
		reportsData[contentType][layoutUserCode] = {}
	}

	reportsData[contentType][layoutUserCode] = reportData

	cacheReportData(reportsData)
}

const cacheMarkedRowsData = (markedRowsData) => {
	const key = getPropertyForStoring().concat('_marked_g_rows')
	const markedRowsCopy = JSON.stringify(markedRowsData)

	localStorage.setItem(key, markedRowsCopy)
}

const getMarkedRowsData = () => {
	const key = getPropertyForStoring().concat('_marked_g_rows')
	const storageValue = localStorage.getItem(key)

	return storageValue ? JSON.parse(storageValue) : {}
}

const getRowTypeFilter = (isReport, entityType) => {
	const markedRowsData = getMarkedRowsData()
	const viewerType = isReport ? 'report_viewer' : 'entity_viewer'

	if (
		markedRowsData[viewerType] &&
		markedRowsData[viewerType][entityType] &&
		markedRowsData[viewerType][entityType]['row_type_filter']
	) {
		return markedRowsData[viewerType][entityType]['row_type_filter']
	}

	return 'none'
}

const cacheRowTypeFilter = (isReport, entityType, color) => {
	const markedRowsData = getMarkedRowsData()
	const viewerType = isReport ? 'report_viewer' : 'entity_viewer'

	if (!markedRowsData[viewerType]) {
		markedRowsData[viewerType] = {}
	}

	if (!markedRowsData[viewerType][entityType]) {
		markedRowsData[viewerType][entityType] = {
			row_type_filter: 'none',
			marked_rows: {},
		}
	}

	markedRowsData[viewerType][entityType]['row_type_filter'] = color

	cacheMarkedRowsData(markedRowsData)
}

const getMarkedRows = (isReport, entityType) => {
	const markedRowsData = getMarkedRowsData()

	/* const viewerType = isReport ? 'report_viewer' : 'entity_viewer';

		if (markedRowsData[viewerType]) {

			if (isReport && markedRowsData[viewerType]['marked_rows']) {
				return markedRowsData[viewerType]['marked_rows'];

			} else if (markedRowsData[viewerType][entityType] && markedRowsData[viewerType][entityType]['marked_rows']) {

				return markedRowsData[viewerType][entityType]['marked_rows'];

			}

		} */
	const viewerType = isReport ? 'report_viewer' : 'entity_viewer'

	if (
		markedRowsData[viewerType] &&
		markedRowsData[viewerType][entityType] &&
		markedRowsData[viewerType][entityType]['marked_rows']
	) {
		return markedRowsData[viewerType][entityType]['marked_rows']
	}

	return {}
}

const cacheMarkedRows = (isReport, entityType, rows) => {
	const markedRowsData = getMarkedRowsData()
	const viewerType = isReport ? 'report_viewer' : 'entity_viewer'

	if (!markedRowsData[viewerType]) {
		markedRowsData[viewerType] = {}
	}

	/* if (isReport) {
			// for report viewer marked rows stored in one place because they area shared across report entityTypes (balance-report, pl-report etc)
			if (!markedRowsData[viewerType]['marked_rows']) markedRowsData[viewerType]['marked_rows'] = {};

			if (!markedRowsData[viewerType][entityType]) {
				markedRowsData[viewerType][entityType] = {
					row_type_filter: 'none',
				}
			}

			markedRowsData[viewerType]['marked_rows'] = rows;

		} else {

			if (!markedRowsData[viewerType][entityType]) {
				markedRowsData[viewerType][entityType] = {
					row_type_filter: 'none',
					marked_rows: {}
				}
			}

			markedRowsData[viewerType][entityType]['marked_rows'] = rows;

		} */

	if (!markedRowsData[viewerType][entityType]) {
		markedRowsData[viewerType][entityType] = {
			row_type_filter: 'none',
			marked_rows: {},
		}
	}

	markedRowsData[viewerType][entityType]['marked_rows'] = rows

	cacheMarkedRowsData(markedRowsData)
}

// };

export default {
	setGlobalDataService: setGlobalDataService, // TODO: inject localStorageService into dependencies
	// setUMuM: setUMuM,

	cacheDefaultLayout: cacheDefaultLayout,
	getDefaultLayout: getDefaultLayout,
	cacheAutosaveLayout: cacheAutosaveLayout,
	getAutosaveLayout: getAutosaveLayout,
	cacheLayout: cacheLayout,
	getCachedLayout: getCachedLayout,
	deleteLayoutFromCache: deleteLayoutFromCache,

	cacheReportData: cacheReportData,
	getReportData: getReportData,
	getReportDataForLayout: getReportDataForLayout,
	cacheReportDataForLayout: cacheReportDataForLayout,

	getRowTypeFilter: getRowTypeFilter,
	cacheRowTypeFilter: cacheRowTypeFilter,
	getMarkedRows: getMarkedRows,
	cacheMarkedRows: cacheMarkedRows,
}
