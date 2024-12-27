import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('counterpartyGroupList.get', { filters: options });
}

export async function create(counterparty) {
	return useApi('counterpartyGroupList.post', { body: counterparty });
}

export async function update(counterparty) {
	const id = counterparty.id;
	return useApi('counterpartyGroupList.put', {
		params: { id },
		body: counterparty
	});
}
