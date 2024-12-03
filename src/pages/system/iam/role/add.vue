<template>
	<CommonSettingsLayout
		title="Add Role"
		saveText="Create Role"
		@save="save"
		@cancel="cancel"
	>
		<template #left>
			<FmCard title="General" class="flex flex-col gap-3 mb-24">

				<FmTextField
					v-model="form.name"
					label="Name"
					outlined
				/>
				<FmTextField
					v-model="form.user_code"
					label="User Code"
					:rules="[rules.required]"
					outlined
				/>
				<FmTextField
					v-model="form.configuration_code"
					label="Configuration Code"
					:rules="[rules.required]"
					outlined
				/>
				<FmTextField
					v-model="form.description"
					label="Description"
					outlined
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
	import {loadMultiselectOpts} from "~/pages/settings/helper";

	definePageMeta({
		middleware: 'auth',
		bread: [
			{
				text: 'Permissions: Roles',
				to: '/settings/permission',
				disabled: false
			},
			{
				text: 'Add Role',
				disabled: true
			},
		],
	});
	const store = useStore()
	const router = useRouter()

	const readyStatus = reactive({
		groups: false,
		members: false,
		accessPolicies: false,
	});

	const form = reactive({
		name: '',
		user_code: '',
		configuration_code: 'com.finmars.local',
		groups: [],
		users: [],
		access_policies: [],
	})

	const groups = ref([]);
	const members = ref([]);
	const accessPolicies = ref([]);

	const rules = {
		required: value => value ? '' : 'Field is required'
	}

	async function init() {

		const res = await Promise.all( [
			loadMultiselectOpts('userGroups.get', readyStatus, 'groups'),
			loadMultiselectOpts('memberList.get', readyStatus, 'members'),
			loadMultiselectOpts('accessPolicyList.get', readyStatus, 'accessPolicies'),
		]);

		groups.value = res[0];
		members.value = res[1];
		accessPolicies.value = res[2];
	}

	async function save() {
		const res = await useApi('roleList.post', {body: form})

		if ( !res._$error ) {
			useNotify({ type: 'success', title: 'Role created!'})
			router.back();
		}
	}
	async function cancel() {
		router.back();
	}

	if (store.isUrlValid) {
		init();
	} else {
		const unwatch = watch(
			() => store.current,
			async () => {
				await init();
				unwatch();
			}
		);
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
