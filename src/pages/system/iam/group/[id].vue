<template>
	<div>
		<div class="py-3 px-8">
			<FmBreadcrumbs :crumbs="crumbs" @update-crumbs="handleCrumbs" />
		</div>
		<CommonSettingsLayout title="Update Group" @save="save" @cancel="cancel">
			<template #left>
				<FmCard
					title="General"
					v-if="group.id"
					class="flex flex-col gap-3 mb-6"
				>
					<FmTextField v-model="group.name" label="Name" outlined />
					<FmTextField
						v-model="group.user_code"
						label="User Code"
						disabled
						outlined
					/>
					<FmTextField
						v-model="group.configuration_code"
						label="Configuration Code"
						disabled
						outlined
					/>
					<FmTextField
						v-model="group.description"
						label="Description"
						outlined
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
	</div>
</template>

<script setup>
	import { FmTextField, FmBreadcrumbs } from '@finmars/ui';
	import { getRealmSpaceCodes } from '~/pages/system/helper';

	const store = useStore();
	const route = useRoute();
	const router = useRouter();

	const group = ref({});
	const roles = ref([]);
	const members = ref([]);
	const accessPolicies = ref([]);

	const { realmCode, spaceCode } = getRealmSpaceCodes(route);
	const crumbs = ref([
		{ title: 'Groups', path: 'group' },
		{ title: 'Update', path: '' }
	]);

	const selectedRoles = computed(() => {
		if (!group.value.roles_object.length) return [];
		return group.value.roles_object.map((item) => item.user_code);
	});

	const selectedMembers = computed(() => {
		if (!group.value.members_object.length) return [];
		return group.value.members_object.map((item) => item.username);
	});

	const selectedAccessPolicies = computed(() => {
		if (!group.value.access_policies_object.length) return [];
		return group.value.access_policies_object.map((item) => item.user_code);
	});

	async function init() {
		let res = await useApi('group.get', { params: { id: route.params.id } });
		group.value = res;

		res = await useApi('roleList.get');
		roles.value = res.results;

		res = await useApi('memberList.get');
		members.value = res.results;

		// res = await useApi('accessPolicyList.get', {params: {page_size: '10000'}})
		res = await useLoadAllPages('accessPolicyList.get', {
			filters: { page: 1, page_size: 10000 }
		});
		accessPolicies.value = res;
	}

	function findRoleUserCodes(val) {
		if (typeof val == 'string') val = val.split(',');
		group.value.roles_object = [];

		val.forEach((itemArr) => {
			let elem = roles.value.find((itemObj) => itemObj.user_code == itemArr);
			if (elem) group.value.roles_object.push(elem);
		});

		group.value.roles = group.value.roles_object.map((item) => item.user_code);
	}

	function findAccessPolicyUserCodes(val) {
		if (typeof val == 'string') val = val.split(',');
		group.value.access_policies_object = [];

		val.forEach((itemArr) => {
			let elem = accessPolicies.value.find(
				(itemObj) => itemObj.user_code == itemArr
			);
			if (elem) group.value.access_policies_object.push(elem);
		});

		group.value.access_policies = group.value.access_policies_object.map(
			(item) => item.user_code
		);
	}

	function findMemberIds(val) {
		if (typeof val == 'string') val = val.split(',');
		group.value.members_object = [];

		console.log('findMemberIds.val', val);

		val.forEach((itemArr) => {
			const elem = members.value.find((itemObj) => itemObj.username == itemArr);
			if (elem) group.value.members_object.push(elem);
		});

		group.value.members = group.value.members_object.map((item) => item.id);
	}

	async function save() {
		const res = await useApi('group.put', {
			body: group.value,
			params: { id: route.params.id }
		});

		if (res) {
			useNotify({ type: 'success', title: 'Saved!' });
			router.back();
		}
	}

	async function cancel() {
		router.back();
	}

	const handleCrumbs = (newCrumbs, newPath) => {
		router.push(`/${realmCode}/${spaceCode}/v/system/iam` + newPath);
	};

	if (store.isUrlValid) {
		init();
	} else {
		watch(
			() => store.current,
			async () => {
				await init();
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
