<template>
	<CommonEntityViewer type="report.performance" @refresh="refresh()">
		<template #default="{ reportOptions, components }">
			<div class="fm_container">
				<RvPerformanceBundles
					v-model:open="components.period"
					:begin_date="reportOptions.begin_date"
					:end_date="reportOptions.end_date"
					:calculation_type="reportOptions.calculation_type"
					:report_currency="reportOptions.report_currency"
					:reportOptions="reportOptions"
					:is-disabled="disableBundledTable"
					@setBundle="onBundleChange"
					@refreshFunc="(func) => bundlesRefreshFunc = func"
				/>

				<RvPerformanceDetail
					v-model:open="components.detail"
					:bundle="currentBundle"
					:begin_date="reportOptions.begin_date"
					:end_date="reportOptions.end_date"
					:reportOptions="reportOptions"
					:calculation_type="reportOptions.calculation_type"
					:report_currency="reportOptions.report_currency"
					@loadingDataStart="disableBundledTable = true"
					@loadingDataEnd="disableBundledTable = false"
					@setYear="currentBundleYear = $event"
					@refresh="refresh()"
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
					@refresh="refresh()"
				/>


			</div>
		</template>
	</CommonEntityViewer>
</template>

<script setup>
provide('refreshReport', refresh)

const route = useRoute()

let currentBundle = ref({})
let currentBundleYear = ref({})
let currentBundleMonth = ref({})

let disableBundledTable = ref(false);

let bundlesRefreshFunc = () => {
}

function onBundleChange(newVal) {

    /* *
     * currentBundleYear should be assigned before currentBundle
     * to empty RvPerformanceChart and RvPerformanceTransactions
     * */
    currentBundleYear.value = null;
    currentBundleMonth.value = null;

    currentBundle.value = newVal;

}

function refresh() {
	bundlesRefreshFunc()
    currentBundleYear.value = null;
    currentBundleMonth.value = null;
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
