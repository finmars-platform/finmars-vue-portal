<template>
	<div>
		<div class="py-3 px-8">
			<FmBreadcrumbs :crumbs="crumbs" @update-crumbs="handleCrumbs" />
		</div>
		<CommonSettingsLayout title="Update member" @save="save" @cancel="cancel">
			<template #left>
				<FmCard title="General" class="flex flex-col gap-3" v-if="member.id">
					<FmTextField
						v-model="member.username"
						label="Username"
						outlined
						disabled
					/>
					<FmTextField
						:modelValue="fromatDate(member.join_date)"
						label="Date joined"
						disabled
						outlined
					/>
					<div
						v-if="
							member.status !== 'invited' &&
							member.status !== 'deleted' &&
							member.status !== 'invite_declined'
						"
					>
						<FmCheckbox v-model="member.is_owner" label="Owner" class="m-b-8" />
					</div>

					<FmCheckbox v-model="member.is_admin" label="Admin" />

					<div style="margin-top: 16px">
						<div
							class="mb-2"
							v-if="
								member.status !== 'invited' &&
								member.status !== 'deleted' &&
								member.status !== 'invite_declined'
							"
						>
							<FmSelect
								v-model="member.status"
								:options="statuses"
								label="Status"
								variant="outlined"
							/>
						</div>

						<div
							v-if="
								member.status === 'invited' ||
								member.status === 'deleted' ||
								member.status === 'invite_declined'
							"
						>
							Status: <b>{{ member.status }}</b>
						</div>
					</div>

					<div v-if="member.is_deleted || member.status === 'invite_declined'">
						<FmButton rounded @click="resendInvite()">Resend Invite</FmButton>
					</div>
				</FmCard>
			</template>
			<template #right>
				<FmCard title="Groups" class="m-b-24" v-if="member.id">
					<BaseMultiSelectInput
						:modelValue="selectedGroups"
						@update:modelValue="findGroupIds($event)"
						:items="groups"
						item_id="name"
					/>
				</FmCard>
				<FmCard title="Roles" class="m-b-24" v-if="member.id">
					<BaseMultiSelectInput
						:modelValue="selectedRoles"
						@update:modelValue="findRoleIds($event)"
						:items="roles"
						item_id="name"
					/>
				</FmCard>

				<FmCard title="Attached Access Policies" class="m-b-24">
					<BaseMultiSelectInput
						:modelValue="selectedAccessPolicies"
						@update:modelValue="findAccessPolicyIds($event)"
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
	import dayjs from 'dayjs';
	import { FmBreadcrumbs, FmButton, FmSelect, FmCheckbox } from '@finmars/ui';
	import { getRealmSpaceCodes } from '~/pages/system/helper';

	const store = useStore();
	const route = useRoute();
	const router = useRouter();

	const member = ref({});
	const groups = ref([]);
	const roles = ref([]);
	const accessPolicies = ref([]);

	const { realmCode, spaceCode } = getRealmSpaceCodes(route);
	const crumbs = ref([
		{ title: 'Members', path: 'member' },
		{ title: 'Update', path: '' }
	]);

	async function resendInvite() {
		const res = await useApi('memberSendInvite.put', {
			params: { id: route.params.id }
		});

		if (res) {
			useNotify({ type: 'success', title: 'Invite sent!' });
		}
	}

	const statuses = ref([
		{ value: 'active', title: 'Active' },
		{ value: 'blocked', title: 'Blocked' }
	]);

	const selectedGroups = computed(() => {
		if (!member.value.groups_object.length) return [];
		return member.value.groups_object.map((item) => item.name);
	});

	const selectedRoles = computed(() => {
		if (!member.value.roles_object.length) return [];
		return member.value.roles_object.map((item) => item.name);
	});

	const selectedAccessPolicies = computed(() => {
		if (!member.value.access_policies_object?.length) return [];
		return member.value.access_policies_object.map((item) => item.user_code);
	});

	async function init() {
		let res = await useApi('member.get', { params: { id: route.params.id } });
		member.value = res;

		res = await useApi('groupList.get');
		groups.value = res.results;

		res = await useApi('roleList.get');
		roles.value = res.results;

		// res = await useApi('accessPolicyList.get', {params: {page_size: '10000'}})
		res = await useLoadAllPages('accessPolicyList.get', {
			filters: { page: 1, page_size: 10000 }
		});
		accessPolicies.value = res;
	}

	function findGroupIds(val) {
		if (typeof val == 'string') val = val.split(',');
		member.value.groups_object = [];

		val.forEach((itemArr) => {
			let elem = groups.value.find((itemObj) => itemObj.name == itemArr);
			if (elem) member.value.groups_object.push(elem);
		});

		member.value.groups = member.value.groups_object.map((item) => item.id);
	}

	function findRoleIds(val) {
		if (typeof val == 'string') val = val.split(',');
		member.value.roles_object = [];

		val.forEach((itemArr) => {
			let elem = roles.value.find((itemObj) => itemObj.name == itemArr);
			if (elem) member.value.roles_object.push(elem);
		});

		member.value.roles = member.value.roles_object.map((item) => item.id);
	}

	function findAccessPolicyIds(val) {
		if (typeof val == 'string') val = val.split(',');
		member.value.access_policies_object = [];

		val.forEach((itemArr) => {
			let elem = accessPolicies.value.find(
				(itemObj) => itemObj.user_code == itemArr
			);
			if (elem) member.value.access_policies_object.push(elem);
		});

		member.value.access_policies = member.value.access_policies_object.map(
			(item) => item.id
		);
	}

	async function save() {
		const res = await useApi('member.put', {
			body: member.value,
			params: { id: route.params.id }
		});

		if (!res._$error) {
			useNotify({ type: 'success', title: 'Saved!' });
			router.back();
		}
	}

	async function cancel() {
		router.back();
	}

	function fromatDate(date) {
		return dayjs(date).format('DD.MM.YYYY LT');
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
