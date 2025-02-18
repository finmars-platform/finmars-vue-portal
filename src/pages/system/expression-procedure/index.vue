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
				<Card
					v-for="item in items"
					@edit-item="generateLink(item.id)"
					@delete-item="deleteItem"
					:item="item"
					:key="item.id"
				/>
				<FmPagination
					:with-info="true"
					:total-items="count"
					:items-per-page="pageSize"
					:model-value="currentPage"
					@update:modelValue="handlePageChange"
				/>
			</template>
			<div class="flex items-center justify-start gap-2">
				<FmButton type="secondary" rounded @click="checkProcedureStatus">Check procedure status</FmButton>
				<FmButton type="primary" rounded @click="generateLink('editor')">Open code editor</FmButton>
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
	import Card from '~/pages/system/expression-procedure/card/index.vue';

	definePageMeta({
		middleware: 'auth'
	});

	const route = useRoute();
	const router = useRouter();
	const dialogService = inject(FM_DIALOGS_KEY);
	const crumbs = [
		{ title: 'Expression procedure', path: 'expression-procedure' }
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
		usePrefixedRouterPush(router, route, `/system/expression-procedure/${linkEnd}`);
	}

	function checkProcedureStatus() {
		const newUrl = `/${route.params.realm_code}/${route.params.space_code}/v/system/task`;
		window.open(newUrl, "_blank");
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
				title: 'Delete procedure',
				onConfirm: async () => {
					const res = await useApi('expressionProcedureList.delete', {
						params: { id: item.id }
					});
					if (res && res._$error) {
						useNotify({ type: 'error', title: res._$error.error.message || res._$error.error.details });
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

	async function getList(newPage = 1) {
		router.push({ query: { ...route.query, page: currentPage.value } });
		loading.value = true;
		const payload = {
			page_size: pageSize.value,
			page: newPage
		};
		const res = await useApi('expressionProcedureList.get', {
			filters: payload,
			query: { page: newPage }
		});
		if (res && res._$error) {
			useNotify({ type: 'error', title: res._$error.error.message || res._$error.error.details });
		}
		count.value = res.count;
		items.value = res.results;
		loading.value = false;
	}

	function init(newPage = 1) {
		getList(newPage);
	}

	init();
</script>

<style scoped lang="scss">
	a {
		all: inherit;
	}
</style>
