import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('responsibleGroupList.get', { filters: options });
}

export async function create(responsible) {
	return useApi('responsibleGroupList.post', { body: responsible });
}

export async function update(responsible) {
	const id = responsible.id;
	return useApi('responsibleGroupList.put', {
		params: { id },
		body: responsible
	});
}
