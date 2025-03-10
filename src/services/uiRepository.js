import useApi from '~/composables/useApi';
import { findContentTypeByEntity } from '~/services/meta/metaContentTypeService';

export async function getListLayout(entity, options = {}) {
	const filters = { ...options };

	if (entity !== 'all') {
		if (!filters.content_type) {
			filters.content_type = findContentTypeByEntity(entity, 'ui');
		}
	}

	return useApi('listLayoutList.get', { filters });
}

export async function getListLayoutLight(entity, options = {}) {
	const filters = { ...options };

	if (entity !== 'all') {
		if (!filters.content_type) {
			filters.content_type = findContentTypeByEntity(entity, 'ui');
		}
	}

	return useApi('listLayoutListLight.get', { filters });
}
