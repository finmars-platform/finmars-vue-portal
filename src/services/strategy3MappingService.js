import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('strategy3MappingList.get', { filters: options });
}
