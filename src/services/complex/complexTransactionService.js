import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('complexTransactionList.get', { filters: options });
}

export async function create(data) {
	return useApi('complexTransactionList.post', { body: data });
}

export async function update(data) {
	const id = data.id;
	return useApi('complexTransactionList.put', { params: { id }, body: data });
}

export async function initRebookComplexTransaction(id) {
	return useApi('complexTransactionRebook.get', { params: { id } });
}

export async function rebookComplexTransaction(id, transaction) {
	return useApi('complexTransactionRebook.put', {
		params: { id },
		body: transaction
	});
}
