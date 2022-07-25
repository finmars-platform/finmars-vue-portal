<template>
	<Head>
		<Title>Finmars</Title>
		<Meta name="description" :content="'Finmars'" />
		<Link type="image/x-icon" rel="icon" href="/img/favicon.png" />
	</Head>

	<NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

	<notifications />
</template>

<script setup>
	let store = useStore()

	await store.init()
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
