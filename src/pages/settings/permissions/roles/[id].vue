<template>
	<CommonSettingsLayout
		title="Update Role"
		@save="save"
		@cancel="cancel"
	>
		<template #left>
			<FmCard title="General" v-if="role.id">
				<BaseInput
					label="Name"
					v-model="role.name"
				/>
				<BaseInput
					label="User Code"
					v-model="role.user_code"
					disabled
				/>

				<BaseInput
					label="Configuration Code"
					v-model="role.configuration_code"
					disabled
				/>

			</FmCard>
		</template>
		<template #right>
			<FmCard title="Groups" class="m-b-24" v-if="role.id">

				<BaseMultiSelectInput
					:modelValue="selectedGroups"
					@update:modelValue="findGroupUserCodes($event)"
					title="Groups"
					:items="groups"
					item_id="user_code"
				/>


			</FmCard>

			<FmCard title="Members" class="m-b-24" v-if="role.id">
				<BaseMultiSelectInput
					v-model="selectedMembers"
					@update:modelValue="findMemberIds($event)"
					title="Members"
					:items="members"
					item_id="username"
					item_title="username"
				/>
			</FmCard>


			<FmCard title="Access Policies" class="m-b-24" v-if="role.id">

				<BaseMultiSelectInput
					v-model="selectedAccessPolicies"
					@update:modelValue="findAccessPolicyUserCodes($event)"
					title="Access Policies"
					:items="accessPolicies"
					item_id="user_code"
					item_title="name"
				/>


			</FmCard>

		</template>
	</CommonSettingsLayout>
</template>

<script setup>

import dayjs from 'dayjs'

definePageMeta({
	middleware: 'auth',
	bread: [
		{
			text: 'Permissions: Roles',
			to: '/settings/permissions',
			disabled: false
		},
		{
			text: 'Update Role',
			disabled: true
		},
	],
});
const store = useStore()
let route = useRoute()
let router = useRouter()

let role = ref({})
let groups = ref([])
let members = ref([])
let accessPolicies = ref([])

let selectedGroups = computed(() => {
	if (!role.value.groups_object.length) return []
	return role.value.groups_object.map(item => item.user_code).join(',')

})

let selectedMembers = computed(() => {
	if (!role.value.members_object.length) return []
	return role.value.members_object.map(item => item.username).join(',')
})

let selectedAccessPolicies = computed(() => {
	if (!role.value.access_policies_object.length) return []
	return role.value.access_policies_object.map(item => item.user_code).join(',')
})


async function init() {
	let res = await useApi('role.get', {params: {id: route.params.id}})
	role.value = res

	res = await useApi('groupList.get')
	groups.value = res.results

	res = await useApi('memberList.get')
	members.value = res.results

	// res = await useApi('accessPolicyList.get', {params: {page_size: '10000'}})
	res = await useLoadAllPages('accessPolicyList.get', {
		filters: { page: 1, page_size: 10000 },
	})
	accessPolicies.value = res

}

function findGroupUserCodes(val) {
	if (typeof val == 'string') val = val.split(',')
	role.value.groups_object = []

	val.forEach(itemArr => {
		let elem = role.value.find(itemObj => itemObj.user_code == itemArr)
		if (elem) role.value.groups_object.push(elem)
	})

	role.value.groups = role.value.groups_object.map(item => item.user_code)
}

function findMemberIds(val) {

	if (typeof val == 'string') val = val.split(',')
	group.value.members_object = []

	console.log('findMemberIds.val', val)

	val.forEach(itemArr => {
		let elem = members.value.find(itemObj => itemObj.username == itemArr)
		if (elem) group.value.members_object.push(elem)
	})

	group.value.members = group.value.members_object.map(item => item.id)
}

function findAccessPolicyUserCodes(val) {
	if (typeof val == 'string') val = val.split(',')
	role.value.access_policies_object = []

	val.forEach(itemArr => {
		let elem = accessPolicies.value.find(itemObj => itemObj.user_code == itemArr)
		if (elem) role.value.access_policies_object.push(elem)
	})

	role.value.access_policies = role.value.access_policies_object.map(item => item.user_code)
}


async function save() {
	let res = await useApi('role.put', {body: role.value, params: {id: route.params.id}})

	if (res) useNotify({type: 'success', title: 'Saved!'})
}

async function cancel() {
	router.push('/settings/permissions')
}

function fromatDate(date) {
	return dayjs(date).format('DD.MM.YYYY LT')
}

if (store.current.base_api_url) {
	init()
} else {
	watch(() => store.current, async () => {
		init()
	})
}
</script>

<style lang="scss" scoped>
.coll {
	width: 48%;
}

.control_line {
	width: calc(100% - 160px);
	position: fixed;
	left: 160px;
	bottom: 0;
	border-top: 1px solid $border;
}
</style>
