import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { defineStore } from 'pinia';
import dayjs from 'dayjs';
import isEmpty from 'lodash/isEmpty';
import has from 'lodash/has';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import set from 'lodash/set';
import size from 'lodash/size';
import { getListLayout } from '~/services/uiService';
import { getListReportGroups, getListReportItems } from '~/services/entity/entityResolverService';
import { isFilterValid } from '~/utils/evRvCommonHelper';
import { entityPluralToSingular } from '~/utils/queryParamsHelper';
import { prepareFlatListOfGroupRows } from '~/components/pages/reports/common/utils';
import { getListLight as getCurrencyList } from '~/services/currency/currencyService';
import { getList as getDefaultList } from '~/services/ecosystemDefaultService';
import { REPORT_DATA_PROPERTIES } from '~/components/pages/reports/common/constants';

export const useBalanceReportStore = defineStore('balance-report', () => {
	const router = useRouter();

	const entityType = ref();
	const contentType = ref();
	const isLoading = ref(false);
	const layouts = ref([]);
	const currentLayout = ref({});
	const currencies = ref([]);
	const currentCurrency = ref('USD');
	const syncedTime = ref(null);
	const sortGroup = ref({
		key: null,
		sort: 'desc'
	});
	const sortColumn = ref({
		key: null,
		sort: 'asc'
	});
	const tableData = ref({
		___group_identifier: 'root',
		___group_name: 'root',
		___group_type_key: 'root',
		totalChildren: 0,
		children: {}
	});

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
				layout: currentLayout.value.user_code,
				costMethod: currentLayout.value.data.reportOptions.cost_method,
				currency: currentCurrency.value.user_code,
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

	async function getLayouts(entityType) {
		const res = await getListLayout(entityType, { pageSize: 1000 });
		layouts.value = res.results;

		const layout = (layouts.value || []).find((l) => l.is_default);
		currentLayout.value = cloneDeep(layout || {});

		if (!isEmpty(currentLayout.value)) {
			await changeRouteQuery(entityType);
		}

		prepareReportLayoutOptions();
	}

	async function getCurrencies() {
		const res = await getCurrencyList({ pageSize: 1000 });
		currencies.value = [...res.results];

		if (isEmpty(currencies.value)) {
			const res = await getDefaultList();
			const ecosystemDefaultData = res?.results[0];

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

	async function getTableData({ type = 'group', entityType, options, path = [] }) {
		console.log('getTableData => ', path);
		const data =
			type === 'group'
				? await getGroupList(options, entityType)
				: await getItemList(options, entityType);
		type === 'group' && console.log('groupList => ', data);
		type !== 'group' && console.log('itemList => ', data);

		set(tableData.value, [...path, 'totalChildren'], get(data, 'count', 0));
		const results = get(data, 'results', []);
		const newChildren =
			type === 'group'
				? results.reduce((res, item) => {
						res[item.___group_identifier] = {
							...item,
							rowId: item.___group_identifier,
							is_open: false,
							parents: path.filter((i) => i !== 'children'),
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
		const reportOptions = cloneDeep(get(currentLayout.value, ['data', 'reportOptions'], {}));

		if (entityType === 'transaction-report') {
			reportOptions.filters = cloneDeep(get(currentLayout.value, ['data', 'filters'], []));
		}

		reportOptions.page = options.page;
		reportOptions.page_size = options.page_size;
		reportOptions.frontend_request_options = cloneDeep(options.frontend_request_options);
		reportOptions.frontend_request_options.columns = cloneDeep(
			get(currentLayout.value, ['data', 'columns'], [])
		);
		// reportOptions.frontend_request_options['globalTableSearch'] = globalTableSearch

		if (sortGroup.value.key) {
			reportOptions.frontend_request_options.groups_order = sortGroup.value.sort;
			reportOptions.frontend_request_options.ordering_mode = sortGroup.value.key;
		}

		reportOptions.frontend_request_options.filter_settings = get(
			currentLayout.value,
			['data', 'filters'],
			[]
		).reduce((res, filter) => {
			if (isFilterValid(filter)) {
				res.push({
					key: entityPluralToSingular(filter.key),
					filter_type: filter.options?.filter_type,
					value_type: filter.value_type,
					value: filter.options?.filter_values
				});
			}

			return res;
		}, []);

		const data = await getListReportGroups(entityType, reportOptions);
		reportOptions.report_instance_id = data.report_instance_id;
		reportOptions.created_at = data.created_at;

		if (data.portfolios_object) {
			reportOptions.portfolios_table_data_objects = data?.portfolios_object;
		} else if (data.items) {
			reportOptions.portfolios_table_data_items = data?.items;
		}

		set(currentLayout.value, ['data', 'reportOptions'], reportOptions);

		return {
			next: null,
			previous: null,
			count: data?.count,
			results: cloneDeep(
				(data?.items || []).map((i) => ({
					...i,
					___group_identifier: i.___group_identifier || '-'
				}))
			)
		};
	}

	async function getItemList(options, entityType) {
		const reportOptions = cloneDeep(get(currentLayout.value, ['data', 'reportOptions'], {}));

		if (entityType === 'transaction-report') {
			reportOptions.filters = cloneDeep(get(currentLayout.value, ['data', 'filters'], []));
		}

		reportOptions.page = options.page;
		reportOptions.page_size = options.page_size;
		reportOptions.frontend_request_options = cloneDeep(options.frontend_request_options);
		reportOptions.frontend_request_options.columns = cloneDeep(
			get(currentLayout.value, ['data', 'columns'], [])
		);
		// reportOptions.frontend_request_options['globalTableSearch'] = globalTableSearch

		if (sortColumn.value.key) {
			reportOptions.frontend_request_options.items_order = sortColumn.value.sort;
			reportOptions.frontend_request_options.ordering = sortColumn.value.key;
		}

		reportOptions.frontend_request_options.filter_settings = get(
			currentLayout.value,
			['data', 'filters'],
			[]
		).reduce((res, filter) => {
			if (isFilterValid(filter)) {
				res.push({
					key: entityPluralToSingular(filter.key),
					filter_type: filter.options?.filter_type,
					value_type: filter.value_type,
					value: filter.options?.filter_values
				});
			}

			return res;
		}, []);

		const data = await getListReportItems(entityType, reportOptions);
		reportOptions.report_instance_id = data?.report_instance_id;
		reportOptions.created_at = data?.created_at;

		set(currentLayout.value, ['data', 'reportOptions'], reportOptions);

		return {
			next: null,
			previous: null,
			count: data?.count,
			results: cloneDeep(data?.items || [])
		};
	}

	return {
		entityType,
		contentType,
		isLoading,
		currencies,
		currentCurrency,
		sortGroup,
		sortColumn,
		syncedTime,
		layouts,
		currentLayout,
		groups,
		groupIds,
		groupRows,
		columns,
		columnsWithoutGroups,
		visibleColumns,
		isExtendedColumnsMode,
		tableData,
		changeRouteQuery,
		getLayouts,
		getCurrencies,
		getTableData,
		getGroupList,
		getItemList
	};
});
