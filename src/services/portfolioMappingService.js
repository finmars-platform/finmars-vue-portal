import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('portfolioMappingList.get', { filters: options });
}

export async function create(map) {
	return useApi('portfolioMappingList.post', { body: map });
}

export async function update(map) {
	const id = map.id;
	return useApi('portfolioMappingList.put', { params: { id }, body: map });
}

export async function deleteByKey(id) {
	return useApi('portfolioMappingList.delete', { params: { id } });
}
