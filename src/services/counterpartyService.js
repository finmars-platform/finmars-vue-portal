import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('counterpartyList.get', { filters: options });
}
