import get from 'lodash/get';
import useApi from '~/composables/useApi';
import { findContentTypeByEntity } from '~/services/meta/metaContentTypeService';
import { isReport } from '~/services/meta/metaService';
import {
	getListLayout as uiGetListLayout,
	getListLayoutLight,
	getDefaultListLayout as getDefListLayout,
	getListLayoutTemplate,
	pingListLayoutByKey
} from '~/services/uiRepository';
import { getList } from '~/services/ecosystemDefaultService';
import {
	getCachedLayout,
	cacheLayout,
	cacheDefaultLayout,
	getDefaultLayout
} from '~/services/localStorageService';

function isCachedLayoutActual(cachedLayout, layoutData) {
	if (cachedLayout && cachedLayout.modified_at) {
		const cachedLayoutModDate = new Date(cachedLayout.modified_at).getTime();
		const layoutModDate = new Date(layoutData.modified_at).getTime();
		return cachedLayoutModDate >= layoutModDate;
	}

	return false;
}

export async function createDashboardLayout(data) {
	return useApi('dashboardLayout.post', { body: data });
}

export async function updateDashboardLayout(data) {
	const id = data.id;
	return useApi('dashboardLayout.put', { params: { id }, body: data });
}

export async function getListLayout(entityType, options = {}) {
	const currentOptions = { ...options };
	if (currentOptions.filters && currentOptions.filters.user_code && entityType) {
		currentOptions.filters.content_type = findContentTypeByEntity(entityType, 'ui');
	}

	if (
		currentOptions.filters &&
		currentOptions.filters.content_type &&
		currentOptions.filters.user_code
	) {
		try {
			const data = await getListLayoutLight(entityType, options);
			const lightLayout = data && data.results ? data.results[0] : undefined;

			if (lightLayout) {
				const cachedLayout = getCachedLayout(lightLayout.id);
				if (isCachedLayoutActual(cachedLayout, lightLayout)) {
					return {
						results: [cachedLayout]
					};
				}

				const listLayoutData = await uiGetListLayout(entityType, options);
				cacheLayout(listLayoutData?.results[0]);
				return listLayoutData;
			}

			return data;
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	const res = await uiGetListLayout(entityType, options);
	return res;
}

export async function getDashboardLayoutList(options = {}) {
	return useApi('dashboardLayoutList.get', { filters: options });
}

export async function getInstrumentFieldPrimaryList(options = {}) {
	return useApi('instrumentUserFieldPrimaryList.get', { filters: options });
}

export async function getListLayoutByUserCode(entityType, userCode) {
	const contentType = findContentTypeByEntity(entityType, 'ui');
	return getListLayout(null, {
		pageSize: 1000,
		filters: {
			content_type: contentType,
			user_code: userCode
		}
	});
}

async function applyDefaultSettingsToLayoutTemplate(layoutTemplate, isReport) {
	if (isReport) {
		const res = await getList();
		const ecosystemDefaultData = res?.results[0];

		return {
			...layoutTemplate,
			data: {
				...layoutTemplate.data,
				reportOptions: {
					account_mode: 1,
					calculation_group: 'no_grouping',
					cost_method: 1,
					report_date: new Date().toISOString().slice(0, 10),
					portfolio_mode: 1,
					strategy1_mode: 0,
					strategy2_mode: 0,
					strategy3_mode: 0,
					table_font_size: 'small',
					pricing_policy: ecosystemDefaultData.pricing_policy
				}
			}
		};
	}

	return {
		...layoutTemplate,
		data: {
			...layoutTemplate.data,
			rowSettings: {},
			ev_options: {}
		}
	};
}

export async function getDefaultListLayout(entityType) {
	const contentType = findContentTypeByEntity(entityType, 'ui');
	const cachedLayout = getDefaultLayout(contentType);
	const cachedLayoutRes = {
		results: [cachedLayout]
	};

	const defaultLayoutData = await getDefListLayout(entityType);
	const defaultLayout = get(defaultLayoutData, ['results', 0]);

	let resultData;

	if (defaultLayout) {
		cacheDefaultLayout(defaultLayout);
		resultData = defaultLayoutData;
	} else {
		const isEntityReport = isReport(entityType);
		const defaultLayouts = getListLayoutTemplate(isEntityReport);
		defaultLayouts[0].content_type = contentType;
		defaultLayouts[0] = await applyDefaultSettingsToLayoutTemplate(
			defaultLayouts[0],
			isEntityReport
		);
		resultData = {
			results: defaultLayouts
		};
	}

	if (cachedLayout) {
		const pingData = await pingListLayoutByKey(cachedLayout.id);
		return pingData && pingData.is_default && isCachedLayoutActual(cachedLayout, pingData)
			? cachedLayoutRes
			: resultData;
	}

	return resultData;
}
