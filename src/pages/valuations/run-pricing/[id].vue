<template>
	<v-container fluid v-if="procedure.id" class="pb-16 mb-10">
		<div class="text-h5 mb-3">Update Pricing Procedure</div>
		<div class="d-flex space-between">
			<div class="coll">
				<v-card class="mb-6">
					<v-card-title>Global</v-card-title>
					<v-card-content>
						<v-text-field
							label="Name"
							placeholder="Name"
							variant="outlined"
							density="comfortable"
							v-model="procedure.name"
						/>
						<v-text-field
							label="User code"
							placeholder="User code"
							variant="outlined"
							density="comfortable"
							v-model="procedure.user_code"
						/>
						<v-text-field
							label="Notes"
							placeholder="Notes"
							variant="outlined"
							density="comfortable"
							v-model="procedure.notes"
						/>
						<v-text-field
							label="Notes for user"
							placeholder="Notes for users"
							variant="outlined"
							density="comfortable"
							v-model="procedure.notes_for_users"
						/>
					</v-card-content>
				</v-card>

				<v-card>
					<v-card-title>Prices</v-card-title>
					<v-card-content>
						<FnDateExpr
							label="Date from"
						/>

						<v-text-field
							:label="`Date to${isDateToExpr ? ' (Expression)' : ''}`"
							:placeholder="`Date to${isDateToExpr ? ' (Expression)' : ''}`"
							variant="outlined"
							density="comfortable"
							:type="isDateToExpr ? 'text' : 'date'"
							:append-inner-icon="isDateToExpr ? 'mdi-code-tags' : ''"
							:prepend-inner-icon="'mdi-swap-vertical'"
							@click:prepend-inner="isDateToExpr = !isDateToExpr"
							:modelValue="isDateToExpr ? procedure.price_date_to_expr : procedure.price_date_to"
							@click="isDateToExpr ? isOpenToExpr = true : ''"
						/>
						<FmExpression
							v-if="isOpenToExpr"
							v-model="isOpenToExpr"
							:expressions="procedure.price_date_to_expr"
							@save="procedure.price_date_to_expr = $event"
						/>

						<v-text-field
							label="Roll prices for N days forward"
							placeholder="Roll prices for N days forward"
							variant="outlined"
							density="comfortable"
							v-model="procedure.price_fill_days"
							hide-details
						/>
						<v-row>
							<v-col
								cols="12"
								sm="4"
								md="4"
							>
								<v-checkbox
									v-model="procedure.price_get_principal_prices"
									label="Get Principal Prices"
									color="primary"
									hide-details
								></v-checkbox>
								<v-checkbox
									v-model="procedure.price_overwrite_principal_prices"
									label="Overwrite "
									color="primary"
									hide-details
								></v-checkbox>
							</v-col>
							<v-col
								cols="12"
								sm="4"
								md="4"
							>
								<v-checkbox
									v-model="procedure.price_get_accrued_prices"
									label="Get Accruals"
									color="primary"
									hide-details
								></v-checkbox>
								<v-checkbox
									v-model="procedure.price_overwrite_accrued_prices"
									label="Overwrite"
									color="primary"
									hide-details
								></v-checkbox>
							</v-col>
							<v-col
								cols="12"
								sm="4"
								md="4"
							>
								<v-checkbox
									v-model="procedure.price_get_fx_rates"
									label="Get FX Rates"
									color="primary"
									hide-details
								></v-checkbox>
								<v-checkbox
									v-model="procedure.price_overwrite_fx_rates"
									label="Overwrite"
									color="primary"
									hide-details
								></v-checkbox>
							</v-col>
						</v-row>
					</v-card-content>
				</v-card>
			</div>
			<div class="coll">
				<v-card class="mb-6">
					<v-card-title>Filters</v-card-title>
					<v-card-content>
						<BaseMultiSelect
							v-model="procedure.pricing_policy_filters"
							title="Pricing policies"
							:items="policyList"
						/>
						<BaseMultiSelect
							v-model="procedure.portfolio_filters"
							title="Portfolios"
							:items="portfolioList"
						/>
					</v-card-content>
				</v-card>

				<v-card class="mb-6">
					<v-card-title>Instruments</v-card-title>
					<v-card-content>
						<BaseMultiSelect
							v-model="procedure.instrument_type_filters"
							title="Instrument types"
							:items="typeList"
						/>
						<BaseMultiSelect
							v-model="procedure.instrument_pricing_scheme_filters"
							title="Pricing schemes"
							:items="instrumentList"
						/>
						<v-select
							v-model="pricing_conditions"
							@update:modelValue="procedure.instrument_pricing_condition_filters = $event.join(',')"
							:items="conditions"
							chips
							closable-chips
							label="Pricing Condition"
							prepend-inner-icon="mdi-menu"
							variant="outlined"
							density="compact"
							multiple
						/>
					</v-card-content>
				</v-card>

				<v-card>
					<v-card-title>Currencies</v-card-title>
					<v-card-content>
						<BaseMultiSelect
							v-model="procedure.currency_pricing_scheme_filters"
							title="Pricing schemes"
							:items="currencyList"
						/>
						<v-select
							v-model="currency_condition"
							@update:modelValue="procedure.currency_pricing_condition_filters = $event.join(',')"
							:items="conditions"
							chips
							closable-chips
							label="Pricing Condition"
							prepend-inner-icon="mdi-menu"
							variant="outlined"
							density="compact"
							multiple
						/>
					</v-card-content>
				</v-card>
			</div>
		</div>

		<v-sheet class="control_line pa-4 d-flex space-between">
			<v-btn variant="text" @click="$router.push('/valuations/run-pricing')">cancel</v-btn>
			<v-btn color="primary" @click="save()">save</v-btn>
		</v-sheet>

	</v-container>
</template>

<script setup>

	definePageMeta({
		title: "Update Pricing Procedure ",
	});
	const store = useStore()
	let route = useRoute()
	let procedure = ref({})

	let policyList = ref({})
	let portfolioList = ref({})
	let typeList = ref({})
	let instrumentList = ref({})
	let currencyList = ref({})

	let isDateFromExpr = ref(false)
	let isDateToExpr = ref(false)
	let editingExpr = ref('')
	let isOpenFromExpr = ref(false)
	let isOpenToExpr = ref(false)

  let conditions = ref([
		{title: 'Run valuation: Always', value: '2'},
		{title: 'Run valuation: Open Position', value: '3'}
	])
	let pricing_conditions = ref()
	let currency_condition = ref()

	async function init() {
		let res = await useApi('pricingProcId.get', {params: {id: route.params.id}})
		procedure.value = res
		pricing_conditions.value = procedure.value.instrument_pricing_condition_filters.split(',')
		currency_condition.value = procedure.value.currency_pricing_condition_filters.split(',')

		isDateFromExpr.value = procedure.value.price_date_from_expr ? true : false
		isDateToExpr.value = procedure.value.price_date_to_expr ? true : false

		typeList.value = (await useApi('instrumentType.get')).results
		instrumentList.value = (await useApi('instrumentScheme.get')).results
		policyList.value = (await useApi('policyFilters.get')).results
		portfolioList.value = (await useApi('portfolioFilters.get')).results
		currencyList.value = (await useApi('currencyScheme.get')).results
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
.coll {
	width: 48%;
}
.control_line {
	width: calc(100% - 160px);
	position: fixed;
	left: 160px;
	bottom: 0;
	border-top: 1px solid $border;
}
</style>
