<template>
	<CommonSettingsLayout
		title="Add Role"
		saveText="Create Role"
		@save="save"
		@cancel="cancel"
	>
		<template #left>
			<FmCard title="General" class="mb-24">
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
			<FmCard title="Groups" class="m-b-24">
				<BaseMultiSelectInput
					v-show="readyStatus.groups"
					v-model="form.groups"
					:items="groups"
				/>

				<FmLoader v-if="!readyStatus.groups" />
			</FmCard>

			<FmCard title="Members" class="m-b-24">
				<BaseMultiSelectInput
					v-show="readyStatus.members"
					v-model="form.members"
					:items="members"
					item_id="id"
					item_title="username"
				/>

				<FmLoader v-if="!readyStatus.members" />
			</FmCard>

			<FmCard title="Access Policies" class="m-b-24">
				<BaseMultiSelectInput
					v-show="readyStatus.accessPolicies"
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
	import {usePrefixedRouterPush} from "~/composables/useMeta";

	definePageMeta({
		bread: [
			{
				text: 'Permissions: Roles',
				to: '/settings/permissions',
				disabled: false
			},
			{
				text: 'Add Role',
				disabled: true
			},
		],
	});
	const store = useStore()
	let route = useRoute()
	let router = useRouter()

	let readyStatus = reactive({
		groups: false,
		members: false,
		accessPolicies: false,
	});

	let form = reactive({
		name: '',
		user_code: '',
		configuration_code: 'com.finmars.local',
		groups: [],
		users: [],
		access_policies: [],
	})

	let groups = ref([]);
	let members = ref([]);
	let accessPolicies = ref([]);

	async function init() {

		let res = await Promise.all( [
			loadMultiselectOpts('userGroups.get', readyStatus, 'groups'),
			loadMultiselectOpts('memberList.get', readyStatus, 'members'),
			loadMultiselectOpts('accessPolicyList.get', readyStatus, 'accessPolicies'),
		]);

		groups.value = res[0];
		members.value = res[1];
		accessPolicies.value = res[2];

	}

	async function save() {

		let res = await useApi('roleList.post', {body: form})

		if ( !res._$error ) {
			useNotify({type: 'success', title: 'Role created!'})

			usePrefixedRouterPush(router, route, '/settings/permissions?tab=Roles')
		}
	}
	async function cancel() {
		usePrefixedRouterPush(router, route, '/settings/permissions?tab=Roles')
	}
	function fromatDate( date ) {
		return dayjs( date ).format('DD.MM.YYYY LT')
	}

	if ( store.isUrlValid ) {
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
	border-top: 1px solid var(--table-border-color);
}
</style>
