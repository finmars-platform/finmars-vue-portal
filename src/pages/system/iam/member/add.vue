<template>
	<div>
		<div class="py-3 px-8">
			<FmBreadcrumbs :crumbs="crumbs" @update-crumbs="handleCrumbs" />
		</div>
		<CommonSettingsLayout
			title="Add member"
			saveText="Send invite"
			@save="save"
			@cancel="cancel"
		>
			<template #left>
				<FmCard title="General" class="flex flex-col gap-3 mb-6">
					<FmTextField v-model="form.username" label="Username" outlined />
					<FmTextField v-model="form.email" label="Email" outlined />
					<FmCheckbox v-model="form.is_admin" label="Admin" />
				</FmCard>
			</template>
			<template #right>
				<FmCard title="Groups" class="mb-6">
					<BaseMultiSelectInput
						v-if="readyStatus.groups"
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
				<FmCard title="Roles" class="mb-6">
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
				<FmCard title="Personal Access Policies" class="mb-6">
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
	import {
		FmTextField,
		FmProgressCircular,
		FmBreadcrumbs,
		FmCheckbox
	} from '@finmars/ui';
	import {
		getRealmSpaceCodes,
		loadMultiselectOpts
	} from '~/pages/system/helper';

	const store = useStore();
	const route = useRoute();
	const router = useRouter();

	const { realmCode, spaceCode } = getRealmSpaceCodes(route);
	const crumbs = ref([
		{ title: 'Members', path: 'member' },
		{ title: 'Add', path: 'add' }
	]);

	const readyStatus = reactive({
		groups: false,
		roles: false,
		accessPolicies: false
	});

	const form = ref({
		username: '',
		email: '',
		is_admin: false,
		is_owner: false,
		groups: [],
		roles: [],
		access_policies: [],
		base_api_url: store.space_code
	});

	const groups = ref([]);
	const roles = ref([]);
	const accessPolicies = ref([]);

	const handleCrumbs = (newCrumbs, newPath) => {
		router.push(`/${realmCode}/${spaceCode}/v/system/iam` + newPath);
	};

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
		const res = await useApi('member.post', {
			body: form.value,
			params: { id: route.params.id }
		});

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
