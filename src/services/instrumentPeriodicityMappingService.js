import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('instrumentPeriodicityMappingList.get', { filters: options });
}
