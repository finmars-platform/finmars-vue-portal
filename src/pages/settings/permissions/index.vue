<template>
	<div>
		<FmTabs v-model="activeTab" :tabs="tabsList"/>

		<div v-if="activeTab == 'Members'">

			<FmTopRefresh
				@refresh="refresh()"
			>
				<template #action>

					<NuxtLink :to="useGetNuxtLink('/settings/permissions/members/add', $route.params)">
						<FmIcon btnPrimary icon="add"/>
					</NuxtLink>

				</template>
			</FmTopRefresh>

			<div class="fm_container">

				<BaseTable
					:headers="['', 'id', 'Name', 'Is Admin', 'Is Owner', 'Is Deleted', 'Status', 'Groups', 'Roles']"
					:items="members"
					:status="members.length ? 'done' : 'loading'"
					:isRightKebab="false"
					colls="50px repeat(8, 1fr)"
					:cb="generateLink"
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
										 @click="deleteMember(index)"
									>
										<FmIcon class="m-r-4" icon="delete"/>
										Delete
									</div>
								</div>
							</FmMenu>
						</div>
					</template>
				</BaseTable>

			</div>

		</div>
		<div v-if="activeTab == 'Groups'">
			<FmTopRefresh
				@refresh="refresh()"
			>
				<template #action>
					<FmIcon
						btnPrimary
						icon="add"
						@click="usePrefixedRouterPush($router, $route, `/settings/permissions/groups/add`)"
					/>
				</template>
			</FmTopRefresh>

			<div class="fm_container">
				<BaseTable
					:headers="['', 'Id','User Code', 'Configuration Code',  'Name', ]"
					:items="groupsRows"
					:status="groupsRows.length ? 'done' : 'loading'"
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
									<FmIcon icon="more_vert"/>
								</template>
								<div class="fm_list">
									<div class="fm_list_item"
										 @click="deleteGroup(index)"
									>
										<FmIcon class="m-r-4" icon="delete"/>
										Delete
									</div>
								</div>
							</FmMenu>
						</div>
					</template>
				</BaseTable>

			</div>
		</div>
		<div v-if="activeTab == 'Roles'">
			<FmTopRefresh
				@refresh="refresh()"
			>
				<template #action>
					<FmIcon
						btnPrimary
						icon="add"
						@click="usePrefixedRouterPush($router, $route, `/settings/permissions/roles/add`)"
					/>
				</template>
			</FmTopRefresh>

			<div class="fm_container">
				<BaseTable
					:headers="['', 'Id','User Code', 'Configuration Code',  'Name', ]"
					:items="roles"
					:status="roles.length ? 'done' : 'loading'"
					:isRightKebab="false"
					colls="50px repeat(4, 1fr)"
					:cb="(id) => usePrefixedRouterPush($router, $route, `/settings/permissions/roles/${roles[id].id}`)"
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
										 @click="deleteRole(index)"
									>
										<FmIcon class="m-r-4" icon="delete"/>
										Delete
									</div>
								</div>
							</FmMenu>
						</div>
					</template>
				</BaseTable>

			</div>

		</div>
		<div v-if="activeTab == 'Access Policies'">
			<FmTopRefresh
				@refresh="refresh()"
			>
				<template #action>
					<FmIcon
						btnPrimary
						icon="add"
						@click="usePrefixedRouterPush($router, $route, `/settings/permissions/access-policies/add`)"
					/>
				</template>
			</FmTopRefresh>

			<div class="fm_container">
				<BaseTable
					:headers="['', 'Id', 'User Code', 'Configuration Code', 'Name', ]"
					:items="accessPolicies"
					:status="accessPolicies.length ? 'done' : 'loading'"
					:isRightKebab="false"
					colls="50px repeat(4, 1fr)"
					:cb="(id) => usePrefixedRouterPush($router, $route, `/settings/permissions/access-policies/${accessPolicies[id].id}`)"
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
			</div>
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

	definePageMeta({
		middleware: 'auth',
		bread: [
			{
				text: 'Permissions: Members',
				disabled: true
			}
		]
	});

	const route = useRoute();
	const router = useRouter();
	const groups = ref([]);
	const roles = ref([]);
	const accessPolicies = ref([]);

	const count = ref(0);
	const pageSize = ref(10);

	const tabsList = ['Members', 'Groups', 'Roles', 'Access Policies'];
	const activeTab = ref('Members');
	const stockMembers = ref(null);

	router.push({ query: { tab: activeTab.value } });

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

	async function init() {
		if (route.query.tab && tabsList.includes(route.query.tab)) {
			activeTab.value = route.query.tab;
		}
		/*let res = await useApi('memberList.get')
		stockMembers.value = res.results

		let groupsRes = await useApi('groupList.get')
		groups.value = groupsRes.results

		let rolesRes = await useApi('roleList.get')
		roles.value = rolesRes.results

		res = await useLoadAllPages('accessPolicyList.get', {
			filters: {page: 1, page_size: 10000},
		})
		accessPolicies.value = res

		res = await useApi('memberInvites.get')
		stockInvites.value = res.results

		let resStatus = await useApi('dataInstance.get')
		statuses.value = resStatus.results*/
		const res = await Promise.all([
			useApi('memberList.get'),
			useApi('groupList.get'),
			useApi('roleList.get'),
			useApi('accessPolicyList.get', { filters: { page: 1, page_size: 10000 } })
		]);

		stockMembers.value = res[0].results;
		groups.value = res[1].results.map((item) => {
			return {
				id: `${item.id}`,
				user_code: item.user_code,
				configuration_code: item.configuration_code,
				name: item.name
			};
		});
		// ['', 'Id','User Code', 'Configuration Code',  'Name', ]
		roles.value = res[2].results.map((item) => {
			return {
				id: `${item.id}`,
				user_code: item.user_code,
				configuration_code: item.configuration_code,
				name: item.name
			};
		});
		// ['', 'Id', 'User Code', 'Configuration Code', 'Name', ]
		accessPolicies.value = res[3].results.map((item) => {
			return {
				id: `${item.id}`,
				user_code: item.user_code,
				configuration_code: item.configuration_code,
				name: item.name
			};
		});
	}

	function generateLink(id) {
		usePrefixedRouterPush(router, route, members.value[id].username.link);
	}

	watch(activeTab, () => {
		router.push({ query: { tab: activeTab.value } });
	});

	init();

	function refresh() {
		init();
	}
</script>

<style lang="scss" scoped>
.cards {
	display: grid;
	grid-template-columns: repeat(2, auto);
	grid-gap: 30px;
	justify-content: flex-start;
}

.table {
	border: 1px solid var(--table-border-color);
	width: 100%;
	font-size: 14px;
}

.table-row {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr;
	align-items: center;
	background: #Fff;
	border-bottom: 1px solid var(--table-border-color);
	padding: 5px 0;
	// height: 26px;
	&.header {
		background: #F2F2F2;
		height: 35px;
	}
}

.table-cell {
	white-space: nowrap;
	padding: 0 14px;
	overflow: hidden;
	text-overflow: ellipsis;
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
:deep(.table-cell-btn) {
	text-align: left;
}
</style>
