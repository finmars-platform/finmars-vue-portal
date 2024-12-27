import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('currencyMappingImportList.get', { filters: options });
}

export async function create(map) {
	return useApi('currencyMappingImportList.post', { body: map });
}

export async function update(map) {
	const id = map.id;
	return useApi('currencyMappingImportList.put', { params: { id }, body: map });
}

export async function deleteByKey(id) {
	return useApi('currencyMappingImportList.delete', { params: { id } });
}
