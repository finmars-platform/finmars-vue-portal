<template>
	<div>
		<div class="py-3 px-8">
			<FmBreadcrumbs :crumbs="crumbs" />
		</div>
		<div class="py-3 px-8 flex flex-col items-start justify-start gap-2">
			<div
				v-if="loading"
				class="flex w-full justify-center items-center min-h-36"
			>
				<FmProgressCircular :size="40" indeterminate />
			</div>
			<div
				v-else-if="!items.length"
				class="flex w-full justify-center items-center min-h-36"
			>
				<span>No data available!</span>
			</div>
			<template v-else>
				<table>
					<thead>
					<tr>
						<th>Name</th>
						<th>Notes</th>
						<th>Active</th>
						<th style="width: 260px">Actions</th>
					</tr>
					</thead>
					<tbody>
					<tr v-for="(item, index) in items" :key="index">
						<td>{{ item.name }}</td>
						<td>{{ item.notes }}</td>
						<td>{{ item.is_enabled }}</td>
						<td>
							<div class="flex flex-row nowrap justify-between">
								<FmButton type="secondary" rounded @click="runItem(item)">Run</FmButton>
								<FmButton type="secondary" rounded @click="generateLink(item.id)">Edit</FmButton>
								<FmButton type="secondary" rounded @click="deleteItem(item)">Delete</FmButton>
							</div>
						</td>
					</tr>
					</tbody>
				</table>
				<FmPagination
					:with-info="true"
					:total-items="count"
					:items-per-page="pageSize"
					:model-value="currentPage"
					@update:modelValue="handlePageChange"
				/>
			</template>
			<div class="flex items-center justify-start gap-2">
				<FmButton type="primary" rounded @click="generateLink('new')">Add New</FmButton>
			</div>
		</div>
	</div>
</template>

<script setup>
	import {
		FmBreadcrumbs,
		FmButton,
		FmPagination,
		FmProgressCircular,
		FM_DIALOGS_KEY
	} from '@finmars/ui';
	import { usePrefixedRouterPush } from '~/composables/useMeta';
	import { defineAsyncComponent, inject } from 'vue';

	definePageMeta({
		middleware: 'auth'
	});

	const route = useRoute();
	const router = useRouter();
	const dialogService = inject(FM_DIALOGS_KEY);
	const crumbs = [
		{ title: 'Pricing Schedules', path: 'schedule' }
	];

	const loading = ref(false);
	const count = ref(0);
	const pageSize = ref(40);
	const currentPage = ref(route.query?.page ? parseInt(route.query.page) : 1);
	const items = ref([]);

	const handlePageChange = (newPage) => {
		currentPage.value = newPage;
		init(currentPage.value);
	};

	function generateLink(linkEnd) {
		usePrefixedRouterPush(router, route, `/system/schedule/${linkEnd}`);
	}

	function deleteItem(item) {
		const confirmationComponent = defineAsyncComponent(
			() => import('@/components/modal/ConfirmationDialog.vue')
		);
		dialogService.$openDialog({
			component: confirmationComponent,
			componentProps: {
				text: `Are you sure to delete "${item.name}" ?`
			},
			dialogProps: {
				title: 'Delete schedule',
				onConfirm: async () => {
					const res = await useApi('schedule.delete', {
						params: { id: item.id }
					});
					if (res && res._$error) {
						useNotify({ type: 'error', title: res._$error.error.message || res._$error.error?.details?.errors?.[0].detail?.toUpperCase() });
					} else {
						useNotify({
							type: 'success',
							title: `"${item.name}" successfully deleted`
						});
						await getList(currentPage.value);
					}
				}
			}
		});
	}

	async function runItem(item) {
		const res = await useApi('scheduleByKey.post', { params: { id: item.id }, body: item });
		if (res && res._$error) {
			useNotify({ type: 'error', title: res._$error.error?.message || res._$error.error?.details?.errors?.[0].detail?.toUpperCase() });
		} else {
			useNotify({
				type: 'success',
				title: `"${item.name}" is being processed`
			});
		}
	}

	async function getList(newPage = 1) {
		router.push({ query: { ...route.query, page: currentPage.value } });
		loading.value = true;
		const payload = {
			page_size: pageSize.value,
			page: newPage
		};
		const res = await useApi('schedule.get', {
			filters: payload,
			query: { page: newPage }
		});
		if (res && res._$error) {
			useNotify({ type: 'error', title: res._$error.error.message || res._$error.error?.details?.errors?.[0].detail?.toUpperCase() });
		} else {
			count.value = res.count;
			items.value = res.results;
			loading.value = false;
		}
	}

	function init(newPage = 1) {
		getList(newPage);
	}

	init();
</script>

<style scoped lang="scss">
	table {
		height: 100%;
		width: 100%;
		border-collapse: collapse;
		text-align: left;

		th,
		td {
			border: 1px solid var(--table-border-color);
			text-align: left;
		}

		th {
			font-size: 14px;
			padding: var(--spacing-8);
			background-color: var(--activeState-backgroundColor);
		}

		td {
			font-size: 12px;
			padding: var(--spacing-4) var(--spacing-8);
		}
	}
</style>
