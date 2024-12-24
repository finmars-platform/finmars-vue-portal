import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('importBankProc.get', { filters: options });
}
