import { NavigationRoutes } from '@finmars/ui';

export function useNavigationRoutes() {

	const store = useStore();
	const ROLES_MAP = {
		'local.poms.space0i3a2:viewer': ['dashboard', 'reports', 'add-ons'],
		'local.poms.space0i3a2:base-data-manager': ['data', 'valuations', 'transactions-from-file', 'data-from-file', 'reconciliation', 'workflows'],
		'local.poms.space0i3a2:configuration-manager': ['Default-settings', 'Account-Types', 'Instrument-Types', 'Transaction-Types', 'Account-Types', 'Transaction-Type-Groups'],
		'local.poms.space0i3a2:full-data-manager': ['dashboard', 'Member', 'Permissions',],
		'local.poms.space0i3a2:member': ['dashboard', 'balance', 'Member']
	};

	const items = ref([])

	function filterMenuItems(navigationRouts, allowedKeys) {
		if (!allowedKeys) return;
		return navigationRouts.reduce((acc, item) => {
			const hasChildren =
				Array.isArray(item.children) && item.children.length > 0;
			let filteredChildren = [];

			if (hasChildren) {
				filteredChildren = filterMenuItems(item.children, allowedKeys);
			}
			const isItemAllowed =
				allowedKeys.includes(item.key) || filteredChildren.length > 0;
			if (isItemAllowed) {
				const newItem = {
					...item,
					children: filteredChildren.length ? filteredChildren : undefined
				};
				acc.push(newItem);
			}
			return acc;
		}, []);
	}

	async function init() {
		console.log('layout-------',store.memberLayout)
		console.log('member-------',store.member)
		const filters = {
			role: store.member?.roles_object[0]?.user_code,
			user_code: store.member?.roles_object[0]?.user_code.split(':')[1],
			configuration_code: store.member?.roles_object[0]?.configuration_code
		}
		const resData = await useApi('sidebarNavigationAccessList.get', {filters});
		console.log('resData-------------',resData);
		if (resData?._$error) {
			useNotify({ type: 'error', title: res._$error.message || res._$error.detail });
		} else {
			const data = resData?.[0];
			if(data) {
				if (data.allowed_items.length) {
					items.value = filterMenuItems(NavigationRoutes, data.allowed_items);
				} else {
					items.value = filterMenuItems(NavigationRoutes, ROLES_MAP[store.member?.roles_object?.[0].user_code])
				}
			} else {
				items.value = [];
			}
		}
	}

	return {
		ROLES_MAP,
		filterMenuItems,
		init,
		items
	};
}
