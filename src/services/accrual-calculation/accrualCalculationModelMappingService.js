import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('accrualCalculationModelMappingList.get', { filters: options });
}
