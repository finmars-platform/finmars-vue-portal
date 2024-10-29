<template>
	<div>
		<FmTopRefresh @refresh="refresh()">
			<template #action>
				<NuxtLink
					:to="
						useGetNuxtLink('/settings/permissions/members/add', $route.params)
					"
				>
					<FmIcon btnPrimary icon="add" />
				</NuxtLink>

			</template>
		</FmTopRefresh>

		<div class="fm_container">
			<BaseTable
				:headers="[
					'',
					'id',
					'Name',
					'Is Admin',
					'Is Owner',
					'Is Deleted',
					'Status',
					'Groups',
					'Roles'
				]"
				:items="members"
				:status="!loading ? 'done' : 'loading'"
				:isRightKebab="false"
				colls="50px repeat(8, 1fr)"
				:cb="generateLink"
				class="clickable_rows"
			>
				<template #actions="{index}">
					<div class="flex jcc aic height-100">
						<FmMenu attach="body">
							<template #btn>
								<FmIcon icon="more_vert" />
							</template>
							<div class="fm_list">
								<div class="fm_list_item" @click="deleteMember(index)">
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
	import { useGetNuxtLink, usePrefixedRouterPush } from '~/composables/useMeta';

	const route = useRoute();
	const router = useRouter();
	const stockMembers = ref(null);
	const loading = ref(false);
	const count = ref(0);
	const pageSize = ref(10);

	const members = computed(() => {
		const data = [];
		if (!stockMembers.value) return [];

		stockMembers.value.forEach((item) => {
			data.push({
				id: `${item.id}`,
				username: {
					value: item.username,
					link: '/settings/permissions/members/' + item.id
				},
				is_admin: item.is_admin ? 'Admin' : 'No',
				is_owner: item.is_owner ? 'Owner' : 'No',
				is_deleted: item.is_deleted ? 'Deleted' : 'No',
				status: item.status,
				groups: item.groups_object.map((item) => item.name).join(', '),
				roles: item.roles_object.map((item) => item.name).join(', ')
			});
		});

		return data;
	});

	function generateLink(id) {
		usePrefixedRouterPush(router, route, members.value[id].username.link);
	}

	async function deleteMember(index) {
		const usernameDel = members.value[index].username?.value;
		const isConfirm = await useConfirm({
			title: 'Delete member',
			text: `Do you want to delete a member "${usernameDel}"?`
		});
		if (!isConfirm) return false;
		await useApi('member.delete', { params: { id: members.value[index].id } });
		useNotify({
			type: 'success',
			title: `Member "${usernameDel}" was deleted.`
		});
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
		const res = await useApi('memberList.get', { filters: payload });
		count.value = res.count;
		stockMembers.value = res.results;
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
