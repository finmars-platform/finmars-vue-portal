<template>
	<div>
		<div class="py-3 px-8">
			<FmBreadcrumbs :crumbs="crumbs" />
		</div>
		<div class="px-5 py-5 flex flex-col items-start justify-start gap-2">
			<div
				v-if="loading"
				class="flex w-full justify-center items-center min-h-36"
			>
				<FmProgressCircular :size="32" indeterminate />
			</div>
			<div
				v-else-if="!items.length"
				class="flex w-full justify-center items-center min-h-36"
			>
				<span>No data available!</span>
			</div>
			<template v-else>
				<table class="transaction-type-group-table">
					<thead>
					<tr>
						<th>Name</th>
						<th>Unique Code</th>
						<th></th>
					</tr>
					</thead>
					<tbody>
					<tr v-for="(item, index) in items" :key="index">
						<td>{{ item.name }}</td>
						<td>{{ item.user_code }}</td>
						<td>
							<div class="flex justify-end items-center gap-2">
								<FmButton
									type="primary"
									@click="generateLink(item.id)"
									rounded
								>Edit
								</FmButton>
								<FmButton
									type="primary"
									@click="deleteItem(item)"
									rounded
								>
									Delete
								</FmButton>
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
			<div>
				<NuxtLink
					:to="
                   useGetNuxtLink('/configuration/transaction-type-group/new', $route.params)
                "
				>
					<FmButton type="primary" rounded> Add New</FmButton>
				</NuxtLink>
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
	import { useGetNuxtLink, usePrefixedRouterPush } from '~/composables/useMeta';
	import { defineAsyncComponent, inject } from 'vue';

	definePageMeta({
		middleware: 'auth'
	});

	const route = useRoute();
	const router = useRouter();
	const dialogService = inject(FM_DIALOGS_KEY);
	const crumbs = ref([{ title: 'Transaction type group', path: 'transaction-type-group' }]);

	const loading = ref(false);
	const count = ref(0);
	const pageSize = ref(40);
	const currentPage = ref(route.query?.page ? parseInt(route.query.page) : 1);
	const items = ref([]);

	const handlePageChange = (newPage) => {
		currentPage.value = newPage;
		init(currentPage.value);
	};

	function generateLink(id) {
		usePrefixedRouterPush(router, route, `/configuration/transaction-type-group/${id}`);
	}

	async function getList(newPage = 1) {
		try {
			router.push({ query: { ...route.query, page: currentPage.value } });
			loading.value = true;
			const payload = {
				page_size: pageSize.value,
				page: newPage
			};
			const res = await useApi('transactionTypeGroupList.get', {
				filters: payload,
				query: { page: newPage }
			});
			count.value = res.count;
			items.value = res.results;
		} catch (e) {
			console.log(`Catch error: ${e}`);
		} finally {
			loading.value = false;
		}
	}

	function deleteItem(item) {
		const confirmationComponent = defineAsyncComponent(
			() => import('@/components/modal/ConfirmationDialog.vue')
		);
		dialogService.$openDialog({
			component: confirmationComponent,
			componentProps: {
				text: `Are you sure to delete ${item.name}?`
			},
			dialogProps: {
				title: 'Warning',
				onConfirm: async () => {
					try {
						await useApi('transactionTypeGroup.delete', {
							params: { id: item.id }
						});
						useNotify({
							type: 'success',
							title: `${item.name} successfully deleted`
						});
						await getList();
					} catch (e) {
						console.log(`Catch error: ${e}`);
					} finally {
						isLoading.value = false;
					}
				}
			}
		});
	}

	function init(newPage = 1) {
		getList(newPage);
	}

	init();
</script>

<style scoped lang="scss">
	.transaction-type-group-table {
		width: 100%;

		td, th {
			display: table-cell;
			text-align: left;
			vertical-align: middle;
			padding: var(--spacing-4) var(--spacing-8);
		}
	}
</style>
