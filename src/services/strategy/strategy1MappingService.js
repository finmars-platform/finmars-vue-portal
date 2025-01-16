import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('strategy1MappingList.get', { filters: options });
}

export async function create(map) {
	return useApi('strategy1MappingList.post', { body: map });
}

export async function update(map) {
	const id = map.id;
	return useApi('strategy1MappingList.put', { params: { id }, body: map });
}

export async function deleteByKey(id) {
	return useApi('strategy1MappingList.delete', { params: { id } });
}
