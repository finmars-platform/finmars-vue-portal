import useApi from '~/composables/useApi';

export async function getList(options) {
	return useApi('expressionProcedureList.get', { filters: options });
}

export async function create(data) {
	return useApi('expressionProcedureList.post', { body: data });
}

export async function update(data) {
	const id = data.id;
	return useApi('expressionProcedureList.put', { params: { id }, body: data });
}
