import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { defineStore } from 'pinia';
import dayjs from 'dayjs';
import isEmpty from 'lodash/isEmpty';
import has from 'lodash/has';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import set from 'lodash/set';
import { getListLayout } from '~/services/uiService';
import { getListReportGroups, getListReportItems } from '~/services/entity/entityResolverService';
import { isFilterValid } from '~/utils/evRvCommonHelper';
import { entityPluralToSingular } from '~/utils/queryParamsHelper';
import { getListLight as getCurrencyList } from '~/services/currency/currencyService';
import { getList as getDefaultList } from '~/services/ecosystemDefaultService';
import { REPORT_DATA_PROPERTIES } from '~/components/pages/reports/common/constants';

const itemsPerPage = 40;

export const useBalanceReportStore = defineStore('balance-report', () => {
	const router = useRouter();

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
		___group_type_key: 'root',
		___group_name: 'root',
		totalChildren: 0,
		children: []
	});

	const groups = computed(() => get(currentLayout.value, ['data', 'grouping'], []));
	const groupIds = computed(() => groups.value.map((gr) => gr.___group_type_id));
	const columns = computed(() => get(currentLayout.value, ['data', 'columns'], []));
	const visibleColumns = computed(() => columns.value.filter((col) => !col.isHidden));

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

	function prepareTableDataRequestOptions({ page = 1, pageSize = itemsPerPage, groupValue = [] }) {
		const options = {
			frontend_request_options: {
				columns: get(currentLayout.value, ['data', 'columns'], []),
				filter_settings: get(currentLayout.value, ['data', 'filters'], []).map((item) => ({
					key: item.key,
					filter_type: item.options.filter_type,
					value_type: item.value_type,
					value: item.options.filter_values
				})),
				globalTableSearch: '',
				groups_types: get(currentLayout.value, ['data', 'grouping'], []).reduce(
					(acc, item, index) => {
						if (index < 1) {
							acc.push(item);
						}

						return acc;
					},
					[]
				),
				group_values: groupValue
			},
			page,
			page_size: pageSize
		};

		return options;
	}

	async function getTableData(type = 'group', entityType, options) {
		if (type === 'group') {
			const groupList = await getGroupList(options, entityType);
			console.log('groupList => ', groupList);
			tableData.value.totalChildren = get(groupList, 'count', 0);
			tableData.value.children = get(groupList, 'results', []).map((item) => ({
				...item,
				rowId: item.___group_identifier,
				totalChildren: 0,
				children: []
			}));
			console.log('<-- !!!!! -->');
		} else {
			const itemList = await getItemList(options, entityType);
			console.log('itemList => ', itemList);
			tableData.value.totalChildren = get(itemList, 'count', 0);
			tableData.value.children = get(itemList, 'results', []).map((item) => ({
				...item,
				rowId: item.___column_id
			}));
		}
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
			results: cloneDeep(data?.items || [])
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
		columns,
		visibleColumns,
		tableData,
		changeRouteQuery,
		getLayouts,
		getCurrencies,
		prepareTableDataRequestOptions,
		getTableData,
		getGroupList,
		getItemList
	};
});
