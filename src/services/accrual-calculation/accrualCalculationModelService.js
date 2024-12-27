import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('instrumentAccrualCalculationModel.get', { filters: options });
}

export async function create(map) {
	return useApi('instrumentAccrualCalculationModel.post', { body: map });
}

export async function update(map) {
	const id = map.id;
	return useApi('instrumentAccrualCalculationModel.put', {
		params: { id },
		body: map
	});
}

export async function deleteByKey(id) {
	return useApi('instrumentAccrualCalculationModel.delete', { params: { id } });
}
