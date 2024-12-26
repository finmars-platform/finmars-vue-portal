import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('importBankProc.get', { filters: options });
}

export async function create(data) {
	return useApi('importBankProc.post', { body: data });
}

export async function update(data) {
	const id = data.id;
	return useApi('importBankProc.put', { params: { id }, body: data });
}
