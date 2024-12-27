import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('strategy3MappingList.get', { filters: options });
}

export async function create(map) {
	return useApi('strategy3MappingList.post', { body: map });
}

export async function update(map) {
	const id = map.id;
	return useApi('strategy3MappingList.put', { params: { id }, body: map });
}

export async function deleteByKey(id) {
	return useApi('strategy3MappingList.delete', { params: { id } });
}
