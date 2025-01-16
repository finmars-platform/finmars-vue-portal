import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('instrumentCostMethodList.get', { filters: options });
}
