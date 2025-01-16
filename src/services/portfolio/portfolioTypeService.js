import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('portfolioTypeList.get', { filters: options });
}

export async function create(data) {
	return useApi('portfolioTypeList.post', { body: data });
}

export async function update(data) {
	const id = data.id;
	return useApi('portfolioTypeList.put', { params: { id }, body: data });
}
