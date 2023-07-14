<template>
	<div class="container">
		<div class="wrapp-select">
			<FmSelect
				v-model="ecosystemDefaults.instrument"
				label="Instrument"
				:items="instrumentItems"
			/>
			<FmSelect
				v-model="ecosystemDefaults.portfolio"
				label="Portfolio"
				:items="portfolioListLightItems"
			/>
			<FmSelect
				v-model="ecosystemDefaults.account"
				label="Account"
				:items="billItems"
			/>
			<FmSelect
				v-model="ecosystemDefaults.currency"
				label="Currency"
				:items="currencyItems"
			/>
		</div>
		<div class="wrapp-select">
			<FmSelect
				v-model="ecosystemDefaults.instrument_type"
				label="Instrument Type"
				:items="instrumentTypeItems"
			/>
			<FmSelect
				v-model="ecosystemDefaults.transaction_type"
				label="Transaction Type"
				:items="transactionTypeLightItems"
			/>
			<FmSelect
				v-model="ecosystemDefaults.account_type"
				label="Instrument Type"
				:items="accountsTypeItems"
			/>
		</div>
		<div class="wrapp-select">
			<FmSelect
				v-model="ecosystemDefaults.pricing_policy"
				label="Pricing Policy"
				:items="pricingPolicyListItems"
			/>
		</div>
		<div class="wrapp-select">
			<FmSelect
				v-model="ecosystemDefaults.periodicity"
				label="Periodicity"
				:items="instrumentPeriodicityItems"
			/>
			<FmSelect
				v-model="ecosystemDefaults.accrual_calculation_model"
				label="Accrual Calculation Model"
				:items="instrumentAccrualCalculationModelItems"
			/>
			<FmSelect
				v-model="ecosystemDefaults.instrument_class"
				label="Instrument Class"
				:items="instrumentClassItems"
			/>
			<FmSelect
				v-model="ecosystemDefaults.payment_size_detail"
				label="Payment Size Detail"
				:items="instrumentSizeDetailItems"
			/>
			<FmSelect
				v-model="ecosystemDefaults.pricing_condition"
				label="Pricing Condition"
				:items="instrumentPricingСonditionItems"
			/>
		</div>
		<div class="wrapp-select">
			<FmSelect
				v-model="ecosystemDefaults.responsible"
				label="Responsible"
				:items="counterpartyResponsibleLightItems"
			/>
			<FmSelect
				v-model="ecosystemDefaults.responsible_group"
				label="Responsible Group"
				:items="instrumentItems"
			/>
			<FmSelect
				v-model="ecosystemDefaults.counterparty"
				label="Counterparty"
				:items="counterpartyCounterpartyLightItems"
			/>
			<FmSelect
				v-model="ecosystemDefaults.counterparty_group"
				label="Counterparty Group"
				:items="instrumentItems"
			/>
		</div>
		<div class="wrapp-select">
			<FmSelect
				v-model="ecosystemDefaults.strategy1"
				label="Strategy 1"
				:items="strategiesOneLightItems"
			/>
			<FmSelect
				v-model="ecosystemDefaults.strategy1_group"
				label="Strategy 1 Group "
				:items="strategiesOneSubgroupItems"
			/>
			<FmSelect
				v-model="ecosystemDefaults.strategy1_subgroup"
				label="Strategy 1  Subgroup"
				:items="instrumentItems"
			/>
		</div>
		<div class="wrapp-select">
			<FmSelect
				v-model="ecosystemDefaults.strategy2"
				label="Strategy 2"
				:items="strategiesSecondLightItems"
			/>
			<FmSelect
				v-model="ecosystemDefaults.strategy2_group"
				label="Strategy 2  Group"
				:items="strategiesSecondSubgroupItems"
			/>
			<FmSelect
				v-model="ecosystemDefaults.strategy2_subgroup"
				label="Strategy 2  Subgroup"
				:items="instrumentItems"
			/>
		</div>
		<div class="wrapp-select">
			<FmSelect
				v-model="ecosystemDefaults.strategy3"
				label="Strategy 3"
				:items="strategiesThirdLightItems"
			/>
			<FmSelect
				v-model="ecosystemDefaults.strategy3_group"
				label="Strategy 3 Group"
				:items="strategiesThirdSubgroupItems"
			/>
			<FmSelect
				v-model="ecosystemDefaults.strategy3_subgroup"
				label="Strategy 3 Subgroup"
				:items="instrumentItems"
			/>
		</div>
		<div class="wrapp-select">
			<FmSelect
				v-model="ecosystemDefaults.instrument_pricing_scheme"
				label="Instrument Pricing Scheme"
				:items="instrumentSchemeListItems"
			/>
			<FmSelect
				v-model="ecosystemDefaults.currency_pricing_scheme"
				label="Currency Pricing Scheme"
				:items="currencySchemeListItems"
			/>
		</div>
		<FmBtn
			type="text"
			class="g-toggle-filters-btn"
			@click="defaultSettingsCreate"
		>
			Save
		</FmBtn>
	</div>
</template>

<script setup>
	const instrumentAction = ref('')
	const billAction = ref('')
	const currencyAction = ref('')
	const portfolioListLightAction = ref('')
	const instrumentTypeAction = ref('')
	const transactionTypeLightAction = ref('')
	const accountsTypeAction = ref('')
	const pricingPolicyListAction = ref('')
	const instrumentPeriodicityAction = ref('')
	const instrumentAccrualCalculationModelAction = ref('')
	const instrumentClassAction = ref('')
	const instrumentSizeDetailAction = ref('')
	const instrumentPricingСonditionAction = ref('')
	const counterpartyResponsibleLightAction = ref('')
	const counterpartyCounterpartyLightAction = ref('')
	const strategiesOneLightAction = ref('')
	const strategiesOneSubgroupAction = ref([])
	const strategiesSecondLightAction = ref([])
	const strategiesSecondSubgroupAction = ref([])
	const strategiesThirdLightAction = ref([])
	const strategiesThirdSubgroupAction = ref([])
	const instrumentSchemeListAction = ref([])
	const currencySchemeListAction = ref([])

	const instrumentItems = ref([])
	const billItems = ref([])
	const currencyItems = ref([])
	const portfolioListLightItems = ref([])
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

	const ecosystemDefaults = ref([])
	console.log(ecosystemDefaults.value, 'ecosystemDefaults topp')
	init()
	async function init() {
		let res = await useApi('instrumentListLight.get')
		let billGet = await useApi('accountLight.get')
		let currencyGet = await useApi('currencyListLight.get')
		let instrumentTypeGet = await useApi('instrumentType.get')
		let portfolioListLightGet = await useApi('portfolioListLight.get')
		let transactionTypeLightGet = await useApi('transactionTypeLight.get')
		let accountsTypeGet = await useApi('accountsType.get')
		let pricingPolicyListGet = await useApi('pricingPolicyList.get')
		let instrumentPeriodicityGet = await useApi('instrumentPeriodicity.get')
		let instrumentAccrualCalculationModelGet = await useApi(
			'instrumentPeriodicity.get'
		)
		let instrumentClassGet = await useApi('instrumentClass.get')
		let instrumentSizeDetailGet = await useApi('instrumentSizeDetail.get')
		let instrumentPricingСonditionGet = await useApi(
			'instrumentPricingСondition.get'
		)
		let counterpartyResponsibleLightGet = await useApi(
			'counterpartyResponsibleLight.get'
		)
		let counterpartyCounterpartyLightGet = await useApi(
			'counterpartyCounterpartyLight.get'
		)
		let strategiesOneLightGet = await useApi('strategiesOneLight.get')
		let strategiesOneSubgroupGet = await useApi('strategiesOneSubgroup.get')
		let strategiesSecondLightGet = await useApi('strategiesSecondLight.get')
		let strategiesSecondSubgroupGet = await useApi(
			'strategiesSecondSubgroup.get'
		)
		let strategiesThirdLightGet = await useApi('strategiesThirdLight.get')
		let strategiesThirdSubgroupGet = await useApi('strategiesThirdSubgroup.get')
		let instrumentSchemeListGet = await useApi('instrumentSchemeList.get')
		let currencySchemeListGet = await useApi('currencySchemeList.get')

		instrumentItems.value = res.results
		billItems.value = billGet.results
		currencyItems.value = currencyGet.results
		portfolioListLightItems.value = portfolioListLightGet.results
		instrumentTypeItems.value = instrumentTypeGet.results
		transactionTypeLightItems.value = transactionTypeLightGet.results
		instrumentSizeDetailItems.value = instrumentSizeDetailGet.results
		accountsTypeItems.value = accountsTypeGet.results
		pricingPolicyListItems.value = pricingPolicyListGet.results
		instrumentPeriodicityItems.value = instrumentPeriodicityGet.results
		instrumentAccrualCalculationModelItems.value =
			instrumentAccrualCalculationModelGet.results
		instrumentClassItems.value = instrumentClassGet.results
		instrumentSizeDetailItems.value = instrumentSizeDetailGet.results
		instrumentPricingСonditionItems.value =
			instrumentPricingСonditionGet.results
		counterpartyResponsibleLightItems.value =
			counterpartyResponsibleLightGet.results
		counterpartyCounterpartyLightItems.value =
			counterpartyCounterpartyLightGet.results
		strategiesOneLightItems.value = strategiesOneLightGet.results
		strategiesOneSubgroupItems.value = strategiesOneSubgroupGet.results
		strategiesSecondLightItems.value = strategiesSecondLightGet.results
		strategiesSecondSubgroupItems.value = strategiesSecondSubgroupGet.results
		strategiesThirdLightItems.value = strategiesThirdLightGet.results
		strategiesThirdSubgroupItems.value = strategiesThirdSubgroupGet.results
		instrumentSchemeListItems.value = instrumentSchemeListGet.results
		currencySchemeListItems.value = currencySchemeListGet.results
	}
	defaultsGet()
	async function defaultsGet() {
		let edRes = await useApi('ecosystemDefaults.get')

		ecosystemDefaults.value = edRes.error ? {} : edRes.results[0]
	}
	async function defaultSettingsCreate() {
		let res = await useApi('defaultSettings.put', {
			params: { id: ecosystemDefaults.value.id },
			body: ecosystemDefaults.value,
		})

		console.log(
			ecosystemDefaults.value +
				'ecosystemDefaults.value + defaultSettingsCreate',
			ecosystemDefaults,
			'ecosystemDefaults'
		)
	}
</script>

<style lang="scss" scoped>
	.wrapp-select {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
		grid-template-rows: 1fr;
		gap: 10px 5px;
	}
</style>
