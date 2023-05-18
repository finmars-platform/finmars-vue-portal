import evEvents from "../services/entityViewerEvents";

export default function (toastNotificationService, uiService) {

	let getLinkingToFilters = function (layout) {

		if (!layout.data) {
			console.error("Broken layout: ", layout);
			return [];
		}

		let linkingToFilters = [];

		layout.data.filters.forEach(function (filter) {

			if (filter.options.use_from_above) {

				if (typeof filter.options.use_from_above === 'object') {

					if (Object.keys(filter.options.use_from_above).length) {

						let filterObj = {
							key: filter.options.use_from_above.key,
							name: filter.name,
							filter_type: filter.options.filter_type
						};

						if (filter.layout_name) {
							filterObj.layout_name = filter.layout_name;
						}

						linkingToFilters.push(filterObj);

					}


				} else {

					let filterObj = {
						key: filter.options.use_from_above,
						name: filter.name,
						filter_type: filter.options.filter_type
					};

					if (filter.layout_name) {
						filterObj.layout_name = filter.layout_name;
					}

					linkingToFilters.push(filterObj);

				}

			}

		});

		return linkingToFilters;
	};

	let getDataForLayoutSelectorWithFilters = function (layouts) {

		let result = [];

		layouts.forEach(function (layout) {

			if (!layout.data) console.error("Broken list layout: ", layout);

			let layoutObj = {
				id: layout.id,
				name: layout.name,
				user_code: layout.user_code,
				content_type: layout.content_type,
				content: []
			};

			layoutObj.content = getLinkingToFilters(layout);

			result.push(layoutObj);

		});

		return result;

	};

	const saveRowTypeFilters = function (entityViewerDataService, isReport, usersService, globalDataService) {

		const rowTypeFilters = entityViewerDataService.getRowTypeFilters();

		if (rowTypeFilters) {

			const color = rowTypeFilters.markedRowFilters || 'none';
			const entityType = entityViewerDataService.getEntityType();
			// const viewerType = isReport ? 'report_viewer' : 'entity_viewer';

			const entityViewersSettings = globalDataService.getMemberEntityViewersSettings(isReport, entityType);
			entityViewersSettings.row_type_filter = color;

			globalDataService.setMemberEntityViewersSettings(entityViewersSettings, isReport, entityType);

			var member = globalDataService.getMember();
			usersService.updateMember(member.id, member);

		}

	};

	const saveLayoutList = function (entityViewerDataService, isReport, usersService, globalDataService) {

		saveRowTypeFilters(entityViewerDataService, isReport, usersService, globalDataService);

		var currentLayoutConfig = entityViewerDataService.getLayoutCurrentConfiguration(isReport);

		if (currentLayoutConfig.hasOwnProperty('id')) {

			uiService.updateListLayout(currentLayoutConfig.id, currentLayoutConfig).then(function (updatedLayoutData) {

				let listLayout = updatedLayoutData;

				entityViewerDataService.setListLayout(listLayout);
				entityViewerDataService.setActiveLayoutConfiguration({layoutConfig: currentLayoutConfig});

				toastNotificationService.success("Success. Page was saved.");

			});

		}

	};

	/**
	 * @memberOf module:evRvLayoutsHelper
	 *
	 * @param isRootEntityViewer {boolean}
	 * @param evDataService {Object}
	 * @param evEventService {Object}
	 * @param layout {Object}
	 */
	const applyLayout = function (isRootEntityViewer, evDataService, evEventService, layout) {

		/*if (isRootEntityViewer) {

			evDataService.setListLayout(layout);
			evDataService.setActiveLayoutConfiguration({layoutConfig: layout});

			evEventService.dispatchEvent(evEvents.LAYOUT_NAME_CHANGE);

			// toastNotificationService.success("New layout with name '" + layout.name + "' created");

			evDataService.setIsNewLayoutState(false);

		} else { // split panel

			evDataService.setSplitPanelLayoutToOpen(layout.id);
			evEventService.dispatchEvent(evEvents.LIST_LAYOUT_CHANGE);

		}*/
		evDataService.setListLayout(layout);
		evDataService.setActiveLayoutConfiguration({layoutConfig: layout});

		evEventService.dispatchEvent(evEvents.LAYOUT_NAME_CHANGE);

		// toastNotificationService.success("New layout with name '" + layout.name + "' created");

		evDataService.setIsNewLayoutState(false);

	};

	/**
	 *
	 * @param layoutToOverwrite {Object}
	 * @param listLayout {Object}
	 * @returns {Promise<any>}
	 */
	const overwriteLayout = (layoutToOverwrite, listLayout) => {

		const id = layoutToOverwrite.id;

		listLayout.id = id;
		layoutToOverwrite.data = listLayout.data;
		layoutToOverwrite.name = listLayout.name;

		return uiService.updateListLayout(id, layoutToOverwrite);

	};
	/**
	 * @param {Object} evDataService - entityViewerDataService
	 * @param {Object} evEventService - entityViewerEventService
	 * @param {boolean} isReport
	 * @param {Object} $mdDialog
	 * @param {string} entityType
	 * @param {Object} $event - event object
	 * @return {Promise<any>} - saved layout or error
	 *
	 * @memberOf module:evRvLayoutsHelper
	 */
	const saveAsLayoutList = function (evDataService, evEventService, isReport, $mdDialog, entityType, $event) {

		return new Promise((resolve, reject) => {

			const listLayout = evDataService.getLayoutCurrentConfiguration(isReport);
			const isRootEntityViewer = evDataService.isRootEntityViewer();

			$mdDialog.show({
				controller: 'NewLayoutDialogController as vm',
				templateUrl: 'views/dialogs/new-layout-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				preserveScope: false,
				locals: {
					data: {
						entityType: entityType,
						name: listLayout.name,
					}
				}
			})
				.then(res => {

					if (res.data && res.data.user_code && res.data.user_code.startsWith('system_autosave_')) {
						throw "This user code reserved for system layout. Please use another one";
					}

					if (res.status === 'agree') {

						const saveAsLayout = function () {

							listLayout.name = res.data.name;
							listLayout.user_code = res.data.user_code;

							uiService.createListLayout(entityType, listLayout).then(function (data) {

								applyLayout(isRootEntityViewer, evDataService, evEventService, data);
								toastNotificationService.success("Layout '" + listLayout.name + "' saved.");

								resolve({status: res.status, layoutData: data});

							}).catch(error => {
								reject({status: res.status, error: error});
							});

						};

						if (isRootEntityViewer) {
							listLayout.is_default = true; // default layout for split panel does not have is_default === true
						}

						listLayout.is_systemic = false;

						if (listLayout.id) { // if layout based on another existing layout

							delete listLayout.id;
							saveAsLayout();

						} else { // if layout was not based on another layout
							saveAsLayout();
						}

					}
					else if (res.status === 'overwrite') {

						const userCode = res.data.user_code;

						listLayout.name = res.data.name;
						listLayout.user_code = userCode;

						uiService.getListLayoutByUserCode(entityType, userCode).then(function (layoutToOverwriteData) {

							const layoutToOverwrite = layoutToOverwriteData.results[0];
							overwriteLayout(layoutToOverwrite, listLayout).then(function (updatedLayoutData) {

								/* if (isRootEntityViewer) listLayout.is_default = true; // default layout for split panel does not have is_default === true
                                listLayout.modified = updatedLayoutData.modified; */

								applyLayout(isRootEntityViewer, evDataService, evEventService, updatedLayoutData);
								toastNotificationService.success("Success. Layout " + listLayout.name + " overwritten.");

								resolve({status: res.status});

							}).catch(error => reject({status: res.status, error: error}));

						});

					}
					else {
						resolve({status: 'disagree'});
					}

				});

		});

	};

	const clearSplitPanelAdditions = function (evDataService) {

		var interfaceLayout = evDataService.getInterfaceLayout();
		interfaceLayout.splitPanel.height = 0;

		evDataService.setInterfaceLayout(interfaceLayout);

		var additions = evDataService.getAdditions();

		additions.isOpen = false;
		additions.type = '';
		delete additions.layoutData;

		evDataService.setSplitPanelStatus(false);
		evDataService.setAdditions(additions);

	};

	const statesWithLayoutsList = [
		'app.portal.reports.balance-report',
		'app.portal.reports.pl-report',
		'app.portal.reports.transaction-report',

		'app.portal.data.portfolio',
		'app.portal.data.account',
		'app.portal.data.account-type',
		'app.portal.data.counterparty',
		'app.portal.data.responsible',
		'app.portal.data.instrument',
		'app.portal.data.instrument-type',
		'app.portal.data.complex-transaction',
		'app.portal.data.transaction',
		'app.portal.data.transaction-type',
		'app.portal.data.currency-history',
		'app.portal.data.price-history',
		'app.portal.data.currency',
		'app.portal.data.strategy-group',
		'app.portal.data.strategy',
	];

	/** @module evRvLayoutsHelper */
	return {
		getLinkingToFilters: getLinkingToFilters,
		getDataForLayoutSelectorWithFilters: getDataForLayoutSelectorWithFilters,

		saveLayoutList: saveLayoutList,
		saveAsLayoutList: saveAsLayoutList,

		clearSplitPanelAdditions: clearSplitPanelAdditions,

		statesWithLayouts: statesWithLayoutsList,
	}
};