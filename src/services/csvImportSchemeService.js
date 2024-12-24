import useApi from '~/composables/useApi';

export async function getList(options = {}) {
	return useApi('simpleImportSchemeList.get', { filters: options });
}

export async function getListLight(options = {}) {
	return useApi('simpleImportSchemeLight.get', { filters: options });
}

export async function getById(id) {
	return useApi('simpleImportSchemeInstance.get', {
		params: { id }
	});
}
