export default defineNuxtRouteMiddleware( async (to, from) => {
  const store = useStore()

	if ( !store.isAuth ) {
		let ping = await useApi("ping.get")

		if ( (ping.error && ping.code == '401') || !ping.is_authenticated ) {
			let refresh_token = useCookie('refresh_token')

			if ( !refresh_token.value ) {
				window.location.href = '/login'
			}

			let token_res = await useApi('tokenRefresh.post',
				{body: { refresh_token }
			})

			if ( !token_res.error ) {
				let access_token = useCookie('access_token')
				access_token.value = token_res.access_token

			} else return window.location.href = '/login'

		} else {

			store.isAuth = true
		}

		//if ( !ping.base_api_url && !useRoute().path.includes('/profile') ) {
		//	return navigateTo('/profile')
		//}
	}
})
