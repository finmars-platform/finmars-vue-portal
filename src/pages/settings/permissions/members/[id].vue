<template>
	<CommonSettingsLayout
		title="Update member"
		@save="save"
		@cancel="cancel"
	>
		<template #left>
			<FmCard title="General" v-if="member.id">
				<BaseInput
					label="Name"
					v-model="member.username"
					disabled
				/>

				<BaseInput
					label="Date joined"
					:modelValue="fromatDate(member.join_date)"
					disabled
				/>

				<FmCheckbox
					v-model="member.is_owner"
					label="Owner"
					class="m-b-8"
				/>

				<FmCheckbox
					v-model="member.is_admin"
					label="Admin"
				/>

				<div style="margin-top: 16px;">

					<div v-if="member.status != 'invited' && member.status != 'deleted' && member.status != 'invite_declined'">
						<FmSelect label="Status"
											:items="statuses"
											v-model="member.status"/>
					</div>

					<div v-if="member.status == 'invited' || member.status == 'deleted' || member.status == 'invite_declined'">
						Status: <b>{{ member.status }}</b>
					</div>

				</div>

				<div v-if="member.is_deleted || member.status == 'invite_declined'">

					<FmBtn @click="resendInvite()">Resend Invite</FmBtn>

				</div>

			</FmCard>
		</template>
		<template #right>
			<FmCard title="Groups" class="m-b-24" v-if="member.id">

				<BaseMultiSelectInput
					:modelValue="selectedGroups"
					@update:modelValue="findGroupIds($event)"
					:items="groups"
					item_id="name"
				/>


			</FmCard>
			<FmCard title="Roles" class="m-b-24" v-if="member.id">

				<BaseMultiSelectInput
					:modelValue="selectedRoles"
					@update:modelValue="findRoleIds($event)"
					:items="roles"
					item_id="name"
				/>


			</FmCard>

			<FmCard title="Attached Access Policies" class="m-b-24">

				<BaseMultiSelectInput
					:modelValue="selectedAccessPolicies"
					@update:modelValue="findAccessPolicyIds($event)"
					:items="accessPolicies"
					label="Testing"
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
				text: 'Permissions: Members',
				to: '/settings/permissions',
				disabled: false
			},
			{
				text: 'Update member',
				disabled: true
			},
		],
	});
	const store = useStore()
	let route = useRoute()
	let router = useRouter()

	let member = ref({})
	let groups = ref([])
	let roles = ref([])
	let accessPolicies = ref([])

	async function resendInvite() {

		let res = await useApi('memberSendInvite.put', {params: {id: route.params.id}})

		if (res) {
			useNotify({type: 'success', title: 'Invite sent!'})
		}

	}

	let statuses = ref([
		{id: 'active', name: 'Active'},
		{id: 'blocked', name: 'Blocked'},
	]);

	let selectedGroups = computed(() => {
		if (!member.value.groups_object.length) return [];
		return member.value.groups_object.map(item => item.name);
	})

	let selectedRoles = computed(() => {
		if (!member.value.roles_object.length) return [];
		return member.value.roles_object.map(item => item.name);
	})

	let selectedAccessPolicies = computed(() => {
		if (!member.value.access_policies_object?.length) return [];
		return member.value.access_policies_object.map(item => item.user_code);
	})


	async function init() {
		let res = await useApi('member.get', {params: {id: route.params.id}})
		member.value = res

		res = await useApi('groupList.get')
		groups.value = res.results

		res = await useApi('roleList.get')
		roles.value = res.results

		// res = await useApi('accessPolicyList.get', {params: {page_size: '10000'}})
		res = await useLoadAllPages('accessPolicyList.get', {
			filters: {page: 1, page_size: 10000},
		})
		accessPolicies.value = res

	}

	function findGroupIds(val) {
		if (typeof val == 'string') val = val.split(',')
		member.value.groups_object = []

		val.forEach(itemArr => {
			let elem = groups.value.find(itemObj => itemObj.name == itemArr)
			if (elem) member.value.groups_object.push(elem)
		})

		member.value.groups = member.value.groups_object.map(item => item.id)
	}

	function findRoleIds(val) {
		if (typeof val == 'string') val = val.split(',')
		member.value.roles_object = []

		val.forEach(itemArr => {
			let elem = roles.value.find(itemObj => itemObj.name == itemArr)
			if (elem) member.value.roles_object.push(elem)
		})

		member.value.roles = member.value.roles_object.map(item => item.id)
	}

	function findAccessPolicyIds(val) {
		if (typeof val == 'string') val = val.split(',')
		member.value.access_policies_object = []
		console.log("testing2182.findAccessPolicyIds val", val);
		console.log("testing2182.findAccessPolicyIds accessPolicies.value", accessPolicies.value);
		val.forEach(itemArr => {
			let elem = accessPolicies.value.find(itemObj => itemObj.user_code == itemArr)
			console.log("testing2182.findAccessPolicyIds itemArr, elem", itemArr, elem);
			if (elem) member.value.access_policies_object.push(elem)
		})
		console.log("testing2182.findAccessPolicyIds member.value.access_policies_object", member.value.access_policies_object);
		member.value.access_policies = member.value.access_policies_object.map(item => item.id)
	}

	async function save() {

		let res = await useApi('member.put', {body: member.value, params: {id: route.params.id}})

		if (!res.error) {
			useNotify({type: 'success', title: 'Saved!'})
			router.push('/settings/permissions?tab=Member')
		}

	}

	async function cancel() {
		router.push('/settings/permissions?tab=Member')
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
