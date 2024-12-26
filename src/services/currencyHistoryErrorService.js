import useApi from '~/composables/useApi';

export async function update(data) {
	return useApi('currencyHistoryError.put', { params: { id }, body: data });
}
