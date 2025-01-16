import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('portfolioReconcileHistoryList.get', { filters: options });
}

export async function create(data) {
	return useApi('portfolioReconcileHistoryList.post', { body: data });
}

export async function update(data) {
	const id = data.id;
	return useApi('portfolioReconcileHistoryList.post', {
		params: { id },
		body: data
	});
}
