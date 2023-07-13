<template>
	<CommonSettingsLayout
		title="Add member"
		saveText="Send invite"
		@save="save"
		@cancel="cancel"
	>
		<template #left>
			<FmCard title="General" class="mb-6">
				<BaseInput
					label="Name"
					v-model="form.username"
				/>

				<FmCheckbox
					v-model="form.is_owner"
					label="Owner"
					class="m-b-8"
				/>

				<FmCheckbox
					v-model="form.is_admin"
					label="Admin"
				/>

			</FmCard>
		</template>
		<template #right>
			<FmCard title="Groups" class="m-b-6">
				<BaseMultiSelectInput
					v-if="readyStatus.groups"
					v-model="form.groups"
					:items="groups"
				/>

				<FmLoader v-if="!readyStatus.groups" />
			</FmCard>

			<FmCard title="Roles" class="m-b-6">
				<BaseMultiSelectInput
					v-if="readyStatus.roles"
					v-model="form.roles"
					:items="roles"
				/>

				<FmLoader v-if="!readyStatus.roles" />
			</FmCard>
			<FmCard title="Personal Access Policies" class="m-b-6">
				<BaseMultiSelectInput
					v-if="readyStatus.accessPolicies"
					v-model="form.access_policies"
					:items="accessPolicies"
				/>

				<FmLoader v-if="!readyStatus.accessPolicies" />
			</FmCard>
		</template>
	</CommonSettingsLayout>
</template>

<script setup>

	import dayjs from 'dayjs'
	import {loadMultiselectOpts} from "~/pages/settings/helper";

	definePageMeta({
		bread: [
			{
				text: 'Permissions: Members',
				to: '/settings/permissions',
				disabled: false
			},
			{
				text: 'Add member',
				disabled: true
			},
		],
	});
	const store = useStore()
	let route = useRoute()
	let router = useRouter()

	let readyStatus = reactive({
		groups: false,
		roles: false,
		accessPolicies: false,
	})

	let form = reactive({
		groups: [],
		base_api_url: store.current.base_api_url,
		is_owner: false
	})

	let groups = ref([]);
	let roles = ref([]);
	let accessPolicies = ref([]);

	async function init() {

		const res = await Promise.all( [
			loadMultiselectOpts('userGroups.get', readyStatus, 'groups'),
			loadMultiselectOpts("roleList.get", readyStatus, 'roles'),
			loadMultiselectOpts("accessPolicyList.get", readyStatus, 'accessPolicies'),
		]);

		groups.value = res[0];
		roles.value = res[1];
		accessPolicies.value = res[2];

	}

	async function save() {
		// TODO Refactor
		let sendedForm = {
			...form,
			groups: form.groups.join(','),
			roles: form.groups.join(',')
		}

		let res = await useApi('memberInvites.post', {body: sendedForm, params: {id: route.params.id}})

		if ( !res.error ) {
			useNotify({type: 'success', title: 'Invite sent!'})

			router.push('/settings/permissions?tab=Members')
		}
	}
	async function cancel() {
		router.push('/settings/permissions?tab=Members')
	}
	function fromatDate( date ) {
		return dayjs( date ).format('DD.MM.YYYY LT')
	}

	if ( store.current.base_api_url ) {
		init()
	} else {
		const unwatch = watch( () => store.current, async () => {
			init()
			unwatch();
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
