import KeycloakJs from 'keycloak-js'

const setTokens = () => {
	useCookie('access_token').value = keycloak.token
	useCookie('refresh_token').value = keycloak.refreshToken
	useCookie('id_token').value = keycloak.idToken
}
const refreshTokens = async () => {
	const isRefreshed = await keycloak.updateToken()

	if ( !isRefreshed ) {
		await keycloak.login()
	}
}

const keycloak = new KeycloakJs({
	url: 'https://dev-auth.finmars.com',
	realm: 'finmars',
	clientId: 'finmars'
})
let isInit = false

keycloak.onAuthSuccess = setTokens
keycloak.onAuthRefreshSuccess = setTokens
keycloak.onTokenExpired = refreshTokens

keycloak.onReady = () => {
	isInit = true
	if ( keycloak.isTokenExpired() ) refreshTokens()
}

export default async () => {
	if ( !isInit ) {
		await keycloak.init({
			onLoad: 'login-required',
			token: useCookie('access_token').value,
			refreshToken: useCookie('refresh_token').value,
			idToken: useCookie('id_token').value
		})
	}

	return keycloak
}
