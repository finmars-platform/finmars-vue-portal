<template>
	<BaseModal title="Settings">
		<div class="rs_mc_wrap" v-if="readyStatus">
			<RvSettingsBlock title="General">
				<RvSettingsRow label="Date to">
					<FmInputDate v-model="reportOptions.end_date" />
				</RvSettingsRow>

				<RvSettingsRow label="Reporting currency">
					<FmSelect v-model="reportOptions.report_currency" :items="currencyOpts" />
				</RvSettingsRow>

				<RvSettingsRow label="Pricing policy">
					<FmSelect v-model="reportOptions.pricing_policy" :items="pricingPoliciesOpts" />
				</RvSettingsRow>

				<RvSettingsRow label="Return calculations">
					<FmSelect v-model="reportOptions.calculation_type" :items="calcTypeOpts" />
				</RvSettingsRow>

				<RvSettingsRow label="Time grain">
					<FmSelect v-model="reportOptions.segmentation_type" :items="segmentTypeOpts" />
				</RvSettingsRow>

				<!-- <RvSettingsRow label="Days Convention">
					<FmSelect v-model="daysConv" :items="daysConventionOpts" />
				</RvSettingsRow>

				<RvSettingsRow label="Graph type">
					<FmSelect v-model="graphType" :items="graphTypeOpts" />
				</RvSettingsRow> -->
			</RvSettingsBlock>

			<RvSettingsBlock title="Filters">
				<RvSettingsRow label="Portfolios and Bundles">
					<BaseMultiSelect
						v-model="reportOptions.bundles"
						title="Portfolios and Bundles"
						:items="bundles"
						item_id="id"
					/>
				</RvSettingsRow>
			</RvSettingsBlock>

			<RvSettingsBlock title="Sections">
				<FmCheckbox
					class="m-b-20"
					v-model="components.period"
					label="Period returns"
				/>

				<FmCheckbox
					class="m-b-20"
					v-model="components.detail"
					label="Monthly returns"
				/>

				<FmCheckbox v-model="components.diagram" label="Graphs" class="m-b-20" />
			</RvSettingsBlock>
		</div>
		<div class="flex-row fc-center" v-else>
			<FmLoader />
		</div>

		<template #controls>
			<div class="flex-row fc-space-between">
				<FmBtn type="basic" @click="cancel()">CANCEL</FmBtn>

				<FmBtn @click="save()">SAVE</FmBtn>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>

	let props = defineProps({
		openDialog: Boolean,
		layoutReadyStatus: Boolean,
		viewerData: Object,
		bundles: Object,
	});
	let emit = defineEmits(["cancel", "save"]);

	let currencyOpts = ref([]);
	let pricingPoliciesOpts = ref([]);
	let calcTypeOpts = [
		{
			id: "time_weighted",
			name: "Time-Weighted Return",
		},
		{
			id: "money_weighted",
			name: "Money Weighted Return",
		},
		/*{
			id: "",
			name: "P&L in Currency"
		}*/
	];
	let segmentTypeOpts = [
		{
			id: "days",
			name: "Day",
		},
		{
			id: "months",
			name: "Month",
		},
	];
	let daysConventionOpts = [
		/*{
			id: "working_days",
			name: "Working days"
		},*/
		{
			id: "calendar_days",
			name: "Working days",
		},
	];
	let graphTypeOpts = [
		{
			id: "1",
			name: "Cummulative return + Monthly",
		},
	];

	let readyStatus = computed(() => {
		return (
			currencyOpts.value && props.layoutReadyStatus && pricingPoliciesOpts.value
		);
	});

	init();

	let reportOptions = ref({...props.viewerData.reportOptions})
	watch(
		() => props.viewerData.reportOptions,
		() => {
			reportOptions.value = { ...props.viewerData.reportOptions }
		}
	);

	let components = ref({ ...props.viewerData.components })
	watch(
		() => props.viewerData.components,
		() => {
			components.value = { ...props.viewerData.components }
		}
	);


	async function fetchPpOpts() {
		const ppData = await useApi("pricingPoliciesLight.get");

		if (!ppData.error) {
			pricingPoliciesOpts.value = ppData.results;
		}
	}
	async function fetchCurrenciesOpts() {
		const ppData = await useApi("currenciesLight.get");

		if (!ppData.error) {
			currencyOpts.value = ppData.results;
		}
	}

	function cancel() {
		emit("cancel");
	}
	function save() {
		emit("save", [ reportOptions.value, components.value ]);
	}

	function init() {
		fetchPpOpts();
		fetchCurrenciesOpts();
	}
</script>

<style lang="scss" scoped>

</style>
