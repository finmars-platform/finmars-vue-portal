import routes from "../api/routes";
import providers from "../api/providers/main.js";

let expireTokens
export default async function useApi (
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
	if ( baseApi )
		url = url.replace('{client}', baseApi);

	let baseUrl = url.startsWith('/authorizer/') ? config.authorizerURL : config.apiURL;

	let token = useCookie('access_token').value

	let opts = {
		baseURL: baseUrl,
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
		let response = await $fetch(url, opts)
		console.log('route:', route)

		return method == 'get' && providers[route] ? providers[route](response) : response

	} catch(e) {
		let [code, url] = e.message.split('  ')

		let errors = {
			400: 'Wrong data',
			401: 'Not authorized',
		}

		return {error: e.data || true, code }
	}

}

export function useLoadAllPages (
	route_opt,
	{
		params,  // Router params
		body,    // Body for POST PUT PATCH
		filters = {}, // Query object
		headers = {},
	} = {},
	dataList = [],
) {

	if (!filters.hasOwnProperty('page')) filters.page = 1;

	const options = {
		params,
		body,
		filters,
		headers
	};

	const loadPage = async () => {

		try {

			let res = await useApi(route_opt, options);

			dataList = dataList.concat(res.results);

			if (res.next) {
				options.filters.page += 1; // number of page to request
				return loadPage();

			} else {
				return dataList;
			}

		} catch (e) {
			throw e;
		}

	};

	return loadPage();

}
