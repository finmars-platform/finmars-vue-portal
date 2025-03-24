import useApi from '~/composables/useApi';
import { findContentTypeByEntity } from '~/services/meta/metaContentTypeService';
import {
	getListLayout as uiGetListLayout,
	getListLayoutLight
} from '~/services/uiRepository';
import { getCachedLayout, cacheLayout } from '~/services/localStorageService';

function isCachedLayoutActual(cachedLayout, layoutData) {
	if (cachedLayout && cachedLayout.modified_at) {
		const cachedLayoutModDate = new Date(
			cachedLayout.modified_at
		).getTime();
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
	console.log('@@@ getListLayout => ', entityType);
	const currentOptions = { ...options };
	if (
		currentOptions.filters &&
		currentOptions.filters.user_code &&
		entityType
	) {
		currentOptions.filters.content_type = findContentTypeByEntity(
			entityType,
			'ui'
		);
	}

	if (
		currentOptions.filters &&
		currentOptions.filters.content_type &&
		currentOptions.filters.user_code
	) {
		try {
			const data = await getListLayoutLight(entityType, options);
			const lightLayout =
				data && data.results ? data.results[0] : undefined;

			if (lightLayout) {
				const cachedLayout = getCachedLayout(lightLayout.id);
				if (isCachedLayoutActual(cachedLayout, lightLayout)) {
					return {
						results: [cachedLayout]
					};
				}

				const listLayoutData = await uiGetListLayout(
					entityType,
					options
				);
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
