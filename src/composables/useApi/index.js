import routes from "./routes";

export default async function (
		route_opt,
		{
			params,  // Router params
			body,    // Body for POST PUT PATCH
			filters, // Query string
			headers = {}
		} = {}
	) {

	const config = useRuntimeConfig();
	const [route, method] = route_opt.split(".");
	let url = routes[route][method];

	if (!url) {
		console.log("Route not found:", route_opt);
		return false;
	}

	let baseApi = useStore().current.base_api_url
	url = url.replace('{client}', baseApi);

	let token = useCookie('authtoken').value

	if ( !token ) window.location.href = `${config.public.apiURL}/login`

	let opts = {
		baseURL: config.public.apiURL,
		method: method.toUpperCase() || "GET",
		headers: {
			Authorization: "Token " + token,
			...headers
		},
	};

	if (body) opts.body = body;
	if (params) {
		for (let param in params) {
			url = url.replace(`{${param}}`, params[param]);
		}
	}

	try {
		return await $fetch(url, opts);

	} catch(e) {
		console.log('e:', e)
		return e
	}

}
