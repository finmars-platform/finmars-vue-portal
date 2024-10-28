<template>
	<div>
		<FmTopRefresh @refresh="refresh()">
			<template #action>
				<FmIcon
					btnPrimary
					icon="add"
					@click="
						usePrefixedRouterPush(
							$router,
							$route,
							`/settings/permissions/groups/add`
						)
					"
				/>
			</template>
		</FmTopRefresh>
		<div class="fm_container">
			<BaseTable
				:headers="['', 'Id', 'User Code', 'Configuration Code', 'Name']"
				:items="groupsRows"
				:status="!loading ? 'done' : 'loading'"
				:isRightKebab="false"
				colls="62.5px repeat(4, 1fr)"
				rowKeyProp="id"
				:cb="(id) => usePrefixedRouterPush($router, $route, `/settings/permissions/groups/${groups[id].id}`)"
				class="clickable_rows"
			>
				<template #actions="{index}">
					<div class="flex jcc aic height-100">
						<FmMenu attach="body">
							<template #btn>
								<FmIcon icon="more_vert" />
							</template>
							<div class="fm_list">
								<div class="fm_list_item" @click="deleteGroup(index)">
									<FmIcon class="m-r-4" icon="delete" />
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

	const groups = ref([]);
	const loading = ref(false);
	const count = ref(0);
	const pageSize = ref(10);

	const groupsRows = computed(() => {
		return groups.value.map((group) => {
			return {
				id: `${group.id}`,
				user_code: group.user_code,
				configuration_code: group.configuration_code,
				name: group.name
			};
		});
	});

	async function deleteGroup(index) {
		const group = groups.value[index];
		const isConfirm = await useConfirm({
			title: 'Delete group',
			text: `Do you want to delete a group "${group.name}"?`
		});
		if (!isConfirm) return false;
		await useApi('group.delete', { params: { id: group.id } });
		useNotify({ type: 'success', title: `Group "${group.name}" was deleted.` });
		refresh();
	}

	const handlePageChange = (newPage) => {
		init(newPage);
	};

	async function init(currentPage = 1) {
		loading.value = true;
		const payload = {
			page_size: pageSize.value,
			page: currentPage
		};
		const res = await useApi('groupList.get', { filters: payload });
		count.value = res.count;
		groups.value = res.results.map((item) => {
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
