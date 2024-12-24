import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('portfolioReconcileHistoryList.get', { filters: options });
}
