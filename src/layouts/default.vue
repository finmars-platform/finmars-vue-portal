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
			console.log('store:', store.current.base_api_url)
			useRouter().push('/profile')
		}
	})

</script>
