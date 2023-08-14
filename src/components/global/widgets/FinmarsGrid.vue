<template>
	<div class="report-viewer-holder height-100">
		<AngularFmGridTable
			v-if="store.current && vm && vm.readyStatus.attributes && vm.readyStatus.layout"
			class="g-group-table-holder"
			:attributeDataService="vm.attributeDataService"
			:evDataService="vm.entityViewerDataService"
			:evEventService="vm.entityViewerEventService"
			:spExchangeService="vm.splitPanelExchangeService"
			:components="{
				addEntityBtn: true,
				autoReportRequest: false,
				columnArea: true,
				columnAreaHeader: true,
				fieldManagerBtn: true,
				filterArea: false,
				groupingArea: false,
				layoutManager: false,
				splitPanel: false,
				topPart: false,
				viewer: true,
			}"
			:vm="vm"
		/>
		<div
			v-else
			class="e-data-loader"
			layout="row"
			layout-sm="column"
			layout-align="space-around"
		>
			<FmLoader></FmLoader>
		</div>
	</div>
</template>

<script setup>
	import reportViewerController from '@/angular/controllers/entityViewer/reportViewerController'
	import entityViewerEvents from '~~/src/angular/services/entityViewerEvents'
	import evEvents from "~/angular/services/entityViewerEvents";
	import useEvAttributesStore from "~/stores/useEvAttributesStore";

	const props = defineProps({
		uid: String,
	})

	const store = useStore();
	const dashStore = useStoreDashboard();
	const evAttrsStore = useEvAttributesStore();

	let component = dashStore.getComponent(props.uid)

	let layout = JSON.parse(component.settings.layout);

	/*const inputs = computed(() => {
		let props = dashStore.props.inputs.filter(
			(prop) => prop.component_id == component.uid
		)
		let obj = {}

		props.forEach((prop) => {
			obj[prop.key] = prop.__val
		})
		return obj
	})*/
	let inputs = computed(() => {
		return dashStore.props.inputs.filter(input => input.component_id === component.uid );
	});

	let inputsVals = computed( () => {

		let result = {};

		// const some = dashStore.props.inputs.filter(input => input.component_id === component.uid )

		inputs.value.forEach(input => {
			result[input.uid] = input.__val;
		})

		return result;

	})

	/* ME 2023-08-06
	const outputs = computed(() => {
		let props = dashStore.props.outputs.filter(
			(prop) => prop.component_id == component.uid
		)
		let obj = {}

		props.forEach((prop) => {
			obj[prop.key] = prop
		})
		return obj
	}) */

	/*const settings = computed(() => {
		let obj = {}
		component.settings.forEach((prop) => {
			obj[prop.key] = prop.default_value
		})
		return obj
	})*/
	// let layoutData = computed(() => component.settings.layoutData );

	const route = {
		current: {
			name: 'app.portal.reports.profit-and-lost',
		},
		params: useRoute().query,
	}

	window.$state = route

	// Modal hack
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

	let vm = ref(null)

	let entities = {
		'reports.transactionreport': 'transaction-report',
		'reports.plreport': 'pl-report',
		'reports.balancereport': 'balance-report',
	}

	/*let $scope = {
		contentType: settings.value.content_type,
		entityType: entities[settings.value.content_type],
		viewContext: 'dashboard',
		layout: JSON.parse(settings.value.layout),
	}*/
	let $scope = {
		contentType: component.settings.content_type,
		entityType: entities[ component.settings.content_type ],
		viewContext: 'dashboard',
		layout: layout,
	}

	/*if ( component.settings.content_type == 'reports.transactionreport' ) {
		watch(
			() => inputs.value.selected_row,
			() => {
				vm.value.entityViewerDataService.setActiveObject(
					inputs.value.selected_row
				)
				vm.value.entityViewerDataService.setActiveObjectFromAbove(
					inputs.value.selected_row
				)

				vm.value.entityViewerEventService.dispatchEvent(
					entityViewerEvents.ACTIVE_OBJECT_CHANGE
				)
				vm.value.entityViewerEventService.dispatchEvent(
					entityViewerEvents.ACTIVE_OBJECT_FROM_ABOVE_CHANGE
				)
			}
		)
	}*/

	// debounce needed because multiple inputs change consecutively
	/*const updateRvAfterInputsChange = useDebounce(function () {

			// console.log("testing1090.finmarsGrid updateRvAfterInputsChange called");
			vm.value.entityViewerEventService.dispatchEvent(evEvents.FILTERS_CHANGE);
			vm.value.entityViewerEventService.dispatchEvent(evEvents.REPORT_OPTIONS_CHANGE);
			vm.value.entityViewerEventService.dispatchEvent(evEvents.REQUEST_REPORT);

	}, 200)*/

	const inputsValsWatcherCb = useDebounce(function (newVal, oldVal) {
		// console.log("testing1090.finmarsGrid inputsValsWatcherCb", newVal, oldVal);
		Object.keys(newVal).forEach(inputId => {

			if ( newVal[inputId] === oldVal[inputId] ) {
				return;
			}

			const input = dashStore.props.inputs.find( input => input.uid === inputId );
			// console.log("testing1090.finmarsGrid inputsValsWatcherCb input", input);
			if ( input.key.startsWith('reportOptions__') ) {

				const ro = updateReportOptionsWithDashInputs(input, vm.value.entityViewerDataService);
				// console.log("testing1090.finmarsGrid report options input changed", input, ro);
				vm.value.entityViewerDataService.setReportOptions(ro);

			}
			else {

				const filters = updateFiltersWithDashInputs(input, vm.value.entityViewerDataService);
				// console.log("testing1090.finmarsGrid filter input changed", input, filters);
				vm.value.entityViewerDataService.setFilters(filters);

			}

		})

		vm.value.entityViewerEventService.dispatchEvent(evEvents.FILTERS_CHANGE);
		vm.value.entityViewerEventService.dispatchEvent(evEvents.REPORT_OPTIONS_CHANGE);
		vm.value.entityViewerEventService.dispatchEvent(evEvents.REQUEST_REPORT);

	}, 200);

	/*watch(
		() => inputs.value.map(input => input.__val), // watching only 'inputs' does not trigger watcher on __val change
		() => {

			const result = onDashCompInputsChange(inputs.value, vm.value.entityViewerDataService);

			if (result.filters) {

				vm.value.entityViewerDataService.setFilters(result.filters);
				vm.value.entityViewerEventService.dispatchEvent(evEvents.FILTERS_CHANGE);

				if (layout.content_type === 'reports.transactionreport') {
					/!*
					Some of layout.data.filters of transaction report are backend filters.
					Requesting report from backend in case of changes of backend filters.
					*!/
					vm.value.entityViewerEventService.dispatchEvent(evEvents.REQUEST_REPORT);

				} else {
					vm.value.entityViewerEventService.dispatchEvent(evEvents.UPDATE_TABLE);
				}

			}

			if (result.reportOptions) {
				vm.value.entityViewerDataService.setReportOptions(result.reportOptions);
				vm.value.entityViewerEventService.dispatchEvent(evEvents.REPORT_OPTIONS_CHANGE);
			}

		}
	)*/

	watch(
		() => inputs.value.matrix_row,
		() => {
			console.log('inputs.value.matrix_row:', inputs.value.matrix_row)
			vm.value.entityViewerDataService.setActiveObject(inputs.value.matrix_row)
			vm.value.entityViewerDataService.setActiveObjectFromAbove(
				inputs.value.matrix_row
			)

			vm.value.entityViewerEventService.dispatchEvent(
				entityViewerEvents.ACTIVE_OBJECT_CHANGE
			)
			vm.value.entityViewerEventService.dispatchEvent(
				entityViewerEvents.ACTIVE_OBJECT_FROM_ABOVE_CHANGE
			)
		}
	)

	onMounted(async () => {
		vm.value = new reportViewerController({
			$scope,
			$stateParams: route.params,
			route,
		})

		const filtersList = formatFiltersForDashInputs(inputs.value, layout.content_type, vm.value.entityViewerDataService, evAttrsStore);
		vm.value.entityViewerDataService.setFilters(filtersList);

		/*inputs.value.forEach(input => {

			let watcherCb;

			if ( input.key.startsWith('reportOptions__') ) {

				watcherCb = () => {

					const ro = updateReportOptionsWithDashInputs(input, vm.value.entityViewerDataService);
					// console.log("testing1090.finmarsGrid report options input changed", input, ro);
					vm.value.entityViewerDataService.setReportOptions(ro);

					updateRvAfterInputsChange();

				}

			} else {

				watcherCb = () => {

					const filters = updateFiltersWithDashInputs(input, vm.value.entityViewerDataService);
					// console.log("testing1090.finmarsGrid filter input changed", input, filters);
					vm.value.entityViewerDataService.setFilters(filters);

					updateRvAfterInputsChange();

				}

			}

			watch(
				() => input.__val,
				watcherCb
			)

		})*/

		watch(
			inputsVals,
			inputsValsWatcherCb,

		)

		/* ME 2023-08-06
		vm.value.entityViewerEventService.addEventListener(
			entityViewerEvents.ACTIVE_OBJECT_CHANGE,
			() => {
				if (outputs.value.selected_row) {
					outputs.value.selected_row.__val =
						vm.value.entityViewerDataService.getActiveObjectRow()
				}
			}
		) */
		vm.value.entityViewerEventService.addEventListener(
			entityViewerEvents.ACTIVE_OBJECT_CHANGE,
			() => {
				/*if (outputs.value.selected_row) {
					outputs.value.selected_row.__val =
						vm.value.entityViewerDataService.getActiveObjectRow()
				}*/
				const output = dashStore.getComponentOutputByKey(component.uid, 'active_object');
				dashStore.setComponentOutputValue( output.uid, vm.value.entityViewerDataService.getActiveObjectRow() )

			}
		)

		// evEventService.addEventListener(evEvents.LAYOUT_NAME_CHANGE, function () {
		// 	listLayout = evDataService.getListLayout()

		// 	if (listLayout && listLayout.name) {
		// 		layoutData.name = listLayout.name
		// 	}
		// })
	})

</script>

<style lang="scss" scoped></style>
