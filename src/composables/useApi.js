import routes from '../api/routes';
import providers from '../api/providers/main.js';

// let expireTokens;
export default async function useApi(
	route_opt,
	{
		params, // Router params
		body, // Body for POST PUT PATCH
		filters, // Query object
		headers = {},
		signal, // AbortController.signal
		provider = true, // callback for format data result
		notifyError = true
	} = {},
	{ apiUrl, apiMethod } = {}
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
	const store = useStore();

	let url;
	let method;
	let route;

	if (apiUrl && apiMethod) {
		url = apiUrl;
		method = apiMethod;
	} else {
		const splittedRouteOpt = route_opt.split('.');
		route = splittedRouteOpt[0];
		method = splittedRouteOpt[1];

		if (!routes[route]) {
			throw new Error(`Route: ${route} is not registered`);
		}

		url = routes[route][method];
		if (!url) {
			console.log('Route not found:', route_opt);
			return false;
		}
	}

	// let baseApi = useStore().current.base_api_url
	let client = store.realm_code + '/' + store.space_code;
	if (client) url = url.replace('{client}', client);

	let token = useCookie('access_token').value;

	let opts = {
		method: method.toUpperCase() || 'GET',
		headers: {
			Authorization: 'Token ' + token,
			...headers
		}
	};

	if (body) opts.body = body;

	if (filters) {
		let searchPaarams = [];

		for (let prop in filters) {
			searchPaarams.push(`${prop}=${filters[prop]}`);
		}

		url += '?' + searchPaarams.join('&');
	}

	if (params) {
		for (let param in params) {
			url = url.replace(`{${param}}`, params[param]);
		}
	}

	if (signal) {
		opts.signal = signal;
	}

	try {
		let response = await $fetch(url, opts);

		return method === 'get' && providers[route] && provider
			? providers[route](response)
			: response;
	} catch (e) {
		if (opts.signal?.aborted) {
			return { _$abort: opts.signal.reason };
		}

		console.error('$fetch error:', e);

		let [code, url] = e.message.split('  ');

		let errors = {
			400: 'Wrong data',
			401: 'Not authorized'
		};

		let error_object = e.data?.error;

		if (e.response && e.response.status == 403) {
			localStorage.setItem(
				'errorMessage',
				error_object.details.errors[0].detail || 'Access Denied'
			);
			localStorage.setItem('previousUrl', window.location.href);

			var root = window.location.href.split('/v/')[0];
			// Redirect to the 403 error page
			window.location.href = root + '/a/#!/403'; // Adjust based on your routing setup

			return;
		}

		let text = error_object;
		let title = code == 500 ? 'Server Error' : 'Client Error';

		if (notifyError) {
			useNotify({ group: 'server_error', title, text, duration: 20000 });
		}

		return { _$error: e.data || true, code };
	}
}

export function useLoadAllPages(
	route_opt,
	{
		params, // Router params
		body, // Body for POST PUT PATCH
		filters = {}, // Query object
		headers = {},
		signal // AbortController.signal
	} = {},
	dataList = []
) {
	if (!filters.hasOwnProperty('page')) filters.page = 1;

	const options = {
		params,
		body,
		filters,
		headers,
		signal
	};

	const loadPage = async () => {
		try {
			let res = await useApi(route_opt, options);

			if (!res.hasOwnProperty('next')) {
				throw new Error(
					`Api for the route: ${route_opt} does not support pagination`
				);
			}

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
