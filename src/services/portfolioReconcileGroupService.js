import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('portfolioReconcileGroupList.get', { filters: options });
}
