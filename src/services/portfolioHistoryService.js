import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('portfolioHistoryList.get', { filters: options });
}
