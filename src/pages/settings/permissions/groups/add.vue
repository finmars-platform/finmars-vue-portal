<template>
	<CommonSettingsLayout
		title="Add Group"
		saveText="Create Group"
		@save="save"
		@cancel="cancel"
	>
		<template #left>
			<FmCard title="General" class="mb-6">
				<BaseInput
					label="Name"
					v-model="form.name"
				/>
				<BaseInput
					label="User Code"
					v-model="form.user_code"
				/>

				<BaseInput
					label="Configuration Code"
					v-model="form.configuration_code"
				/>

			</FmCard>
		</template>
		<template #right>


			<FmCard title="Roles" class="m-b-24">
				<BaseMultiSelectInput
					v-if="readyStatus.roles"
					v-model="form.roles"
					:items="roles"
				/>

				<FmLoader v-if="!readyStatus.roles" />
			</FmCard>

			<FmCard title="Members" class="m-b-24">
				<BaseMultiSelectInput
					v-if="readyStatus.members"
					v-model="form.members"
					:items="members"
					item_id="id"
					item_title="username"
				/>

				<FmLoader v-if="!readyStatus.members" />
			</FmCard>

			<FmCard title="Access Policies" class="m-b-24">
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
				text: 'Permissions: Groups',
				to: '/settings/permissions',
				disabled: false
			},
			{
				text: 'Add Group',
				disabled: true
			},
		],
	});

	const store = useStore()
	let router = useRouter()

	let readyStatus = reactive({
		roles: false,
		members: false,
		accessPolicies: false,
	})

	let roles = ref([]);
	let members = ref([]);
	let accessPolicies = ref([]);

	let form = reactive({
		name: '',
		user_code: '',
		configuration_code: 'com.finmars.local',
		roles: [],
		users: [],
		access_policies: [],
	})

	async function init() {

		let res = await Promise.all( [
			loadMultiselectOpts('roleList.get', readyStatus, 'roles'),
			loadMultiselectOpts('memberList.get', readyStatus, 'members'),
			loadMultiselectOpts('accessPolicyList.get', readyStatus, 'accessPolicies'),
		]);

		roles.value = res[0];
		members.value = res[1];
		accessPolicies.value = res[2];

	}
	async function save() {
		let res = await useApi('groupList.post', {body: form})

		if ( !res.error ) {
			useNotify({type: 'success', title: 'Group created!'})
			router.push('/settings/permissions?tab=Groups')
		}
	}
	async function cancel() {
		router.push('/settings/permissions?tab=Groups')
	}
	function fromatDate( date ) {
		return dayjs( date ).format('DD.MM.YYYY LT')
	}

	if ( store.current.base_api_url ) {
		init()
	} else {
		const unwatch = watch( () => store.current, async () => {
			init();
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
