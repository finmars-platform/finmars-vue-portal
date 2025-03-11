import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('currencyList.get', { filters: options });
}

export async function getListLight(options = {}) {
	return useApi('currencyListLight.get', { filters: options });
}

export async function create(currency) {
	return useApi('currencyList.post', { body: currency });
}

export async function update(currency) {
	const id = currency.id;
	return useApi('currencyList.put', { params: { id }, body: currency });
}
