import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('instrumentPricingCondition.get', { filters: options });
}
