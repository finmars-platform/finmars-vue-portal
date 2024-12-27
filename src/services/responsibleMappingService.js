import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('responsibleMappingList.get', { filters: options });
}

export async function create(map) {
	return useApi('responsibleMappingList.post', { body: map });
}

export async function update(map) {
	const id = map.id;
	return useApi('responsibleMappingList.put', { params: { id }, body: map });
}

export async function deleteByKey(id) {
	return useApi('responsibleMappingList.delete', { params: { id } });
}
