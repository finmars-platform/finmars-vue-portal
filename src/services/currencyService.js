import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('currencyList.get', { filters: options });
}
