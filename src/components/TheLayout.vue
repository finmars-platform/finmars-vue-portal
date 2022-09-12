<template>
	<div class="wrap">
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

	import Stream from '~/services/WebSocket.js'

	defineProps({
		isShowSidebar: {
			type: Boolean,
			default: true
		}
	})

	let store = useStore()

	await store.init()

	store.ws = new Stream({
		url: 'wss://dev.finmars.com/ws/'
	})

	try {
		store.ws.send({action: "initial_auth", data: {access_token: useCookie('access_token').value}})

	} catch(e) {
		console.log('e:', e)
	}

</script>

<style lang="scss" scoped>
.wrap {
	display: flex;
}
.main {
	flex-grow: 1;
	background: $main;
}
.content {
	height: calc(100vh - 56px);
	overflow: auto;
}
</style>
