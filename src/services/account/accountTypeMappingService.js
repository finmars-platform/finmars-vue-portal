import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('accountTypeMappingList.get', { filters: options });
}

export async function create(map) {
	return useApi('accountTypeMappingList.post', { body: map });
}

export async function update(map) {
	const id = map.id;
	return useApi('accountTypeMappingList.put', { params: { id }, body: map });
}

export async function deleteByKey(id) {
	return useApi('accountTypeMappingList.delete', { params: { id } });
}
