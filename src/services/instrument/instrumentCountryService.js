import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('instrumentCountryList.get', { filters: options });
}
