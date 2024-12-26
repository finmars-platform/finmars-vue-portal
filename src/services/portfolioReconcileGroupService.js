import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('portfolioReconcileGroupList.get', { filters: options });
}

export async function create(data) {
	return useApi('portfolioReconcileGroupList.post', { body: data });
}

export async function update(data) {
	const id = data.id;
	return useApi('portfolioReconcileGroupList.put', {
		params: { id },
		body: data
	});
}
