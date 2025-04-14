import { getListLayout } from '~/services/uiService';

export async function loadLayoutList(entityType) {
	const { results = [] } = await getListLayout(entityType, { pageSize: 1000 });
	return results;
}
