import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('paymentSizeDetailMappingList.get', { filters: options });
}
