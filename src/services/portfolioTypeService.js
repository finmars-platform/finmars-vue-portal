import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('portfolioTypeList.get', { filters: options });
}
