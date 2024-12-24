import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('pricingPolicyMappingList.get', { filters: options });
}
