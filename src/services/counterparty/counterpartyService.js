import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('counterpartyList.get', { filters: options });
}

export async function create(counterparty) {
	return useApi('counterpartyList.post', { body: counterparty });
}

export async function update(counterparty) {
	const id = counterparty.id;
	return useApi('counterpartyList.put', { params: { id }, body: counterparty });
}
