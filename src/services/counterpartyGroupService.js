import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('counterpartyGroupList.get', { filters: options });
}
