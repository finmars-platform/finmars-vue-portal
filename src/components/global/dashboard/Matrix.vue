<template>
	<div>
		<AngularFmGridTableMatrix
			v-if="vm"
			:matrixSettings="viewSettings"
			ref="matrixComp"
		/>

		<div v-if="errorMessage" class="red-text">{{ errorMessage }}</div>
	</div>
</template>

<script setup>
	import reportViewerController from '~~/src/angular/controllers/entityViewer/reportViewerController'
	import entityViewerEvents from '~~/src/angular/services/entityViewerEvents'

	let props = defineProps({
		uid: String,
	})

	onMounted(() => {})

	const dashStore = useStoreDashboard()
	const evAttrsStore = useEvAttributesStore()
	const layoutsStore = useLayoutsStore()
	const component = computed(() => dashStore.getComponent(props.uid))
	console.log('component:', component)

	let readyStatus = ref(false)
	let matrixComp = ref(null);

	let errorMessage = ref('')

	let inputs = computed(() => {
		return dashStore.props.inputs.filter(input => input.component_id === component.value.uid );
	});

	let inputsVals = computed(() => {
		let result = {}

		// const some = dashStore.props.inputs.filter(input => input.component_id === component.value.uid )

		inputs.value.forEach((input) => {
			result[input.uid] = input.__val
		})

		return result
	})

	const inputsValsWatcherCb = useDebounce(function (newVal, oldVal) {

		Object.keys(inputsVals.value).forEach((inputId) => {
			if (newVal[inputId] === oldVal[inputId]) {
				return
			}

			const input = dashStore.props.inputs.find(
				(input) => input.uid === inputId
			)

			if (input.key.startsWith('reportOptions__')) {
				const ro = updateReportOptionsWithDashInputs(
					input,
					vm.value.entityViewerDataService
				)
				vm.value.entityViewerDataService.setReportOptions(ro)
			} else {
				const filters = updateFiltersWithDashInputs(
					input,
					vm.value.entityViewerDataService
				)
				vm.value.entityViewerDataService.setFilters(filters)
			}
		})

		vm.value.entityViewerEventService.dispatchEvent(
			entityViewerEvents.FILTERS_CHANGE
		)
		vm.value.entityViewerEventService.dispatchEvent(
			entityViewerEvents.REPORT_OPTIONS_CHANGE
		)
		vm.value.entityViewerEventService.dispatchEvent(
			entityViewerEvents.REQUEST_REPORT
		)
	}, 200)

	async function getLayoutId() {
		let res = await layoutsStore.getLayoutByUserCode(
			component.value.settings.content_type,
			component.value.settings.layout
		)

		if (res.error) {
			errorMessage.value = `ERROR: Layout with user code: ${component.value.settings.layout} not found`
			throw res.error
		} else {
			return res.id
		}
	}

	let vm = ref(null)

	let entities = {
		'reports.transactionreport': 'transaction-report',
		'reports.plreport': 'pl-report',
		'reports.balancereport': 'balance-report',
	}

	/*let layout = {
		id: 698,
		content_type: 'reports.plreport',
		name: 'New layout',
		user_code: 'com.finmars.local:reports.plreport:mobile',
		configuration_code: 'com.finmars.local',
		is_default: true,
		is_active: false,
		is_systemic: false,
		data: {
			additions: {
				isOpen: true,
				layoutData: {
					content_type: 'reports.transactionreport',
					layoutId: 648,
					name: 'Investor Transactions (PL)',
					user_code:
						'com.finmars.local:reports.transactionreport:investor_transactions_pl_',
				},
				type: 'transaction-report',
			},
			columns: [
				{
					___column_id: '4fa339e82e030128ad0539908d205dba',
					columns: true,
					error_data: null,
					id: 11,
					key: 'custom_fields.asset_types',
					name: 'Custom Field. Asset Types',
					options: {
						sort: null,
						sort_settings: {},
					},
					style: {
						width: '300px',
					},
					value_type: 10,
				},
				{
					___column_id: '9091aec9603b23598dbe0e0ab48156fc',
					columns: true,
					isHidden: false,
					key: 'item_type_name',
					name: 'Balance. Item Type',
					options: {
						sort: null,
						sort_settings: {},
					},
					style: {
						width: '100px',
					},
					value_type: 10,
				},
				{
					___column_id: '38681c7355f296596587fa4cf3559baa',
					columns: true,
					key: 'item_group_name',
					name: 'Performance. Group Name',
					options: {
						sort: null,
						sort_settings: {},
					},
					style: {
						width: '167px',
					},
					value_type: 10,
				},
				{
					___column_id: 'a631eae73eeddae40e22c4b94f2304c1',
					columns: true,
					key: 'total',
					name: 'Performance. Total',
					options: {
						sort: null,
						sort_settings: {},
					},
					report_settings: {
						subtotal_formula_id: 1,
					},
					style: {
						width: '100px',
					},
					value_type: 20,
				},
				{
					___column_id: '0ee9b69bca9c1e61cc5997f483f27191',
					columns: true,
					isHidden: false,
					key: 'position_size',
					name: 'Balance. Position size',
					options: {
						sort: null,
						sort_settings: {},
					},
					style: {
						width: '155px',
					},
					value_type: 20,
				},
				{
					___column_id: '7dc503c58ddbfb129e056b8dbd5172b9',
					columns: true,
					isHidden: false,
					key: 'short_name',
					name: 'Balance. Short name',
					options: {
						sort: null,
						sort_settings: {},
					},
					style: {
						width: '218px',
					},
					value_type: 10,
				},
				{
					___column_id: '125167c1044977d44f4dd9d48f243a68',
					columns: true,
					isHidden: false,
					key: 'portfolio.user_code',
					name: 'Portfolio. User code',
					options: {
						sort: null,
						sort_settings: {},
					},
					style: {
						width: '168px',
					},
					value_type: 10,
				},
				{
					___column_id: 'f06dc29edaf03b159a783c9d03541e8c',
					columns: true,
					isHidden: false,
					key: 'account.user_code',
					name: 'Account. User code',
					options: {
						sort: null,
						sort_settings: {},
					},
					style: {
						width: '147px',
					},
					value_type: 10,
				},
			],
			components: {
				addEntityBtn: true,
				autoReportRequest: false,
				columnArea: true,
				columnAreaHeader: true,
				fieldManagerBtn: true,
				filterArea: true,
				groupingArea: false,
				layoutManager: true,
				splitPanel: true,
				topPart: true,
				viewer: true,
			},
			entityType: null,
			export: {},
			filters: [
				{
					content_type: 'portfolios.portfolio',
					key: 'portfolio.user_code',
					name: 'Portfolio. User code',
					options: {
						enabled: true,
						exclude_empty_cells: false,
						filter_type: 'contains',
						filter_values: ['Model'],
						use_from_above: {},
					},
					value_type: 10,
				},
			],
			folding: false,
			grouping: [
				{
					___group_type_id: '4fa339e82e030128ad0539908d205dba',
					columns: true,
					error_data: null,
					groups: true,
					id: 11,
					key: 'custom_fields.asset_types',
					name: 'Custom Field. Asset Types',
					options: {
						sort: null,
						sort_settings: {},
					},
					report_settings: {
						is_level_folded: false,
						subtotal_type: 'line',
					},
					style: {
						width: '300px',
					},
					value_type: 10,
				},
				{
					___group_type_id: '9091aec9603b23598dbe0e0ab48156fc',
					columns: true,
					groups: true,
					key: 'item_type_name',
					name: 'Balance. Item Type',
					options: {
						sort: null,
						sort_settings: {},
					},
					report_settings: {
						is_level_folded: false,
						subtotal_type: 'line',
					},
					style: {
						width: '100px',
					},
					value_type: 10,
				},
				{
					___group_type_id: '38681c7355f296596587fa4cf3559baa',
					columns: true,
					groups: true,
					key: 'item_group_name',
					name: 'Performance. Group Name',
					options: {
						sort: null,
						sort_settings: {},
					},
					report_settings: {
						is_level_folded: false,
						subtotal_type: 'line',
					},
					style: {
						width: '167px',
					},
					value_type: 10,
				},
			],
			interfaceLayout: {
				columnArea: {
					height: 50,
				},
				splitPanel: {
					height: 245,
				},
			},
			reportLayoutOptions: {
				datepickerOptions: {
					reportFirstDatepicker: {
						datepickerMode: 'datepicker',
					},
					reportLastDatepicker: {
						datepickerMode: 'datepicker',
					},
				},
				useDateFromAbove: true,
			},
			reportOptions: {
				account_mode: 0,
				accounts: [],
				accounts_cash: [],
				accounts_cash_object: [],
				accounts_object: [],
				accounts_position: [],
				accounts_position_object: [],
				allocation_detailing: true,
				allocation_mode: 1,
				approach_multiplier: 0.5,
				calculationGroup: 'portfolio',
				complex_transaction_statuses_filter: 'booked',
				cost_method: 1,
				cost_method_object: {
					description: 'AVCO',
					id: 1,
					name: 'AVCO',
					user_code: 'AVCO',
				},
				custom_fields_to_calculate: 'Asset Types',
				date_field: 'accounting_date',
				depth_level: 'base_transaction',
				expression_iterations_count: 1,
				filters: [
					{
						content_type: 'portfolios.portfolio',
						key: 'portfolio.user_code',
						name: 'Portfolio. User code',
						options: {
							exclude_empty_cells: false,
							filter_type: 'contains',
							filter_values: [],
						},
						value_type: 10,
					},
				],
				pl_first_date: '2021-06-08',
				pl_include_zero: false,
				portfolio_mode: 1,
				portfolios: [2],
				portfolios_object: [
					{
						deleted_user_code: null,
						id: 2,
						meta: {
							app_label: 'portfolios',
							content_type: 'portfolios.portfolio',
							model_name: 'portfolio',
							space_code: 'space0crgw',
						},
						name: 'Model',
						public_name: 'Model',
						short_name: 'Model',
						user_code: 'Model',
					},
				],
				pricing_policy: 1,
				pricing_policy_object: {
					deleted_user_code: null,
					expr: '(ask+bid)/2',
					id: 1,
					meta: {
						app_label: 'instruments',
						content_type: 'instruments.pricingpolicy',
						model_name: 'pricingpolicy',
						space_code: 'space0crgw',
					},
					name: '-',
					notes: null,
					short_name: '-',
					user_code: '-',
				},
				report_currency: 2,
				report_currency_object: {
					deleted_user_code: null,
					id: 2,
					meta: {
						app_label: 'currencies',
						content_type: 'currencies.currency',
						model_name: 'currency',
						space_code: 'space0crgw',
					},
					name: 'USD - United States Dollar',
					short_name: 'USD',
					user_code: 'USD',
				},
				report_date: '2023-05-10',
				report_type: 1,
				show_balance_exposure_details: false,
				show_transaction_details: false,
				strategies1: [],
				strategies1_object: [],
				strategies2: [],
				strategies2_object: [],
				strategies3: [],
				strategies3_object: [],
				strategy1_mode: 0,
				strategy2_mode: 0,
				strategy3_mode: 0,
				table_font_size: 'small',
				transaction_classes: [],
				transaction_classes_object: [],
			},
			rootGroupOptions: {
				subtotal_type: false,
			},
			rowSettings: {},
			sorting: {
				column: {
					id: null,
					key: null,
					sort: 'ASC',
				},
				group: {
					id: null,
					key: null,
					sort: 'DESC',
				},
			},
			viewSettings: {},
			viewType: 'report_viewer',
		},
		origin_for_global_layout: null,
		sourced_from_global_layout: null,
		meta: {
			content_type: 'ui.listlayout',
			app_label: 'ui',
			model_name: 'listlayout',
			space_code: 'space0crgw',
		},
	}*/
	let layout = JSON.parse(component.value.settings.layout);

	const route = {
		current: {
			name: 'app.portal.reports.profit-and-lost',
		},
		params: useRoute().query,
	}

	window.$state = route
	window.$mdDialog = {
		modals: reactive({}),
		show(opts) {
			return new Promise((resolve, reject) => {
				window.$mdDialog.modals[opts.controller.replace(' as vm', '')] = {
					resolve,
					reject,
					...opts.locals,
				}
			})
		},
	}
	provide('$mdDialog', window.$mdDialog)

	let $scope = {
		contentType: component.value.settings.content_type,
		entityType: entities[component.value.settings.content_type],
		viewContext: 'dashboard',
		layout: layout,
	}

	let vmE

	let viewSettings = computed(() => {
		return {
			abscissa: component.value.settings.axisX,
			ordinate: component.value.settings.axisY,
			value_key: component.value.settings.valueKey,

			available_abscissa_keys: component.value.settings.availableAxisXAttributes,
			available_ordinate_keys: component.value.settings.availableAxisYAttributes,
			available_value_keys: component.value.settings.availableValueAttributes,

			number_format: component.value.settings.numberFormat,
			subtotal_formula_id: component.value.settings.subtotal_formula_id,

			matrix_view: component.value.settings.matrix_view, // possibly DEPRECATED

			styles: component.value.settings.styles,
			auto_scaling: component.value.settings.auto_scaling,
			calculate_name_column_width: component.value.settings.calculate_name_column_width,
			hide_empty_lines: component.value.settings.hide_empty_lines

		}
	})

	// debounce needed because multiple inputs change consecutively
	const updateRvAfterInputsChange = useDebounce(function () {

		vmE.entityViewerEventService.dispatchEvent(
			entityViewerEvents.FILTERS_CHANGE
		)
		vmE.entityViewerEventService.dispatchEvent(
			entityViewerEvents.REPORT_OPTIONS_CHANGE
		)
		vmE.entityViewerEventService.dispatchEvent(
			entityViewerEvents.REQUEST_REPORT
		)
	}, 200)

	watch(
		() => component.value.settings,
		() => {

			if (component.value.layout) {
				prepareData();
				matrixComp.value.init();
			}

		},
		{deep: true}
	)
	function prepareData() {

		$scope = {
			contentType: component.value.settings.content_type,
			entityType: entities[component.value.settings.content_type],
			viewContext: 'dashboard',
			layout: layout,
		}

		vmE = new reportViewerController({
			$scope,
			$stateParams: route.params,
			route,
		})

		const filtersList = formatFiltersForDashInputs(
			inputs.value,
			layout.content_type,
			vmE.entityViewerDataService,
			evAttrsStore
		)
		vmE.entityViewerDataService.setFilters(filtersList)

		vmE.entityViewerEventService.addEventListener(
			entityViewerEvents.ACTIVE_OBJECT_CHANGE,
			() => {
				/*if (outputs.value.selected_row) {
					outputs.value.selected_row.__val =
						vm.value.entityViewerDataService.getActiveObjectRow()
				}*/
				const output = dashStore.getComponentOutputByKey(component.value.uid, 'active_object');
				dashStore.setComponentOutputValue( output.uid, vmE.entityViewerDataService.getActiveObject() );

			}
		)

		// viewSettings.value = vmE.entityViewerDataService.getViewSettings(
		// 	vmE.entityViewerDataService.getViewType()
		// )
		/*viewSettings.value = {
			abscissa: component.value.settings.axisX,
			ordinate: component.value.settings.axisY,
			value_key: component.value.settings.valueKey,

			available_abscissa_keys: [
				{
					key: 'portfolio.user_code',
					name: 'Portfolio. User code',
					value_type: 10,
					content_type: 'portfolios.portfolio',
				},
				{
					key: 'instrument.user_code',
					name: 'Instrument. User code',
					value_type: 10,
					content_type: 'instruments.instrument',
				},
			],
			available_ordinate_keys: [
				{
					key: 'instrument.user_code',
					name: 'Instrument. User code',
					value_type: 10,
					content_type: 'instruments.instrument',
				},

				{
					key: 'portfolio.user_code',
					name: 'Portfolio. User code',
					value_type: 10,
					content_type: 'portfolios.portfolio',
				},
			],
			available_value_keys: [
				{
					key: 'position_size',
					name: 'Balance. Position size',
					value_type: 20,
					content_type: 'reports.balancereport',
				},
				{
					key: 'market_value',
					name: 'Balance. Market value',
					value_type: 20,
					content_type: 'reports.balancereport',
				},
			],

			number_format: component.value.settings.number_format,
			subtotal_formula_id: component.value.settings.subtotal_formula_id,

			matrix_view: component.value.settings.matrix_view, // DEPRECATED possibly

			styles: component.value.settings.styles,
			auto_scaling: component.value.settings.auto_scaling,
			calculate_name_column_width:
				component.value.settings.calculate_name_column_width,
			hide_empty_lines: component.value.settings.hide_empty_lines,
		}*/

		provide('ngDependace', {
			evDataService: vmE.entityViewerDataService,
			evEventService: vmE.entityViewerEventService,
			attributeDataService: vmE.attributeDataService,
		})

		vm.value = vmE;

	}

	/*vm.value.entityViewerEventService.addEventListener(
		entityViewerEvents.ACTIVE_OBJECT_CHANGE,
		() => {
			if (outputs.value.matrix_row) {
				outputs.value.matrix_row.__val =
					vm.value.entityViewerDataService.getActiveObject()
			}
		}
	)*/

	function init() {

		prepareData();

		watch(
			inputsVals,
			inputsValsWatcherCb,
		)

	}

	init()

</script>

<style lang="scss" scoped></style>
