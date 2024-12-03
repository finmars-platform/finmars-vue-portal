<template>
	<CommonSettingsLayout
		title="Add member"
		saveText="Send invite"
		@save="save"
		@cancel="cancel"
	>
		<template #left>
			<FmCard title="General" class="flex flex-col gap-3 mb-6">

				<FmTextField
					v-model="form.Username"
					label="Username"
					outlined
				/>
				<FmTextField
					v-model="form.email"
					label="Email"
					outlined
				/>

				<!--<FmCheckbox
					v-model="form.is_owner"
					label="Owner"
					class="m-b-8"
				/>-->

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
				<FmProgressCircular v-if="!readyStatus.groups" :size="32" indeterminate />
			</FmCard>

			<FmCard title="Roles" class="m-b-6">
				<BaseMultiSelectInput
					v-if="readyStatus.roles"
					v-model="form.roles"
					:items="roles"
				/>
				<FmProgressCircular v-if="!readyStatus.roles" :size="32" indeterminate />
			</FmCard>
			<FmCard title="Personal Access Policies" class="m-b-6">
				<BaseMultiSelectInput
					v-if="readyStatus.accessPolicies"
					v-model="form.access_policies"
					:items="accessPolicies"
				/>
				<FmProgressCircular v-if="!readyStatus.accessPolicies" :size="32" indeterminate />
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
				text: 'Permissions: Members',
				to: '/settings/permission',
				disabled: false
			},
			{
				text: 'Add member',
				disabled: true
			},
		],
	});
	const store = useStore()
	const route = useRoute()
	const router = useRouter()

	const readyStatus = reactive({
		groups: false,
		roles: false,
		accessPolicies: false,
	})

	const form = reactive({
		groups: [],
		base_api_url: store.space_code,
		is_owner: false
	})

	const groups = ref([]);
	const roles = ref([]);
	const accessPolicies = ref([]);

	async function init() {
		const res = await Promise.all([
			loadMultiselectOpts('groupList.get', readyStatus, 'groups'),
			loadMultiselectOpts('roleList.get', readyStatus, 'roles'),
			loadMultiselectOpts('accessPolicyList.get', readyStatus, 'accessPolicies')
		]);

		groups.value = res[0];
		roles.value = res[1];
		accessPolicies.value = res[2];
	}

	async function save() {
		// TODO Refactor
		const sendedForm = {
			...form,
			groups: form.groups,
			roles: form.roles
		}

		let res = await useApi('member.post', {body: sendedForm, params: {id: route.params.id}})

		if (!res._$error) {
			useNotify({ type: 'success', title: 'Invite sent!' });
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
