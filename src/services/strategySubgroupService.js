import useApi from '~/composables/useApi';

export async function getList(strategyNumber, options = {}) {
	return useApi('strategyGroupList.get', {
		params: { strategyNumber },
		filters: options
	});
}
