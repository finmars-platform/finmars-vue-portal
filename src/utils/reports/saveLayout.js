import { updateListLayout } from '~/services/uiService';
import useNotify from '~/composables/useNotify';

export async function saveLayout(layout) {
	if (layout.id) {
		await updateListLayout(layout);
		useNotify({ type: 'success', title: 'Page was saved.' });
	} else {
		// TODO open dialog for enter new layout name and user code and then save new layout
	}
}
