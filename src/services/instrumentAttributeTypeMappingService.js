import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('instrumentAttributeTypeMappingList.get', { filters: options });
}
