import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('portfolioClassList.get', { filters: options });
}
