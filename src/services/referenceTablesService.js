import useApi from '~/composables/useApi';

export async function getList(options = {}) {
	return useApi('referenceTablesList.get', { filters: options });
}

export async function getByKey(id) {
	return useApi('referenceTable.get', { params: { id } });
}

export async function create(data) {
	return useApi('referenceTable.post', { body: data });
}

export async function update(data) {
	const { id } = data;
	return useApi('referenceTable.put', { params: { id }, body: data });
}

export async function deleteByKey(id) {
	return useApi('referenceTable.delete', { params: { id } });
}
