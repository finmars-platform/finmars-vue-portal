<template>
	<div class="entity-viewer-holder">
		<div class="height-100">
			<div
				v-if="vm && vm.readyStatus.attributes && vm.readyStatus.layout"
				class="g-group-table-holder"
			>
				<AngularFmGridTable
					:attributeDataService="vm.attributeDataService"
					:evDataService="vm.entityViewerDataService"
					:evEventService="vm.entityViewerEventService"
					:spExchangeService="vm.splitPanelExchangeService"
					:vm="vm"
				/>
			</div>
			<div v-else>
				<div
					class="e-data-loader"
					layout="row"
					layout-sm="column"
					layout-align="space-around"
				>
					<FmLoader></FmLoader>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
	import entityViewerController from '@/angular/controllers/entityViewer/entityViewerController'

	definePageMeta({
		middleware: 'auth',
		bread: [
			{
				text: 'Transaction: transactions',
				disabled: true,
			},
		],
	})

	const route = {
		current: {
			name: 'app.portal.data.transaction',
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

	onMounted(() => {
		vm.value = new entityViewerController(route)
	})

	// fetchTrans()
	async function fetchTrans() {
		let res = await useApi('transactionComplexFiltered.post', {
			body: {
				groups_types: [],
				page: 1,
				groups_values: [],
				groups_order: 'asc',
				page_size: 5000,
				ev_options: {
					complex_transaction_filters: ['booked', 'ignored'],
					entity_filters: [
						'ignored',
						'locked',
						'partially_visible',
						'unlocked',
					],
				},
				filter_settings: [],
				global_table_search: '',
				is_enabled: 'any',
				ordering: '-code',
			},
		})
	}
</script>
