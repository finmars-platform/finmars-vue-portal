<template>
	<Head>
		<Title>Finmars</Title>
		<Meta name="description" :content="'Finmars'" />
		<Link type="image/x-icon" rel="icon" href="img/favicon/favicon.ico" />
	</Head>

	<v-app>
		<TheSidebar v-if="isOpenSidbar" />

		<v-main class="main bg-grey-lighten-5">
			<TheHeader />

			<v-container class="pa-0" fluid>
				<NuxtPage />
			</v-container>
		</v-main>
	</v-app>

	<notifications />
</template>

<script setup>
	let store = useStore()
	// let isOpenSidbar = useState('isOpenSidbar', () => true)
	let isOpenSidbar = true;

	await store.init()

	if ( !store.current.base_api_url) {
		onMounted(() => {
			useNotify({
				type: 'warn',
				title: 'Notice',
				text: 'Workspace is not selected'
			})
		})

		useRouter().push('/profile')
	}
</script>

<style lang="scss" scoped>
.wrap {
	display: grid;
	grid-template-columns: 160px 1fr;
}
.content {
	padding: 20px;
	height: calc(100vh - 50px);
	overflow: auto;
}
</style>
