import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('transactionEventClass.get', { filters: options });
}
