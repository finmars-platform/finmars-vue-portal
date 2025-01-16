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

export async function update(scheme) {
	const schemeId = scheme.id;
	return useApi('simpleImportSchemeInstance.patch', {
		params: { id: schemeId },
		body: scheme
	});
}

export async function create(scheme) {
	return useApi('simpleImportSchemeInstance.post', {
		body: scheme
	});
}
