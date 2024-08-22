<template>
	<div v-if="notLoadingMember && store.user" class="wrap">
		<LazyTheSidebar v-if="!$route.meta.isHideSidebar" />

		<div class="main">
			<TheHeader />

			<div class="content scrollable">
				<slot />
			</div>
		</div>
	</div>
</template>

<script setup>
	import Stream from '~/services/WebSocket.js'



	const { loadThemeSettingsDefault } = useWhiteLabelStore()
	const store = useStore();
  	const evAttrsStore = useEvAttributesStore();
	const config = useRuntimeConfig();

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
	watch(
		() => store.user?.data.dark_mode,
		() => {
			useToggleDarkMode(store.user.data.dark_mode)
		}
	)

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

	loadThemeSettingsDefault()
</script>
<style lang="scss" scoped>
	.wrap {
		display: flex;
	}
	.main {
		flex-grow: 1;
		width: calc(100vw - 160px);
		background: var(--base-backgroundColor);
	}
	.content {
		height: calc(100vh - 52px);
		overflow: auto;
	}
</style>
