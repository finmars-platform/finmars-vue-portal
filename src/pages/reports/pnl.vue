<template>
	<div class="report-viewer-holder height-100">
		<LazyAngularFmGridTable
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

	definePageMeta({
		middleware: 'auth',
		bread: [
			{
				text: 'Reports: P&L',
				disabled: true,
			},
		],
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
		entityType: 'pl-report',
	}

	onMounted(() => {
		vm.value = new reportViewerController({
			$scope,
			$stateParams: route.params,
			route,
		})
	})
</script>
