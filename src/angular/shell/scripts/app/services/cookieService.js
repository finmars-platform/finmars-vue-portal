'use strict';

export default function () {

	/* //# region IMPORTANT: Only for development purpose. E.g. development of components inside iframe locally.

	let cookieStorage = {};

	const getStoredCookie = function () {

	   const cookieString = Object.keys(cookieStorage).reduce(function (prev, propName) {
		   return prev + propName + '=' + cookieStorage[propName] + ';';
	   }, '');

	   return cookieString;

	}

	const storeCookie = function (value) {

	   const attributeToStore = value.split(';')[0].trim();
	   const keyAndVal = attributeToStore.split('=');

	   const prop = keyAndVal[0];

	   cookieStorage[prop] = keyAndVal[1];

	}

	//# endregion IMPORTANT: Only for development purpose. E.g. development of components inside iframe locally. */

	const getStoredCookie = function () {
		return document.cookie;
	}

	const storeCookie = function (value) {
		document.cookie = value;
	}

	const getCookie = function (name) {
		let cookieValue = null;
		let cookie = getStoredCookie();
		if (cookie && cookie != '') {
			const cookies = cookie.split(';');
			for (let i = 0; i < cookies.length; i++) {
				const cookie = jQuery.trim(cookies[i]);
				// Does this cookie string begin with the name we want?
				if (cookie.substring(0, name.length + 1) === (name + '=')) {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	};

	const setCookie = function (name, value, options) {
		options = options || {};

		if (!options.path) {
			options.path = '/'
		}

		let expires = options.expires;

		if (typeof expires == "number" && expires) {
			let d = new Date();
			d.setTime(d.getTime() + expires * 1000);
			expires = options.expires = d;
		}

		if (expires && expires.toUTCString) {
			options.expires = expires.toUTCString();
		}

		value = encodeURIComponent(value);

		let updatedCookie = name + "=" + value;

		for (const propName in options) {
			updatedCookie += "; " + propName;
			const propValue = options[propName];
			if (propValue !== true) {
				updatedCookie += "=" + propValue;
			}
		}

		// document.cookie = updatedCookie;
		storeCookie(updatedCookie);
	};

	const deleteCookie = function (name) {
		setCookie(name, "", {expires: -1})
	};

	return {
		getCookie: getCookie,
		setCookie: setCookie,
		deleteCookie: deleteCookie
	}

};