import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('pricingProc.get', { filters: options });
}
