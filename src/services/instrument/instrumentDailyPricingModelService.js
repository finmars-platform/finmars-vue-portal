import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('instrumentDailyPricingModelList.get', { filters: options });
}
