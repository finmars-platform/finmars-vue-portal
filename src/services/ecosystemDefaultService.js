import useApi from '~/composables/useApi';

export async function getList(options = {}) {
	return useApi('ecosystemDefaults.get', { filters: options });
}

export async function getByKey(id) {
	return useApi('defaultSettings.get', { params: { id } });
}

export async function create(account) {
	return useApi('defaultSettings.post', { body: account });
}

export async function update(account) {
	const { id } = account;
	return useApi('defaultSettings.put', { params: { id }, body: account });
}

export async function deleteByKey(id) {
	return useApi('defaultSettings.delete', { params: { id } });
}
