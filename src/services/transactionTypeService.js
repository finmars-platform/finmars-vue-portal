import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('transactionTypeLight.get', { filters: options });
}
