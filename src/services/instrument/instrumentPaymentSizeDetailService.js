import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('instrumentSizeDetail.get', { filters: options });
}
