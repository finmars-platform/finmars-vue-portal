import { ref } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import isEmpty from 'lodash/isEmpty';
import has from 'lodash/has';
import { useEntityViewerStore } from '~/stores/useEntityViewerStore';
import { getListLayout } from '~/services/uiService';
import { getListLight as getCurrencyList } from '~/services/currency/currencyService';
import { getList as getDefaultList } from '~/services/ecosystemDefaultService';

export const useBalanceReportStore = defineStore('balance-report', () => {
	const entityViewerStore = useEntityViewerStore();
	const { data } = storeToRefs(entityViewerStore);

	const layouts = ref([]);
	const currencies = ref([]);
	const currentCurrency = ref('USD');

	async function getLayouts(entityType) {
		const res = await getListLayout(entityType, { pageSize: 1000 });
		layouts.value = res.results;
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
		if (!has(data.value.reportLayoutOptions, 'datepickerOptions')) {
			data.value.reportLayoutOptions.datepickerOptions = {};
		}

		if (!has(data.value.reportLayoutOptions.datepickerOptions, 'reportFirstDatepicker')) {
			data.value.reportLayoutOptions.datepickerOptions.reportFirstDatepicker = {};
		}

		if (!has(data.value.reportLayoutOptions.datepickerOptions, 'reportLastDatepicker')) {
			data.value.reportLayoutOptions.datepickerOptions.reportLastDatepicker = {};
		}

		if (typeof data.value.reportLayoutOptions.useDateFromAbove !== 'boolean') {
			data.value.reportLayoutOptions.useDateFromAbove = true;
		}
	}

	return {
		data,
		layouts,
		currencies,
		currentCurrency,
		getLayouts,
		getCurrencies,
		prepareReportLayoutOptions
	};
});
