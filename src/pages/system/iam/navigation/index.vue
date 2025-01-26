<template>
	<div class="py-3 px-8">
		<span class="text-xl">Sidebar Navigation Access</span>
		<div
			v-if="loading"
			class="flex w-full justify-center items-center min-h-36"
		>
			<FmProgressCircular :size="50" indeterminate />
		</div>
		<div v-else class="flex justify-between nowrap mt-4 gap-8">
			<div class="recursive-row-wrap mr-1">
				<div class="code-wrapper">
					<UserCodeInput
						:user-code="selectedItem.user_code"
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
						@update:modelValue="roleUpdate"
					/>
				</div>
				<template v-if="!loadingTree">
					<template v-if="!showCreateBtn">
						<RecursiveRow
							v-for="item in defaultItems"
							:key="item.key"
							:item="item"
							@update-list="updateList"
						/>
					</template>
					<template v-else>
						<FmButton @click="create" rounded>Create</FmButton>
					</template>
				</template>
				<div v-else	class="flex w-full justify-center items-center min-h-36">
					<FmProgressCircular :size="30" indeterminate />
				</div>
			</div>
			<div class="flex flex-col justify-start items-start gap-2" >
				<FmButton @click="enableAll" rounded>Enable All
					<template #prepend>
						<div class="prepend-dot enable-dot" />
					</template>
				</FmButton>
				<FmButton @click="disableAll" rounded>Disable All
					<template #prepend>
						<div class="prepend-dot disable-dot" />
					</template>
				</FmButton>
				<FmButton @click="reset" rounded>
					Reset
					<template #prepend>
						<FmIcon icon="mdi-refresh" size="22" color="" />
					</template>
				</FmButton>
				<FmButton @click="save" rounded :class="{ disable: !isComplete || showCreateBtn }">
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
	import { FmButton, FmIcon, FmProgressCircular, FmSelect, NavigationRoutes } from '@finmars/ui';
	import UserCodeInput from '~/components/common/UserCodeInput/UserCodeInput.vue';
	import RecursiveRow from './RecursiveRow';
	import { useNavigationRoutes } from '~/composables/useNavigationRoutes';

	definePageMeta({
		middleware: 'auth'
	});

	const { ROLES_MAP, filterMenuItems } = useNavigationRoutes();

	const formData = ref({
		id: {
			isDirty: false,
			isValid: true
		},
		role: {
			isDirty: false,
			skipValidation: true,
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
	const selectedItem = ref({
		id: '',
		role: '',
		user_code: '',
		configuration_code: ''
	});

	const defaultItems = ref([]);
	const updatedDataId = ref(0);
	const lastSavedItems = ref([]);

	const roles = ref([]);
	const loadingTree = ref(false);
	const loading = ref(false);
	const showCreateBtn = ref(false);

	const isComplete = computed(() => {
		return !!(
			selectedItem.value.role?.length &&
			selectedItem.value.user_code?.length &&
			selectedItem.value.configuration_code?.length &&
			formData.value.user_code.isValid &&
			formData.value.configuration_code.isValid
		);
	});

	function updateAccessList() {
		const initList = (list) => {
			list.forEach((item) => {
				item.access = lastSavedItems.value.includes(item.key);
				if (item.children) {
					initList(item.children);
				}
			});
		};
		initList(defaultItems.value);
	}

	function enableAll() {
		const enableItems = (list) => {
			list.forEach(item => {
				item.access = true;
				if (item.children) {
					enableItems(item.children);
				}
			});
		};
		enableItems(defaultItems.value);
	}

	function disableAll() {
		const disableItems = (list) => {
			list.forEach(item => {
				item.access = false;
				if (item.children) {
					disableItems(item.children);
				}
			});
		};
		disableItems(defaultItems.value);
	}

	function reset() {
		updateAccessList();
	}

	function updateList(updatedItem) {
		const updateItem = (list) => {
			const index = list.findIndex(item => item.key === updatedItem.key);
			if (index !== -1) {
				list[index] = updatedItem;
			} else {
				list.forEach(item => {
					if (item.children) {
						updateItem(item.children);
					}
				});
			}
		};
		updateItem(defaultItems.value);
	}

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

	async function save() {
		let listToSave = [];
		const findItems = (list) => {
			list.forEach(item => {
				if (item.access) {
					listToSave.push(item.key);
				}
				if (item.children) {
					findItems(item.children);
				}
			});
		};
		findItems(defaultItems.value);
		const payload = {
			id: updatedDataId.value,
			role: selectedItem.value.role,
			user_code: selectedItem.value.user_code,
			configuration_code: selectedItem.value.configuration_code,
			allowed_items: listToSave
		};
		const res = await useApi('sidebarNavigationAccessList.put', { params: { id: payload.id }, body: payload });
		if (res?._$error) {
			useNotify({ type: 'error', title: res._$error.message || res._$error.detail });
		} else {
			useNotify({ type: 'success', title: 'Successfully saved !' });
			await fetchAllowedItems();
		}
	}

	async function getRoles() {
		const res = await useApi('roleList.get');
		if (res?._$error) {
			useNotify({ type: 'error', title: res._$error.message || res._$error.detail });
		} else {
			roles.value = res.results.map((item) => {
				return {
					title: item.name,
					value: item.user_code
				};
			});
		}
	}

	async function create() {
		defaultItems.value = filterMenuItems(NavigationRoutes, ROLES_MAP[selectedItem.value.role]);
		let listToSave = [];
		const findItems = (list) => {
			list.forEach(item => {
				if (item.access) {
					listToSave.push(item.key);
				}
				if (item.children) {
					findItems(item.children);
				}
			});
		};
		findItems(defaultItems.value);
		const payload = {
			role: selectedItem.value.role,
			user_code: selectedItem.value.user_code,
			configuration_code: selectedItem.value.configuration_code,
			allowed_items: listToSave
		};
		const res = await useApi('sidebarNavigationAccessList.post', {
			body: payload
		});
		if (res?._$error) {
			useNotify({ type: 'error', title: res._$error.message || res._$error.detail });
		} else {
			updatedDataId.value = res?.id;
			showCreateBtn.value = false;
			useNotify({ type: 'success', title: 'Successfully created !' });
			await fetchAllowedItems();
		}
	}

	async function fetchAllowedItems() {
		loadingTree.value = true;
		const filters = {
			role: selectedItem.value.role,
			user_code: selectedItem.value.user_code,
			configuration_code: selectedItem.value.configuration_code
		}
		defaultItems.value = filterMenuItems(NavigationRoutes, ROLES_MAP[selectedItem.value.role]);
		const resData = await useApi('sidebarNavigationAccessList.get', {filters});
		if (resData?._$error) {
			useNotify({ type: 'error', title: res._$error.message || res._$error.detail });
		} else {
			const data = resData?.[0];
			if (data?.allowed_items) {
				showCreateBtn.value = false;
				updatedDataId.value = data.id || 0;
				lastSavedItems.value = data.allowed_items;
				updateAccessList();
			} else {
				showCreateBtn.value = true;
			}
		}
		loadingTree.value = false;
	}

	async function roleUpdate(val) {
		if(!isComplete) return;
		selectedItem.value.role = val;
		await fetchAllowedItems();
	}

	watch(
		isComplete,
		async (nVal) => {
			if(nVal) {
				await fetchAllowedItems();
			}
		},
		{ deep: true }
	)

	onMounted(async () => {
		await getRoles();
	})

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
