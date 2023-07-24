<template>
	<BaseModal title="Report settings" @close="vm.cancel()">
		<div v-if="vm.checkReadyStatus">
			<div
				v-if="
					vm.entityType == 'balance-report' ||
					vm.entityType == 'pl-report' ||
					vm.entityType == 'performance-report'
				"
			>
				<h5 class="headers">General Settings</h5>

				<div class="flex-column">
					<div
						v-if="vm.entityType === 'balance-report'"
						class="g-report-settings-row p-b-8"
					>
						<div class="default-f-s">Report date</div>

						<div class="g-report-settings-field">
							<complex-zh-datepicker
								date="vm.reportOptions.report_date"
								datepicker-options="vm.reportLayoutOptions.datepickerOptions.reportLastDatepicker"
								ev-data-service="evDataService"
								ev-event-service="evEventService"
								attribute-data-service="attributeDataService"
								is-disabled="vm.disableDatepicker"
								selector-look="input"
							></complex-zh-datepicker>
						</div>
					</div>

					<RvSettingsRow
						v-if="vm.entityType === 'pl-report'"
						label="Report date"
					>
						<FmInputDateComplex
							class="width-100"
							:firstDate="vm.reportOptions.pl_first_date"
							:firstDatepickerOptions="
								vm.reportLayoutOptions.datepickerOptions.reportFirstDatepicker
							"
							:secondDate="vm.reportOptions.report_date"
							:secondDatepickerOptions="
								vm.reportLayoutOptions.datepickerOptions.reportLastDatepicker
							"
							is-disabled="vm.disableDatepicker"
						/>
					</RvSettingsRow>

					<RvSettingsRow label="Currency">
						<FmSelect
							v-model="vm.reportOptions.report_currency"
							:items="vm.currencies"
							prop_id="user_code"
						/>
					</RvSettingsRow>

					<RvSettingsRow label="Cost method">
						<FmSelect
							v-model="vm.reportOptions.cost_method"
							:items="vm.costMethod"
						/>
					</RvSettingsRow>

					<RvSettingsRow label="Pricing Policy">
						<FmSelect
							v-model="vm.reportOptions.pricing_policy"
							:items="vm.pricingPolicies"
							prop_id="user_code"
						/>
					</RvSettingsRow>

					<RvSettingsRow label="Table font size">
						<FmSelect
							v-model="vm.reportOptions.table_font_size"
							:items="vm.tableFontSizeOptions"
						/>
					</RvSettingsRow>
				</div>

				<h5 class="headers">Consolidation</h5>

				<RvSettingsRow label="Portfolio mode">
					<FmSelect
						v-model="vm.reportOptions.portfolio_mode"
						:items="vm.selectOptions"
					/>
				</RvSettingsRow>

				<RvSettingsRow label="Account mode">
					<FmSelect
						v-model="vm.reportOptions.account_mode"
						:items="vm.selectOptions"
					/>
				</RvSettingsRow>

				<RvSettingsRow label="Strategy 1 Mode">
					<FmSelect
						v-model="vm.reportOptions.strategy1_mode"
						:items="vm.strategiesSelectOptions"
					/>
				</RvSettingsRow>

				<RvSettingsRow label="Strategy 2 Mode">
					<FmSelect
						v-model="vm.reportOptions.strategy2_mode"
						:items="vm.strategiesSelectOptions"
					/>
				</RvSettingsRow>

				<RvSettingsRow label="Strategy 3 Mode">
					<FmSelect
						v-model="vm.reportOptions.strategy3_mode"
						:items="vm.strategiesSelectOptions"
					/>
				</RvSettingsRow>

				<RvSettingsRow
					label="Allocation mode"
					v-if="vm.entityType === 'pl-report'"
				>
					<FmSelect
						v-model="vm.reportOptions.allocation_mode"
						:items="vm.selectOptions"
					/>
				</RvSettingsRow>

				<RvSettingsRow label="Offsetting Size">
					<FmSelect
						v-model="vm.reportOptions.approach_multiplier"
						:items="vm.approachMultiplierOptions"
					/>
				</RvSettingsRow>

				<h5 class="headers">Filters</h5>

				<RvSettingsRow label="Portfolios multiselector">
					<BaseMultiSelectInput
						v-model="vm.reportOptions.portfolios"
						:items="vm.portfolios"
						title="Portfolios multiselector"
						item_title="short_name"
						item_id="id"
					/>
				</RvSettingsRow>

				<RvSettingsRow label="Accounts multiselector">
					<BaseMultiSelectInput
						v-model="vm.reportOptions.accounts"
						:items="vm.accounts"
						title="Accounts multiselector"
						item_title="short_name"
						item_id="id"
					/>
				</RvSettingsRow>

				<RvSettingsRow label="Strategies 1 multiselector">
					<BaseMultiSelectInput
						v-model="vm.reportOptions.strategies1"
						:items="vm.strategies1"
						title="Strategies 1 multiselector"
						item_title="short_name"
						item_id="id"
					/>
				</RvSettingsRow>

				<RvSettingsRow label="Strategies 2 multiselector">
					<BaseMultiSelectInput
						v-model="vm.reportOptions.strategies2"
						:items="vm.strategies2"
						title="Strategies 2 multiselector"
						item_title="short_name"
						item_id="id"
					/>
				</RvSettingsRow>

				<RvSettingsRow label="Strategies 3 multiselector">
					<BaseMultiSelectInput
						v-model="vm.reportOptions.strategies3"
						:items="vm.strategies3"
						title="Strategies 3 multiselector"
						item_title="short_name"
						item_id="id"
					/>
				</RvSettingsRow>

				<h5 class="headers">Market Value/Exposure %</h5>

				<RvSettingsRow
					label="Calculation Grouping"
					v-if="vm.entityType === 'pl-report'"
				>
					<FmSelect
						v-model="vm.reportOptions.calculationGroup"
						:items="vm.calculationGroupOptions"
					/>
				</RvSettingsRow>

				<RvSettingsRow label="Custom Fields">
					<BaseMultiSelectInput
						v-model="vm.selectedCustomFields"
						:items="vm.customFieldsNames"
						title="Accounts multiselector"
						item_title="name"
						item_id="id"
						@update:model-value="vm.selectedCustomFieldsChanged()"
					/>
				</RvSettingsRow>

				<RvSettingsRow>
					<FmCheckbox
						label="Show exposure details"
						v-model="vm.reportOptions.show_balance_exposure_details"
					/>
				</RvSettingsRow>

				<RvSettingsRow>
					<FmCheckbox
						label="Show transaction details"
						v-model="vm.reportOptions.show_transaction_details"
					/>
				</RvSettingsRow>
			</div>

			<div v-if="vm.entityType == 'transaction-report'">
				<h5 class="default-f-s">General Settings</h5>

				<div class="flex-column">
					<!--<div class="g-report-settings-row p-b-8" >
								<div class="default-f-s">Date from</div>
								<date-input model="vm.reportOptions.begin_date" class="g-report-settings-field"></date-input>
						</div>


						<div class="g-report-settings-row p-b-8">
								<div class="default-f-s">Date to</div>
								<date-input model="vm.reportOptions.end_date" class="g-report-settings-field"></date-input>
						</div>-->
					<div class="g-report-settings-row p-b-8">
						<div class="default-f-s">Report date</div>

						<div class="g-report-settings-field">
							<complex-zh-datepicker
								date="vm.reportOptions.begin_date"
								datepicker-options="vm.reportLayoutOptions.datepickerOptions.reportFirstDatepicker"
								second-date="vm.reportOptions.end_date"
								second-datepicker-options="vm.reportLayoutOptions.datepickerOptions.reportLastDatepicker"
								ev-data-service="evDataService"
								ev-event-service="evEventService"
								attribute-data-service="attributeDataService"
								is-disabled="vm.disableDatepicker"
								selector-look="input"
							></complex-zh-datepicker>
						</div>
					</div>

					<div class="g-report-settings-row p-b-8">
						<div class="default-f-s">Table font size</div>

						<dropdown-select
							model="vm.tableFontSize"
							menu-options="vm.tableFontSizeOptions"
							small-options="{tooltipText: 'Table font size'}"
							class="g-report-settings-field"
						>
						</dropdown-select>
					</div>

					<div class="g-report-settings-row p-b-8" v-if="vm.fieldsReady">
						<div class="default-f-s">Date Field</div>

						<dropdown-select
							model="vm.reportOptions.date_field"
							menu-options="vm.dateFieldOptions"
							small-options="{tooltipText: 'Date field'}"
							class="g-report-settings-field"
						>
						</dropdown-select>
					</div>

					<div class="g-report-settings-row p-b-16">
						<div class="default-f-s">Custom Fields</div>

						<two-fields-multiselect
							items="vm.customFieldsNames"
							model="vm.selectedCustomFields"
							selected-items="vm.selectedCustomFields"
							nothing-selected-text="Off"
							selected-items-indication="chips"
							on-change-callback="vm.selectedCustomFieldsChanged()"
							name-property="name"
							class="g-report-settings-field"
						></two-fields-multiselect>
					</div>

					<hr />

					<div class="g-report-settings-row p-b-8">
						<div class="default-f-s">Depth Level</div>

						<dropdown-select
							model="vm.reportOptions.depth_level"
							menu-options="vm.depthLevelOptions"
							small-options="{tooltipText: 'Depth Level'}"
							class="g-report-settings-field"
						>
						</dropdown-select>
					</div>
				</div>
			</div>
		</div>

		<div v-if="!vm.checkReadyStatus" class="p-t-24 p-b-24">
			<FmLoader></FmLoader>
		</div>

		<template #controls>
			<div class="flex aic sb">
				<FmBtn type="text" @click="vm.cancel()"> close </FmBtn>

				<FmBtn @click="vm.saveSettings()" v-if="!vm.disableChangesSaving"
					>Save</FmBtn
				>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>
	import evEvents from '@/angular/services/entityViewerEvents'
	import currencyService from '~~/src/angular/services/currencyService'
	import metaContentTypesService from '~~/src/angular/services/metaContentTypesService'
	import portfolioService from '~~/src/angular/services/portfolioService'
	import pricingPolicyService from '~~/src/angular/services/pricingPolicyService'
	import customFieldServiceInst from '~~/src/angular/services/reports/customFieldService'
	import transactionClassService from '~~/src/angular/services/transaction/transactionClassService'

	// portfolioService
	let customFieldService = new customFieldServiceInst()
	const props = defineProps(['payload'])
	const { resolve, reject, disableChangesSaving } = props.payload

	const { evEventService, evDataService, attributeDataService } =
		inject('ngDependace')
	// 	customFieldService,
	// 	ecosystemDefaultService,
	// 	uiService,
	var vm = reactive({})

	vm.reportOptions = JSON.parse(
		JSON.stringify(evDataService.getReportOptions())
	)
	vm.reportLayoutOptions = JSON.parse(
		JSON.stringify(evDataService.getReportLayoutOptions())
	)

	if (vm.reportOptions.accounts_cash && vm.reportOptions.accounts_cash.length) {
		vm.accountsCash = vm.reportOptions.accounts_cash[0]
	} else {
		vm.accountsCash = 0
	}
	// console.log('vm.reportOptions:', vm.reportOptions)

	if (
		vm.reportOptions.accounts_position &&
		vm.reportOptions.accounts_position.length
	) {
		vm.accountsPosition = vm.reportOptions.accounts_position[0]
	} else {
		vm.accountsPosition = 0
	}

	if (!vm.reportOptions.depth_level) {
		vm.reportOptions.depth_level = 'base_transaction'
	}

	/* vm.selectOptions = [
            {
                value: 0,
                caption: "Ignore"
            },
            {
                value: 1,
                caption: "Independent"
            }
        ]; */
	vm.selectOptions = [
		{
			id: 0,
			name: 'Ignore',
		},
		{
			id: 1,
			name: 'Independent',
		},
	]

	vm.strategiesSelectOptions = [
		{
			id: 0,
			name: 'Ignore',
		},
		{
			id: 1,
			name: 'Independent',
		},
		{
			id: 2,
			name: 'Offsetting (Interdependent - 0/100, 100/0, 50/50)',
		},
	]

	vm.tableFontSizeOptions = [
		{ id: 'small', name: 'Small' },
		{ id: 'medium', name: 'Medium' },
		{ id: 'large', name: 'Large' },
	]

	vm.dateFieldOptions = [
		{ id: 'transaction_date', name: 'Transaction Date' },
		{ id: 'accounting_date', name: 'Accounting Date' },
		{ id: 'cash_date', name: 'Cash Date' },
		{ id: 'date', name: 'Complex Transaction Date' },
		{ id: 'user_date_1', name: 'User Date 1' },
		{ id: 'user_date_2', name: 'User Date 2' },
		{ id: 'user_date_3', name: 'User Date 3' },
		{ id: 'user_date_4', name: 'User Date 4' },
		{ id: 'user_date_5', name: 'User Date 5' },
		// {id: 'user_date_6', name: 'User Date 6'},
		// {id: 'user_date_7', name: 'User Date 7'},
		// {id: 'user_date_8', name: 'User Date 8'},
		// {id: 'user_date_9', name: 'User Date 9'},
		// {id: 'user_date_10', name: 'User Date 10'},
	]

	vm.depthLevelOptions = [
		{ id: 'complex_transaction', name: 'Complex Transaction' },
		{ id: 'base_transaction', name: 'Base Transaction' },
		{ id: 'entry', name: 'Entry' },
	]

	vm.costMethod = [
		{ id: 1, name: 'AVCO' },
		{ id: 2, name: 'FIFO' },
	]

	vm.approachMultiplierOptions = [
		{
			id: 0,
			name: '0/100',
		},
		{
			id: 0.5,
			name: '50/50',
		},
		{
			id: 1,
			name: '100/0',
		},
	]

	vm.calculationGroupOptions = [
		{
			id: 'portfolio',
			name: 'Portfolio',
		},
		{
			id: 'account',
			name: 'Account',
		},
		{
			id: 'strategy1',
			name: 'Strategy 1',
		},
		{
			id: 'strategy2',
			name: 'Strategy 2',
		},
		{
			id: 'strategy3',
			name: 'Strategy 3',
		},
	]

	if (vm.reportOptions.table_font_size) {
		vm.tableFontSize = vm.reportOptions.table_font_size
	} else {
		vm.tableFontSize = vm.tableFontSizeOptions[0].id
	}

	/* vm.entityType = options.entityType;
        vm.disableChangesSaving = options.disableChangesSaving; // when opened inside dashboard */
	let et = new metaContentTypesService().findEntityByContentType(
		evDataService.getEntityType()
	)
	vm.entityType = et
	vm.disableChangesSaving = disableChangesSaving // when opened inside dashboard

	vm.disableDatepicker = false

	vm.readyStatus = {
		pricingPolicy: false,
		currency: false,
		// portfolio: false,
		// account: false,
		// strategy1: false,
		// strategy2: false,
		// strategy3: false,
		transactionClass: false,
	}

	vm.getPricingPolicies = async function () {
		vm.readyStatus.pricingPolicy = false

		var opitons = {
			pageSize: 1000,
			page: 1,
		}
		await pricingPolicyService.getListLight(opitons).then(function (data) {
			vm.pricingPolicies = data.results.map(function (pPolicy) {
				return {
					user_code: pPolicy.user_code,
					name: pPolicy.short_name,
				}
			})

			vm.readyStatus.pricingPolicy = true
		})
	}

	vm.onSearchChange = function ($event) {
		$event.stopPropagation()
	}

	vm.getCurrencies = async function () {
		vm.readyStatus.currency = false

		var options = {
			page: 1,
			pageSize: 1000,
		}
		let res = await currencyService.getListLight(options)

		vm.currencies = res.results.map(function (currency) {
			return {
				user_code: currency.user_code,
				name: currency.short_name,
			}
		})

		vm.readyStatus.currency = true

		return true
	}

	vm.optionsForMultiselect = {
		page: 1,
		pageSize: 1000,
	}

	vm.portfolios = []

	useApi('portfolioListLight.get').then((res) => {
		vm.portfolios = res.results
	})

	vm.accounts = []

	useApi('accountLight.get').then((res) => {
		vm.accounts = res.results
	})

	vm.strategies1 = []

	useApi('strategiesOneLight.get').then((res) => {
		vm.strategies1 = res.results
	})

	vm.strategies2 = []

	useApi('strategiesSecondLight.get').then((res) => {
		vm.strategies2 = res.results
	})

	vm.strategies3 = []
	useApi('strategiesThirdLight.get').then((res) => {
		vm.strategies3 = res.results
	})

	vm.getTransactionClasses = function () {
		vm.readyStatus.transactionClass = false

		transactionClassService.getList().then(function (data) {
			vm.transactionClasses = data
			vm.readyStatus.transactionClass = true
		})
	}

	vm.checkReadyStatus = computed(() => {
		var ready = true

		var keys = Object.keys(vm.readyStatus)

		for (var i = 0; i < keys.length; i = i + 1) {
			//;

			if (vm.readyStatus[keys[i]] == false) {
				ready = false
			}
		}

		return ready
	})

	vm.saveSettings = function () {
		if (vm.accountsCash === 1) {
			vm.reportOptions.accounts_cash[0] = 1
		} else {
			vm.reportOptions.accounts_cash = []
		}

		if (vm.accountsPosition === 1) {
			vm.reportOptions.accounts_position[0] = 1
		} else {
			vm.reportOptions.accounts_position = []
		}

		vm.reportOptions.table_font_size = vm.tableFontSize

		vm.reportOptions.complex_transaction_statuses_filter =
			vm.complex_transaction_statuses_filter.join(',')

		resolve({
			status: 'agree',
			data: {
				reportOptions: vm.reportOptions,
				reportLayoutOptions: vm.reportLayoutOptions,
			},
		})

		delete $mdDialog.modals['GReportSettingsDialogController']
	}

	vm.cancel = function () {
		reject()
		delete $mdDialog.modals['GReportSettingsDialogController']
	}

	vm.selectedCustomFieldsChanged = function () {
		vm.reportOptions.custom_fields_to_calculate =
			vm.selectedCustomFields.join(',')
	}

	vm.getCustomFields = function () {
		customFieldService.getList(vm.entityType).then(function (data) {
			if (vm.reportOptions.custom_fields_to_calculate) {
				vm.selectedCustomFields =
					vm.reportOptions.custom_fields_to_calculate.split(',')
			}
			vm.customFields = data.results
			vm.customFieldsNames = data.results.map(function (item) {
				return {
					id: item.name,
					name: item.name,
				}
			})
		})
	}

	let ecosystemDefaultData = null

	const getEcosystemDefaultCurrencies = async () => {
		if (!ecosystemDefaultData) {
			ecosystemDefaultData = await ecosystemDefaultService
				.getList()
				.then((res) => res.results[0])
		}

		vm.currencies.push({
			id: ecosystemDefaultData.currency_object.id,
			name: ecosystemDefaultData.currency_object.short_name,
		})

		vm.reportOptions.report_currency = ecosystemDefaultData.currency_object.id
	}

	const getEcosystemDefaultPricingPolicies = async () => {
		if (!ecosystemDefaultData) {
			ecosystemDefaultData = await ecosystemDefaultService
				.getList()
				.then((res) => res.results[0])
		}
		vm.pricingPolicies.push(ecosystemDefaultData.pricing_policy_object)
		vm.reportOptions.pricing_policy =
			ecosystemDefaultData.pricing_policy_object.id
	}

	vm.init = async function () {
		await Promise.all([vm.getPricingPolicies(), vm.getCurrencies()])

		if (vm.entityType === 'transaction-report') {
			vm.transactionsUserDates = []

			let options = {
				pageSize: 1000,
				page: 1,
			}

			metaService
				.loadDataFromAllPages(uiService.getTransactionFieldList, [options])
				.then(function (transactionFields) {
					vm.transactionsUserDates = transactionFields
						.filter(function (field) {
							return [
								'user_date_1',
								'user_date_2',
								'user_date_3',
								'user_date_4',
								'user_date_5',
							].includes(field.key)
						})
						.map(function (dateField) {
							return { name: dateField.name, id: dateField.key }
						})

					vm.transactionsUserDates.push({
						name: 'Transaction date',
						id: null,
					})
				})
		}

		let ecosystemDefProms = []
		if (!vm.currencies.length) {
			// await getEcosystemDefaultCurrencies();
			ecosystemDefProms.push(getEcosystemDefaultCurrencies())
		}

		if (!vm.pricingPolicies.length) {
			// await getEcosystemDefaultPricingPolicies();
			ecosystemDefProms.push(getEcosystemDefaultPricingPolicies())
		}

		await Promise.allSettled(ecosystemDefProms)

		if (vm.reportOptions.complex_transaction_statuses_filter) {
			vm.complex_transaction_statuses_filter =
				vm.reportOptions.complex_transaction_statuses_filter.split(',')
		} else {
			vm.complex_transaction_statuses_filter = ['booked']
		}

		// vm.getPortfolios();
		// vm.getAccounts();
		vm.getTransactionClasses()
		// vm.getStrategies1();
		// vm.getStrategies2();
		// vm.getStrategies3();

		vm.getCustomFields()

		const viewContext = evDataService.getViewContext()
		vm.disableDatepicker =
			viewContext === 'split_panel' && vm.reportLayoutOptions.useDateFromAbove

		uiService.getTransactionFieldList({ pageSize: 1000 }).then(function (data) {
			vm.fieldsReady = true

			data.results.forEach(function (field) {
				vm.dateFieldOptions.forEach(function (item) {
					if (field.key === item.id) {
						item.name = field.name
					}
				})
			})
		})
	}

	vm.init()
</script>

<style lang="scss" scoped>
	.headers {
		font-weight: 600;
		font-size: 16px;
		margin-bottom: 20px;
	}
</style>
