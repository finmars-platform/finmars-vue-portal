
// import formbricks from "@/services/formbricks";

export default defineNuxtRouteMiddleware( async (to, from) => {
	let keycloak = await uKeycloak()

	// if (typeof formbricks !== "undefined") {
	// 	await formbricks.registerRouteChange();
	// }

	if ( !keycloak.authenticated ) keycloak.login()
})
