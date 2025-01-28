import { NavigationRoutes } from '@finmars/ui';

export function useNavigationRoutes() {

	const store = useStore();
	const ROLES_MAP = {
		'local.poms.space0i3a2:viewer': ['reports'],
		'local.poms.space0i3a2:base-data-manager': ['data'],
		'local.poms.space0i3a2:configuration-manager': ['Default-settings', 'Account-Types', 'Instrument-Types', 'Transaction-Types', 'Account-Types', 'Transaction-Type-Groups'],
		'local.poms.space0i3a2:full-data-manager': ['dashboard', 'Member', 'Permissions'],
		'local.poms.space0i3a2:member': ['dashboard']
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
				const resData = await useApi('sidebarNavigationAccessList.get', { filters });
				if (resData?._$error) {
					useNotify({ type: 'error', title: resData._$error.message || resData._$error.detail });
					return null;
				}
				return resData[0];
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
		ROLES_MAP,
		filterMenuItems,
		init
	};
}
