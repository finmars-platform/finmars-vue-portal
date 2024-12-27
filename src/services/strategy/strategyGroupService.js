import useApi from '~/composables/useApi';

export async function create(strategyNumber, data) {
	return useApi('strategyGroup.post', {
		params: { strategyNumber },
		body: data
	});
}

export async function update(strategyNumber, data) {
	const id = data.id;
	return useApi('strategyGroup.put', {
		params: { strategyNumber, id },
		body: data
	});
}
