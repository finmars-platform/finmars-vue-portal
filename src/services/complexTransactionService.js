import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('complexTransactionList.get', { filters: options });
}
