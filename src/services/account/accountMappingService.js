import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('accountMappingList.get', { filters: options });
}

export async function create(map) {
	return useApi('accountMappingList.post', { body: map });
}

export async function update(map) {
	const id = map.id;
	return useApi('accountMappingList.put', { params: { id }, body: map });
}

export async function deleteByKey(id) {
	return useApi('accountMappingList.delete', { params: { id } });
}
