<template>
	<div v-if="notLoadingMember" class="wrap">
		<LazyTheSidebar v-if="!$route.meta.isHideSidebar" />

		<div class="main">
			<TheHeader />

			<div class="content">
				<slot />
			</div>
		</div>
	</div>
</template>

<script setup>
	import Stream from '~/services/WebSocket.js'



	const store = useStore();
  const evAttrsStore = useEvAttributesStore();
	const config = useRuntimeConfig();

	const router = useRouter();

	const routesList = router.getRoutes();

	routesList.forEach((route) => {


		// if (!route.params) {
		// 	route.params = {}
		// }

		// route.props['realm_code'] = 'realm00000'
		// route.props['space_code'] = 'space00000'

		// route.path = route.path.replace(':realm_code', 'realm00000')
		// route.path = route.path.replace(':space_code', 'space00000')

		// console.log('routesList.route', route);

	});

	const route = useRoute();

	console.log('home.route', route.params);

	await store.init();

	let notLoadingMember = ref(true)

	// let ws = new Stream({
	// 	url: config.public.wsURL,
	// 	onOpen() {
	// 		store.ws = ws

	// 		store.ws.send({
	// 			action: "initial_auth",
	// 			data: { access_token: useCookie("access_token").value },
	// 		})
	// 		store.ws.send({
	// 			action: "update_user_state",
	// 			data: { member: store.member },
	// 		})
	// 		store.ws.send({
	// 			action: "update_user_state",
	// 			data: { master_user: { id: store.current.id } },
	// 		})
	// 	}
	// })

	watchEffect(async (onCleanup) => {
		if (store.isUrlValid) {
			onCleanup(() => {})

			notLoadingMember.value = false

			await Promise.all([
        store.getMe(),
        store.fetchEcosystemDefaults(),
        evAttrsStore.fetchSystemAttributes(),
      ]);

			notLoadingMember.value = true

			// store.ws.send({
			// 	action: "update_user_state",
			// 	data: { member: store.member },
			// })
		}
	})
</script>
<style lang="scss" scoped>
	.wrap {
		display: flex;
	}
	.main {
		flex-grow: 1;
		width: calc(100vw - 160px);
		background: $main;
	}
	.content {
		height: calc(100vh - 52px);
		overflow: auto;
	}
</style>
