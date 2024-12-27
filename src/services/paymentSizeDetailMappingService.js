import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('paymentSizeDetailMappingList.get', { filters: options });
}

export async function create(map) {
	return useApi('paymentSizeDetailMappingList.post', { body: map });
}

export async function update(map) {
	const id = map.id;
	return useApi('paymentSizeDetailMappingList.put', {
		params: { id },
		body: map
	});
}

export async function deleteByKey(id) {
	return useApi('paymentSizeDetailMappingList.delete', { params: { id } });
}
