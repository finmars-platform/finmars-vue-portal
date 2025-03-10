import useApi from '~/composables/useApi';

export async function getList(options = {}) {
	return useApi('instrumentDownloadSchemeList.get', { filters: options });
}

export async function getListLight(options = {}) {
	return useApi('instrumentDownloadSchemeListLight.get', {
		filters: options
	});
}

export async function create(scheme) {
	return useApi('instrumentDownloadSchemeInstance.post', { body: scheme });
}

export async function getByKey(id) {
	return useApi('instrumentDownloadSchemeInstance.get', {
		params: { id }
	});
}

export async function update(scheme) {
	const { id } = scheme;
	if (!id) {
		console.error('ID not found');
		return;
	}

	return useApi('instrumentDownloadSchemeInstance.patch', {
		params: { id },
		body: scheme
	});
}

export async function deleteByKey(id) {
	return useApi('instrumentDownloadSchemeInstance.delete', {
		params: { id }
	});
}
