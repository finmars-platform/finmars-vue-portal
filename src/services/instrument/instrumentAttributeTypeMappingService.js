import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('instrumentAttributeTypeMappingList.get', { filters: options });
}

export async function create(map) {
	return useApi('instrumentAttributeTypeMappingList.post', { body: map });
}

export async function update(map) {
	const id = map.id;
	return useApi('instrumentAttributeTypeMappingList.put', {
		params: { id },
		body: map
	});
}

export async function deleteByKey(id) {
	return useApi('instrumentAttributeTypeMappingList.delete', {
		params: { id }
	});
}
