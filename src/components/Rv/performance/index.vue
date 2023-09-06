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
					@setBundle="currentBundle = $event"
					@refreshFunc="bundlesRefreshFunc = $event"
				/>

				<RvPerformanceDetail
					v-model:open="components.detail"
					:bundleId="currentBundle"
					:begin_date="reportOptions.begin_date"
					:end_date="reportOptions.end_date"
					:calculation_type="reportOptions.calculation_type"
					:report_currency="reportOptions.report_currency"
					@setYear="currentBundleYear = $event"
					@refresh="refresh()"
				/>

				<RvPerformanceChart
					v-model:open="components.diagram"
					:yearData="currentBundleYear"
					@setMonth="currentBundleMonth = $event"
				/>

				<RvPerformanceTransactions
					v-model:open="components.detail"
					:bundleId="currentBundle"
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

let bundlesRefreshFunc = () => {
}



function refresh() {
	bundlesRefreshFunc()
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
