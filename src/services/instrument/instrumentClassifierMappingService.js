import useApi from '~/composables/useApi';

export async function getList(attrTypeId) {
	return useApi('instrumentClassifierMappingList.get', {
		filters: {
			page: 1,
			page_size: 1000,
			attribute_type_id: attrTypeId
		}
	});
}

export async function getByKey(id) {
	return useApi('instrumentClassifierMappingInstance.get', {
		params: { id }
	});
}

export async function create(data) {
	return useApi('instrumentClassifierMappingInstance.post', { body: data });
}

export async function update(data) {
	const { id } = data;
	return useApi('instrumentClassifierMappingInstance.put', {
		params: { id },
		body: data
	});
}

export async function deleteByKey(id) {
	return useApi('instrumentClassifierMappingInstance.delete', {
		params: { id }
	});
}
