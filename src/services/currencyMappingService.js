import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('currencyMappingImportList.get', { filters: options });
}
