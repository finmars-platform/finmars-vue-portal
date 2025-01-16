import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('auditHistoryList.get', { filters: options });
}
