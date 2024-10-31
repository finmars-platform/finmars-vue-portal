<template>
	<div>
		<FmTopRefresh @refresh="refresh()">
			<template #action>
				<FmIcon
					btnPrimary
					icon="add"
					@click="usePrefixedRouterPush($router, $route, `/settings/permission/access-policy/add`)"
				/>
			</template>
		</FmTopRefresh>

		<div class="fm_container">
			<BaseTable
				:headers="['', 'Id', 'User Code', 'Configuration Code', 'Name']"
				:items="accessPolicies"
				:status="!loading ? 'done' : 'loading'"
				:isRightKebab="false"
				colls="50px repeat(4, 1fr)"
				:cb="(id) => usePrefixedRouterPush($router, $route, `/settings/permission/access-policy/${accessPolicies[id].id}`)"
				class="clickable_rows"
			>
				<template #actions="{index}">
					<div class="flex jcc aic height-100">
						<FmMenu attach="body">
							<template #btn>
								<FmIcon icon="more_vert"/>
							</template>
							<div class="fm_list">
								<div class="fm_list_item"
									 @click="deleteAccessPolicy(index)"
								>
									<FmIcon class="m-r-4" icon="delete"/>
									Delete
								</div>
							</div>
						</FmMenu>
					</div>
				</template>
			</BaseTable>
			<FmPagination
				class="m-t-20"
				:count="count"
				:page-size="pageSize"
				@page-change="handlePageChange"
			/>
		</div>
	</div>
</template>

<script setup>
	import { usePrefixedRouterPush } from '~/composables/useMeta';

	const route = useRoute();
	const router = useRouter();

	const accessPolicies = ref([]);
	const loading = ref(false);
	const count = ref(0);
	const pageSize = ref(10);
	const currentPage = ref(route.query.page ? parseInt(route.query.page) : 1);

	async function deleteAccessPolicy(index) {
		const policy = accessPolicies.value[index];
		const isConfirm = await useConfirm({
			title: 'Delete Access Policy',
			text: `Do you want to delete an Access Policy "${policy.name}"?`
		});
		if (!isConfirm) return false;
		await useApi('accessPolicy.delete', { params: { id: policy.id } });
		useNotify({
			type: 'success',
			title: `Access Policy "${policy.name}" was deleted.`
		});
		refresh();
	}

	const handlePageChange = (newPage) => {
		currentPage.value = newPage;
		init(currentPage.value);
	};

	async function init(newPage = 1) {
		router.push({ query: { ...route.query, page: currentPage.value } });
		loading.value = true;
		const payload = {
			page_size: pageSize.value,
			page: newPage
		};
		const res = await useApi('accessPolicyList.get', {
			filters: payload
		});
		count.value = res.count;
		accessPolicies.value = res.results.map((item) => {
			return {
				id: `${item.id}`,
				user_code: item.user_code,
				configuration_code: item.configuration_code,
				name: item.name
			};
		});
		loading.value = false;
	}

	function refresh() {
		init();
	}
	init();
</script>

<style lang="scss" scoped>
	:deep(.table-cell-btn) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		text-align: left;
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(2, auto);
		grid-gap: 30px;
		justify-content: flex-start;
	}

	.sub_procedure {
		grid-column: 1 / -1;
		padding: 5px 18px;
	}

	.sp_item {
		padding-top: 10px;
	}

	.date_item {
		width: 48%;
	}

	.sp_item_h {
		width: 120px;
	}
</style>
