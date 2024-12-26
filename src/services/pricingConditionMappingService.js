import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('pricingConditionMappingList.get', { filters: options });
}

export async function create(map) {
	return useApi('pricingConditionMappingList.post', { body: map });
}

export async function update(map) {
	return useApi('pricingConditionMappingList.put', {
		params: { id },
		body: map
	});
}
