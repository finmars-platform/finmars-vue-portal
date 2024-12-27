import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('accountTypeList.get', { filters: options });
}

export async function create(data) {
	return useApi('accountTypeList.post', { body: data });
}

export async function update(data) {
	const id = data.id;
	return useApi('accountTypeList.put', { params: { id }, body: data });
}
