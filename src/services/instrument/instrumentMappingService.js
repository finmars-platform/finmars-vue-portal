import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('instrumentMappingList.get', { filters: options });
}

export async function create(map) {
	return useApi('instrumentMappingList.post', { body: map });
}

export async function update(map) {
	const id = map.id;
	return useApi('instrumentMappingList.put', { params: { id }, body: map });
}

export async function deleteByKey(id) {
	return useApi('instrumentMappingList.delete', { params: { id } });
}
