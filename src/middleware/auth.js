export default defineNuxtRouteMiddleware( async (to, from) => {
	if ( !uKeycloak.authenticated ) uKeycloak.login()
})
