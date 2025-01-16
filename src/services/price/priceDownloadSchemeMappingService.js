import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('priceDownloadSchemeMappingList.get', { filters: options });
}

export async function create(map) {
	return useApi('priceDownloadSchemeMappingList.post', { body: map });
}

export async function update(map) {
	const id = map.id;
	return useApi('priceDownloadSchemeMappingList.put', {
		params: { id },
		body: map
	});
}

export async function deleteByKey(id) {
	return useApi('priceDownloadSchemeMappingList.delete', { params: { id } });
}
