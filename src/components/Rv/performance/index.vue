<template>
	<CommonEntityViewer
		type="report.performance"
		@refresh="refresh()"
	>
		<template #default="{ reportOptions }">
			<div class="fm_container">
				<RvPerformanceBundles
					:begin_date="reportOptions.begin_date"
					:end_date="reportOptions.end_date"
					:calculation_type="reportOptions.calculation_type"
					:report_currency="reportOptions.report_currency"

					@setBundle="currentBundle = $event"
				/>

				<RvPerformanceDetail
					:currentBundle="currentBundle"

					:begin_date="reportOptions.begin_date"
					:end_date="reportOptions.end_date"
					:calculation_type="reportOptions.calculation_type"
					:report_currency="reportOptions.report_currency"

					@setMonth="currentBundleYear = $event"
				/>

				<RvPerformanceChart
					:yearData="currentBundleYear"
				/>
			</div>
		</template>
	</CommonEntityViewer>
</template>

<script setup>

	const store = useStore();
	const route = useRoute();

	let currentBundle = ref({})
	let currentBundleYear = ref({})

	function refresh(e) {
		console.log('e:', e)
	}

	let panels = ref(['period', 'detail', 'diagram'])





	let newBundle = ref({
		name: '',
		short_name: computed(() => newBundle.value.name),
		user_code: computed(() => newBundle.value.name),
		public_name: computed(() => newBundle.value.name),
		registers: [],
	})

	async function fetchPrtfRegistersList() {

		readyStatusData.portfolioRegisters = false;

		const res = await useApi('portfolioRegisterEvFiltered.post', {
			body: '{"groups_types":[],"page":1,"groups_values":[],"groups_order":"asc","page_size":60,"ev_options":{"entity_filters":["enabled","disabled","active","inactive"]},"filter_settings":[],"global_table_search":"","is_enabled":"any"}'
		});

		if (!res.error) {

			res.results.forEach(addPrtfRegisterItem);

			readyStatusData.portfolioRegisters = true;

		}

	}


	let currencyListLight = ref([]);

	async function fetchCurrenciesLightList() {
		const res = await useApi('currencyListLight.get');

		if (!res.error) {
			currencyListLight.value = res.results;
		}
	}

	let pricingPolicyListLight = ref([]);

	async function fetchPricingPoliciesOpts() {
		const res = await useApi('currencyListLight.get');

		if (!res.error) {
			pricingPolicyListLight.value = res.results;
		}
	}

/*function resetNewBundle () {

	newBundle.value = {
		name: '',
		short_name: computed(() => newBundle.value.name),
		user_code: computed(() => newBundle.value.name),
		public_name: computed(() => newBundle.value.name),
		registers: [],
	};

}*/

/* async function createBundle() {
	let res = await useApi('portfolioBundles.post', {body: newBundle.value})

	if ( res ) {
		resetNewBundle();

		refresh()

		useNotify({
			type: 'success',
			title: 'Bundle created successfully'
		})
	}
} */

init()

//#region Main

/** Index of selected bundle **/
let activePeriod = ref(0)
/** Object of selected bundle **/
let activePeriodData = computed(() => {

	if (!activePeriod.value && activePeriod.value !== 0) {
		return null;
	}

	return bundles.value[activePeriod.value] || null;

})

/*let activePeriodName = computed(() => {

	if (!activePeriod.value && activePeriod.value !== 0) {
		return '';
	}

	const activePeriodData = bundles.value[activePeriod.value];

	return activePeriodData ? activePeriodData.name : '';

})*/
/*#endregion */

	watch(
		() => route.query.layout,
		async () => {
			await fetchListLayout();
			refresh();
		}
	)
	async function saveLayout () {

		if (viewerData.newLayout) {

			/*const layoutToSave = viewerData.getLayoutCurrentConfiguration();
			layoutToSave.name = "default";
			layoutToSave.user_code = "default";
			layoutToSave.is_default = true;

			let res = await useApi('listLayout.post', {body: layoutToSave});

			if (!res.error) {
				viewerData.newLayout = false;
				viewerData.listLayout = res;
				useNotify({type: 'success', title: 'Success. Page was saved.'})
			}*/
			openSaveAsModal.value = true;


		} else {
			useSaveEvRvLayout(store, viewerData);
		}

	}



	async function init() {

	// fetchPrtfRegistersList();
	// await Promise.all([fetchCurrenciesLightList(), fetchPricingPoliciesOpts()]);

	}

	provide('refreshReport', refresh);

	let detailsLoading = false
	// rework
	async function getEndDate() {

		if (viewerData.reportOptions?.end_date) {
			return viewerData.reportOptions?.end_date;
		}

		const roCopy = viewerData.reportOptions ? JSON.parse(JSON.stringify(viewerData.reportOptions)) : viewerData.reportOptions;
		console.error("No end_date set for performance report ", roCopy);

		// if there is expression for end_date, calculate it
		if (
			viewerData.reportLayoutOptions?.datepickerOptions?.reportLastDatepicker.datepickerMode !== 'datepicker' &&
			viewerData.reportLayoutOptions.datepickerOptions.reportLastDatepicker.expression
		) {

			const opts = {
				body: {
					is_eval: true,
					expression: viewerData.reportLayoutOptions.datepickerOptions.reportLastDatepicker.expression,
				}
			}

			const res = await useApi('expression.post', opts);

			viewerData.reportOptions.end_date = res.result;

			return viewerData.reportOptions.end_date;

		}

		const opts = {
			body: {
				is_eval: true,
				expression: 'last_business_day(now())',
			}
		}

		const res = await useApi('expression.post', opts);

		if (res.error) throw new Error(res.error);

		viewerData.reportOptions.end_date = res.result;

		return viewerData.reportOptions.end_date;

	}

</script>

<style lang="scss" scoped>
.split_panel_wrap {
	display: grid;
	height: calc(100vh - 161px);
}
.split_panel {
	background: #fff;
}
.split_panel_main {
	overflow: auto;
}
.split_panel_devider {
	height: 5px;
	border-top: 1px solid $border;
	border-bottom: 1px solid $border;
	cursor: row-resize;
}

</style>
