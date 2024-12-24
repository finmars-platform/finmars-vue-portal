import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('instrumentList.get', { filters: options });
}
