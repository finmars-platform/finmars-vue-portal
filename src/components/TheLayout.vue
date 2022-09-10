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

	let ws = new Stream({
		url: 'wss://dev.finmars.com/ws/'
	})

	store.ws = ws

	// useApi('member.get', {params: {id: 0}}).then(res => {
	store.getMe().then(res => {
		ws.send({action: "initial_auth", data: {access_token: useCookie('access_token').value}})
		ws.send( {action: "update_user_state", data: {member: store.member}} )
		ws.send( {action: "update_user_state", data: {master_user: {id: store.current.current_master_user_id}}} )
	})

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
