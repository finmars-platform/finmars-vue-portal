import useApi from '~/composables/useApi';

export async function getList(options = {}) {
	return useApi('transactionImportSchemeList.get', { filters: options });
}

export async function create(data) {
	return useApi('transactionImportSchemeList.post', { body: data });
}

export async function update(data) {
	const id = data.id;
	return useApi('transactionImportSchemeList.patch', {
		params: { id },
		body: data
	});
}
