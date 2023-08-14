'use strict'

window.base_api_url = ''

const store = useStore();

const resolve = () => {
	if ('__PROJECT_ENV__') {
		// const host = '__API_HOST__';
		// IMPORTANT
		const host = 'https://dev.finmars.com'

		return host
	}

	return ''
}

const getAuthorizerUrl = () => {
	// return '__AUTHORIZER_URL__'
	return window.AUTHORIZER_URL
}

const setMasterUserPrefix = function (_prefix) {
	window.base_api_url = _prefix
}

const getMasterUserPrefix = () => {
	// return window.base_api_url;
	return store.current.base_api_url;
}

const getApiVersion = () => {
	return 'api/v1'
}

export default {
	resolve: resolve,
	getAuthorizerUrl: getAuthorizerUrl,
	setMasterUserPrefix: setMasterUserPrefix,
	getMasterUserPrefix: getMasterUserPrefix,

	getApiVersion: getApiVersion,
}
