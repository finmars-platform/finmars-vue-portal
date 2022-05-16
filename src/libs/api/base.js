export default class Base {
	apiUrl = "";
	token = "";
	baseHeaders = {
		Accept: "application/json",
		"Content-Type": "application/json",
	};

	constructor(opts) {
		this.apiUrl = opts.apiUrl;

		this.$setHeaders(opts.headers);
		this.$setToken(opts.token);
	}

	$setHeaders(headers) {
		this.baseHeaders = Object.assign(this.baseHeaders, headers);
	}

	$setToken(token) {
		this.token = token;
		this.baseHeaders.Authorization = "Bearer " + this.token;
	}

	get(path) {
		return this._baseFetch(path);
	}

	POST(path, body) {
		return this._baseFetch(path, "POST", body);
	}

	async _baseFetch(path, httpMethod = "GET", body) {
		let url = this.apiUrl + path;
		let opts = {
			method: httpMethod || "GET",
			headers: this.baseHeaders,
		};

		if (body) opts.body = JSON.stringify(body);

		let response = await fetch(url, opts);

		if (response.status == 404) {
			throw new Error({ error: 404 });
		}

		return await response.json();
	}

	callApiPost = async function (method, body = {}, httpMethod) {
		const token = "Bearer " + getToken();

		if (httpMethod) method += "?_method=" + httpMethod;

		try {
			let response = await fetch(apiUrl + method, {
				method: "POST",
				headers: {
					Authorization: token,
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			});

			return await response.json();
		} catch (e) {
			console.log("e:", e);
		}
	};

	callApiPostWithFile = async function (method, params = {}, httpMethod) {
		const token = "Bearer " + getToken();
		let formData = new FormData();

		for (let prop in params) {
			formData.append(prop, params[prop]);
		}

		if (httpMethod) method += "?_method=" + httpMethod;

		try {
			let response = await fetch(apiUrl + method, {
				method: "POST",
				headers: {
					Authorization: token,
				},
				body: formData,
			});

			return await response.json();
		} catch (e) {
			console.log("e:", e);
		}
	};
}
