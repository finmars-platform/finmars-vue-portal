import { NavigationRoutes } from '@finmars/ui';

export function useNavigationRoutes() {

	const store = useStore();
	const ROLES_MAP = {
		'local.poms.space0i3a2:viewer': ['dashboard', 'reports', 'add-ons'],
		'local.poms.space0i3a2:base-data-manager': ['data', 'valuations', 'transactions-from-file', 'data-from-file', 'reconciliation', 'workflows'],
		'local.poms.space0i3a2:configuration-manager': ['Default-settings', 'Account-Types', 'Instrument-Types', 'Transaction-Types', 'Account-Types', 'Transaction-Type-Groups'],
		'local.poms.space0i3a2:full-data-manager': ['dashboard', 'Member', 'Permissions',],
		'local.poms.space0i3a2:member': ['dashboard', 'reports', 'Member', 'navigation', 'group']
	};

	function filterMenuItems(navigationRouts, allowedKeys) {
		if (!allowedKeys) return;

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
					children: item.children
				});
			} else if (isChildAllowed) {
				acc.push({
					...item,
					children: filteredChildren
				});
			}
			return acc;
		}, []);
	}

	async function init() {
		if(store.member?.is_admin) {
			return NavigationRoutes;
		} else {
			const filters = {
				role: store.member?.roles_object?.[0]?.user_code,
				user_code: store.member?.roles_object?.[0]?.user_code.split(':')[1],
				configuration_code: store.member?.roles_object?.[0]?.configuration_code
			}

			const resData = await useApi('sidebarNavigationAccessList.get', {filters});
			if (resData?._$error) {
				useNotify({ type: 'error', title: res._$error.message || res._$error.detail });
				return [];
			} else {
				const data = resData?.[0];
				if(data?.allowed_items) {
					return filterMenuItems(NavigationRoutes, data.allowed_items);
				}
			}
		}
	}

	return {
		ROLES_MAP,
		filterMenuItems,
		init
	};
}
