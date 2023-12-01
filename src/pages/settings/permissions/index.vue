<template>
	<div>
		<FmTabs v-model="activeTab" :tabs="tabsList"/>

		<div v-if="activeTab == 'Members'">

			<FmTopRefresh
				@refresh="refresh()"
			>
				<template #action>
					<FmIcon
						btnPrimary
						icon="add"
						@click="$router.push(`/settings/permissions/members/add`)"
					/>
				</template>
			</FmTopRefresh>

			<div class="fm_container">
				<BaseTable
					:headers="['', 'id', 'Name', 'Is Admin', 'Is Owner', 'Is Deleted', 'Status', 'Groups', 'Roles']"
					:items="members"
					colls="50px repeat(8, 1fr)"
					:cb="(id) => $router.push(`/settings/permissions/members/${stockMembers[id].id}`)"
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
						@click="$router.push(`/settings/permissions/groups/add`)"
					/>
				</template>
			</FmTopRefresh>

			<div class="fm_container">
				<BaseTable
					:headers="['', 'Id','User Code', 'Configuration Code',  'Name', ]"
					:items="groupsRows"
					colls="62.5px repeat(4, 1fr)"
					rowKeyProp="id"
					:cb="(id) => $router.push(`/settings/permissions/groups/${id}`)"
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
						@click="$router.push(`/settings/permissions/roles/add`)"
					/>
				</template>
			</FmTopRefresh>

			<div class="fm_container">
				<BaseTable
					:headers="['', 'Id', 'User Code', 'Configuration Code',  'Name']"
					:items="roles"
					colls="50px repeat(4, 1fr)"
					:cb="(id) => $router.push(`/settings/permissions/roles/${roles[id].id}`)"
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
						@click="$router.push(`/settings/permissions/access-policies/add`)"
					/>
				</template>
			</FmTopRefresh>

			<div class="fm_container">
				<BaseTable
					:headers="['', 'Id', 'User Code', 'Configuration Code', 'Name', ]"
					:items="accessPolicies"
					colls="50px repeat(4, 1fr)"
					:cb="(id) => $router.push(`/settings/permissions/access-policies/${accessPolicies[id].id}`)"
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

		</div>
	</div>
</template>

<script setup>

import dayjs from 'dayjs'

definePageMeta({
	middleware: 'auth',
	bread: [
		{
			text: 'Permissions: Members',
			disabled: true
		}
	],
});

const store = useStore()
const route = useRoute();

let tabsList = ['Members', 'Groups', 'Roles', 'Access Policies'];
let activeTab = ref('Members')


let stockMembers = ref(null)

let members = computed(() => {
	let data = []

	if (!stockMembers.value) return []

	stockMembers.value.forEach(item => {

		data.push({
			id: item.id,
			username: {value: item.username, link: '/settings/permissions/members/' + item.id},
			is_admin: item.is_admin ? 'Admin' : 'No',
			is_owner: item.is_owner ? 'Owner' : 'No',
			is_deleted: item.is_deleted ? 'Deleted' : 'No',
			status: item.status,
			groups: item.groups_object.map(item => item.name).join(', '),
			roles: item.roles_object.map(item => item.name).join(', '),
		})
	})

	return data
})


let processing = ref(false)

let groups = ref([])
let roles = ref([])
let accessPolicies = ref([])

let groupsRows = computed(() => {
	return groups.value.map(group => {
		return {
			id: group.id,
			user_code: group.user_code,
			configuration_code: group.configuration_code,
			name: group.name,
		}
	})
})

function fromatDate(date) {
	return dayjs(date).format('DD.MM.YYYY LT')
}

async function deleteMember(index) {
	let usernameDel = members.value[index].username?.value

	let isConfirm = await useConfirm({
		title: 'Delete member',
		text: `Do you want to delete a member "${usernameDel}"?`,
	})
	if (!isConfirm) return false

	console.log('members.value[index]', members.value[index]);

	let res = await useApi('member.delete', {params: {id: members.value[index].id}})

	useNotify({type: 'success', title: `Member "${usernameDel}" was deleted.`})

	refresh()
}

async function deleteGroup(index) {
	let group = groups.value[index]

	let isConfirm = await useConfirm({
		title: 'Delete group',
		text: `Do you want to delete a group "${group.name}"?`,
	})
	if (!isConfirm) return false

	let res = await useApi('group.delete', {params: {id: group.id}})

	useNotify({type: 'success', title: `Group "${group.name}" was deleted.`})

	refresh()
}

async function deleteRole(index) {
	let role = roles.value[index]

	let isConfirm = await useConfirm({
		title: 'Delete role',
		text: `Do you want to delete a role "${role.name}"?`,
	})
	if (!isConfirm) return false

	let res = await useApi('role.delete', {params: {id: role.id}})

	useNotify({type: 'success', title: `Role "${role.name}" was deleted.`})

	refresh()
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
		useApi(
			'accessPolicyList.get',
			{filters: {page: 1, page_size: 10000},}
		)
	]);

	stockMembers.value = res[0].results;
	// TODO we need to refactor that table, cause each new key will break it
	groups.value = res[1].results.map((item) => {
		return {
			"id": item.id,
			"user_code": item.user_code,
			"configuration_code": item.configuration_code,
			"name": item.name
		}
	});

	roles.value = res[2].results.map((item) => {
		return {
			"id": item.id,
			"user_code": item.user_code,
			"configuration_code": item.configuration_code,
			"name": item.name
		}
	});

	accessPolicies.value = res[3].results.map((item) => {
		return {
			"id": item.id,
			"user_code": item.user_code,
			"configuration_code": item.configuration_code,
			"name": item.name
		}
	});

}

init()

function refresh() {
	init()
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
	border: 1px solid $border;
	width: 100%;
	font-size: 14px;
}

.table-row {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr;
	align-items: center;
	background: #Fff;
	border-bottom: 1px solid $border;
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
</style>
