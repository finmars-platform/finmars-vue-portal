import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('accountMappingList.get', { filters: options });
}
