import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('dailyPricingModelMappingList.get', { filters: options });
}

export async function create(map) {
	return useApi('dailyPricingModelMappingList.post', { body: map });
}

export async function update(map) {
	const id = map.id;
	return useApi('dailyPricingModelMappingList.put', {
		params: { id },
		body: map
	});
}

export async function deleteByKey(id) {
	return useApi('dailyPricingModelMappingList.delete', { params: { id } });
}
