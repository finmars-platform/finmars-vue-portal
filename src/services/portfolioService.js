import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('portfolioList.get', { filters: options });
}
