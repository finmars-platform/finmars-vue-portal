import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('transactionNotificationClass.get', { filters: options });
}
