<template>
	<AngularFmGridTable v-if="controller" :evEventService="{}" />
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
	}

	let controller = new entityViewerController(route)
	console.log('controller:', controller)

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
