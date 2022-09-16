<template>
	<div
		class="wrap"
	>
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

	await store.init()

	store.ws = new Stream({
		url: "wss://dev.finmars.com/ws/",
	})

	try {
		store.ws.send({
			action: "initial_auth",
			data: { access_token: useCookie("access_token").value },
		})
	} catch (e) {
		console.log("e:", e)
	}
	onMounted(() => {
		if (!store.current.base_api_url) {
			useNotify({
				title: "Workspace is not selected",
				type: "warn",
			})

			useRouter().push("/profile")
		} else {
			store.getMe().then((res) => {
				store.ws.send({
					action: "update_user_state",
					data: { member: store.member },
				})
				store.ws.send({
					action: "update_user_state",
					data: { master_user: { id: store.current.current_master_user_id } },
				})
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
