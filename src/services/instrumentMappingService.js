import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('instrumentMappingList.get', { filters: options });
}
