import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('instrumentAccrualCalculationModel.get', { filters: options });
}
