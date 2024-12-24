import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('counterpartyResponsible.get', { filters: options });
}
