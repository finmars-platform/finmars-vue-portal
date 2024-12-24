import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('expressionProcedureList.get', { filters: options });
}
