<template>
	<BaseModal title="Settings">
		<div v-show="readyStatus" class="rs_mc_wrap">
			<RvSettingsBlock title="General">
				<RvSettingsRow label="Date to">
					<FmInputDate v-model="reportOptions.end_date" />
				</RvSettingsRow>

				<RvSettingsRow label="Reporting currency">
					<!--					<FmSelect v-model="reportOptions.report_currency" :items="currencyOpts" />-->
					<FmUnifiedDataSelect v-model="reportOptions.report_currency"
															 :itemObject="reportOptions.report_currency_object"
															 content_type="currencies.currency" />
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
					<BaseMultiSelectInput
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

		<div v-if="!readyStatus" class="flex-row fc-center">
			<FmLoader />
		</div>

		<template #controls>
			<div class="flex-row fc-space-between">
				<FmBtn type="basic" @click="cancel()">CANCEL</FmBtn>

				<FmBtn v-model:loading="notReady" @click="save()">SAVE</FmBtn>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>

let props = defineProps({
	openDialog: Boolean,
	layoutReadyStatus: Boolean,
	bundles: Object,
});
let emit = defineEmits(["cancel", "save"]);

const viewerData = inject('viewerData');

const readyStatusData = reactive({
	currency: false,
	pricingPolicy: false,
});

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
	let ready = props.layoutReadyStatus;

	Object.keys(readyStatusData).forEach(status => {
		ready = ready && readyStatusData[status];
	})

	return ready;
});

let notReady = computed(() => {
	return !readyStatus.value;
});

init();

let reportOptions = ref({...viewerData.reportOptions})

watch(
	() => viewerData.reportOptions,
	() => {
		reportOptions.value = { ...viewerData.reportOptions }
	}
);

let components = ref({ ...viewerData.components })
watch(
	() => viewerData.components,
	() => {
		components.value = { ...viewerData.components }
	}
);


async function fetchPpOpts() {
	const ppData = await useLoadAllPages('pricingPolicyListLight.get', {filters: {page: 1, page_size: 1000}});

	if (!ppData.error) {
		pricingPoliciesOpts.value = ppData;
		readyStatusData.pricingPolicy = true;
	}
}

async function fetchCurrenciesOpts() {
	const currencyData = await useLoadAllPages('currencyListLight.get', {filters: {page: 1, page_size: 1000}});

	if (!currencyData.error) {
		currencyOpts.value = currencyData;
		readyStatusData.currency = true;
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
