<template>
	<div>
		<div class="py-3 px-8">
			<FmBreadcrumbs :crumbs="crumbs" @update-crumbs="handleCrumbs" />
		</div>
		<CommonSettingsLayout
			title="Add Role"
			saveText="Create Role"
			@save="save"
			@cancel="cancel"
		>
			<template #left>
				<FmCard title="General" class="flex flex-col gap-3 mb-24">
					<FmTextField v-model="form.name" label="Name" outlined />
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
					<div class="flex w-full justify-center">
						<FmProgressCircular
							v-if="!readyStatus.groups"
							:size="32"
							indeterminate
						/>
					</div>
				</FmCard>

				<FmCard title="Members" class="m-b-24">
					<BaseMultiSelectInput
						v-show="readyStatus.members"
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
						v-show="readyStatus.accessPolicies"
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
	import {
		getRealmSpaceCodes,
		loadMultiselectOpts
	} from '~/pages/system/helper';
	import { FmTextField, FmBreadcrumbs, FmProgressCircular } from '@finmars/ui';

	const store = useStore();
	const route = useRoute();
	const router = useRouter();

	const { realmCode, spaceCode } = getRealmSpaceCodes(route);
	const crumbs = ref([
		{ title: 'Roles', path: 'role' },
		{ title: 'Add', path: 'add' }
	]);

	const readyStatus = reactive({
		groups: false,
		members: false,
		accessPolicies: false
	});

	const form = reactive({
		name: '',
		user_code: '',
		configuration_code: 'com.finmars.local',
		groups: [],
		users: [],
		access_policies: [],
		description: ''
	});

	const groups = ref([]);
	const members = ref([]);
	const accessPolicies = ref([]);

	const rules = {
		required: (value) => (value ? '' : 'Field is required')
	};

	const handleCrumbs = (newCrumbs, newPath) => {
		router.push(`/${realmCode}/${spaceCode}/v/system/iam` + newPath);
	};

	async function init() {
		const res = await Promise.all([
			loadMultiselectOpts('userGroups.get', readyStatus, 'groups'),
			loadMultiselectOpts('memberList.get', readyStatus, 'members'),
			loadMultiselectOpts('accessPolicyList.get', readyStatus, 'accessPolicies')
		]);

		groups.value = res[0];
		members.value = res[1];
		accessPolicies.value = res[2];
	}

	async function save() {
		const res = await useApi('roleList.post', { body: form });

		if (!res._$error) {
			useNotify({ type: 'success', title: 'Role created!' });
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
