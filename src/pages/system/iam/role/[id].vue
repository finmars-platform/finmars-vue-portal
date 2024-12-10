<template>
	<div>
		<div class="py-3 px-8">
			<FmBreadcrumbs :crumbs="crumbs" @update-crumbs="handleCrumbs" />
		</div>
		<CommonSettingsLayout title="Update Role" @save="save" @cancel="cancel">
			<template #left>
				<FmCard title="General" class="flex flex-col gap-3" v-if="role.id">
					<FmTextField v-model="role.name" label="Name" outlined />
					<FmTextField
						v-model="role.user_code"
						label="User Code"
						disabled
						outlined
					/>
					<FmTextField
						v-model="role.configuration_code"
						label="Configuration Code"
						disabled
						outlined
					/>
					<FmTextField
						v-model="role.description"
						label="Description"
						outlined
					/>
				</FmCard>
			</template>
			<template #right>
				<FmCard title="Groups" class="m-b-24" v-if="role.id">
					<BaseMultiSelectInput
						:modelValue="selectedGroups"
						@update:modelValue="findGroupUserCodes($event)"
						label="Groups"
						:items="groups"
						item_id="user_code"
					/>
				</FmCard>

				<FmCard title="Members" class="m-b-24" v-if="role.id">
					<BaseMultiSelectInput
						v-model="selectedMembers"
						@update:modelValue="findMemberIds($event)"
						label="Members"
						:items="members"
						item_id="username"
						item_title="username"
					/>
				</FmCard>

				<FmCard title="Access Policies" class="m-b-24" v-if="role.id">
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

	const role = ref({});
	const groups = ref([]);
	const members = ref([]);
	const accessPolicies = ref([]);

	const { realmCode, spaceCode } = getRealmSpaceCodes(route);
	const crumbs = ref([
		{ title: 'Roles', path: 'role' },
		{ title: 'Update', path: '' }
	]);

	const selectedGroups = computed(() => {
		if (!role.value.groups_object.length) return [];
		return role.value.groups_object.map((item) => item.user_code);
	});

	const selectedMembers = computed(() => {
		if (!role.value.members_object.length) return [];
		return role.value.members_object.map((item) => item.username);
	});

	const selectedAccessPolicies = computed(() => {
		if (!role.value.access_policies_object.length) return [];
		return role.value.access_policies_object.map((item) => item.user_code);
	});

	async function init() {
		let res = await useApi('role.get', { params: { id: route.params.id } });
		role.value = res;

		res = await useApi('groupList.get');
		groups.value = res.results;

		res = await useApi('memberList.get');
		members.value = res.results;

		// res = await useApi('accessPolicyList.get', {params: {page_size: '10000'}})
		res = await useLoadAllPages('accessPolicyList.get', {
			filters: { page: 1, page_size: 10000 }
		});
		accessPolicies.value = res;
	}

	function findGroupUserCodes(val) {
		if (typeof val == 'string') val = val.split(',');
		role.value.groups_object = [];

		val.forEach((itemArr) => {
			let elem = role.value.find((itemObj) => itemObj.user_code == itemArr);
			if (elem) role.value.groups_object.push(elem);
		});

		role.value.groups = role.value.groups_object.map((item) => item.user_code);
	}

	function findMemberIds(val) {
		if (typeof val == 'string') val = val.split(',');
		role.value.members_object = [];

		val.forEach((itemArr) => {
			let elem = members.value.find((itemObj) => itemObj.username == itemArr);
			if (elem) role.value.members_object.push(elem);
		});

		role.value.members = role.value.members_object.map((item) => item.id);
	}

	function findAccessPolicyUserCodes(val) {
		if (typeof val == 'string') val = val.split(',');
		role.value.access_policies_object = [];

		val.forEach((itemArr) => {
			let elem = accessPolicies.value.find(
				(itemObj) => itemObj.user_code == itemArr
			);
			if (elem) role.value.access_policies_object.push(elem);
		});

		role.value.access_policies = role.value.access_policies_object.map(
			(item) => item.user_code
		);
	}

	async function save() {
		const res = await useApi('role.put', {
			body: role.value,
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
