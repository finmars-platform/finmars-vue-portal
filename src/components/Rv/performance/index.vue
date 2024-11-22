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

					:sortSettings="periodSortSettings"
					@sortingChanged="onPeriodSortChange"

                    :isDisabled="disableBundledTable"
					@setBundle="onBundleChange"
				/>

				<RvPerformanceDetail
					v-model:open="components.detail"

					:bundle="currentBundle"
					:end_date="reportOptions.end_date"
					:calculation_type="reportOptions.calculation_type"
					:report_currency="reportOptions.report_currency"
                    :performance_unit="reportOptions.performance_unit"

					:sortSettings="detailSortSettings"
					@sortingChanged="onDetailsSortChange"

					@setYear="currentBundleYear = $event"

					@refresh="refresh()"
				/>

				<RvPerformanceChart
					v-model:open="components.diagram"
					:bundle="currentBundle"
					:yearData="currentBundleYear"

                    :calculation_type="reportOptions.calculation_type"
                    :report_currency="reportOptions.report_currency"
                    :performance_unit="reportOptions.performance_unit"

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

let periodSortSettings = ref(null);
let detailSortSettings = ref(null);

function getPerformanceViewerData() {

	function getPeriodDefaultData() {
		return {
			sortSettings: {}
		}
	}

	function getDetailDefaultData() {
		return {
			sortSettings: {}
		}
	}

	return reactive({
		listLayout: {},
		reportLayoutOptions: {},
		reportOptions: {},
		additions: {},
		components: {},
		exportOptions: {},

		periodComponent: getPeriodDefaultData(),

		detailComponent: getDetailDefaultData(),

		layoutToOpen: null, // id of layout

		content_type: 'reports.performancereport',
		entityType: 'reports-performance', // TODO: remove and use only content_type

		isReport: true,
		isRootEntityViewer: true,
		newLayout: false,
		viewerContext: 'entity_viewer',

		/*setListLayout(listLayout) {
				this.state.listLayout = listLayout;
			},

			setReportOptions(ro) {
				this.state.reportOptions = ro;
			},

			setAdditions(additions) {
				this.state.additions = additions;
			},

			setComponents(components) {
				this.state.components = components;
			},

			setExportOptions(options) {
				this.state.exportOptions = options;
			},*/

		/**
		 * Apply layout on front-end
		 *
		 * @param {Object} listLayout - layout as it is stored on backend plus little changes
		 * @param {Object} ecosystemDefaults
		 */
		setLayoutCurrentConfiguration(listLayout, ecosystemDefaults) {
			if (listLayout) {
				this.newLayout = false
				listLayout = useRecursiveDeepCopy(listLayout)
			} else {
				this.newLayout = true

				/*let edRes = await useApi('ecosystemDefaults.get');

					const ecosystemDefaults = (edRes.error) ? {} : edRes.results[0];*/

				listLayout = getEmptyLayoutData(
					JSON.parse(JSON.stringify(ecosystemDefaults))
				)
			}

			//region Setup data for FmInputDateComplex
			if (!listLayout.data.hasOwnProperty('reportLayoutOptions')) {
				listLayout.data.reportLayoutOptions = {}
			}

			if (
				!listLayout.data.reportLayoutOptions.hasOwnProperty(
					'datepickerOptions'
				)
			) {
				listLayout.data.reportLayoutOptions.datepickerOptions = {}
			}

			if (
				!listLayout.data.reportLayoutOptions.datepickerOptions.hasOwnProperty(
					'reportFirstDatepicker'
				)
			) {
				listLayout.data.reportLayoutOptions.datepickerOptions.reportFirstDatepicker =
					{}
			}

			if (
				!listLayout.data.reportLayoutOptions.datepickerOptions.hasOwnProperty(
					'reportLastDatepicker'
				)
			) {
				listLayout.data.reportLayoutOptions.datepickerOptions.reportLastDatepicker =
					{
						expression: 'last_business_day(now())',
						datepickerMode: 'expression',
					}
			}
			//endregion

			this.components = JSON.parse(JSON.stringify(listLayout.data.components))
			this.reportLayoutOptions = JSON.parse(
				JSON.stringify(listLayout.data.reportLayoutOptions)
			)
			this.reportOptions = JSON.parse(
				JSON.stringify(listLayout.data.reportOptions)
			)

			this.additions = JSON.parse(JSON.stringify(listLayout.data.additions))
			this.exportOptions = JSON.parse(
				JSON.stringify(listLayout.data.exportOptions)
			)

			if (listLayout.data.periodComponent) {

				this.periodComponent = JSON.parse(JSON.stringify(listLayout.data.periodComponent));

			}
			else {

				this.periodComponent = getPeriodDefaultData();

			}

			periodSortSettings.value = JSON.parse(JSON.stringify(this.periodComponent.sortSettings))

			if (listLayout.data.detailComponent) {

				this.detailComponent = JSON.parse(JSON.stringify(listLayout.data.detailComponent));

			} else {

				this.detailComponent = getDetailDefaultData();

			}

			detailSortSettings.value = JSON.parse(JSON.stringify(this.detailComponent.sortSettings))

			this.listLayout = listLayout

			/*this.setComponents(JSON.parse(JSON.stringify(listLayout.data.components)));
				this.setReportOptions(JSON.parse(JSON.stringify(listLayout.data.reportOptions)));
				this.setAdditions(JSON.parse(JSON.stringify(listLayout.data.additions)));
				this.setExportOptions(JSON.parse(JSON.stringify(listLayout.data.exportOptions)));

				this.setListLayout(listLayout);*/
		},

		getLayoutCurrentConfiguration() {
			let listLayout = useRecursiveDeepCopy(this.listLayout)
			delete listLayout.newLayout;

			listLayout.data.components = { ...{}, ...this.components }
			listLayout.data.reportLayoutOptions = JSON.parse(
				JSON.stringify(this.reportLayoutOptions)
			)
			listLayout.data.reportOptions = JSON.parse(
				JSON.stringify(this.reportOptions)
			)

			listLayout.data.additions = JSON.parse(JSON.stringify(this.additions))
			listLayout.data.exportOptions = JSON.parse(
				JSON.stringify(this.exportOptions)
			)

			listLayout.data.periodComponent = JSON.parse(JSON.stringify(this.periodComponent));
			listLayout.data.detailComponent = JSON.parse(JSON.stringify(this.detailComponent));

			return listLayout
		},

		/**
		 *
		 * @param {Object|{}|null} sortSettings
		 * @param {String} sortSettings.key - key of a column to sort by
		 * @param {String} sortSettings.direction - direction of sorting. Values: 'asc', 'desc'
		 */
		setDetailSortSettings(sortSettings) {

			if ( sortSettings?.hasOwnProperty('direction') && !['asc', 'desc'].includes(sortSettings.direction) ) {

				console.trace("[viewerData.setDetailSortSettings] Error");

				throw new Error(
					"[viewerData.setDetailSortSettings] Invalid values for the property " +
					`'sortSettings.direction': ${sortSettings.direction}`
				);

			}

			this.detailComponent.sortSettings = sortSettings || {};

		},

		getDetailSortSettings() {
			return this.detailComponent.sortSettings;
		},

		/**
		 *
		 * @param {Object|{}|null} sortSettings
		 * @param {String} sortSettings.key - key of a column to sort by
		 * @param {String} sortSettings.direction - direction of sorting. Values: 'asc', 'desc'
		 */
		setPeriodSortSettings(sortSettings) {

			if ( sortSettings?.hasOwnProperty('direction') && !['asc', 'desc'].includes(sortSettings.direction) ) {

				console.trace("[viewerData.setPeriodSortSettings] Error");

				throw new Error(
					"[viewerData.setPeriodSortSettings] Invalid values for the property " +
					`'sortSettings.direction': ${sortSettings.direction}`
				);

			}

			this.periodComponent.sortSettings = sortSettings || {};

		},

		getPeriodSortSettings() {
			return this.periodComponent.sortSettings;
		},

		/*get reportOptions() {
				return this.state.reportOptions;
			},

			get components() {
				return this.state.components;
			},

			get exportOptions() {
				return this.state.exportOptions;
			},*/
	})
}

let viewerData = getPerformanceViewerData()

provide("viewerData", viewerData);

function onPeriodSortChange(newVal) {

	if (newVal) {

		viewerData.setPeriodSortSettings(newVal);

	} else {
		viewerData.setPeriodSortSettings(null);
	}

}

function onDetailsSortChange(newVal) {

	if (newVal) {

		viewerData.setDetailSortSettings(newVal);

	} else {
		viewerData.setDetailSortSettings(null);
	}

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
