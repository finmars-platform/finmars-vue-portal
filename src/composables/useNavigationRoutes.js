import { NavigationRoutes } from '@finmars/ui';
import cloneDeep from 'lodash/cloneDeep';

export function useNavigationRoutes() {
	const store = useStore();
	const router = useRouter();
	const route = useRoute();

	const selectedItem = ref({
		id: '',
		name: '',
		role: '',
		user_code: '',
		configuration_code: '',
		allowed_items: []
	});
	const itemDataForReset = ref(null);
	const defaultItems = ref([]);
	const roles = ref([]);

	function enableAll(defaultItems) {
		const enableItems = (list) => {
			list.forEach(item => {
				item.access = true;
				if (item.children) {
					enableItems(item.children);
				}
			});
		};
		enableItems(defaultItems);
	}

	function disableAll(defaultItems) {
		const disableItems = (list) => {
			list.forEach(item => {
				item.access = false;
				if (item.children) {
					disableItems(item.children);
				}
			});
		};
		disableItems(defaultItems);
	}

	function updateAccessList(defaultItems, selectedItem) {
		const initList = (list) => {
			list.forEach((item) => {
				item.access = selectedItem.allowed_items.includes(item.key);
				if (item.children) {
					initList(item.children);
				}
			});
		};
		initList(defaultItems);
	}

	function updateList(defaultItems, updatedItem) {
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
		updateItem(defaultItems);
	}

	async function getRoles() {
		const res = await useApi('roleList.get');
		if (res?._$error) {
			useNotify({ type: 'error', title: res._$error.message || res._$error.detail });
		} else {
			roles.value = res.results.map((item) => ({
				title: item.name,
				value: item.user_code
			}));
		}
	}

	async function reset() {
		selectedItem.value = cloneDeep(itemDataForReset.value);
		await updateAccessList(defaultItems.value, selectedItem.value);
	}

	function filterMenuItems(navigationRouts, allowedKeys) {
		if (!allowedKeys) return navigationRouts;

		return navigationRouts.reduce((acc, item) => {
			const hasChildren = Array.isArray(item.children) && item.children.length > 0;
			let filteredChildren = [];

			if (hasChildren) {
				filteredChildren = filterMenuItems(item.children, allowedKeys);
			}

			const isParentAllowed = allowedKeys.includes(item.key);
			const isChildAllowed = filteredChildren.length > 0;

			if (isParentAllowed && !isChildAllowed) {
				acc.push({
					...item,
					access: true,
					children: item.children
				});
			} else if (isChildAllowed) {
				acc.push({
					...item,
					access: true,
					children: filteredChildren
				});
			}
			return acc;
		}, []);
	}

	async function saveItem(defaultItems, selectedItem, isEdit = false) {
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
		findItems(defaultItems);
		const payload = {
			role: selectedItem.role,
			name: selectedItem.name,
			user_code: selectedItem.user_code,
			configuration_code: selectedItem.configuration_code,
			allowed_items: listToSave
		};
		let apiMethod = '';
		let requestData = {};

		if (isEdit) {
			apiMethod = 'sidebarNavigationAccessList.put';
			requestData = { params: { id: route.params.id }, body: payload };
		} else {
			apiMethod = 'sidebarNavigationAccessList.post';
			requestData = { body: payload };
		}

		const res = await useApi(apiMethod, requestData);
		if (res?._$error) {
			useNotify({ type: 'error', title: res._$error.message || res._$error.detail });
		} else {
			useNotify({ type: 'success', title: 'Successfully saved !' });
		}
	}

	async function deleteItem(selectedItem, isGoBack) {
		const confirm = await useConfirm({
			title: 'Delete',
			text: `Are you sure you want delete ${selectedItem.user_code}?`
		});
		if (confirm) {
			const res = await useApi('sidebarNavigationAccessList.delete', {
				params: { id: selectedItem.id }
			});
			if (res?._$error) {
				useNotify({ type: 'error', title: res._$error.message || res._$error.detail });
			} else {
				if (isGoBack) {
					router.back();
				} else {
					await init();
				}
			}
		}
	}

	async function init() {
		if (store.member?.is_admin) {
			return NavigationRoutes;
		} else {
			const filtersArray = store.member?.roles_object?.map(({ id, ...rest }) => {
				return {
					user_code: rest.user_code?.split(':')[1],
					role: rest.user_code,
					configuration_code: rest?.configuration_code
				};
			});

			const results = await Promise.all(filtersArray.map(async (filters) => {
				const res = await useApi('sidebarNavigationAccessList.get', { filters });
				if (res?._$error) {
					useNotify({ type: 'error', title: res._$error.message || res._$error.detail });
					return null;
				}
				return res.results[0];
			}));

			const allowedItems = results
				.filter(data => data && data.allowed_items)
				.flatMap(data => data.allowed_items);

			const uniqueAllowedItems = [...new Set(allowedItems)];

			if (allowedItems.length > 0) {
				return filterMenuItems(NavigationRoutes, uniqueAllowedItems);
			} else {
				return [];
			}
		}
	}

	return {
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
		deleteItem,
		init
	};
}
