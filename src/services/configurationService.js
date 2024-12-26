import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('configurationList.get', { filters: options });
}

export async function create(data) {
	return useApi('configurationList.post', { body: data });
}

export async function update(data) {
	const id = data.id;
	return useApi('configurationList.put', { params: { id }, body: data });
}
