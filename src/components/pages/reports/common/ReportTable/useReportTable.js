/* eslint-disable no-case-declarations */
import { inject, ref } from 'vue';
import { storeToRefs } from 'pinia';
import cloneDeep from 'lodash/cloneDeep';
import size from 'lodash/size';
import get from 'lodash/get';
import set from 'lodash/set';
import unset from 'lodash/unset';
import hasIn from 'lodash/hasIn';
import { FM_DIALOGS_KEY } from '@finmars/ui';
import { useMainReportStore } from '~/stores/useMainReportStore';
import {
	calculatePageNumberForRequest,
	prepareTableDataRequestOptions,
	isGrandTotalHidden,
	isSubtotalAvgWeighted
} from '../utils';
import RenameFieldDialog from '~/components/modal/RenameFieldDialog/RenameFieldDialog.vue';
import NumberFormatSettingsDialog from '~/components/modal/NumberFormatSettingsDialog/NumberFormatSettingsDialog.vue';

export default function useReportTable(emits) {
	const dialogsService = inject(FM_DIALOGS_KEY);

	const mainReportStore = useMainReportStore();
	const { isLoading, entityType, currentLayout, groups, columns, visibleColumns, tableData } =
		storeToRefs(mainReportStore);
	const { getTableData, loadTableDataToGroupLevel } = mainReportStore;

	const isLocalLoading = ref(false);
	const tableHeaderEl = ref(null);
	const isMenuColumnHidden = ref(false);
	const headerCellMenuSettings = ref({
		open: false,
		x: 0,
		y: 0,
		entity: {
			type: 'group',
			value: null
		}
	});

	function onCellResize(type = 'group', item, width) {
		emits('cell-resize', { type, item, width });
	}

	async function loadMore() {
		try {
			isLocalLoading.value = true;

			const newPage = calculatePageNumberForRequest({
				totalItems: tableData.value?.totalChildren,
				currentItemsCount: size(tableData.value?.children)
			});
			const options = prepareTableDataRequestOptions({
				currentLayout: currentLayout.value,
				groupIndex: -1,
				groupValues: [],
				page: newPage
			});
			await getTableData({
				type: options.frontend_request_options.groups_types.length ? 'group' : 'items',
				entityType: entityType.value,
				options,
				justThisLevel: true
			});
		} finally {
			isLocalLoading.value = false;
		}
	}

	function openHeaderCellMenu(event, type = 'group', value) {
		if (!event || !value) {
			headerCellMenuSettings.value.open = false;
		}

		if (headerCellMenuSettings.value.open) {
			headerCellMenuSettings.value = {
				open: false,
				x: 0,
				y: 0,
				entity: {
					type: 'group',
					value: null
				}
			};
			return;
		}

		const elRect = event.target.getBoundingClientRect();
		headerCellMenuSettings.value = {
			open: true,
			x: elRect.x,
			y: elRect.y + elRect.height + 4,
			entity: {
				type,
				value
			}
		};
	}

	function findIndexInColumns(column) {
		return columns.value.findIndex((c) => c.key === column.key);
	}

	function findIndexInGroups(column) {
		return groups.value.findIndex((g) => g.key === column.key);
	}

	function findIndexInFilters(column) {
		return get(currentLayout.value, ['data', 'filters'], []).findIndex((f) => f.key === column.key);
	}

	function renameColumn(column, newName) {
		const columnIndex = findIndexInColumns(column);
		if (columnIndex !== -1) {
			set(currentLayout.value, ['data', 'columns', columnIndex, 'layout_name'], newName);
		}

		const indexInGroups = findIndexInGroups(column);
		if (indexInGroups !== -1) {
			set(currentLayout.value, ['data', 'grouping', indexInGroups, 'layout_name'], newName);
		}

		const indexInFilters = findIndexInFilters(column);
		if (indexInFilters !== -1) {
			set(currentLayout.value, ['data', 'filters', indexInFilters, 'layout_name'], newName);
		}
	}

	async function addColumnToGroup(column) {
		const newGroupItem = {
			___group_type_id: column.___column_id,
			columns: true,
			groups: true,
			key: column.key,
			layout_name: column.layout_name,
			name: column.name,
			options: column.options,
			report_settings: {
				is_level_folded: true,
				subtotal_type: 'line'
			},
			style: column.style,
			value_type: column.value_type
		};
		const updatedGroup = cloneDeep(get(currentLayout.value, ['data', 'grouping'], []));
		const currentGroupSize = size(updatedGroup);
		updatedGroup.push(newGroupItem);
		set(currentLayout.value, ['data', 'grouping'], updatedGroup);
		await loadTableDataToGroupLevel(currentGroupSize);
	}

	async function unGroup(column) {
		const indexInGroups = findIndexInGroups(column);
		if (indexInGroups !== -1) {
			const updatedGroup = cloneDeep(get(currentLayout.value, ['data', 'grouping'], []));
			updatedGroup.splice(indexInGroups, 1);
			set(currentLayout.value, ['data', 'grouping'], updatedGroup);
			await loadTableDataToGroupLevel(Math.max(0, indexInGroups - 1));
		} else {
			throw new Error(`No group with such key found: ${column.key}`);
		}
	}

	async function addFilter(column) {
		// TODO требует доработки (открытие созданного фильтра для редактирования и обновление данных таблицы с учетом обновленных фильтров
		const newFilterItem = {
			isNew: true,
			key: column.key,
			columns: column.columns,
			name: column.name,
			value_type: column.value_type,
			layout_name: column.layout_name,
			options: {
				filter_type: 'equal',
				filter_values: [],
				enabled: true,
				use_from_above: {}
			},
			filters: true
		};
		const updatedFilters = cloneDeep(get(currentLayout.value, ['data', 'filters'], []));
		updatedFilters.push(newFilterItem);
		set(currentLayout.value, ['data', 'filters'], updatedFilters);
	}

	function changeColumnTextAlign(column, type) {
		const columnIndex = findIndexInColumns(column);
		if (columnIndex === -1) return;

		const currentColumnTextAlign = get(currentLayout.value, [
			'data',
			'columns',
			columnIndex,
			'style',
			'text_align'
		]);

		if (currentColumnTextAlign === type) {
			unset(currentLayout.value, ['data', 'columns', columnIndex, 'style', 'text_align']);
		} else {
			set(currentLayout.value, ['data', 'columns', columnIndex, 'style', 'text_align'], type);
		}
	}

	async function removeColumn(column) {
		const isGroupColumn = hasIn(column, '___group_type_id');

		if (isGroupColumn) {
			const indexInGroups = findIndexInGroups(column);
			if (indexInGroups === -1) {
				throw new Error(`No group with such key found: ${column.key}`);
			}

			const updatedGroup = cloneDeep(get(currentLayout.value, ['data', 'grouping'], []));
			updatedGroup.splice(indexInGroups, 1);
			set(currentLayout.value, ['data', 'grouping'], updatedGroup);
			await loadTableDataToGroupLevel(Math.max(0, indexInGroups - 1));
			return;
		}

		const columnIndex = findIndexInColumns(column);
		if (columnIndex === -1) {
			throw new Error(`No column with such key found: ${column.key}`);
		}

		const updatedColumns = cloneDeep(get(currentLayout.value, ['data', 'columns'], []));
		updatedColumns.splice(columnIndex, 1);
		set(currentLayout.value, ['data', 'columns'], updatedColumns);
	}

	function changeNumberFormat(column) {
		const indexInColumns = findIndexInColumns(column);
		const settings = {
			...(column.options && { ...column.options.numberFormat }),
			...(!column.options && { ...column.report_settings }),
			...(column.options && !hasIn(column.options, 'numberFormat') && { ...column.report_settings })
		};
		dialogsService.$openDialog({
			component: NumberFormatSettingsDialog,
			componentProps: {
				settings
			},
			dialogProps: {
				title: 'Number Format',
				width: 600,
				closeOnClickOverlay: false,
				onConfirm: (val) => {
					set(
						currentLayout.value,
						['data', 'columns', indexInColumns, 'options', 'numberFormat'],
						val
					);
				}
			}
		});
	}

	function changeSubtotalValue(column, field, value) {
		const isGroupColumn = hasIn(column, '___group_type_id');
		const index = isGroupColumn ? findIndexInGroups(column) : findIndexInColumns(column);
		if (index === -1) return;

		const path = ['data', isGroupColumn ? 'grouping' : 'columns', index, 'report_settings', field];
		const currentValue =
			typeof value === 'boolean'
				? !!get(currentLayout.value, path)
				: get(currentLayout.value, path);
		const newValue = currentValue === value ? (typeof value === 'boolean' ? !value : null) : value;
		set(currentLayout.value, path, newValue);
	}

	async function runAction(action, item) {
		headerCellMenuSettings.value = {
			open: false,
			x: 0,
			y: 0,
			entity: {
				type: 'group',
				value: null
			}
		};

		console.log('## ACT => ', action, item);
		switch (action) {
			case 'rename':
				dialogsService.$openDialog({
					component: RenameFieldDialog,
					componentProps: {
						data: item
					},
					dialogProps: {
						title: 'Rename',
						width: 400,
						closeOnClickOverlay: false,
						onConfirm: (name) => {
							renameColumn(item, name);
						}
					}
				});
				break;
			case 'add:group':
				await addColumnToGroup(item);
				break;
			case 'remove:group':
				await unGroup(item);
				break;
			case 'add:filter':
				await addFilter(item);
				break;
			case 'alignment:left':
				changeColumnTextAlign(item, 'left');
				break;
			case 'alignment:center':
				changeColumnTextAlign(item, 'center');
				break;
			case 'alignment:right':
				changeColumnTextAlign(item, 'right');
				break;
			case 'remove':
				await removeColumn(item);
				break;
			case 'format:number':
				changeNumberFormat(item);
				break;
			case 'subtotal:sum':
				changeSubtotalValue(item, 'subtotal_formula_id', 1);
				break;
			case 'subtotal:weighted':
				changeSubtotalValue(item, 'subtotal_formula_id', 2);
				break;
			case 'subtotal:av-weighted':
				changeSubtotalValue(item, 'subtotal_formula_id', 6);
				break;
			case 'hide:total':
				changeSubtotalValue(item, 'hide_grandtotal', !isGrandTotalHidden(item));
				break;
			case 'format:number:market':
				changeSubtotalValue(item, 'subtotal_formula_id', 2 + 4 * isSubtotalAvgWeighted(item));
				break;
			case 'format:number:market:percentage':
				changeSubtotalValue(item, 'subtotal_formula_id', 3 + 4 * isSubtotalAvgWeighted(item));
				break;
			case 'format:number:exposure':
				changeSubtotalValue(item, 'subtotal_formula_id', 4 + 4 * isSubtotalAvgWeighted(item));
				break;
			case 'format:number:exposure:percentage':
				changeSubtotalValue(item, 'subtotal_formula_id', 5 + 4 * isSubtotalAvgWeighted(item));
				break;
		}
	}

	return {
		isLoading,
		isLocalLoading,
		tableHeaderEl,
		currentLayout,
		groups,
		visibleColumns,
		tableData,
		isMenuColumnHidden,
		headerCellMenuSettings,
		onCellResize,
		loadMore,
		openHeaderCellMenu,
		runAction
	};
}
