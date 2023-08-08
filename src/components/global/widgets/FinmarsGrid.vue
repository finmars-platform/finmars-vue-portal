<template>
	<div class="report-viewer-holder height-100">
		<AngularFmGridTable
			v-if="vm && vm.readyStatus.attributes && vm.readyStatus.layout"
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

	const props = defineProps({
		uid: String,
	})
	const dashStore = useStoreDashboard()

	let component = dashStore.getComponent(props.uid)

	const inputs = computed(() => {
		let props = dashStore.props.inputs.filter(
			(prop) => prop.component_id == component.uid
		)
		let obj = {}

		props.forEach((prop) => {
			obj[prop.key] = prop.__val
		})
		return obj
	})

	const outputs = computed(() => {
		let props = dashStore.props.outputs.filter(
			(prop) => prop.component_id == component.uid
		)
		let obj = {}

		props.forEach((prop) => {
			obj[prop.key] = prop
		})
		return obj
	})

	const settings = computed(() => {
		let obj = {}
		component.settings.forEach((prop) => {
			obj[prop.key] = prop.default_value
		})
		return obj
	})

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

	let $scope = {
		contentType: settings.value.content_type,
		entityType: entities[settings.value.content_type],
		viewContext: 'dashboard',
		layout: JSON.parse(settings.value.layout),
	}

	if (settings.value.content_type == 'reports.transactionreport') {
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
	}

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

		vm.value.entityViewerEventService.addEventListener(
			entityViewerEvents.ACTIVE_OBJECT_CHANGE,
			() => {
				if (outputs.value.selected_row) {
					outputs.value.selected_row.__val =
						vm.value.entityViewerDataService.getActiveObjectRow()
				}
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
