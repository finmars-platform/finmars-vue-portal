import useApi from '~/composables/useApi';

export async function getValuesForSelect(contentType, key, valueType, options = {}) {
	const filters = { ...options };
	filters.content_type = contentType;
	filters.key = key;
	filters.value_type = valueType;

	return useApi('specificDataValuesForSelect.get', { filters });
}
