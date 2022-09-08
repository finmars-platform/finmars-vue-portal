<template>
	<BaseModal title="Settings"
						 @cancel="cancel()"
						 v-model="openDialog">

		<template #default>
			<div class="rs_mc_wrap">
				<div v-if="getReadyStatus()">

					<RvSettingsBlock title="General">

						<RvSettingsRow label="Date to">
							<FmInputDate v-model="endDate" />
						</RvSettingsRow>

						<RvSettingsRow label="Reporting currency">
							<FmSelect v-model="currency"
												:items="currencyOpts" />
						</RvSettingsRow>

						<RvSettingsRow label="Pricing policy">
							<FmSelect v-model="pricingPolicy"
												:items="pricingPoliciesOpts" />
						</RvSettingsRow>

						<RvSettingsRow label="Return calculations">
							<FmSelect v-model="calculationType"
												:items="calcTypeOpts" />
						</RvSettingsRow>

						<RvSettingsRow label="Time grain">
							<FmSelect v-model="segmentationType"
												:items="segmentTypeOpts" />
						</RvSettingsRow>

<!--						<RvSettingsRow label="Days Convention">
							<FmSelect v-model="daysConv"
												:items="daysConventionOpts" />
						</RvSettingsRow>-->

<!--						<RvSettingsRow label="Graph type">
							<FmSelect v-model="graphType"
												:items="graphTypeOpts" />
						</RvSettingsRow>-->

					</RvSettingsBlock>

					<!--		<RvSettingsBlock title="Filters">

							</RvSettingsBlock>-->

<!--					<RvSettingsBlock title="Sections">
						<FmCheckbox v-model="showPeriod" label="Period returns" class="m-b-20" />

						<FmCheckbox v-model="showDetail" label="Monthly returns" class="m-b-20"  />

						<FmCheckbox v-model="showDiagram" label="Graphs" class="m-b-20" />
					</RvSettingsBlock>-->

				</div>

				<div v-if="!getReadyStatus()" class="flex-row fc-center">
					<FmLoader />
				</div>
			</div>
		</template>

		<template #controls>
			<div class="flex-row fc-space-between">
				<FmBtn type="basic" @click="cancel()">CANCEL</FmBtn>

				<FmBtn @click="save()">SAVE</FmBtn>
			</div>
		</template>

	</BaseModal>
</template>

<script setup>

	// import {defineProps} from "vue";

	let props = defineProps({
		'openDialog': Boolean,
		'layoutReadyStatus': Boolean,
		'viewerData': Object,
	});
	let emit = defineEmits(['cancel', 'save']);

	//<editor-fold desc="Variables">
	let endDate = ref(null);

	let currency = ref(null);
	let currencyOpts = ref([]);

	let pricingPolicy = ref(null);
	let pricingPoliciesOpts = ref([]);

	let calculationType = ref(null);
	let calcTypeOpts = [
		{
			id: "time_weighted",
			name: "Time-Weighted Return"
		},
		/*{
			id: "money_weighted",
			name: "Money Weighted Return"
		},
		{
			id: "pnl_currency",
			name: "P&L in Currency"
		}*/
	];

	let segmentationType = ref('days');

	let segmentTypeOpts = [
		{
			id: 'days',
			name: 'Day'
		},
		{
			id: 'months',
			name: 'Month'
		}
	];

	let daysConv = ref(null);
	let daysConventionOpts = [
		/*{
			id: "working_days",
			name: "Working days"
		},*/
		{
			id: "calendar_days",
			name: "Working days"
		},
	]

	let graphType = ref(null);
	let graphTypeOpts = [{
		id: '1',
		name: "Cummulative return + Monthly"
	}]

	let showPeriod = ref(true);
	let showDetail = ref(true);
	let showDiagram = ref(true);

	let readyStatus = ref(false);
	//</editor-fold>

	function getReadyStatus () {
		return readyStatus.value && props.layoutReadyStatus;
	}

	function fetchPpOpts () {

		return new Promise(async (resolve, reject) => {

			const ppData = await useApi('pricingPoliciesLight.get');

			if (ppData.error) {
				reject(ppData.error)

			} else {

				pricingPoliciesOpts.value = ppData.results;

				resolve()

			}

		})

	}

	function fetchCurrenciesOpts () {

		return new Promise(async (resolve, reject) => {

			const ppData = await useApi('currenciesLight.get');

			if (ppData.error) {
				reject(ppData.error);

			} else {

				currencyOpts.value = ppData.results;

				resolve();

			}

		})

	}

	function cancel() {
		emit('cancel');
	}

	function save() {

		props.viewerData.reportOptions.end_date = endDate.value;
		props.viewerData.reportOptions.report_currency = currency.value;
		props.viewerData.reportOptions.pricing_policy = pricingPolicy.value;
		props.viewerData.reportOptions.calculation_type = calculationType.value;
		props.viewerData.reportOptions.segmentation_type = segmentationType.value;

		/* props.viewerData.components.period = showPeriod.value;
		props.viewerData.components.detail = showDetail.value;
		props.viewerData.components.diagram = showDetail.value; */

		emit('save');

	}

	watch( () => props.viewerData.reportOptions, () => {

		endDate.value = props.viewerData.reportOptions.end_date;
		currency.value = props.viewerData.reportOptions.report_currency;
		pricingPolicy.value = props.viewerData.reportOptions.pricing_policy;
		calculationType.value = props.viewerData.reportOptions.calculation_type;
		segmentationType.value = props.viewerData.reportOptions.segmentation_type;

	});

	watch( () => props.viewerData.components, () => {
		showPeriod.value = props.viewerData.components.period;
		showDetail.value = props.viewerData.components.detail;
		showDiagram.value = props.viewerData.components.diagram;
	});

	function init () {

		Promise.all([fetchPpOpts(), fetchCurrenciesOpts()]).then((data) => {
			readyStatus.value = true;
		});

	}

	init();

</script>

<style lang="scss" scoped>
	.rs_mc_wrap {
		width: 570px;
		padding-left: 8px;
	}
</style>
