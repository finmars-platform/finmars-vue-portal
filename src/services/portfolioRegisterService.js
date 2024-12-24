import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('portfolioRegisterList.get', { filters: options });
}
