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

	let token = useCookie('access_token').value
	let refresh_token = useCookie('refresh_token').value

	if ( !refresh_token ) window.location.href = `${config.public.apiURL}/login`

	let opts = {
		baseURL: config.public.apiURL,
		method: method.toUpperCase() || "GET",
		headers: {
			Authorization: "Token " + token,
			...headers
		}
	};

	if (body) opts.body = body;
	if (params) {
		for (let param in params) {
			url = url.replace(`{${param}}`, params[param]);
		}
	}

	try {
		return await $fetch(url, opts)

	} catch(e) {
		let [code, url] = e.message.split('  ')

		let errors = {
			401: 'Not authorized'
		}

		if ( code == 401 && route_opt != 'tokenRefresh.post' ) {
			let res = await useApi('tokenRefresh.post', {body: {refresh_token}})

			if ( !res.error ) {
				useCookie('access_token').value = res.access_token
			} else {
				const config = useRuntimeConfig()

				window.location.href = `${config.public.apiURL}/login`
			}

			return e.date
		}

		useNotify({
			type: 'error',
			title: 'Error',
			text: errors[code] ? errors[code] : 'Hz error'
		})

		return {error: e.date || true}
	}

}
