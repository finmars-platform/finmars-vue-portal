import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('counterpartyMappingList.get', { filters: options });
}
