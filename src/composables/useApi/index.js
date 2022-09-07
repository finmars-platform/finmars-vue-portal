import routes from "./routes";

let expireTokens

export default async function (
		route_opt,
		{
			params,  // Router params
			body,    // Body for POST PUT PATCH
			filters, // Query object
			headers = {}
		} = {}
	) {

	// if ( !expireTokens && route_opt != 'tokenInfo.get' ) {
	// 	let res = await useApi('tokenInfo.get')

	// 	if ( res.code != 401 ) {
	// 		expireTokens = {
	// 			expireAccess: res.results[0].access_token_expires_at,
	// 			expireToken: res.results[0].refresh_token_expires_at,
	// 		}
	// 		console.log('expireTokens:', expireTokens)
	// 	}
	// }
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

	let opts = {
		baseURL: config.public.apiURL,
		method: method.toUpperCase() || "GET",
		headers: {
			Authorization: "Token " + token,
			...headers
		}
	};

	if (body) opts.body = body;
	if (filters) {
		let searchPaarams = []

		for ( let prop in filters ) {
			searchPaarams.push(`${prop}=${filters[prop]}`)
		}

		url += '?' + searchPaarams.join('&')
	}
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
			400: 'Wrong data',
			401: 'Not authorized',
		}

		useNotify({
			type: 'error',
			title: 'Error',
			text: errors[code] ? errors[code] : 'Unknown server error'
		})

		return {error: e.data || true, code }
	}

}
