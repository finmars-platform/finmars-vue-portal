import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('instrumentPriceHistoryList.get', { filters: options });
}

export async function create(price) {
	return useApi('instrumentPriceHistoryList.post', { body: price });
}

export async function update(price) {
	const id = price.id;
	return useApi('instrumentPriceHistoryList.put', {
		params: { id },
		body: price
	});
}
