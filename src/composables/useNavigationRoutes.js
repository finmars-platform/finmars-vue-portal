import { NavigationRoutes } from '@finmars/ui';

export function useNavigationRoutes() {
	const store = useStore();
	const selectedItem = ref({
		id: '',
		role: '',
		user_code: '',
		configuration_code: ''
	});
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

	const defaultItems = ref(NavigationRoutes);
	const roles = ref([]);
	const temporaryItems = ref([]);
	const lastSavedItems = ref([]);
	const saveRequestType = ref('post');
	const loading = ref(false);
	// const showAccessList = ref(false);

	const isComplete = computed(() => {
		console.log(selectedItem.value);
		return !!(
			selectedItem.value.role?.length &&
			selectedItem.value.user_code?.length &&
			selectedItem.value.configuration_code?.length && formData.value.user_code.isValid &&
			formData.value.configuration_code.isValid
		);
	});

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

	function updateAccessList() {
		const initList = (list, parentAccess) => {
			list.forEach((item) => {
				item.access = parentAccess ? parentAccess : lastSavedItems.value.includes(item.key);
				if (item.children) {
					initList(item.children, item.access);
				}
			});
		};
		initList(defaultItems.value, false);
	}

	function getSidebarFilteredResult(items, allowedKeys) {
		const result = [];
		const filterItems = (list) => {
			list.forEach(item => {
				if (allowedKeys.includes(item.key)) {
					result.push(item);
				}
				if (item.children) {
					filterItems(item.children);
				}
			});
		};
		filterItems(items);
		return result;
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
			id: selectedItem.value.id,
			role: selectedItem.value.role,
			user_code: selectedItem.value.user_code,
			configuration_code: selectedItem.value.configuration_code,
			allowed_items: listToSave
		};

		const apiOptions = saveRequestType.value === 'put'
			? { params: { id: payload.id }, body: payload }
			: { body: payload };

		const res = await useApi(`sidebarNavigationAccessList.${saveRequestType.value}`, apiOptions);
		if (res?._$error) {
			useNotify({ type: 'error', title: res._$error.message || res._$error.detail });
		} else {
			await navigationInit();
		}
	}

	async function getRoles() {
		const res = await useApi('roleList.get');
		if (res?._$error) {
			useNotify({ type: 'error', title: res._$error.message || res._$error.detail });
		} else {
			roles.value = res.results.map((item) => {
				return {
					title: item.user_code,
					value: item.user_code
				};
			});
		}
	}

	// async function getAccesses() {
	// 	await navigationInit();
	// }

	async function navigationInit() {
		loading.value = true;
		const res = await useApi('sidebarNavigationAccessList.get');
		if (res?._$error) {
			useNotify({ type: 'error', title: res._$error.message || res._$error.detail });
		} else if (res?.allowed_items) {
			saveRequestType.value = 'put';
			lastSavedItems.value = res.allowed_items;
			temporaryItems.value = getSidebarFilteredResult(defaultItems.value, lastSavedItems.value);
		} else {
			saveRequestType.value = 'post';
			if (store?.current?.is_admin) {
				temporaryItems.value = NavigationRoutes;
			}
		}

		updateAccessList();
		loading.value = false;
	}

	// getRoles();

	return {
		loading,
		defaultItems,
		temporaryItems,
		enableAll,
		disableAll,
		reset,
		updateList,
		selectedItem,
		updateUserCodeValidationValue,
		updateField,
		save,
		navigationInit,
		roles,
		isComplete,
		// getAccesses,
		// showAccessList
	};
}
