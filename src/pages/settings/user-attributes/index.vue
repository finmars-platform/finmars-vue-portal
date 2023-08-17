<template>
	<div class="container">
		<h1 class="title">User Attributes</h1>

		<FmExpansionPanel title="Portfolio Attributes">
			<div class="attributes-header">
				<FmBtn
					type="primary"
					class="btn-transaction mr-20"
					@click="complexTransactionUserFieldCreate()"
					>Add New</FmBtn
				>
				<FmBtn
					type="primary"
					class="btn-transaction"
					@click="complexTransactionUserFieldCreate()"
					>SHOW HIDDEN ATTRIBUTES </FmBtn
				>
			</div>
			<span>You could add new user attributes here</span>
		</FmExpansionPanel>
		<FmExpansionPanel title="Account Attributes">
			<span>You could add new user attributes here</span>
		</FmExpansionPanel>
		<FmExpansionPanel title="Instruments Attributes">
            <div v-if="ecosystemDefaults"></div>
			<span v-else>You could add new user attributes here</span>
		</FmExpansionPanel>
		<FmExpansionPanel title="Responsible Attributes">
			<span>You could add new user attributes here</span>
		</FmExpansionPanel>
		<FmExpansionPanel title="Counterparty Attributes">
			<span>You could add new user attributes here</span>
		</FmExpansionPanel>
		<FmExpansionPanel title="Counterparty Attributes">
			<span>You could add new user attributes here</span>
		</FmExpansionPanel>
		<FmExpansionPanel title="Currency Attributes">
			<span>You could add new user attributes here</span>
		</FmExpansionPanel>
		<FmExpansionPanel title="Strategy 1 Attributes">
			<span>You could add new user attributes here</span>
		</FmExpansionPanel>
		<FmExpansionPanel title="Strategy 2 Attributes">
			<span>You could add new user attributes here</span>
		</FmExpansionPanel>
		<FmExpansionPanel title="Strategy 3 Attributes">
			<span>This entity has no layouts.</span>
		</FmExpansionPanel>
		<FmExpansionPanel title="Account Type Attributes">
			<span>You could add new user attributes here</span>
		</FmExpansionPanel>
		<FmExpansionPanel title="Transaction Type Attributes">
			<span>You could add new user attributes here</span>
		</FmExpansionPanel>
	</div>
</template>
<script setup>
	definePageMeta({
		middleware: 'auth',
		bread: [
			{
				text: 'Default settings',
				to: '/settings/default-settings',
			},
		],
	})

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

	const disabledBtn = ref(true)
	const ecosystemDefaults = ref([1])
	const BaseInputEcosystemDefaults = ref([])
	init()
	async function init() {
		const res = await Promise.all([
			useApi('instrumentListLight.get'),
			useApi('portfolioListLight.get'),
			useApi('accountLight.get'),
			useApi('currencyListLight.get'),
			useApi('instrumentType.get'),
			useApi('transactionTypeLight.get'),
			useApi('accountsType.get'),
			useApi('pricingPolicyList.get'),
			useApi('instrumentPeriodicity.get'),
			useApi('instrumentAccrualCalculationModel.get'),
			useApi('instrumentClass.get'),
			useApi('instrumentSizeDetail.get'),
			useApi('instrumentPricingСondition.get'),
			useApi('counterpartyResponsibleLight.get'),
			useApi('counterpartyCounterpartyLight.get'),
			useApi('strategiesOneLight.get'),
			useApi('strategiesOneSubgroup.get'),
			useApi('strategiesSecondLight.get'),
			useApi('strategiesSecondSubgroup.get'),
			useApi('strategiesThirdLight.get'),
			useApi('strategiesThirdSubgroup.get'),
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

	watch(
		ecosystemDefaults,
		(newValue, oldValue) => {
			if (oldValue[0] === 1) {
			} else {
				disabledBtn.value = false
			}
		},
		{ deep: true }
	),
	defaultsGet()
	async function defaultsGet() {
		let edRes = await useApi('instrumentAttrTypeList.get')
        console.log(edRes,"edRes")
		ecosystemDefaults.value = edRes.error ? {} : edRes.results[0]
	}
	async function defaultSettingsCreate() {
		let res = await useApi('defaultSettings.put', {
			params: { id: ecosystemDefaults.value.id },
			body: ecosystemDefaults.value,
		})

		if (res.error) {
			// console.error(res.error);
			useNotify({ type: 'error', title: res.error.message || res.error.detail })
			throw new Error(res.error)
		} else {
			useNotify({ type: 'success', title: `data saved on the server` })
		}
		disabledBtn.value = true
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
	.transaction-fields {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		grid-template-rows: auto auto;
		grid-template-areas:
			'title-block title-block title-block'
			'. . .';

		gap: 20px 20px;
		// .transaction-fields__block

		&__block {
		}

		// .transaction-fields__title

		&__title {
			font-weight: 700;
			font-size: 16px;
			margin: 20px 0;
		}
	}
	.complex-input {
		display: flex;
		flex-direction: column;
		// .complex-input__header

		&__header {
			display: flex;
			align-items: center;
			margin-bottom: 5px;
		}

		// .complex-input__name

		&__name {
			font-weight: 700;
			font-size: 16px;
			margin-right: 10px;
		}

		// .complex-input__lable

		&__lable {
			font-weight: 400;
			font-size: 11px;
			color: grey;
		}
		// .complex-input__body
		&__body {
			display: flex;
			align-items: center;
		}
	}
	.title {
		grid-area: title-block;
	}
	.footer {
		grid-area: footer;
	}
	.btn-transaction {
		margin-bottom: 20px;
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
