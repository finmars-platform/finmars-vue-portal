import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('importPriceDownloadSchemeList.get', { filters: options });
}
