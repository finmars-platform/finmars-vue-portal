<template>
	<TheLayout>
		<slot />
	</TheLayout>
</template>

<script setup>
	let store = useStore()

	if ( !store.current.base_api_url ) {
		useNotify({
			title: 'Workspace is not selected',
			type: 'warn'
		})
		useRouter().push('/profile')
	}
</script>
