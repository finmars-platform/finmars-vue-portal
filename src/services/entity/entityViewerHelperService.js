import hasIn from 'lodash/hasIn';
import get from 'lodash/get';
import useNotify from '~/composables/useNotify';
import useApi from '~/composables/useApi';
import * as uiService from '~/services/uiService';

export async function getDefaultLayout(entityType) {
	const defaultLayoutData = await uiService.getDefaultListLayout(entityType);
	return get(defaultLayoutData, ['results', 0], null);
}

export async function getListLayoutByUserCode(entityType, userCode) {
	const activeLayoutData = await uiService.getListLayoutByUserCode(entityType, userCode);
	const activeLayout = get(activeLayoutData, ['results', 0], null);

	if (activeLayout) {
		return activeLayout;
	} else {
		useNotify({
			type: 'warning',
			title: 'The selected layout is not found. Switch back to Default Layout'
		});

		return getDefaultLayout(entityType);
	}
}
