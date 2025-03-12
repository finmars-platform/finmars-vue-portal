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

export async function getDefaultListLayout(entityType) {
	const content_type = findContentTypeByEntity(entityType, 'ui');
	return useApi('listLayoutList.get', { filters: { is_default: true, content_type } });
}

export async function pingListLayoutByKey(layoutId, options = {}) {
	return useApi('listLayoutPing.get', { params: { id: layoutId }, filters: options });
}

export function getListLayoutTemplate(isReport) {
	return [
		{
			name: '',
			user_code: '',
			content_type: '',
			data: {
				entityType: null,
				folding: false,
				sorting: {
					group: {
						id: null,
						sort: 'DESC',
						key: null
					},
					column: {
						id: null,
						sort: 'ASC',
						key: null
					}
				},
				grouping: [],
				columns: [],
				filters: {
					backend: [],
					frontend: [],
					...(isReport && {
						filters: [],
						reportOptions: {},
						reportLayoutOptions: {}
					})
				},
				additions: {}
			}
		}
	];
}
