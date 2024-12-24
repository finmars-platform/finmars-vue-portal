import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('manageConfigurationList.get', { filters: options });
}
