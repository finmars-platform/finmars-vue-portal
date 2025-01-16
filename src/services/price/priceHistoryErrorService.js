import useApi from '~/composables/useApi';

export function update(data) {
	const id = data.id;
	return useApi('priceHistoryError.put', { params: { id }, body: data });
}
