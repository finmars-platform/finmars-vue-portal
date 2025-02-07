<template>
	<div class="py-3 px-8">
		<div class="pb-4">
			<FmBreadcrumbs :crumbs="crumbs" @update-crumbs="handleCrumbs" />
		</div>
		<div
			v-if="isLoading"
			class="flex w-full justify-center items-center min-h-48"
		>
			<FmProgressCircular :size="50" indeterminate />
		</div>
		<div v-else class="flex justify-between nowrap mt-4 gap-8">
			<div class="recursive-row-wrap mr-1">
				<div class="code-wrapper">
					<UserCodeInput
						:user-code="`${selectedItem.configuration_code}:${selectedItem.user_code}`"
						@update:user-code="updateField('user_code', $event)"
						@update:configuration-code="
							updateField('configuration_code', $event)
						"
						@update:valid="updateUserCodeValidationValue"
					/>
				</div>
				<div class="role-wrapper">
					<FmSelect
						v-model="selectedItem.role"
						:options="roles"
						label="Role"
						variant="outlined"
					/>
				</div>
				<div class="mb-2">
					<FmTextField
						v-model="selectedItem.name"
						:rules="[rules.required]"
						label="Name"
						outlined
					/>
				</div>
				<RecursiveRow
					v-for="item in defaultItems"
					:key="item.key"
					:item="item"
					@update-list="handleUpdateList"
				/>
			</div>
			<div class="flex flex-col justify-start items-start gap-2">
				<FmButton @click="handleEnableAll" rounded>Enable All
					<template #prepend>
						<div class="prepend-dot enable-dot" />
					</template>
				</FmButton>
				<FmButton @click="handleDisableAll" rounded>Disable All
					<template #prepend>
						<div class="prepend-dot disable-dot" />
					</template>
				</FmButton>
				<FmButton @click="handleDelete" rounded>
					Delete
					<template #prepend>
						<FmIcon icon="mdi-delete" size="22" color="" />
					</template>
				</FmButton>
				<FmButton @click="reset" rounded>
					Reset
					<template #prepend>
						<FmIcon icon="mdi-refresh" size="22" color="" />
					</template>
				</FmButton>
				<FmButton @click="handleSave" rounded :class="{ disable: !isComplete }">
					Save
					<template #prepend>
						<FmIcon icon="mdi-check" size="22" color="" />
					</template>
				</FmButton>
			</div>
		</div>
	</div>
</template>

<script setup>
	import {
		FmBreadcrumbs,
		FmButton,
		FmIcon,
		FmProgressCircular,
		FmSelect,
		FmTextField,
		NavigationRoutes
	} from '@finmars/ui';
	import UserCodeInput from '~/components/common/UserCodeInput/UserCodeInput.vue';
	import RecursiveRow from './RecursiveRow.vue';
	import { getRealmSpaceCodes } from '~/pages/system/helper';
	import { useNavigationRoutes } from '~/composables/useNavigationRoutes';
	import cloneDeep from 'lodash/cloneDeep';

	definePageMeta({
		middleware: 'auth'
	});

	const route = useRoute();
	const router = useRouter();

	const {
		selectedItem,
		itemDataForReset,
		defaultItems,
		roles,
		enableAll,
		disableAll,
		reset,
		updateAccessList,
		updateList,
		getRoles,
		saveItem,
		deleteItem
	} = useNavigationRoutes();

	const { realmCode, spaceCode } = getRealmSpaceCodes(route);

	const formData = ref({
		id: {
			isDirty: false,
			isValid: true
		},
		configuration_code: {
			isDirty: false,
			skipValidation: true,
			isValid: true
		},
		user_code: {
			isDirty: false,
			skipValidation: true,
			isValid: true
		}
	});
	const isLoading = ref(false);

	const rules = {
		required: (value) => (value ? '' : 'Field is required')
	};

	const crumbs = ref([
		{ title: 'Navigation permission', path: 'navigation' },
		{ title: 'Edit', path: 'edit' }
	]);

	const isComplete = computed(() => {
		return !!(
			selectedItem.value.role?.length &&
			selectedItem.value.name?.length &&
			formData.value.user_code.isValid &&
			formData.value.configuration_code.isValid
		);
	});

	const handleCrumbs = (newCrumbs, newPath) => {
		router.push(`/${realmCode}/${spaceCode}/v/system/iam` + newPath);
	};

	const handleUpdateList = (updatedItem) => {
		updateList(defaultItems.value, updatedItem);
	};

	function updateUserCodeValidationValue(val) {
		formData.value.user_code.isValid = val;
		formData.value.configuration_code.isValid = val;
	}

	function validateForm() {
		Object.keys(formData.value).forEach((field) => {
			if (!formData.value[field].skipValidation) {
				formData.value[field].isValid = !!selectedItem.value[field];
			}
		});
	}

	function updateField(field, value) {
		selectedItem.value[field] = value;
		!formData.value[field].isDirty &&
		(formData.value[field].isDirty = true);
		validateForm();
	}

	function handleEnableAll() {
		enableAll(defaultItems.value);
	}

	function handleDisableAll() {
		disableAll(defaultItems.value);
	}

	function handleSave() {
		saveItem(defaultItems.value, selectedItem.value, true);
	}

	function handleDelete() {
		deleteItem(selectedItem.value, true);
	}

	async function init() {
		isLoading.value = true;
		await getRoles();

		const res = await useApi('sidebarNavigationAccess.get', { params: { id: route.params.id } });
		if (res?._$error) {
			useNotify({ type: 'error', title: res._$error.message || res._$error.detail });
			router.back();
		} else {
			defaultItems.value = NavigationRoutes;
			selectedItem.value = {
				id: res.id,
				name: res.name,
				role: res?.role,
				user_code: res?.user_code?.split(':')[1],
				configuration_code: res?.configuration_code,
				allowed_items: res?.allowed_items || []
			};
			itemDataForReset.value = cloneDeep(selectedItem.value);
			await updateAccessList(defaultItems.value, selectedItem.value);
		}
		isLoading.value = false;
	}

	init();
</script>

<style scoped lang="scss">
	.recursive-row-wrap {
		border-right: 2px solid var(--primary-color);
		width: 100%;
		min-height: 300px;
		max-height: 80svh;
		overflow-y: auto;
		padding-right: var(--spacing-16);

		.code-wrapper {
			position: relative;
			width: 100%;
			padding: 16px 12px;
			border-radius: 8px;
			border: 1px solid var(--outline-variant);
			margin-bottom: var(--spacing-16);
		}

		.role-wrapper {
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: var(--spacing-16);
			padding: 0 2px;
			width: 100%;
		}
	}

	.disable {
		pointer-events: none;
		opacity: 0.7;
	}

	.prepend-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
	}

	.enable-dot {
		background: #66bf3c;
	}

	.disable-dot {
		background: orange;
	}

	.enable-icon {
		background: #66bf3c;
	}

	.disable-icon {
		background: orange;
	}
</style>
