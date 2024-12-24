import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('pricingPolicyList.get', { filters: options });
}
