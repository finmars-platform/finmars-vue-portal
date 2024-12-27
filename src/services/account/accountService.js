import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('account.get', { filters: options });
}

export async function create(account) {
	return useApi('account.post', { body: account });
}

export async function update(account) {
	const id = account.id;
	return useApi('account.put', { params: { id }, body: account });
}
