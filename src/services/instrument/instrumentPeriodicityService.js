import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('instrumentPeriodicity.get', { filters: options });
}
