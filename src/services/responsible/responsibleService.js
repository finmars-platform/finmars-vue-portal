import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('counterpartyResponsible.get', { filters: options });
}

export async function create(responsible) {
	return useApi('counterpartyResponsible.post', { body: responsible });
}

export async function update(responsible) {
	const id = responsible.id;
	return useApi('counterpartyResponsible.put', {
		params: { id },
		body: responsible
	});
}
