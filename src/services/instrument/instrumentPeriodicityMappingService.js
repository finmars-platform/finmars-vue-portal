import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('instrumentPeriodicityMappingList.get', { filters: options });
}

export async function create(map) {
	return useApi('instrumentPeriodicityMappingList.post', { body: map });
}

export async function update(map) {
	const id = map.id;
	return useApi('instrumentPeriodicityMappingList.put', {
		params: { id },
		body: map
	});
}

export async function deleteByKey(id) {
	return useApi('instrumentPeriodicityMappingList.delete', { params: { id } });
}
