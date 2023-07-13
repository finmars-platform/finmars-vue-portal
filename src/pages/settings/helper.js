export async function loadMultiselectOpts(routeOpt, readyStatusObj, readyStatusProp) {
	const res = await useApi(routeOpt);

	if ( !res.error ) {
		readyStatusObj[readyStatusProp] = true;
		return res.results;
	}

	return [];
}
