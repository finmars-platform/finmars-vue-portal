import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('priceDownloadSchemeMappingList.get', { filters: options });
}
