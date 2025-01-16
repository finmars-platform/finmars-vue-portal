import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('portfolioHistoryList.get', { filters: options });
}

export async function create(data) {
	return useApi('portfolioHistoryList.post', { body: data });
}

export async function update(data) {
	const id = data.id;
	return useApi('portfolioHistoryList.put', { params: { id }, body: data });
}
