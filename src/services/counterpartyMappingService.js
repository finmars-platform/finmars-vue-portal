import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('counterpartyMappingList.get', { filters: options });
}

export async function create(map) {
	return useApi('counterpartyMappingList.post', { body: map });
}

export async function update(map) {
	const id = map.id;
	return useApi('counterpartyMappingList.put', { params: { id }, body: map });
}
