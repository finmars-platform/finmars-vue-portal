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
					:reportOptions="reportOptions"

					@setBundle="currentBundle = $event"
					@refreshFunc="bundlesRefreshFunc = $event"
				/>

				<RvPerformanceDetail
					:currentBundle="currentBundle"

					:begin_date="reportOptions.begin_date"
					:end_date="reportOptions.end_date"
					:calculation_type="reportOptions.calculation_type"
					:report_currency="reportOptions.report_currency"

					@setMonth="currentBundleYear = $event"
					@refresh="refresh()"
				/>

				<RvPerformanceChart
					:yearData="currentBundleYear"
				/>
			</div>
		</template>
	</CommonEntityViewer>
</template>

<script setup>

	provide('refreshReport', refresh);

	const route = useRoute();

	let currentBundle = ref({})
	let currentBundleYear = ref({})
	let bundlesRefreshFunc = () => {}

	function refresh() {
		bundlesRefreshFunc()
	}

	watch(
		() => route.query.layout,
		async () => {
			await fetchListLayout();
			refresh();
		}
	)

</script>

<style lang="scss" scoped>

</style>
