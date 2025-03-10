import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('transactionType.get', { filters: options });
}

export async function getListLight(options) {
	return useApi('transactionTypeLight.get', { filters: options });
}

export async function create(data) {
	return useApi('transactionType.post', { body: data });
}

export async function update(data) {
	const id = data.id;
	return useApi('transactionType.put', { params: { id }, body: data });
}

export async function initBookComplexTransaction(id, options = {}) {
	return useApi('bookComplexTransaction.get', {
		params: { id },
		filters: options
	});
}

export async function bookComplexTransaction(id, transaction) {
	return useApi('bookComplexTransaction.put', {
		params: { id },
		body: transaction
	});
}
