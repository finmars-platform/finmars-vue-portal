import useApi from '~/composables/useApi';

export async function getList(strategyNumber, options = {}) {
	return useApi('strategyList.get', {
		params: { strategyNumber },
		filters: options
	});
}
