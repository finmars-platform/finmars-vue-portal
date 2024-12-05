<template>
	<div>
		<div class="py-3 px-8">
			<FmBreadcrumbs :crumbs="crumbs" @update-crumbs="handleCrumbs" />
		</div>
		<CommonSettingsLayout
			title="Add Group"
			saveText="Create Group"
			@save="save"
			@cancel="cancel"
		>
			<template #left>
				<FmCard title="General" class="flex flex-col gap-3 mb-6">
					<FmTextField v-model="form.name" label="Name" outlined />
					<FmTextField
						v-model="form.user_code"
						:rules="[rules.required]"
						label="User Code"
						outlined
					/>
					<FmTextField
						v-model="form.configuration_code"
						:rules="[rules.required]"
						label="Configuration Code"
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
				<FmCard title="Roles" class="m-b-24">
					<BaseMultiSelectInput
						v-if="readyStatus.roles"
						v-model="form.roles"
						:items="roles"
					/>
					<div class="flex w-full justify-center">
						<FmProgressCircular
							v-if="!readyStatus.roles"
							:size="32"
							indeterminate
						/>
					</div>
				</FmCard>

				<FmCard title="Members" class="m-b-24">
					<BaseMultiSelectInput
						v-if="readyStatus.members"
						v-model="form.members"
						:items="members"
						item_id="id"
						item_title="username"
					/>
					<div class="flex w-full justify-center">
						<FmProgressCircular
							v-if="!readyStatus.members"
							:size="32"
							indeterminate
						/>
					</div>
				</FmCard>

				<FmCard title="Access Policies" class="m-b-24">
					<BaseMultiSelectInput
						v-if="readyStatus.accessPolicies"
						v-model="form.access_policies"
						:items="accessPolicies"
					/>
					<div class="flex w-full justify-center">
						<FmProgressCircular
							v-if="!readyStatus.accessPolicies"
							:size="32"
							indeterminate
						/>
					</div>
				</FmCard>
			</template>
		</CommonSettingsLayout>
	</div>
</template>

<script setup>
	import { FmTextField, FmBreadcrumbs, FmProgressCircular } from '@finmars/ui';
	import {
		getRealmSpaceCodes,
		loadMultiselectOpts
	} from '~/pages/system/helper';

	const store = useStore();
	const route = useRoute();
	const router = useRouter();

	const { realmCode, spaceCode } = getRealmSpaceCodes(route);
	const crumbs = ref([
		{ title: 'Groups', path: 'group' },
		{ title: 'Add', path: 'add' }
	]);

	const readyStatus = reactive({
		roles: false,
		members: false,
		accessPolicies: false
	});

	const roles = ref([]);
	const members = ref([]);
	const accessPolicies = ref([]);

	const form = reactive({
		name: '',
		user_code: '',
		configuration_code: 'com.finmars.local',
		roles: [],
		members: [],
		users: [],
		access_policies: [],
		description: ''
	});

	const rules = {
		required: (value) => (value ? '' : 'Field is required')
	};

	const handleCrumbs = (newCrumbs, newPath) => {
		router.push(`/${realmCode}/${spaceCode}/v/system/iam` + newPath);
	};

	async function init() {
		const res = await Promise.all([
			loadMultiselectOpts('roleList.get', readyStatus, 'roles'),
			loadMultiselectOpts('memberList.get', readyStatus, 'members'),
			loadMultiselectOpts('accessPolicyList.get', readyStatus, 'accessPolicies')
		]);

		roles.value = res[0];
		members.value = res[1];
		accessPolicies.value = res[2];
	}
	async function save() {
		const res = await useApi('groupList.post', { body: form });

		if (!res._$error) {
			useNotify({ type: 'success', title: 'Group created!' });
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
