import useApi from '~/composables/useApi';

export async function update(data) {
	const id = data.id;
	return useApi('currencyHistoryError.put', { params: { id }, body: data });
}
