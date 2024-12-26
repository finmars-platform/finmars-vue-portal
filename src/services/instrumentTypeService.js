import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('instrumentTypeList.get', { filters: options });
}

export async function create(data) {
	return useApi('instrumentTypeList.post', { body: data });
}

export async function update(data) {
	const id = data.id;
	return useApi('instrumentTypeList.put', { params: { id }, body: data });
}
