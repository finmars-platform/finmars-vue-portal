const saveRowTypeFilters = function (store, viewerData, rowTypeFilters, isReport) {

		const color = rowTypeFilters.markedRowFilters || 'none';
		const entityType = viewerData.getEntityType();
		// const viewerType = isReport ? 'report_viewer' : 'entity_viewer';

		const entityViewersSettings = store.getMemberEntityViewersSettings(isReport, entityType);
		entityViewersSettings.row_type_filter = color;

		store.setMemberEntityViewersSettings(entityViewersSettings, isReport, entityType);

		const member = store.member;

		useApi('member.put', {params: {id: member.id}, body: {body: member}});

};

export async function useSaveEvRvLayout (store, viewerData) {

	const isReport = viewerData.isReport;

	if (viewerData.content_type !== 'reports.performancereport') {

		const rowTypeFilters = viewerData.getRowTypeFilters();
		if (rowTypeFilters) saveRowTypeFilters(store, viewerData, rowTypeFilters, isReport);

	}

	const currentLayoutConfig = viewerData.getLayoutCurrentConfiguration(isReport);

	if (currentLayoutConfig.hasOwnProperty('id')) {

		/*uiService.updateListLayout(currentLayoutConfig.id, currentLayoutConfig).then(function (updatedLayoutData) {

			let listLayout = updatedLayoutData;

			viewerData.setListLayout(listLayout);
			// viewerData.setActiveLayoutConfiguration({layoutConfig: currentLayoutConfig});

			useNotify({type: 'success', title: 'Success. Page was saved.'})

		});*/
		const params = {id: currentLayoutConfig.id};

		const resData = await useApi('listLayout.put', {params: params, body: currentLayoutConfig});

		if (!resData.error) {

			viewerData.listLayout = resData;
			// viewerData.setActiveLayoutConfiguration({layoutConfig: currentLayoutConfig}); // TODO: check layout for changes

			useNotify({type: 'success', title: 'Success. Page was saved.'})

		}

	}

}

export async function useFetchEvRvLayout(layoutsStore, viewerData, queryUserCode) {

	let res;

	if (viewerData.layoutToOpen !== 'default') {

		if (viewerData.layoutToOpen) {
			res = await layoutsStore.getLayoutByKey(viewerData.layoutToOpen);

		} else if (queryUserCode) {
			res = await layoutsStore.getLayoutByUserCode(viewerData.content_type, queryUserCode);

			if (!res) {

				useNotify({
					type: 'warning',
					title: `Layout with user code "${queryUserCode}" is not found. Switching back to Default Layout.`
				})

			}

		}

	}

	if (!res) {
		res = await layoutsStore.getDefaultLayout(viewerData.content_type);
	}

	if (res && res.error) {
		throw new Error(res.error);
	}

	return res;

}
