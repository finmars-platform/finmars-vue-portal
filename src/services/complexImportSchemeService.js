import useApi from '~/composables/useApi';

export async function getList(options = {}) {
	return useApi('complexImportSchemeList.get', { filters: options });
}
