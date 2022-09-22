<template>
	<Head>
		<Title>Finmars</Title>
		<Meta name="description" :content="'Finmars'" />
		<Link type="image/x-icon" rel="icon" href="/v/img/favicon.png" />
	</Head>

	<NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

	<notifications />

	<FmConfirm />
</template>

<script setup>

</script>

<style lang="scss" scoped>

</style>
