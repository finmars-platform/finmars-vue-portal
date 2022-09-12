<template>
	<TheLayout>
		<slot />
	</TheLayout>
</template>

<script setup>

	onMounted(() => {
		let store = useStore()

		if ( !store.current.base_api_url ) {
			useNotify({
				title: 'Workspace is not selected',
				type: 'warn'
			})

			useRouter().push('/profile')
		} else {

			store.getMe().then(res => {
				store.ws.send( {action: "update_user_state", data: {member: store.member}} )
				store.ws.send( {action: "update_user_state", data: {master_user: {id: store.current.current_master_user_id}}} )
			})
		}
	})

</script>
