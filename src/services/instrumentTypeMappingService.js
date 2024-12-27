import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('instrumentTypeMappingList.get', { filters: options });
}

export async function create(map) {
	return useApi('instrumentTypeMappingList.post', { body: map });
}

export async function update(map) {
	const id = map.id;
	return useApi('instrumentTypeMappingList.put', { params: { id }, body: map });
}

export async function deleteByKey(id) {
	return useApi('instrumentTypeMappingList.delete', { params: { id } });
}
