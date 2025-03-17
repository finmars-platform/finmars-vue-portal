import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { defineStore } from 'pinia';
import dayjs from 'dayjs';
import isEmpty from 'lodash/isEmpty';
import has from 'lodash/has';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import set from 'lodash/set';
import { getListLayout } from '~/services/uiService';
import { isFilterValid } from '~/utils/evRvCommonHelper';
import { entityPluralToSingular } from '~/utils/queryParamsHelper';
import { getListLight as getCurrencyList } from '~/services/currency/currencyService';
import { getList as getDefaultList } from '~/services/ecosystemDefaultService';
import { REPORT_DATA_PROPERTIES } from '~/components/pages/reports/common/constants';

export const useBalanceReportStore = defineStore('balance-report', () => {
	const router = useRouter();

	const layouts = ref([]);
	const currentLayout = ref({});
	const currencies = ref([]);
	const currentCurrency = ref('USD');
	const syncedTime = ref(null);

	async function getLayouts(entityType) {
		const res = await getListLayout(entityType, { pageSize: 1000 });
		layouts.value = res.results;

		const layout = (layouts.value || []).find((l) => l.is_default);
		currentLayout.value = cloneDeep(layout || {});

		if (!isEmpty(currentLayout.value)) {
			syncedTime.value = dayjs();

			const [dateFromKey, dateToKey] = REPORT_DATA_PROPERTIES[entityType];

			await router.push({
				query: {
					layout: currentLayout.value.id,
					costMethod: currentLayout.value.data.reportOptions.cost_method,
					currency: currentCurrency.value.user_code,
					...(entityType !== 'balance-report' && {
						dateFrom: currentLayout.value.data.reportOptions[dateFromKey]
					}),
					dateTo: currentLayout.value.data.reportOptions[dateToKey],
					useDateFromAbove: !!currentLayout.value.data.reportLayoutOptions.useDateFromAbove
				}
			});
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
	}

	return {
		layouts,
		currentLayout,
		currencies,
		currentCurrency,
		getLayouts,
		getCurrencies
	};
});
