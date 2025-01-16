import useApi from '~/composables/useApi';

export async function getList(strategyNumber, options = {}) {
	return useApi('strategySubGroupList.get', {
		params: { strategyNumber },
		filters: options
	});
}

export async function create(strategyNumber, data) {
	return useApi('strategySubGroupList.post', {
		params: { strategyNumber },
		body: data
	});
}

export async function update(strategyNumber, data) {
	const id = data.id;
	return useApi('strategySubGroupList.put', {
		params: { strategyNumber, id },
		body: data
	});
}
