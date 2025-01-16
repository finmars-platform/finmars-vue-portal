import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('pricingConditionMappingList.get', { filters: options });
}

export async function create(map) {
	return useApi('pricingConditionMappingList.post', { body: map });
}

export async function update(map) {
	const id = map.id;
	return useApi('pricingConditionMappingList.put', {
		params: { id },
		body: map
	});
}

export async function deleteByKey(id) {
	return useApi('pricingConditionMappingList.delete', { params: { id } });
}
