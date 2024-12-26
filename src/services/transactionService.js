import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('transactionList.get', { filters: options });
}

export async function create(transaction) {
	return useApi('transactionList.post', { body: transaction });
}

export async function update(transaction) {
	const id = transaction.id;
	return useApi('transactionList.post', { params: { id }, body: transaction });
}
