<template>
	<div>
		<FmTabs v-model="activeTab" :tabs="['Members', 'Groups', 'Roles', 'Access Policies']"/>

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
					:headers="['', 'Name', 'Is Admin', 'Is Owner',  'Status', 'Groups', 'Roles']"
					:items="members"
					colls="50px repeat(7, 1fr)"
					:cb="(id) => $router.push(`/settings/permissions/members/${stockMembers[id].id}`)"
				>
					<template #actions="{index}">
						<div class="flex jcc aic height-100">
							<FmMenu anchor="bottom left">
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
					:items="groups"
					colls="50px repeat(5, 1fr)"
					:cb="(id) => $router.push(`/settings/permissions/groups/${groups[id].id}`)"
				>
					<template #actions="{index}">
						<div class="flex jcc aic height-100">
							<FmMenu anchor="bottom left">
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
					:headers="['', 'Id','User Code', 'Configuration Code',  'Name', ]"
					:items="roles"
					colls="50px repeat(5, 1fr)"
					:cb="(id) => $router.push(`/settings/permissions/roles/${roles[id].id}`)"
				>
					<template #actions="{index}">
						<div class="flex jcc aic height-100">
							<FmMenu anchor="bottom left">
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
				>
					<template #actions="{index}">
						<div class="flex jcc aic height-100">
							<FmMenu anchor="bottom left">
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

let activeTab = ref('Members')


let stockMembers = ref(null)
let stockInvites = ref(null)

let members = computed(() => {
	let data = []

	if (!stockMembers.value || !stockInvites.value) return []

	stockMembers.value.forEach(item => {
		let roles = []

		if (item.is_admin) roles.push('Admin')
		if (item.is_owner) roles.push('Owner')
		if (!item.is_owner && !item.is_admin) roles.push('User')

		data.push({
			// id: item.id,
			username: {value: item.username, link: '/settings/permissions/members/' + item.id},
			is_admin: item.is_admin ? 'Admin' : 'No',
			is_owner: item.is_owner ? 'Owner' : 'No',
			status: item.is_owner ? 'Creator' : 'Accepted',
			groups: item.groups_object.map(item => item.name).join(', '),
			roles: item.roles_object.map(item => item.name).join(', '),
		})
	})

	stockInvites.value.forEach(item => {
		if (data.find(row => row.username.value == item.user_object.username)) return false

		let roles = []

		if (item.is_admin) roles.push('Admin')
		if (item.is_owner) roles.push('Owner')
		if (!item.is_owner && !item.is_admin) roles.push('User')

		data.push({
			// id: item.id,
			username: {value: item.user_object.username, link: '/settings/permissions/members/' + item.user},
			role: 'Admin',
			status: 'Pending',
			groups: item.groups.replace(',', ', ')
		})
	})

	return data
})

let statuses = ref(null)
let processing = ref(false)

let groups = ref([])
let roles = ref([])
let accessPolicies = ref([])


async function init() {
	let res = await useApi('memberList.get')
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
	statuses.value = resStatus.results
}

async function deleteMember(index) {
	let usernameDel = members.value[index].username?.value

	let isConfirm = await useConfirm({
		title: 'Delete member',
		text: `Do you want to delete a member "${usernameDel}"?`,
	})
	if (!isConfirm) return false

	let res = await useApi('memberKick.post', {
		body: {
			username: usernameDel,
			base_api_url: store.current.base_api_url
		}
	})

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

	let res = await useApi('group.delete', group.id)

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

	let res = await useApi('role.delete', role.id)

	useNotify({type: 'success', title: `Role "${role.name}" was deleted.`})

	refresh()
}

init()

function refresh() {
	init()
}

function fromatDate(date) {
	return dayjs(date).format('DD.MM.YYYY LT')
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
