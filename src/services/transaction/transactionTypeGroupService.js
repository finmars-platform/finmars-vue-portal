import useApi from '~/composables/useApi';

export async function getList(options = {}) {
	return useApi('transactionTypeGroupList.get', { filters: options });
}

export async function create(data) {
	return useApi('transactionTypeGroup.post', { body: data });
}

export async function update(data) {
	const id = data.id;
	return useApi('transactionTypeGroup.put', { params: { id }, body: data });
}
