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
	init()
	async function init() {
		const res = await Promise.all([
			useApi('instrumentListLight.get'),
			// let billGet = await
			useApi('accountLight.get'),
			// let currencyGet = await
			useApi('currencyListLight.get'),
			// let instrumentTypeGet = await
			useApi('instrumentType.get'),
			// let portfolioListLightGet = await
			useApi('portfolioListLight.get'),
			// let transactionTypeLightGet = await
			useApi('transactionTypeLight.get'),
			// let accountsTypeGet = await
			useApi('accountsType.get'),
			// let pricingPolicyListGet = await
			useApi('pricingPolicyList.get'),
			// let instrumentPeriodicityGet = await
			useApi('instrumentPeriodicity.get'),
			// let instrumentAccrualCalculationModelGet = await
			useApi('instrumentPeriodicity.get'),
			// let instrumentClassGet = await
			useApi('instrumentClass.get'),
			// let instrumentSizeDetailGet = await
			useApi('instrumentSizeDetail.get'),
			// let instrumentPricingСonditionGet = await
			useApi('instrumentPricingСondition.get'),
			// let counterpartyResponsibleLightGet = await
			useApi('counterpartyResponsibleLight.get'),
			// let counterpartyCounterpartyLightGet = await
			useApi('counterpartyCounterpartyLight.get'),
			// let strategiesOneLightGet = await
			useApi('strategiesOneLight.get'),
			// let strategiesOneSubgroupGet = await
			useApi('strategiesOneSubgroup.get'),
			// let strategiesSecondLightGet = await
			useApi('strategiesSecondLight.get'),
			// let strategiesSecondSubgroupGet = await
			useApi('strategiesSecondSubgroup.get'),
			// let strategiesThirdLightGet = await
			useApi('strategiesThirdLight.get'),
			// let strategiesThirdSubgroupGet = await
			useApi('strategiesThirdSubgroup.get'),
			// let instrumentSchemeListGet = await
			useApi('instrumentSchemeList.get'),
			// let currencySchemeListGet = await
			useApi('currencySchemeList.get'),
			
		])
		instrumentItems.value = res[0].results
		billItems.value = res[1].results
		currencyItems.value = res[2].results
		portfolioListLightItems.value = res[3].results
		instrumentTypeItems.value = res[4].results
		transactionTypeLightItems.value = res[5].results
		instrumentSizeDetailItems.value = res[6].results
		accountsTypeItems.value = res[7].results
		pricingPolicyListItems.value = res[8].results
		instrumentPeriodicityItems.value = res[9].results
		instrumentAccrualCalculationModelItems.value = res[10].results
		instrumentClassItems.value = res[11].results
		instrumentSizeDetailItems.value = res[12].results
		instrumentPricingСonditionItems.value = res[13].results
		counterpartyResponsibleLightItems.value = res[14].results
		counterpartyCounterpartyLightItems.value = res[15].results
		strategiesOneLightItems.value = res[16].results
		strategiesOneSubgroupItems.value = res[17].results
		strategiesSecondLightItems.value = res[18].results
		strategiesSecondSubgroupItems.value = res[19].results
		strategiesThirdLightItems.value = res[20].results
		strategiesThirdSubgroupItems.value = res[21].results
		instrumentSchemeListItems.value = res[22].results
		currencySchemeListItems.value = res[23].results
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
