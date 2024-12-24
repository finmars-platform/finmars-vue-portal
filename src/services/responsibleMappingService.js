import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('responsibleMappingList.get', { filters: options });
}
