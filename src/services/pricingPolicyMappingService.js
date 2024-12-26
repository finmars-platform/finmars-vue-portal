import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('pricingPolicyMappingList.get', { filters: options });
}

export async function create(map) {
	return useApi('pricingPolicyMappingList.post', { body: map });
}

export async function update(map) {
	return useApi('pricingPolicyMappingList.put', { params: { id }, body: map });
}
