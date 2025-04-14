import { computed, inject, ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import dayjs from 'dayjs';
import isEmpty from 'lodash/isEmpty';
import has from 'lodash/has';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import set from 'lodash/set';
import size from 'lodash/size';
import { FM_DIALOGS_KEY } from '@finmars/ui';
import useNotify from '~/composables/useNotify';
import useGlobalStore from '~/stores/useStore';
import {
	loadLayoutList as _loadLayoutList,
	getGroupList as _getGroupList,
	getItemList as _getItemList,
	saveLayout as _saveLayout
} from '~/utils/reports';
import {
	prepareFlatListOfGroupRows,
	prepareTableDataRequestOptions
} from '~/components/pages/reports/common/utils';
import * as uiService from '~/services/uiService';
import * as metaContentTypesService from '~/services/meta/metaContentTypeService';
import { getListLight as getCurrencyList } from '~/services/currency/currencyService';
import { getList as getDefaultList } from '~/services/ecosystemDefaultService';
import { REPORT_DATA_PROPERTIES } from '~/components/pages/reports/common/constants';
import ConfirmationDialog from '~/components/modal/ConfirmationDialog.vue';
import LayoutSaveAsDialog from '~/components/modal/LayoutSaveAsDialog/LayoutSaveAsDialog.vue';

export const useMainReportStore = defineStore('balance-report', () => {
	const router = useRouter();
	const dialogsSrv = inject(FM_DIALOGS_KEY);

	const { defaultConfigurationCode } = storeToRefs(useGlobalStore());

	const entityType = ref();
	const contentType = ref();
	const isLoading = ref(false);
	const rootEntityViewer = ref(true);
	const layouts = ref([]);
	const initialCurrentLayout = ref({});
	const currentLayout = ref({});
	const splitPanelDefaultLayout = ref(null);
	const currencies = ref([]);
	const syncedTime = ref(null);
	const sortGroup = ref({
		key: null,
		sort: 'desc'
	});
	const sortColumn = ref({
		key: null,
		sort: 'asc'
	});
	const expandGroupsToLevel = ref(null);
	const tableData = ref({
		___group_identifier: 'root',
		___group_name: 'root',
		___group_type_key: 'root',
		totalChildren: 0,
		children: {}
	});

	const targetContentType = computed(() =>
		metaContentTypesService.findContentTypeByEntity(entityType.value, 'ui')
	);
	const autosaveLayoutUserCode = computed(
		() => `${defaultConfigurationCode.value}:${targetContentType.value}:autosave`
	);

	const groupRows = computed(() => prepareFlatListOfGroupRows(tableData.value));

	const groups = computed(() => get(currentLayout.value, ['data', 'grouping'], []));
	const groupIds = computed(() => groups.value.map((gr) => gr.___group_type_id));
	const isExtendedColumnsMode = computed(() => {
		if (isEmpty(groups.value)) return true;

		return groupRows.value.some(
			(row) => size(row.parents) === size(groups.value) - 1 && row.is_open
		);
	});

	const columns = computed(() => get(currentLayout.value, ['data', 'columns'], []));
	const columnsWithoutGroups = computed(() =>
		columns.value.filter((col) => !groupIds.value.includes(col.___column_id))
	);
	const visibleColumnsForNonExtendedMode = computed(() =>
		columnsWithoutGroups.value.filter((col) => col.report_settings?.subtotal_formula_id === 1)
	);

	const visibleColumns = computed(() =>
		isExtendedColumnsMode.value
			? columnsWithoutGroups.value
			: visibleColumnsForNonExtendedMode.value
	);

	async function changeRouteQuery(entityType) {
		syncedTime.value = dayjs();

		const sortedGroup = get(currentLayout.value, ['data', 'grouping'], []).find(
			(gr) => !!gr.options.sort
		);

		const sortedColumn = get(currentLayout.value, ['data', 'columns'], []).find(
			(c) => !groupIds.value.includes(c.___column_id) && !!c.options.sort
		);

		sortGroup.value = sortedGroup
			? {
					key: sortedGroup.key,
					sort: sortedGroup.options.sort.toLowerCase()
				}
			: {
					key: null,
					sort: 'desc'
				};

		sortColumn.value = sortedColumn
			? {
					key: sortedColumn.key,
					sort: sortedColumn.options.sort.toLowerCase()
				}
			: {
					field: null,
					by: 'asc'
				};

		const [dateFromKey, dateToKey] = REPORT_DATA_PROPERTIES[entityType];

		await router.push({
			query: {
				layout: currentLayout.value.id,
				costMethod: currentLayout.value.data.reportOptions.cost_method,
				currency: currentLayout.value.data.reportOptions.report_currency,
				...(entityType !== 'balance-report' && {
					dateFrom: currentLayout.value.data.reportOptions[dateFromKey]
				}),
				dateTo: currentLayout.value.data.reportOptions[dateToKey],
				...(sortGroup.value.key && {
					sortGroupField: sortedGroup.value.key,
					sortGroupBy: sortedGroup.value.sort
				}),
				...(sortColumn.value.key && {
					sortColumnField: sortColumn.value.key,
					sortColumnBy: sortColumn.value.sort
				}),
				useDateFromAbove: !!currentLayout.value.data.reportLayoutOptions.useDateFromAbove
			}
		});
	}

	async function loadLayoutList(entityType) {
		layouts.value = await _loadLayoutList(entityType);
	}

	async function getLayouts(entityType) {
		await loadLayoutList(entityType);
		const layout = (layouts.value || []).find((l) => l.is_default);
		currentLayout.value = cloneDeep(layout || {});

		if (!isEmpty(currentLayout.value)) {
			await changeRouteQuery(entityType);
		}

		prepareReportLayoutOptions();
		initialCurrentLayout.value = cloneDeep(currentLayout.value);
	}

	function updateLayoutList(layout) {
		const currentLayoutIndex = layouts.value.findIndex((l) => l.id === layout.id);
		if (currentLayoutIndex === -1) {
			layouts.value.push(layout);
		} else {
			layouts.value[currentLayoutIndex] = layout;
		}
	}

	async function getCurrencies() {
		const { results = [] } = await getCurrencyList({ page: 1, page_size: 1000 });
		currencies.value = results;

		if (isEmpty(currencies.value)) {
			const data = await getDefaultList();
			const ecosystemDefaultData = data?.results[0];

			if (ecosystemDefaultData) {
				currencies.value.push(ecosystemDefaultData.currency_object);
				data.value.reportOptions.report_currency = ecosystemDefaultData.currency_object.id;
			}
		}
	}

	function prepareReportLayoutOptions() {
		if (!has(currentLayout.value, 'data.reportLayoutOptions.datepickerOptions')) {
			set(currentLayout.value, 'data.reportLayoutOptions.datepickerOptions', {});
		}

		if (
			!has(currentLayout.value, 'data.reportLayoutOptions.datepickerOptions.reportFirstDatepicker')
		) {
			set(
				currentLayout.value,
				'data.reportLayoutOptions.datepickerOptions.reportFirstDatepicker',
				{}
			);
		}

		if (
			!has(currentLayout.value, 'data.reportLayoutOptions.datepickerOptions.reportLastDatepicker')
		) {
			set(
				currentLayout.value,
				'data.reportLayoutOptions.datepickerOptions.reportLastDatepicker',
				{}
			);
		}

		if (
			typeof get(currentLayout.value, 'data.reportLayoutOptions.useDateFromAbove') !== 'boolean'
		) {
			set(currentLayout.value, 'data.reportLayoutOptions.useDateFromAbove', true);
		}
	}

	async function loadTableDataToGroupLevel(level) {
		console.log('### loadTableDataToGroupLevel => ', level);
		tableData.value = {
			___group_identifier: 'root',
			___group_name: 'root',
			___group_type_key: 'root',
			totalChildren: 0,
			children: {}
		};
		expandGroupsToLevel.value = level;
		const options = prepareTableDataRequestOptions({
			currentLayout: currentLayout.value,
			groupIndex: -1,
			groupValues: []
		});
		await getTableData({
			type: options.frontend_request_options.groups_types.length ? 'group' : 'items',
			entityType: entityType.value,
			options
		});
	}

	async function getTableData({
		type = 'group',
		entityType,
		options,
		path = [],
		justThisLevel = false
	}) {
		const data =
			type === 'group'
				? await getGroupList(options, entityType)
				: await getItemList(options, entityType);
		type === 'group' && console.log('groupList => ', data);
		type !== 'group' && console.log('itemList => ', data);

		set(tableData.value, [...path, 'hasServerResponseError'], !!data?.error);
		set(tableData.value, [...path, 'totalChildren'], get(data, 'count', 0));
		const results = get(data, 'results', []);
		const currentGroupRowParents = path.filter((i) => i !== 'children');
		const isOpen =
			!justThisLevel &&
			typeof expandGroupsToLevel.value === 'number' &&
			size(currentGroupRowParents) <= expandGroupsToLevel.value;

		const newChildren =
			type === 'group'
				? results.reduce((res, item) => {
						res[item.___group_identifier] = {
							...item,
							rowId: item.___group_identifier,
							is_open: isOpen,
							parents: currentGroupRowParents,
							totalChildren: 0,
							children: {}
						};
						return res;
					}, {})
				: results.reduce((res, item) => {
						res[item.id] = {
							...item,
							rowId: item.id
						};
						return res;
					}, {});

		set(tableData.value, [...path, 'children'], {
			...get(tableData.value, [...path, 'children'], {}),
			...newChildren
		});
	}

	async function getGroupList(options, entityType) {
		const { reportOptions, data } = await _getGroupList({
			currentLayout: currentLayout.value,
			sortGroup: sortGroup.value,
			options,
			entityType
		});

		if (!data.error) {
			set(currentLayout.value, ['data', 'reportOptions'], reportOptions);
		}

		return { ...data };
	}

	async function getItemList(options, entityType) {
		const { reportOptions, data } = await _getItemList({
			currentLayout: currentLayout.value,
			sortColumn: sortColumn.value,
			options,
			entityType
		});

		if (!data.error) {
			set(currentLayout.value, ['data', 'reportOptions'], reportOptions);
		}

		return { ...data };
	}

	async function loadTableData() {
		const groupIndexToExpand = groups.value.reduce((acc, g, index) => {
			const { report_settings = {} } = g;
			const { is_level_folded } = report_settings;
			if (!is_level_folded && index > acc) {
				acc = index;
			}

			return acc;
		}, -1);

		if (groupIndexToExpand !== -1) {
			await loadTableDataToGroupLevel(groupIndexToExpand);
			return;
		}

		const options = prepareTableDataRequestOptions({
			currentLayout: currentLayout.value,
			groupIndex: -1,
			groupValues: []
		});

		await getTableData({
			type: options.frontend_request_options.groups_types.length ? 'group' : 'items',
			entityType: entityType.value,
			options,
			justThisLevel: true
		});
	}

	async function selectLayout(layout) {
		try {
			isLoading.value = true;
			currentLayout.value = layout;
			initialCurrentLayout.value = cloneDeep(currentLayout.value);
			await changeRouteQuery(entityType.value);
			tableData.value = [];
			await loadTableData();
		} finally {
			isLoading.value = false;
		}
	}

	async function saveLayout() {
		await _saveLayout(currentLayout.value);
		initialCurrentLayout.value = cloneDeep(currentLayout.value);
	}

	async function _saveAsLayout(updatedLayoutData) {
		const layout = await uiService.createListLayout(entityType.value, updatedLayoutData);
		updateLayoutList(layout);
		await selectLayout(layout);
		useNotify({ type: 'success', title: `Layout ${updatedLayoutData.name} saved.` });
	}

	async function _overwriteLayout(updatedLayoutData) {
		const layoutToOverwriteData = await uiService.getListLayoutByUserCode(
			entityType.value,
			updatedLayoutData.user_code
		);

		const layoutToOverwrite = layoutToOverwriteData.results[0];
		layoutToOverwrite.data = updatedLayoutData.data;
		layoutToOverwrite.name = updatedLayoutData.name;
		const layout = await uiService.updateListLayout(layoutToOverwrite);
		updateLayoutList(layout);
		await selectLayout(layout);
		useNotify({ type: 'success', title: `Success. Layout ${updatedLayoutData.name} overwritten.` });
	}

	async function saveAsLayout(layout) {
		dialogsSrv.$openDialog({
			component: LayoutSaveAsDialog,
			componentProps: {
				entityType: entityType.value
			},
			dialogProps: {
				title: 'New layout',
				width: 800,
				cancelButton: false,
				confirmButton: false,
				closeOnClickOverlay: false,
				onConfirm: async ({ status, data }) => {
					try {
						isLoading.value = true;

						const updatedLayout = {
							...(layout || cloneDeep(currentLayout.value)),
							...data,
							is_systemic: false
						};

						if (status === 'agree') {
							updatedLayout.id && delete updatedLayout.id;
							await _saveAsLayout(updatedLayout);
						} else if (status === 'overwrite') {
							await _overwriteLayout(updatedLayout);
						}
					} finally {
						isLoading.value = false;
					}
				}
			}
		});
	}

	async function renameLayout(layout) {
		return new Promise((resolve) => {
			const updatedLayout = layout || cloneDeep(currentLayout.value);

			dialogsSrv.$openDialog({
				component: LayoutSaveAsDialog,
				componentProps: {
					entityType: metaContentTypesService.findEntityByContentType(contentType.value),
					name: updatedLayout.name,
					userCode: updatedLayout.user_code
				},
				dialogProps: {
					title: 'Rename layout',
					width: 800,
					cancelButton: false,
					confirmButton: false,
					closeOnClickOverlay: false,
					onConfirm: async ({ status, data }) => {
						try {
							isLoading.value = true;

							if (status === 'agree') {
								updatedLayout.name = data.name;
								updatedLayout.user_code = data.user_code;
								const res = await uiService.updateListLayout(updatedLayout);
								updateLayoutList(res);

								if (currentLayout.value.id === res.id) {
									currentLayout.value.name = data.name;
									currentLayout.value.user_code = data.user_code;
								}

								useNotify({ type: 'success', title: 'Success. Layout has been renamed.' });
								resolve(updatedLayout);
							}
						} finally {
							isLoading.value = false;
						}
					}
				}
			});
		});
	}

	async function makeLayoutDefault(layout) {
		try {
			isLoading.value = true;
			const updatedLayout = layout || cloneDeep(currentLayout.value);

			if (rootEntityViewer.value) {
				if (updatedLayout.is_default) return;

				updatedLayout.is_default = true;
				layouts.value.forEach((l) => {
					l.is_default = l.id === updatedLayout.id;
				});
				const layout = await uiService.updateListLayout(updatedLayout);
				updateLayoutList(layout);

				useNotify({ type: 'success', title: 'Success. Layout made by default' });
			} else if (updatedLayout.id !== splitPanelDefaultLayout.value.id) {
				splitPanelDefaultLayout.value = {
					layoutId: updatedLayout.id,
					name: updatedLayout.name,
					content_type: updatedLayout.content_type
				};
			}
		} finally {
			isLoading.value = false;
		}
	}

	async function deleteLayout(layout) {
		dialogsSrv.$openDialog({
			component: ConfirmationDialog,
			componentProps: {
				text: 'Are you sure want to delete this layout?'
			},
			dialogProps: {
				title: 'Warning',
				width: 480,
				onConfirm: async () => {
					try {
						isLoading.value = true;
						const deletedLayout = layout || currentLayout.value;

						await uiService.deleteListLayoutByKey(deletedLayout.id);

						if (deletedLayout.is_default && layouts.value.length > 1) {
							const newDefaultLayoutIndex = layouts.value[0].id === deletedLayout.id ? 1 : 0;
							layouts.value[newDefaultLayoutIndex].is_default = true;
							await uiService.updateListLayout(layouts.value[newDefaultLayoutIndex]);
						}

						await getLayouts(entityType.value);
					} finally {
						isLoading.value = false;
					}
				}
			}
		});
	}

	watch(groupRows, () => {
		groups.value.forEach((_, index) => {
			const currentGroupRows = groupRows.value.filter((r) => size(r.parents) === index);
			const isGroupColumnOpen = currentGroupRows.some((r) => r.is_open);
			set(
				currentLayout.value,
				['data', 'grouping', index, 'report_settings', 'is_level_folded'],
				!isGroupColumnOpen
			);
		});
	});

	return {
		entityType,
		contentType,
		targetContentType,
		autosaveLayoutUserCode,
		rootEntityViewer,
		splitPanelDefaultLayout,
		isLoading,
		currencies,
		sortGroup,
		sortColumn,
		syncedTime,
		layouts,
		initialCurrentLayout,
		currentLayout,
		groups,
		groupIds,
		groupRows,
		columns,
		columnsWithoutGroups,
		visibleColumns,
		isExtendedColumnsMode,
		expandGroupsToLevel,
		tableData,
		updateLayoutList,
		changeRouteQuery,
		loadLayoutList,
		getLayouts,
		getCurrencies,
		loadTableData,
		getTableData,
		loadTableDataToGroupLevel,
		getGroupList,
		getItemList,
		saveLayout,
		selectLayout,
		saveAsLayout,
		renameLayout,
		makeLayoutDefault,
		deleteLayout
	};
});
