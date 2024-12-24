import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('accountTypeMappingList.get', { filters: options });
}
