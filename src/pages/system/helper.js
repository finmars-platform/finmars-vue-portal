export function getRealmSpaceCodes(route) {
	const pathnamePartsList = route.fullPath.split('/');
	const realmCode = pathnamePartsList.find((part) => part.startsWith('realm'));
	const spaceCode = pathnamePartsList.find((part) => part.startsWith('space'));
	return { realmCode, spaceCode };
}

export async function loadMultiselectOpts(
	routeOpt,
	readyStatusObj,
	readyStatusProp
) {
	const res = await useApi(routeOpt);
	if (!res._$error) {
		readyStatusObj[readyStatusProp] = true;
		return res.results;
	}
	return [];
}
