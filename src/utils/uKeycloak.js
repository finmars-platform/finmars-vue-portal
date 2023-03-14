import Keycloak from 'Keycloak-js'

const setTokens = () => {
	console.log('onAuthSuccess:')
	useCookie('access_token').value = keycloak.token
	useCookie('refresh_token').value = keycloak.refreshToken
	useCookie('id_token').value = keycloak.idToken
}
const refreshTokens = async () => {
	console.log('onTokenExpired:')
	const isRefreshed = await keycloak.updateToken()

	if ( !isRefreshed ) {
		await keycloak.login()
	}
}

const keycloak = new Keycloak({
	url: 'https://dev-auth.finmars.com',
	realm: 'finmars',
	clientId: 'finmars'
})

keycloak.onAuthSuccess = setTokens
keycloak.onAuthRefreshSuccess = setTokens
keycloak.onTokenExpired = refreshTokens

await keycloak.init({
	onLoad: 'login-required',
	token: useCookie('access_token').value,
	refreshToken: useCookie('refresh_token').value,
	idToken: useCookie('id_token').value
})

if ( keycloak.isTokenExpired() ) refreshTokens()

export default keycloak
