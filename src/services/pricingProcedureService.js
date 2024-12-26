import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('pricingProc.get', { filters: options });
}

export async function create(data) {
	return useApi('pricingProc.post', { body: data });
}

export async function update(data) {
	const id = data.id;
	return useApi('pricingProc.put', { params: { id }, body: data });
}
