import useApi from '~/composables/useApi';

export async function getList(options = {}) {
	return useApi('complexImportSchemeList.get', { filters: options });
}

export async function create(scheme) {
	return useApi('complexImportSchemeList.post', { body: scheme });
}

export async function update(scheme) {
	const id = scheme.id;
	return useApi('complexImportSchemeList.put', {
		params: { id },
		body: { scheme }
	});
}
