<template>
	<div class="wrap">
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
	import Stream from "~/services/WebSocket.js"

	const store = useStore()
	const config = useRuntimeConfig()

	await store.init()

	let ws = new Stream({
		url: config.public.wsURL,
		onOpen() {
			store.ws = ws

			store.ws.send({
				action: "initial_auth",
				data: { access_token: useCookie("access_token").value },
			})
			store.ws.send({
				action: "update_user_state",
				data: { member: store.member },
			})
			store.ws.send({
				action: "update_user_state",
				data: { master_user: { id: store.current.id } },
			})
		}
	})

	watchEffect( async ( onCleanup ) => {
		if ( store.current.base_api_url ) {
			onCleanup(() => {})
			await store.getMe()
			store.ws.send({
				action: "update_user_state",
				data: { member: store.member },
			})
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
		height: calc(100vh - 56px);
		overflow: auto;
	}
</style>
