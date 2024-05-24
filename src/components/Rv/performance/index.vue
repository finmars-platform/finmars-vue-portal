<template>
	<CommonEntityViewer type="report.performance" @refresh="refreshD()">
		<template #default="{ reportOptions, components }">
			<div class="fm_container">
				<RvPerformanceBundles
					ref="bundlesComp"
					v-model:open="components.period"
					:begin_date="reportOptions.begin_date"
					:end_date="reportOptions.end_date"
					:calculation_type="reportOptions.calculation_type"
					:report_currency="reportOptions.report_currency"
					:reportOptions="reportOptions"
					:is-disabled="disableBundledTable"
					@setBundle="onBundleChange"
				/>

				<RvPerformanceDetail
					v-model:open="components.detail"
					:bundle="currentBundle"
					:end_date="reportOptions.end_date"
					:reportOptions="reportOptions"
					:calculation_type="reportOptions.calculation_type"
					:report_currency="reportOptions.report_currency"
					@loadingDataStart="disableBundledTable = true"
					@loadingDataEnd="disableBundledTable = false"
					@setYear="currentBundleYear = $event"
					@refresh="refreshD()"
				/>

				<RvPerformanceChart
					v-model:open="components.diagram"
					:bundle="currentBundle"
					:yearData="currentBundleYear"
					:reportOptions="reportOptions"
					@setMonth="currentBundleMonth = $event"
				/>

				<RvPerformanceTransactions
					v-model:open="components.detail"
					:bundle="currentBundle"
					:yearData="currentBundleYear"
					:monthData="currentBundleMonth"
					:reportOptions="reportOptions"
					@refresh="refreshD()"
				/>


			</div>
		</template>
	</CommonEntityViewer>
</template>

<script setup>

const route = useRoute()

const bundlesComp = ref(null);

let currentBundle = ref({})
let currentBundleYear = ref({})
let currentBundleMonth = ref({})

let disableBundledTable = ref(false);

const refreshD = useDebounce(function () {

	bundlesComp.value.init();

	currentBundle.value = null;
	currentBundleYear.value = null;
	currentBundleMonth.value = null;
}, 1000);

provide('refreshReport', refreshD)

function onBundleChange(newVal) {

    /* *
     * currentBundleYear should be assigned before currentBundle
     * to empty RvPerformanceChart and RvPerformanceTransactions
     * */
    currentBundleYear.value = null;
    currentBundleMonth.value = null;

    currentBundle.value = newVal;

}

watch(
	() => route.query.layout,
	async () => {
		await fetchListLayout()
		refresh()
	}
)
</script>

<style lang="scss" scoped></style>
