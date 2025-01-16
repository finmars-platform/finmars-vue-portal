import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('pricingPolicyMappingList.get', { filters: options });
}

export async function create(map) {
	return useApi('pricingPolicyMappingList.post', { body: map });
}

export async function update(map) {
	const id = map.id;
	return useApi('pricingPolicyMappingList.put', { params: { id }, body: map });
}

export async function deleteByKey(id) {
	return useApi('pricingPolicyMappingList.delete', { params: { id } });
}
