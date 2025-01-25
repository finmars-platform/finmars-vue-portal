export function useNavigationRoutes() {

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

	// async function navigationInit() {
	// 	const resData = await useApi('sidebarNavigationAccessList.get');
	// 	const res = resData?.[0];
	// 	if (resData?._$error) {
	// 		useNotify({ type: 'error', title: res._$error.message || res._$error.detail });
	// 	} else if (res?.allowed_items) {
	// 		lastSavedItems.value = res.allowed_items;
	// 		temporaryItems.value = getSidebarFilteredResult(defaultItems.value, lastSavedItems.value);
	// 	} else {
	// 		if (store?.current?.is_admin) {
	// 			temporaryItems.value = NavigationRoutes;
	// 		}
	// 	}
	// }

	return {
		filterMenuItems
	};
}
