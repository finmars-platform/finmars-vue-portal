<template>
	<CommonSettingsLayout
		v-if="procedure.id"
		title="Update Pricing Procedure"
		@save="save()"
		@cancel="() => $router.push('/valuations/run-pricing')"
	>
		<template #left>
			<FmCard title="Global" class="mb-x">
				<BaseInput
					label="Name"
					v-model="procedure.name"
				/>
				<BaseInput
					label="User code"
					v-model="procedure.user_code"
				/>
				<BaseInput
					label="Notes"
					v-model="procedure.notes"
				/>
				<BaseInput
					label="Notes for user"
					v-model="procedure.notes_for_users"
				/>
			</FmCard>

			<FmCard title="Prices" class="mb-x">
				<FmInputDateExpr
					label="Date from"
					v-model:expr="procedure.price_date_from_expr"
					v-model:date="procedure.price_date_from"
				/>
				<FmInputDateExpr
					label="Date to"
					v-model:expr="procedure.price_date_to_expr"
					v-model:date="procedure.price_date_to"
				/>
				<BaseInput
					label="Roll prices for N days forward"
					v-model="procedure.price_fill_days"
				/>

				<div class="checks">
					<FmCheckbox
						v-model="procedure.price_get_principal_prices"
						label="Get Principal Prices"
					/>
					<FmCheckbox
						v-model="procedure.price_get_accrued_prices"
						label="Get Accruals"
					/>
					<FmCheckbox
						v-model="procedure.price_get_fx_rates"
						label="Get FX Rates"
					/>

					<FmCheckbox
						v-model="procedure.price_overwrite_principal_prices"
						label="Overwrite "
					/>
					<FmCheckbox
						v-model="procedure.price_overwrite_accrued_prices"
						label="Overwrite"
					/>
					<FmCheckbox
						v-model="procedure.price_overwrite_fx_rates"
						label="Overwrite"
					/>
				</div>
			</FmCard>
		</template>
		<template #right>
			<FmCard title="Filters" class="mb-x">
				<BaseMultiSelectInput
					v-model="procedure.pricing_policy_filters"
					label="Pricing policies"
					item_title="user_code"
					:items="policyList"
				/>
				<BaseMultiSelectInput
					v-model="procedure.portfolio_filters"
					label="Portfolios"
					item_title="user_code"
					:items="portfolioList"
				/>
			</FmCard>

			<FmCard  title="Instruments" class="mb-x">
				<BaseMultiSelectInput
					v-model="procedure.instrument_type_filters"
					label="Instrument types"
					item_title="user_code"
					:items="typeList"
				/>
				<BaseMultiSelectInput
					v-model="procedure.instrument_pricing_scheme_filters"
					label="Pricing schemes"
					item_title="user_code"
					:items="instrumentList"
				/>
				<FmSelect multiple
					v-model="pricing_conditions"
					@update:modelValue="procedure.instrument_pricing_condition_filters = $event.join(',')"
					:items="conditions"
					label="Pricing Condition"
				/>
			</FmCard>

			<FmCard title="Currencies" class="mb-x">
				<BaseMultiSelectInput
					v-model="procedure.currency_pricing_scheme_filters"
					label="Pricing schemes"
					item_title="user_code"
					:items="currencyList"
				/>
				<FmSelect
					label="Pricing Condition"
					v-model="currency_condition"
					@update:modelValue="procedure.currency_pricing_condition_filters = $event.join(',')"
					:items="conditions"
				/>
			</FmCard>
		</template>
	</CommonSettingsLayout>
</template>

<script setup>

	definePageMeta({
		bread: [
			{
				text: 'Valuations: Run Pricing ',
				to: '/valuations/run-pricing',
				disabled: false
			},
			{
				text: 'Update Pricing Procedure ',
				disabled: true
			},
		],
	});
	const store = useStore()
	let route = useRoute()
	let procedure = ref({})

	let policyList = ref([])
	let portfolioList = ref([])
	let typeList = ref([])
	let instrumentList = ref([])
	let currencyList = ref([])

	let isDateFromExpr = ref(false)
	let isDateToExpr = ref(false)
	let editingExpr = ref('')
	let isOpenFromExpr = ref(false)
	let isOpenToExpr = ref(false)

  let conditions = ref([
		{name: 'Run valuation: Always', id: '2'},
		{name: 'Run valuation: Open Position', id: '3'}
	])
	let pricing_conditions = ref()
	let currency_condition = ref()

	async function init() {
		useApi('instrumentTypeList.get').then( res => typeList.value = res.results )
		useApi('instrumentSchemeList.get').then( res => instrumentList.value = res.results )
		useApi('pricingPolicyList.get').then( res => policyList.value = res.results )
		useApi('portfolioListList.get').then( res => portfolioList.value = res.results )
		useApi('currencySchemeList.get').then( res => currencyList.value = res.results )

		let res = await useApi('pricingProcId.get', {params: {id: route.params.id}})
		procedure.value = res
		pricing_conditions.value = procedure.value.instrument_pricing_condition_filters.split(',')
		currency_condition.value = procedure.value.currency_pricing_condition_filters.split(',')

		isDateFromExpr.value = procedure.value.price_date_from_expr ? true : false
		isDateToExpr.value = procedure.value.price_date_to_expr ? true : false
	}
	function openExpr( expr ) {
		dialog.value = true
		editingExpr.value = expr
	}
	async function save() {
		procedure.value.currency_pricing_condition_filters = currency_condition.value.join(',')
		procedure.value.instrument_pricing_condition_filters = pricing_conditions.value.join(',')

		let res = await useApi('pricingProcId.put', {body: procedure.value, params: {id: route.params.id}})

		if ( res ) {
			useNotify({type: 'success', title: 'Saved!'})
		}
	}

	if ( store.current.base_api_url ) {
		init()
	} else {
		watch( () => store.current, async () => {
			init()
		})
	}

</script>

<style lang="scss" scoped>
.checks {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 10px;
}
</style>
