import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('strategy1MappingList.get', { filters: options });
}
