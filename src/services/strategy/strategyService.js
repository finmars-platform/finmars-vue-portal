import useApi from '~/composables/useApi';

export async function getList(strategyNumber, options = {}) {
	return useApi('strategyList.get', {
		params: { strategyNumber },
		filters: options
	});
}

export async function create(strategyNumber, data) {
	return useApi('strategyList.post', {
		params: { strategyNumber },
		body: data
	});
}

export async function update(strategyNumber, data) {
	const id = data.id;
	return useApi('strategyList.put', {
		params: { strategyNumber, id },
		body: data
	});
}
