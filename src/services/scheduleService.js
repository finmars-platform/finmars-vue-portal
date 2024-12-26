import useApi from '~/composables/useApi';

export async function create(data) {
	return useApi('schedule.post', { body: data });
}

export async function update(data) {
	const id = data.id;
	return useApi('schedule.put', { params: { id }, body: data });
}
