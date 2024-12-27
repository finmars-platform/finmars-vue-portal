import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('portfolioRegisterRecordList.get', { filters: options });
}
