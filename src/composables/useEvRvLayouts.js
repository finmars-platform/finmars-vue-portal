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

export async function useSaveLayoutList (store, viewerData) {

	const entityType = viewerData.entityType;
	const isReport = viewerData.isReport;

	if (entityType !== 'reports-performance') {

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

		if (!resData.errorData) {

			viewerData.listLayout = resData;
			// viewerData.setActiveLayoutConfiguration({layoutConfig: currentLayoutConfig}); // TODO: check layout for changes

			useNotify({type: 'success', title: 'Success. Page was saved.'})

		}

	}

}


