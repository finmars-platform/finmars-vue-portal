import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('responsibleGroupList.get', { filters: options });
}
