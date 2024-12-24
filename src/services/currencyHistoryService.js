import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('currencyHistoryList.get', { filters: options });
}
