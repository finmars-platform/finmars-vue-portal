import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('instrumentTypeList.get', { filters: options });
}
