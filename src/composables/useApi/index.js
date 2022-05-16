import routes from "./routes";

export default function (route_opt, { params, body } = {}) {
	const config = useRuntimeConfig();
	const [route, method] = route_opt.split(".");
	let url = routes[route][method];

	if (!url) {
		console.log("Route not found:", route_opt);
		return false;
	}

	let opts = {
		baseURL: config.public.apiURL,
		method: method.toLowerCase() || "GET",
		headers: {
			Authorization: "Token " + "b0077c3678b9021bcf28d4ef2b0e92ebfd8f1143",
		},
	};

	if (body) opts.body = body;
	if (params) {
		for (let param in params) {
			url = url.replace(`{${param}}`, params[param]);
		}
	}

	return $fetch(url, opts);
}
