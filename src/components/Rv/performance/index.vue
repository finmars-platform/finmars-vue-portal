<template>
	<CommonEntityViewer type="report.performance" @refresh="refresh()">
		<template #default="{ reportOptions, components }">
			<div class="fm_container">
				<RvPerformanceBundles
					ref="bundlesTable"
					v-model:open="components.period"

                    :begin_date="reportOptions.begin_date"
					:end_date="reportOptions.end_date"
					:calculation_type="reportOptions.calculation_type"
					:report_currency="reportOptions.report_currency"
                    :bundlesIds="reportOptions.bundles"
                    :performance_unit="reportOptions.performance_unit"

                    :is-disabled="disableBundledTable"
					@setBundle="onBundleChange"
				/>

				<RvPerformanceDetail
					v-model:open="components.detail"

					:bundle="currentBundle"
					:end_date="reportOptions.end_date"
					:calculation_type="reportOptions.calculation_type"
					:report_currency="reportOptions.report_currency"
                    :performance_unit="reportOptions.performance_unit"

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

let bundlesTable = ref(null);
let testRef = ref(null);
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
	bundlesTable.value.reloadTableD();
	// bundlesRefreshFunc()
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
