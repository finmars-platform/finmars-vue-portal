import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('pricingPolicyList.get', { filters: options });
}

export async function create(policy) {
	return useApi('pricingPolicyList.post', { body: policy });
}

export async function update(policy) {
	const id = policy.id;
	return useApi('pricingPolicyList.put', { params: { id }, body: policy });
}
