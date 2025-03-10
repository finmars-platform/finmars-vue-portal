import { getUser, getMasterUser, getMember } from '~/services/globalService';

function getPropertyForStoring() {
	const errorsList = [];

	const user = getUser();
	if (!user) {
		errorsList.push(new Error('No user set'));
	}

	const masterUser = getMasterUser();
	if (!masterUser) {
		errorsList.push(new Error('No masterUser set'));
	}

	const member = getMember();
	if (!member) {
		errorsList.push(new Error('No member set'));
	}

	if (errorsList.length) {
		const lastError = errorsList.pop();
		if (errorsList.length) {
			console.error(...errorsList);
		}

		throw lastError;
	}

	return `${user.id}_${masterUser.id}_${member.id}`;
}

export function getCache() {
	const propName = getPropertyForStoring();
	let cache = localStorage.getItem(propName);

	if (cache) {
		cache = JSON.parse(cache);
	} else {
		cache = {};
	}

	return cache;
}

export function cacheData(objPath, item, cache) {
	if (!cache) {
		cache = getCache();
	}

	let objPlace = cache;
	const lastProp = objPath.pop();

	for (let i = 0; i < objPath.length; i++) {
		let prop = objPath[i];
		if (!objPlace[prop]) {
			objPlace[prop] = {};
		}

		objPlace = objPlace[prop];
	}

	objPlace[lastProp] = item;

	return cache;
}

export function getCachePropVal(objPath, cache) {
	if (!cache) {
		cache = getCache();
	}

	let objPlace = cache;

	for (let i = 0; i < objPath.length; i++) {
		const prop = objPath[i];

		if (!objPlace[prop]) {
			return null;
		}

		objPlace = objPlace[prop];
	}

	return objPlace;
}

export function removeFromCache(objPath, cache) {
	if (!cache) {
		cache = getCache();
	}

	let objPlace = cache;
	const lastProp = objPath.pop();
	let propertyExist = true;

	for (let i = 0; i < objPath.length; i++) {
		const prop = objPath[i];

		if (!objPlace[prop]) {
			propertyExist = false;
			break;
		}

		objPlace = objPlace[prop];
	}

	if (propertyExist) {
		delete objPlace[lastProp];
	}

	return cache;
}

export function cacheDefaultLayout(layout) {
	const defLayoutDataPath = [
		'layouts',
		'defaultLayouts',
		layout.content_type
	];
	const cachedLayoutsList = ['layouts', 'layoutsList'];
	const layoutPath = ['layouts', 'layoutsList', layout.id];

	const defaultLayoutData = {
		content_type: layout.content_type,
		id: layout.id,
		name: layout.name,
		user_code: layout.user_code
	};

	const propName = getPropertyForStoring();
	const cachedLayouts = getCachePropVal(cachedLayoutsList);

	if (cachedLayouts && typeof cachedLayouts === 'object') {
		Object.keys(cachedLayouts).forEach((layoutId) => {
			if (cachedLayouts[layoutId].content_type === layout.content_type) {
				cachedLayouts[layoutId].is_default = false;
			}
		});
	}

	const cache = cacheData(cachedLayoutsList, cachedLayouts);
	cacheData(defLayoutDataPath, defaultLayoutData, cache);
	cacheData(layoutPath, layout, cache);

	localStorage.setItem(propName, JSON.stringify(cache));
}

export function getDefaultLayout(contentType) {
	const objPath = ['layouts', 'defaultLayouts', contentType];
	const propName = getPropertyForStoring();

	if (propName) {
		const defaultLayoutData = getCachePropVal(objPath);

		if (!defaultLayoutData || !defaultLayoutData.id) {
			return null;
		}

		return getCachedLayout(defaultLayoutData.id);
	}
}

export function cacheAutosaveLayout(layout) {
	const autosaveLayoutPath = [
		'layouts',
		'autosaveLayouts',
		layout.content_type
	];
	const layoutPath = ['layouts', 'layoutsList', layout.id];

	const autosaveLayoutData = {
		content_type: layout.content_type,
		id: layout.id,
		name: layout.name,
		user_code: layout.user_code,
		is_default: layout.is_default
	};

	const propName = getPropertyForStoring();

	let cache = cacheData(autosaveLayoutPath, autosaveLayoutData);
	cache = cacheData(layoutPath, layout, cache);

	localStorage.setItem(propName, JSON.stringify(cache));
}

export function getAutosaveLayout(contentType) {
	const propName = getPropertyForStoring();

	if (propName) {
		// check for availability of user, masterUser, member
		const objPath = ['layouts', 'autosaveLayouts', contentType];
		const autosaveLayoutData = getCachePropVal(objPath);

		if (!autosaveLayoutData || !autosaveLayoutData.id) {
			return null;
		}

		return getCachedLayout(autosaveLayoutData.id);
	}
}

export function cacheLayout(layout) {
	const objPath = ['layouts', 'layoutsList', layout.id];
	const propName = getPropertyForStoring();
	const cache = cacheData(objPath, layout);
	localStorage.setItem(propName, JSON.stringify(cache));
}

export function getCachedLayout(layoutId) {
	if (getPropertyForStoring()) {
		// check for availability of user, masterUser, member
		const objPath = ['layouts', 'layoutsList', layoutId];
		return getCachePropVal(objPath);
	}
}

export function deleteLayoutFromCache(layoutId) {
	const propName = getPropertyForStoring();

	const layoutPath = ['layouts', 'layoutsList', layoutId];
	let cache = getCache();
	const layoutToDelete = getCachePropVal(layoutPath, cache);

	if (layoutToDelete && layoutToDelete.is_default) {
		// clear default layout for content_type
		const defLayoutPath = [
			'layouts',
			'defaultLayouts',
			layoutToDelete.content_type
		];
		cache = removeFromCache(defLayoutPath, cache);
	}

	if (layoutToDelete && layoutToDelete.user_code.endsWith(':autosave')) {
		// clear autosave layout for content_type
		const asLayoutPath = [
			'layouts',
			'autosaveLayouts',
			layoutToDelete.content_type
		];
		cache = removeFromCache(asLayoutPath, cache);
	}

	cache = removeFromCache(layoutPath, cache);
	localStorage.setItem(propName, JSON.stringify(cache));
}

export function cacheReportData(reportData) {
	const propName = getPropertyForStoring();
	const storageKey = `${propName}_report_data`;
	localStorage.setItem(storageKey, JSON.stringify(reportData));
}

export function getReportData() {
	const propName = getPropertyForStoring();
	const storageKey = `${propName}_report_data`;
	const storageValue = localStorage.getItem(storageKey);
	let reportData = {};

	if (storageValue) {
		reportData = JSON.parse(storageValue);
	}

	return reportData;
}

export function getReportDataForLayout(contentType, layoutUserCode) {
	const reportData = getReportData();

	if (reportData[contentType] && reportData[contentType][layoutUserCode]) {
		return reportData[contentType][layoutUserCode];
	}

	return {};
}

export function cacheReportDataForLayout(
	contentType,
	layoutUserCode,
	reportData
) {
	const reportsData = getReportData();

	if (!reportsData[contentType]) {
		reportsData[contentType] = {};
	}

	if (!reportsData[contentType][layoutUserCode]) {
		reportsData[contentType][layoutUserCode] = {};
	}

	reportsData[contentType][layoutUserCode] = reportData;
	cacheReportData(reportsData);
}

export function cacheMarkedRowsData(markedRowsData) {
	const key = getPropertyForStoring().concat('_marked_g_rows');
	const markedRowsCopy = JSON.stringify(markedRowsData);
	localStorage.setItem(key, markedRowsCopy);
}

export function getMarkedRowsData() {
	const key = getPropertyForStoring().concat('_marked_g_rows');
	const storageValue = localStorage.getItem(key);
	return storageValue ? JSON.parse(storageValue) : {};
}

export function getRowTypeFilter(isReport, entityType) {
	const markedRowsData = getMarkedRowsData();
	const viewerType = isReport ? 'report_viewer' : 'entity_viewer';

	if (
		markedRowsData[viewerType] &&
		markedRowsData[viewerType][entityType] &&
		markedRowsData[viewerType][entityType]['row_type_filter']
	) {
		return markedRowsData[viewerType][entityType]['row_type_filter'];
	}

	return 'none';
}

export function cacheRowTypeFilter(isReport, entityType, color) {
	const markedRowsData = getMarkedRowsData();
	const viewerType = isReport ? 'report_viewer' : 'entity_viewer';

	if (!markedRowsData[viewerType]) {
		markedRowsData[viewerType] = {};
	}

	if (!markedRowsData[viewerType][entityType]) {
		markedRowsData[viewerType][entityType] = {
			row_type_filter: 'none',
			marked_rows: {}
		};
	}

	markedRowsData[viewerType][entityType]['row_type_filter'] = color;
	cacheMarkedRowsData(markedRowsData);
}

export function getMarkedRows(isReport, entityType) {
	const markedRowsData = getMarkedRowsData();
	const viewerType = isReport ? 'report_viewer' : 'entity_viewer';

	if (
		markedRowsData[viewerType] &&
		markedRowsData[viewerType][entityType] &&
		markedRowsData[viewerType][entityType]['marked_rows']
	) {
		return markedRowsData[viewerType][entityType]['marked_rows'];
	}

	return {};
}

export function cacheMarkedRows(isReport, entityType, rows) {
	const markedRowsData = getMarkedRowsData();
	const viewerType = isReport ? 'report_viewer' : 'entity_viewer';

	if (!markedRowsData[viewerType]) {
		markedRowsData[viewerType] = {};
	}

	if (!markedRowsData[viewerType][entityType]) {
		markedRowsData[viewerType][entityType] = {
			row_type_filter: 'none',
			marked_rows: {}
		};
	}

	markedRowsData[viewerType][entityType]['marked_rows'] = rows;
	cacheMarkedRowsData(markedRowsData);
}
