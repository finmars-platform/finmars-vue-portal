<template>
	<div class="container">
		<h1 class="title">Ecosystem Default</h1>
		<div class="wrapp-select">
			<FmSelect
				v-model="ecosystemDefaultsRef.instrument"
				label="InstrumentItems"
				:items="instrumentItems"
			/>
			<FmSelect
				v-model="ecosystemDefaultsRef.portfolio"
				label="Portfolio"
				:items="portfolioListLightItems"
			/>
			<FmSelect
				v-model="ecosystemDefaultsRef.account"
				label="Account"
				:items="billItems"
			/>
			<FmSelect
				v-model="ecosystemDefaultsRef.currency"
				label="Currency"
				:items="currencyItems"
			/>
		</div>
		<div class="wrapp-select">
			<FmSelect
				v-model="ecosystemDefaultsRef.instrument_type"
				label="Instrument Type"
				:items="instrumentTypeItems"
			/>
			<FmSelect
				v-model="ecosystemDefaultsRef.transaction_type"
				label="Transaction Type"
				:items="transactionTypeLightItems"
			/>
			<FmSelect
				v-model="ecosystemDefaultsRef.account_type"
				label="Account Type"
				:items="accountsTypeItems"
			/>
		</div>
		<div class="wrapp-select">
			<FmSelect
				v-model="ecosystemDefaultsRef.pricing_policy"
				label="Pricing Policy"
				:items="pricingPolicyListItems"
			/>
		</div>

		<div class="wrapp-select">
			<FmSelect
				v-model="ecosystemDefaultsRef.periodicity"
				label="Periodicity"
				:items="instrumentPeriodicityItems"
			/>
			<FmSelect
				v-model="ecosystemDefaultsRef.accrual_calculation_model"
				label="Accrual Calculation Model"
				:items="instrumentAccrualCalculationModelItems"
			/>
			<FmSelect
				v-model="ecosystemDefaultsRef.instrument_class"
				label="Instrument Class"
				:items="instrumentClassItems"
			/>
			<FmSelect
				v-model="ecosystemDefaultsRef.payment_size_detail"
				label="Payment Size Detail"
				:items="instrumentSizeDetailItems"
			/>
			<FmSelect
				v-model="ecosystemDefaultsRef.pricing_condition"
				label="Pricing Condition"
				:items="instrumentPricingСonditionItems"
			/>
		</div>
		<div class="wrapp-select">
			<FmSelect
				v-model="ecosystemDefaultsRef.responsible"
				label="Responsible"
				:items="counterpartyResponsibleLightItems"
			/>
			<FmSelect
				v-model="ecosystemDefaultsRef.responsible_group"
				label="Responsible Group"
				:items="instrumentItems"
			/>
			<FmSelect
				v-model="ecosystemDefaultsRef.counterparty"
				label="Counterparty"
				:items="counterpartyCounterpartyLightItems"
			/>
			<FmSelect
				v-model="ecosystemDefaultsRef.counterparty_group"
				label="Counterparty Group"
				:items="instrumentItems"
			/>
		</div>
		<div class="wrapp-select">
			<FmSelect
				v-model="ecosystemDefaultsRef.strategy1"
				label="Strategy 1"
				:items="strategiesOneLightItems"
			/>
			<FmSelect
				v-model="ecosystemDefaultsRef.strategy1_subgroup"
				label="Strategy 1 Group "
				:items="strategiesOneSubgroupItems"
			/>
<!--			<FmSelect
				v-model="ecosystemDefaultsRef.strategy1_subgroup"
				label="Strategy 1  Subgroup"
				:items=""
			/>-->
		</div>
		<div class="wrapp-select">
			<FmSelect
				v-model="ecosystemDefaultsRef.strategy2"
				label="Strategy 2"
				:items="strategiesSecondLightItems"
			/>
			<FmSelect
				v-model="ecosystemDefaultsRef.strategy2_subgroup"
				label="Strategy 2 Group"
				:items="strategiesSecondSubgroupItems"
			/>
<!--			<FmSelect
				v-model="ecosystemDefaultsRef.strategy2_subgroup"
				label="Strategy 2  Subgroup"
				:items="''"
			/>-->
		</div>
		<div class="wrapp-select">
			<FmSelect
				v-model="ecosystemDefaultsRef.strategy3"
				label="Strategy 3"
				:items="strategiesThirdLightItems"
			/>
			<FmSelect
				v-model="ecosystemDefaultsRef.strategy3_subgroup"
				label="Strategy 3 Group"
				:items="strategiesThirdSubgroupItems"
			/>
<!--			<FmSelect
				v-model="ecosystemDefaultsRef.strategy3_subgroup"
				label="Strategy 3 Subgroup"
				:items="''"
			/>-->
		</div>
		<div class="wrapp-select">
			<FmSelect
				v-model="ecosystemDefaultsRef.instrument_pricing_scheme"
				label="Instrument Pricing Scheme"
				:items="instrumentSchemeListItems"
			/>
			<FmSelect
				v-model="ecosystemDefaultsRef.currency_pricing_scheme"
				label="Currency Pricing Scheme"
				:items="currencySchemeListItems"
			/>
		</div>
		<FmBtn
			type="primary"
			class="g-toggle-filters-btn"
			@click="defaultSettingsCreate()"
			:disabled="disabledBtn"
		>
			Save
		</FmBtn>
	</div>
</template>

<script setup>
  definePageMeta({
		middleware: 'auth',
		bread: [
			{
				text: 'settings: DEFAULT SETTINGS',
				to: '/settings/default-settings',
			},
		],
	})

	const store = useStore();

	const instrumentItems = ref([])
	const portfolioListLightItems = ref([])
	const billItems = ref([])
	const currencyItems = ref([])
	const instrumentTypeItems = ref([])
	const transactionTypeLightItems = ref([])
	const accountsTypeItems = ref([])
	const pricingPolicyListItems = ref([])
	const instrumentPeriodicityItems = ref([])
	const instrumentAccrualCalculationModelItems = ref([])
	const instrumentClassItems = ref([])
	const instrumentSizeDetailItems = ref([])
	const instrumentPricingСonditionItems = ref([])
	const counterpartyResponsibleLightItems = ref([])
	const counterpartyCounterpartyLightItems = ref([])
	const strategiesOneLightItems = ref([])
	const strategiesOneSubgroupItems = ref([])
	const strategiesSecondLightItems = ref([])
	const strategiesSecondSubgroupItems = ref([])
	const strategiesThirdLightItems = ref([])
	const strategiesThirdSubgroupItems = ref([])
	const instrumentSchemeListItems = ref([])
	const currencySchemeListItems = ref([])

	const disabledBtn = ref(false)
	const ecosystemDefaultsRef = ref( JSON.parse(JSON.stringify(store.ecosystemDefaults)) );

	init()

	async function init() {
		const res = await Promise.all([
			useApi('instrumentListLight.get'),
			useApi('portfolioListLight.get'),
			useApi('accountLight.get'),
			useApi('currencyListLight.get'),
			useApi('instrumentType.get'),
			useApi('transactionTypeLight.get'),
			useApi('accountTypeList.get'),
			useApi('pricingPolicyList.get'),
			useApi('instrumentPeriodicity.get'),
			useApi('instrumentAccrualCalculationModel.get'),
			useApi('instrumentClass.get'),
			useApi('instrumentSizeDetail.get'),
			useApi('instrumentPricingСondition.get'),
			useApi('counterpartyResponsibleLight.get'),
			useApi('counterpartyCounterpartyLight.get'),
			useApi('strategies1ListLight.get'),
			useApi('strategies1SubgroupList.get'),
			useApi('strategies2ListLight.get'),
			useApi('strategies2SubgroupList.get'),
			useApi('strategies3ListLight.get'),
			useApi('strategies3SubgroupList.get'),
			useApi('instrumentSchemeList.get'),
			useApi('currencySchemeList.get'),
		])

		instrumentItems.value = res[0].results
		portfolioListLightItems.value = res[1].results
		billItems.value = res[2].results
		currencyItems.value = res[3].results
		instrumentTypeItems.value = res[4].results
		transactionTypeLightItems.value = res[5].results
		accountsTypeItems.value = res[6].results
		pricingPolicyListItems.value = res[7].results
		instrumentPeriodicityItems.value = res[8]
		instrumentAccrualCalculationModelItems.value = res[9]
		instrumentClassItems.value = res[10]
		instrumentSizeDetailItems.value = res[11]
		instrumentPricingСonditionItems.value = res[12]
		counterpartyResponsibleLightItems.value = res[13].results
		counterpartyCounterpartyLightItems.value = res[14].results
		strategiesOneLightItems.value = res[15].results
		strategiesOneSubgroupItems.value = res[16].results
		strategiesSecondLightItems.value = res[17].results
		strategiesSecondSubgroupItems.value = res[18].results
		strategiesThirdLightItems.value = res[19].results
		strategiesThirdSubgroupItems.value = res[20].results
		instrumentSchemeListItems.value = res[21].results
		currencySchemeListItems.value = res[22].results
	}

	async function defaultSettingsCreate() {

		disabledBtn.value = true;

		let res = await useApi('defaultSettings.put', {
			params: { id: ecosystemDefaultsRef.value.id },
			body: ecosystemDefaultsRef.value,
		})

		if (res.error) {
			// console.error(res.error);
			useNotify({ type: 'error', title: res.error.message || res.error.detail })

		} else {
			useNotify({ type: 'success', title: `data saved on the server` })
			store.ecosystemDefaults = structuredClone(res);
		}

		disabledBtn.value = false;

	}
</script>

<style lang="scss" scoped>
	.wrapp-select {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
		grid-template-rows: 1fr;
		gap: 10px 5px;
	}
	.container {
		padding: 30px;
	}
	.title {
		margin-bottom: 24px;
		font-weight: 700;
	}
	@media (max-width: 1200px) {
		.wrapp-select {
			display: grid;
			grid-template-columns: 1fr 1fr 1fr;
			grid-template-rows: 1fr;
			gap: 10px 5px;
		}
	}
	@media (max-width: 767px) {
		.wrapp-select {
			display: grid;
			grid-template-columns: 1fr;
			grid-template-rows: 1fr;
			gap: 10px 5px;
		}
	}
</style>
