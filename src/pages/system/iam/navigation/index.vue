<template>
	<div class="flex flex-col gap-2 py-3 px-8">
		<div class="pb-4">
			<FmBreadcrumbs :crumbs="crumbs" />
		</div>
		<div
			v-if="isLoading"
			class="flex w-full justify-center items-center min-w-40 min-h-48"
		>
			<FmProgressCircular :size="50" indeterminate />
		</div>
		<div
			v-else-if="!items.length"
			class="flex w-full justify-center items-center min-w-44"
		>
			<span>No data available!</span>
		</div>
		<template v-else>
			<div v-for="item in items" class="card flex justify-between items-center p-2 w-full gap-3">
				<div class="flex flex-col gap-1 text-sm">
					<span><strong>User code:</strong> {{ item.user_code }}</span>
					<span><strong>Name:</strong> {{ item.name }}</span>
				</div>
				<div class="flex justify-end gap-2">
					<FmButton type="primary" @click="generateLink(item.id)" rounded>
						Edit
					</FmButton>
					<FmButton type="secondary" @click="deleteItem(item, false)" rounded>
						Delete
					</FmButton>
				</div>
			</div>
			<FmPagination
				:with-info="true"
				:total-items="count"
				:items-per-page="pageSize"
				:model-value="currentPage"
				@update:modelValue="handlePageChange"
			/>
		</template>
		<div class="m-4">
			<FmButton type="primary" @click="generateLink('new')" rounded>
				Create
			</FmButton>
		</div>
	</div>
</template>

<script setup>
	import { FmProgressCircular, FmButton, FmBreadcrumbs , FmPagination } from '@finmars/ui';
	import { usePrefixedRouterPush } from '~/composables/useMeta';
	import { useNavigationRoutes } from '~/composables/useNavigationRoutes';

	definePageMeta({
		middleware: 'auth'
	});

	const route = useRoute();
	const router = useRouter();

	const { deleteItem } = useNavigationRoutes();

	const isLoading = ref(false);
	const items = ref([]);
	const count = ref(0);
	const pageSize = ref(40);
	const currentPage = ref(route.query.page ? parseInt(route.query.page) : 1);

	const crumbs = ref([
		{ title: 'Navigation permission', path: 'navigation' }
	]);

	const handlePageChange = (newPage) => {
		currentPage.value = newPage;
		init(currentPage.value);
	};

	function generateLink(pathEnd) {
		usePrefixedRouterPush(
			router,
			route,
			`/system/iam/navigation/${pathEnd}`
		);
	}

	async function init(newPage = 1) {
		router.push({ query: { ...route.query, page: currentPage.value } });
		isLoading.value = true;
		const payload = {
			page_size: pageSize.value,
			page: newPage
		};
		const res = await useApi('sidebarNavigationAccessList.get',{
			filters: payload,
			query: { page: newPage }
		});
		if (res?._$error) {
			useNotify({ type: 'error', title: res._$error.message || res._$error.detail });
		} else {
			count.value = res.count;
			items.value = res.result;
		}
		isLoading.value = false;
	}

	init();
</script>

<style lang="scss" scoped>
	.card {
		border-radius: var(--spacing-8);
		border: 1px solid var(--card-border-color);
	}
</style>
