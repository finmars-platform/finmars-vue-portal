<template>
	<CommonSettingsLayout
		title="Update Group"
		@save="save"
		@cancel="cancel"
	>
		<template #left>
			<FmCard title="General" v-if="group.id">
				<BaseInput
					label="Name"
					v-model="group.name"
					class="m-b-24"
				/>
				<BaseInput
					label="User Code"
					v-model="group.user_code"
					disabled
					class="m-b-24"
				/>

				<BaseInput
					label="Configuration Code"
					v-model="group.configuration_code"
					disabled
					class="m-b-24"
				/>

				<BaseInput
					label="Description"
					v-model="group.description"
					class="m-b-24"
				/>


			</FmCard>
		</template>
		<template #right>

			<FmCard title="Roles" class="m-b-24" v-if="group.id">

				<BaseMultiSelectInput
					:modelValue="selectedRoles"
					@update:modelValue="findRoleUserCodes($event)"
					label="Roles"
					:items="roles"
					item_id="user_code"
					item_title="name"
				/>


			</FmCard>
			<FmCard title="Members" class="m-b-24" v-if="group.id">
				<BaseMultiSelectInput
					v-model="selectedMembers"
					@update:modelValue="findMemberIds($event)"
					label="Members"
					:items="members"
					item_id="username"
					item_title="username"
				/>
			</FmCard>

			<FmCard title="Access Policies" class="m-b-24" v-if="group.id">

				<BaseMultiSelectInput
					v-model="selectedAccessPolicies"
					@update:modelValue="findAccessPolicyUserCodes($event)"
					label="Access Policies"
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
			text: 'Permissions: Groups',
			to: '/settings/permissions',
			disabled: false
		},
		{
			text: 'Update Group',
			disabled: true
		},
	],
});
const store = useStore()
let route = useRoute()
let router = useRouter()

let group = ref({})
let roles = ref([])
let members = ref([])
let accessPolicies = ref([])

let selectedRoles = computed(() => {
	if (!group.value.roles_object.length) return []
	return group.value.roles_object.map(item => item.user_code).join(',')
})

let selectedMembers = computed(() => {
	if (!group.value.members_object.length) return []
	return group.value.members_object.map(item => item.username).join(',')
})

let selectedAccessPolicies = computed(() => {
	if (!group.value.access_policies_object.length) return []
	return group.value.access_policies_object.map(item => item.user_code).join(',')
})



async function init() {
	let res = await useApi('group.get', {params: {id: route.params.id}})
	group.value = res

	res = await useApi('roleList.get')
	roles.value = res.results

	res = await useApi('memberList.get')
	members.value = res.results

	// res = await useApi('accessPolicyList.get', {params: {page_size: '10000'}})
	res = await useLoadAllPages('accessPolicyList.get', {
		filters: { page: 1, page_size: 10000 },
	})
	accessPolicies.value = res

}

function findRoleUserCodes(val) {
	if (typeof val == 'string') val = val.split(',')
	group.value.roles_object = []

	val.forEach(itemArr => {
		let elem = roles.value.find(itemObj => itemObj.user_code == itemArr)
		if (elem) group.value.roles_object.push(elem)
	})

	group.value.roles = group.value.roles_object.map(item => item.user_code)
}

function findAccessPolicyUserCodes(val) {
	if (typeof val == 'string') val = val.split(',')
	group.value.access_policies_object = []

	val.forEach(itemArr => {
		let elem = accessPolicies.value.find(itemObj => itemObj.user_code == itemArr)
		if (elem) group.value.access_policies_object.push(elem)
	})

	group.value.access_policies = group.value.access_policies_object.map(item => item.user_code)
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

async function save() {
	let res = await useApi('group.put', {body: group.value, params: {id: route.params.id}})

	if (res) {
		useNotify({type: 'success', title: 'Saved!'})
		router.push('/settings/permissions?tab=Groups')
	}
}

async function cancel() {
	router.push('/settings/permissions?tab=Groups')
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
