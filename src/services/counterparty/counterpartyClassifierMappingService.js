import useApi from '~/composables/useApi';

export async function getList(attrTypeId) {
	return useApi('counterpartyClassifierMappingList.get', {
		filters: {
			page: 1,
			page_size: 1000,
			attribute_type_id: attrTypeId
		}
	});
}

export async function getByKey(id) {
	return useApi('counterpartyClassifierMappingInstance.get', {
		params: { id }
	});
}

export async function create(data) {
	return useApi('counterpartyClassifierMappingInstance.post', { body: data });
}

export async function update(data) {
	const { id } = data;
	return useApi('counterpartyClassifierMappingInstance.put', {
		params: { id },
		body: data
	});
}

export async function deleteByKey(id) {
	return useApi('counterpartyClassifierMappingInstance.delete', {
		params: { id }
	});
}
