import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('instrumentList.get', { filters: options });
}

export async function create(instrument) {
	return useApi('instrumentList.post', { body: instrument });
}

export async function update(instrument) {
	const id = instrument.id;
	return useApi('instrumentList.put', { params: { id }, body: instrument });
}
