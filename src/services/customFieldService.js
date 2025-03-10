import useApi from '@/composables/useApi';

export function getList(entityType, options = {}) {
	try {
		return useApi('customFieldList.get', {
			params: { entityType },
			filters: options
		});
	} catch (error) {
		console.error(
			`[${entityType}] The custom fields loading error. ${error}`
		);
		return [];
	}
}
