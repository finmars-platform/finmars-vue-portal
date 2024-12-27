import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('instrumentClass.get', { filters: options });
}
