<template>
	<BaseModal title="Settings">
		<div>
			<div class="rs_mc_wrap">
				<RvSettingsBlock title="General">
					<RvSettingsRow label="Date to">
						<!--						<FmInputDate v-model="reportOptions.end_date" v-model:errorData="endDateErrorData" />-->
						<FmInputDateComplex
							v-model:firstDate="reportOptions.end_date"
							v-model:firstDatepickerOptions="
								reportLayoutOptions.datepickerOptions.reportLastDatepicker
							"
							v-model:errorData="endDateErrorData"
						/>
					</RvSettingsRow>

					<RvSettingsRow label="Reporting currency">
<!--						<FmUnifiedDataSelect
							v-model="reportOptions.report_currency"
							v-model:itemObject="reportOptions.report_currency_object"
							content_type="currencies.currency"
						/>-->
						<FmUnifiedDataSelect
							v-model="reportOptions.report_currency"
							propId="user_code"
							:selectedItemName="reportOptions.report_currency_object.name"
							content_type="currencies.currency"
							@itemSelected="newVal => reportOptions.report_currency_object = newVal"
						/>
					</RvSettingsRow>

					<RvSettingsRow label="Pricing policy">
						<FmSelect
							:modelValue="reportOptions.pricing_policy"
							:items="pricingPoliciesOpts"
							@update:modelValue="onPpChange"
						/>
					</RvSettingsRow>

					<RvSettingsRow label="Return calculations">
						<FmSelect
							v-model="reportOptions.calculation_type"
							:items="calcTypeOpts"
						/>
					</RvSettingsRow>

					<RvSettingsRow label="Time grain">
						<FmSelect
							v-model="reportOptions.segmentation_type"
							:items="segmentTypeOpts"
						/>
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
							label="Portfolios and Bundles"
							:items="bundles"
							item_id="id"
							item_title="user_code"
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

					<FmCheckbox
						v-model="components.diagram"
						label="Graphs"
						class="m-b-20"
					/>
				</RvSettingsBlock>
			</div>

			<!-- <div v-if="!readyStatus" class="flex-row fc-center">
				<FmLoader />
			</div> -->
		</div>

		<template #controls>
			<div class="flex-row fc-space-between">
				<FmBtn type="basic" @click="cancel()">CANCEL</FmBtn>

				<FmBtn :disabled="endDateErrorData" @click="save()">SAVE</FmBtn>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>
	const props = defineProps({
		openDialog: Boolean,
		bundles: Object,
	})
	const emit = defineEmits(['cancel', 'save'])

	const viewerData = inject('viewerData')

	let endDateErrorData = ref(null)

	let currencyOpts = ref([])
	let pricingPoliciesOpts = ref([])
	let calcTypeOpts = [
		// {
		// 	id: 'time_weighted',
		// 	name: 'Time-Weighted Return',
		// },
		{
			id: 'modified_dietz',
			name: 'Modified Dietz',
		},
		/*{
			id: "",
			name: "P&L in Currency"
		}*/
	]
	let segmentTypeOpts = [
		{
			id: 'days',
			name: 'Day',
		},
		{
			id: 'months',
			name: 'Month',
		},
	]
	let daysConventionOpts = [
		/*{
			id: "working_days",
			name: "Working days"
		},*/
		{
			id: 'calendar_days',
			name: 'Working days',
		},
	]
	let graphTypeOpts = [
		{
			id: '1',
			name: 'Cummulative return + Monthly',
		},
	]

	let reportOptions = ref({ ...viewerData.reportOptions })

	watch(
		() => viewerData.reportOptions,
		() => {
			reportOptions.value = JSON.parse(JSON.stringify(viewerData.reportOptions))
		},
		{ deep: true }
	)

	let reportLayoutOptions = ref({ ...viewerData.reportLayoutOptions })

	watch(
		() => viewerData.reportLayoutOptions,
		() => {
			reportLayoutOptions.value = JSON.parse(
				JSON.stringify(viewerData.reportLayoutOptions)
			)
		},
		{ deep: true }
	)

	let components = ref({ ...viewerData.components })
	watch(
		() => viewerData.components,
		() => {
			components.value = { ...viewerData.components }
		}
	)

	async function fetchPpOpts() {
		const ppData = await useLoadAllPages('pricingPolicyListLight.get', {
			filters: { page: 1, page_size: 1000 },
		})

		if (!ppData.error) {
			pricingPoliciesOpts.value = ppData
		}
	}

	async function fetchCurrenciesOpts() {
		const currencyData = await useLoadAllPages('currencyListLight.get', {
			filters: { page: 1, page_size: 1000 },
		})

		if (!currencyData.error) {
			currencyOpts.value = currencyData
		}
	}

	function onPpChange(newVal) {
		reportOptions.value.pricing_policy = newVal
		const ppObj = pricingPoliciesOpts.value.find(
			(pPolicy) => pPolicy.id === newVal
		)

		reportOptions.value.pricing_policy_object = JSON.parse(
			JSON.stringify(ppObj)
		)
	}

	function cancel() {
		emit('cancel')
	}
	function save() {
		emit('save', [
			reportOptions.value,
			reportLayoutOptions.value,
			components.value,
		])
	}

	function init() {
		fetchPpOpts()
		fetchCurrenciesOpts()
	}

	init()
</script>

<style lang="scss" scoped></style>
