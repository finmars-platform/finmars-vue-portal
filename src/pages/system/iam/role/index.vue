<template>
	<div>
		<div class="py-3 px-8">
			<FmBreadcrumbs :crumbs="crumbs" />
		</div>
		<div class="fm_container">
			<FmTopRefresh @refresh="refresh()" class="mb-4">
				<template #action>
					<NuxtLink :to="useGetNuxtLink('/system/iam/role/add', $route.params)">
						<FmIcon icon="mdi-plus-circle" :size="36" />
					</NuxtLink>
				</template>
			</FmTopRefresh>
			<FmTextField
				v-model="searchTerm"
				outlined
				label="Search for a ..."
				@update:model-value="setFiltersQueryDebounced"
			/>
			<BaseTable
				:headers="['', 'Id', 'User Code', 'Configuration Code', 'Name']"
				:items="roles"
				:status="!loading ? 'done' : 'loading'"
				:isRightKebab="false"
				colls="50px repeat(4, 1fr)"
				:cb="
					(id) =>
						usePrefixedRouterPush(
							$router,
							$route,
							`/system/iam/role/${roles[id].id}`
						)
				"
				class="clickable_rows"
			>
				<template #actions="{ index }">
					<div class="flex jcc aic height-100 cursor-pointer">
						<FmMenu attach="body">
							<template #btn>
								<FmIcon icon="mdi-dots-vertical" :size="26" />
							</template>
							<div class="fm_list">
								<div class="fm_list_item" @click="deleteRole(index)">
									<FmIcon icon="mdi-delete" :size="26" class="mr-2" />
									Delete
								</div>
							</div>
						</FmMenu>
					</div>
				</template>
			</BaseTable>
			<FmPagination
				:with-info="true"
				:total-items="count"
				:items-per-page="pageSize"
				:model-value="currentPage"
				@update:modelValue="handlePageChange"
			/>
		</div>
	</div>
</template>

<script setup>
	import {
		FmTextField,
		FmBreadcrumbs,
		FmIcon,
		FmPagination
	} from '@finmars/ui';
	import { useGetNuxtLink, usePrefixedRouterPush } from '~/composables/useMeta';
	import { debounce } from 'lodash';

	const route = useRoute();
	const router = useRouter();

	const searchTerm = ref('');
	const roles = ref([]);
	const loading = ref(false);
	const count = ref(0);
	const pageSize = ref(40);
	const currentPage = ref(route.query.page ? parseInt(route.query.page) : 1);
	const crumbs = ref([{ title: 'Roles', path: 'role' }]);

	async function deleteRole(index) {
		const role = roles.value[index];
		const isConfirm = await useConfirm({
			title: 'Delete role',
			text: `Do you want to delete a role "${role.name}"?`
		});
		if (!isConfirm) return false;
		await useApi('role.delete', { params: { id: role.id } });
		useNotify({ type: 'success', title: `Role "${role.name}" was deleted.` });
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
			page: newPage,
			user_code__contains: searchTerm.value
		};
		const res = await useApi('roleList.get', {
			filters: payload,
			query: { page: newPage }
		});
		count.value = res.count;
		roles.value = res.results.map((item) => {
			return {
				id: `${item.id}`,
				user_code: item.user_code,
				configuration_code: item.configuration_code,
				name: item.name
			};
		});
		loading.value = false;
	}

	const setFiltersQueryDebounced = debounce(async () => {
		currentPage.value = 1;
		await init();
	}, 500);

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
		user-select: auto;
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
