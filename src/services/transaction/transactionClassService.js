import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('transactionClassList.get', { filters: options });
}
