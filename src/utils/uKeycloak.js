import KeycloakJs from 'keycloak-js'

const setTokens = () => {
	useCookie('access_token').value = keycloak.token
	useCookie('refresh_token').value = keycloak.refreshToken
	useCookie('id_token').value = keycloak.idToken
}
const refreshTokens = async () => {
	const isRefreshed = await keycloak.updateToken()

	if (!isRefreshed) {
		await keycloak.login()
	}
}

const keycloak = new KeycloakJs({
	url: useRuntimeConfig().public.KEYCLOAK_URL,
	realm: useRuntimeConfig().public.KEYCLOAK_REALM,
	clientId: useRuntimeConfig().public.KEYCLOAK_CLIENT_ID,
})
let isInit = false

keycloak.onAuthSuccess = setTokens
keycloak.onAuthRefreshSuccess = setTokens
keycloak.onTokenExpired = refreshTokens

keycloak.onReady = async () => {
	isInit = true
	if (keycloak.isTokenExpired()) await refreshTokens()

	if (useRoute().hash.includes('#state=')) useRouter().push({ hash: '' })
}

export default async () => {
	if (!isInit) {
		await keycloak.init({
			onLoad: 'login-required',
			token: useCookie('access_token').value,
			refreshToken: useCookie('refresh_token').value,
			idToken: useCookie('id_token').value,
			timeSkew: 0,
		})
	}

	return keycloak
}
