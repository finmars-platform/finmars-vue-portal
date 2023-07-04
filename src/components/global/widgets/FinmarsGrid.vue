<template>
	<div class="report-viewer-holder height-100">
		<AngularFmGridTable
			v-if="vm && vm.readyStatus.attributes && vm.readyStatus.layout"
			class="g-group-table-holder"
			:attributeDataService="vm.attributeDataService"
			:evDataService="vm.entityViewerDataService"
			:evEventService="vm.entityViewerEventService"
			:spExchangeService="vm.splitPanelExchangeService"
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
	const props = defineProps({
		uid: String,
	})
	const dashStore = useStoreDashboard()

	let component = dashStore.getComponent(props.uid)

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

	let $scope = {
		contentType: 'reports.plreport',
		viewContext: 'dashboard',
	}

	onMounted(() => {
		vm.value = new reportViewerController({
			$scope,
			$stateParams: route.params,
			route,
		})
		console.log('vm.value:', vm.value)
	})
</script>

<style lang="scss" scoped></style>
