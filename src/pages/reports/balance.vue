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

	definePageMeta({
		middleware: 'auth',
		bread: [
			{
				text: 'Reports: Balance',
				disabled: true,
			},
		],
	})

    let store = useStore();
	let evAttrsStore = useEvAttributesStore();

	/*
	 * TIPS:
	 * vm.value.readyStatus set inside reportViewerController()
	 *
	 * */

	const route = {
		current: {
			name: 'app.portal.reports.balance',
		},
		params: useRoute().query,
	}

	window.$state = route

	// Modal hack
	window.$mdDialog = getMdDialogData()
	provide('$mdDialog', window.$mdDialog)

	let vm = ref(null)

	let $scope = {
		contentType: 'reports.balancereport',
		entityType: 'balance-report',
	}

	onMounted(async () => {

		/*vm.value = new reportViewerController({
			$scope,
			$stateParams: route.params,
		})*/

    vm.value = await initReportViewerController(
        $scope.contentType,
		evAttrsStore,
		{
            $scope,
            store,
            $stateParams: route.params,
      	}
      )

	})
</script>
