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
				:items="instrumentPricingConditionItems"
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
				:items="responsibleGroups"
			/>
			<FmSelect
				v-model="ecosystemDefaultsRef.counterparty"
				label="Counterparty"
				:items="counterpartyCounterpartyLightItems"
			/>
			<FmSelect
				v-model="ecosystemDefaultsRef.counterparty_group"
				label="Counterparty Group"
				:items="counterpartyGroups"
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


		<div>

			<p>Finmars License Key is Optional</p>
			<p>To obtain your License Key you need to have <a href="https://id-auth.finmars.io/realms/finmars/account" target="_blank" style="text-decoration: underline; display: inline">Finmars ID</a></p>
			<p>With Finmars ID you will able to receive License Key <a href="https://license.finmars.com/account/" target="_blank" style="text-decoration: underline; display: inline">here</a></p>

			<p>License Key Extends Finmars Marketplace, with that key you will be able to download paid modules</p>

			<fm-text-field v-model="ecosystemDefaultsRef.license_key" label="License Key" outlined  style="margin-top: 16px;"/>
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
				to: '/settings/default-settings'
			}
		]
	});

	const store = useStore();

	const instrumentItems = ref([]);
	const portfolioListLightItems = ref([]);
	const billItems = ref([]);
	const currencyItems = ref([]);
	const instrumentTypeItems = ref([]);
	const transactionTypeLightItems = ref([]);
	const accountsTypeItems = ref([]);
	const pricingPolicyListItems = ref([]);
	const instrumentPeriodicityItems = ref([]);
	const instrumentAccrualCalculationModelItems = ref([]);
	const instrumentClassItems = ref([]);
	const instrumentSizeDetailItems = ref([]);
	const instrumentPricingConditionItems = ref([]);
	const counterpartyResponsibleLightItems = ref([]);
	const responsibleGroups = ref([]);
	const counterpartyCounterpartyLightItems = ref([]);
	const counterpartyGroups = ref([]);
	const strategiesOneLightItems = ref([]);
	const strategiesOneSubgroupItems = ref([]);
	const strategiesSecondLightItems = ref([]);
	const strategiesSecondSubgroupItems = ref([]);
	const strategiesThirdLightItems = ref([]);
	const strategiesThirdSubgroupItems = ref([]);

	const disabledBtn = ref(false);
	const ecosystemDefaultsRef = ref(
		JSON.parse(JSON.stringify(store.ecosystemDefaults))
	);

	init();

	async function init() {
		const opts = {
			filters: {
				page: 1,
				page_size: 1000,
				is_deleted: false
			}
		};

		const res = await Promise.all([
			useLoadAllPages('instrumentListLight.get', opts), // 0
			useLoadAllPages('portfolioListLight.get', opts), // 1
			useLoadAllPages('accountLight.get', opts), // 2
			useLoadAllPages('currencyListLight.get', opts), // 3
			useLoadAllPages('instrumentType.get', opts), // 4
			useLoadAllPages('transactionTypeLight.get', opts), // 5
			useLoadAllPages('accountTypeList.get', opts), // 6
			useLoadAllPages('pricingPolicyList.get', opts), // 7
			useApi('instrumentPeriodicity.get', opts), // 8
			useApi('instrumentAccrualCalculationModel.get', opts), // 9
			useApi('instrumentClass.get', opts), // 10
			useApi('instrumentSizeDetail.get', opts), // 11
			useApi('instrumentPricingCondition.get', opts), // 12
			useLoadAllPages('counterpartyResponsibleLight.get', opts), // 13
			useLoadAllPages('responsibleGroupList.get', opts), // 14
			useLoadAllPages('counterpartyCounterpartyLight.get', opts), // 15
			useLoadAllPages('counterpartyGroupList.get', opts), // 16. there is no api for light
			useLoadAllPages('strategies1ListLight.get', opts), // 17
			useLoadAllPages('strategies1SubgroupList.get', opts), // 18
			useLoadAllPages('strategies2ListLight.get', opts), // 19
			useLoadAllPages('strategies2SubgroupList.get', opts), // 20
			useLoadAllPages('strategies3ListLight.get', opts), // 21
			useLoadAllPages('strategies3SubgroupList.get', opts) // 22
		]);

		instrumentItems.value = res[0];
		portfolioListLightItems.value = res[1];
		billItems.value = res[2];
		currencyItems.value = res[3];
		instrumentTypeItems.value = res[4];
		transactionTypeLightItems.value = res[5];
		accountsTypeItems.value = res[6];
		pricingPolicyListItems.value = res[7];
		instrumentPeriodicityItems.value = res[8];
		instrumentAccrualCalculationModelItems.value = res[9];
		instrumentClassItems.value = res[10];
		instrumentSizeDetailItems.value = res[11];
		instrumentPricingConditionItems.value = res[12];
		counterpartyResponsibleLightItems.value = res[13];
		responsibleGroups.value = res[14];
		counterpartyCounterpartyLightItems.value = res[15];
		counterpartyGroups.value = res[16];
		strategiesOneLightItems.value = res[17];
		strategiesOneSubgroupItems.value = res[18];
		strategiesSecondLightItems.value = res[19];
		strategiesSecondSubgroupItems.value = res[20];
		strategiesThirdLightItems.value = res[21];
		strategiesThirdSubgroupItems.value = res[22];
	}

	async function defaultSettingsCreate() {
		disabledBtn.value = true;

		let res = await useApi('defaultSettings.put', {
			params: { id: ecosystemDefaultsRef.value.id },
			body: ecosystemDefaultsRef.value
		});

		if (res._$error) {
			// console.error(res._$error);
			useNotify({
				type: 'error',
				title: res._$error.message || res._$error.detail
			});
		} else {
			useNotify({ type: 'success', title: `data saved on the server` });
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
