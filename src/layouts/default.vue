<template>
	<div
		class="wrap"
		:style="{ 'grid-template-columns': `${sidenav_width}px 1fr` }"
	>
		<TheSidebar v-if="isShowSidebar" />

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

	defineProps({
		isShowSidebar: {
			type: Boolean,
			default: true,
		},
	})

	let store = useStore()
	let sidenav_width = useState("sidenav_width")

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
		let store = useStore()

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
		display: grid;
	}
	.main {
		background: $main;
	}
	.content {
		height: calc(100vh - 56px);
		overflow: auto;
	}
</style>
