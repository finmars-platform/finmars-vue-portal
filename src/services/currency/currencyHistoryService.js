import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('currencyHistoryList.get', { filters: options });
}

export async function create(data) {
	return useApi('currencyHistoryList.post', { body: data });
}

export async function update(data) {
	const id = data.id;
	return useApi('currencyHistoryList.put', { params: { id }, body: data });
}
