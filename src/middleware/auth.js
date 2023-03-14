export default defineNuxtRouteMiddleware( async (to, from) => {
	let keycloak = await uKeycloak()

	if ( !keycloak.authenticated ) keycloak.login()
})
