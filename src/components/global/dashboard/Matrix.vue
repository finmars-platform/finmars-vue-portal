<template>
	<div>
		<AngularFmGridTableMatrix v-if="vm" :matrixSettings="viewSettings" />

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

	let readyStatus = ref(false)

	let errorMessage = ref('')

	let reportLayoutUc = component.value.settings.layout
	let reportLayoutId

	let inputs = computed(() => {
		return dashStore.props.inputs.filter(
			(input) => input.component_id === component.value.uid
		)
	})

	/*let inputsVals = computed( () => {

		let result = {};

		const some = dashStore.props.inputs.filter(input => input.component_id === component.uid )

		some.forEach(input => {
			result[input.uid] = input.__val;
		})

		return result;

	})*/

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

	async function updateMatrix() {
		if (component.value.settings.layout !== reportLayoutUc) {
			// user code changed
			reportLayoutId = await getLayoutId()
		}

		let settings = JSON.parse(JSON.stringify(component.value.settings))
		settings.layout = reportLayoutId

		const payload = {
			id: props.uid,
			settings: settings,
		}

		iframeWindow.postMessage(
			{ action: 'SETTINGS_CHANGE', payload: payload },
			windowOrigin
		)
	}

	const outputs = computed(() => {
		let props = dashStore.props.outputs.filter(
			(prop) => prop.component_id == component.value.uid
		)
		let obj = {}

		props.forEach((prop) => {
			obj[prop.key] = prop
		})
		return obj
	})

	watch(component, updateMatrix)

	let vm = ref(null)

	let entities = {
		'reports.transactionreport': 'transaction-report',
		'reports.plreport': 'pl-report',
		'reports.balancereport': 'balance-report',
	}

	let layout = JSON.parse(component.value.settings.layout)

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

	let viewSettings = ref({})

	// debounce needed because multiple inputs change consecutively
	const updateRvAfterInputsChange = useDebounce(function () {
		// console.log("testing1090.finmarsGrid updateRvAfterInputsChange called");
		vmE.entityViewerEventService.dispatchEvent(evEvents.FILTERS_CHANGE)
		vmE.entityViewerEventService.dispatchEvent(evEvents.REPORT_OPTIONS_CHANGE)
		vmE.entityViewerEventService.dispatchEvent(evEvents.REQUEST_REPORT)
	}, 200)

	function init() {
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

		inputs.value.forEach((input) => {
			let watcherCb

			if (input.key.startsWith('reportOptions__')) {
				watcherCb = () => {
					const ro = updateReportOptionsWithDashInputs(
						input,
						vmE.entityViewerDataService
					)
					// console.log("testing1090.finmarsGrid report options input changed", input, ro);
					vmE.entityViewerDataService.setReportOptions(ro)

					updateRvAfterInputsChange()
				}
			} else {
				watcherCb = () => {
					const filters = updateFiltersWithDashInputs(
						input,
						vmE.entityViewerDataService
					)
					// console.log("testing1090.finmarsGrid filter input changed", input, filters);
					vmE.entityViewerDataService.setFilters(filters)

					updateRvAfterInputsChange()
				}
			}

			watch(() => input.__val, watcherCb)
		})

		vmE.entityViewerEventService.addEventListener(
			entityViewerEvents.ACTIVE_OBJECT_CHANGE,
			() => {
				/*if (outputs.value.selected_row) {
					outputs.value.selected_row.__val =
						vm.value.entityViewerDataService.getActiveObjectRow()
				}*/
				const output = dashStore.getComponentOutputByKey(
					component.value.uid,
					'active_object'
				)
				dashStore.setComponentOutputValue(
					output.uid,
					vmE.entityViewerDataService.getActiveObject()
				)
			}
		)

		// viewSettings.value = vmE.entityViewerDataService.getViewSettings(
		// 	vmE.entityViewerDataService.getViewType()
		// )
		/*viewSettings.value = {
			abscissa: 'instrument.user_code',
			ordinate: 'portfolio.user_code',
			value_key: 'position_size',

			subtotal_formula_id: 1,
			matrix_view: 'fixed-totals',
			auto_refresh: false,
			auto_scaling: false,
			calculate_name_column_width: false,
			hide_empty_lines: '',
			filters: {
				show_filters_area: false,
				show_use_from_above_filters: false,
			},
			user_settings: {},

			styles: {
				cell: {
					text_align: 'center',
				},
			},
		}*/
		viewSettings.value = {
			abscissa: component.value.settings.axisX,
			ordinate: component.value.settings.axisY,
			value_key: component.value.settings.valueKey,

			available_abscissa_keys: [],
			available_ordinate_keys: [],
			available_value_keys: [],

			number_format: component.value.settings.number_format,
			subtotal_formula_id: component.value.settings.subtotal_formula_id,

			matrix_view: component.value.settings.matrix_view, // DEPRECATED possibly

			styles: component.value.settings.styles,
			auto_scaling: component.value.settings.auto_scaling,
			calculate_name_column_width:
				component.value.settings.calculate_name_column_width,
			hide_empty_lines: component.value.settings.hide_empty_lines,
		}
		provide('ngDependace', {
			evDataService: vmE.entityViewerDataService,
			evEventService: vmE.entityViewerEventService,
			attributeDataService: vmE.attributeDataService,
		})

		vm.value = vmE

		vm.value.entityViewerEventService.addEventListener(
			entityViewerEvents.ACTIVE_OBJECT_CHANGE,
			() => {
				if (outputs.value.matrix_row) {
					outputs.value.matrix_row.__val =
						vm.value.entityViewerDataService.getActiveObject()
				}
			}
		)
	}

	init()
</script>

<style lang="scss" scoped></style>
