import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('portfolioMappingList.get', { filters: options });
}
