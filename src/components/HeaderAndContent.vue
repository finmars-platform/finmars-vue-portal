<template>
	<TheHeader />

	<div class="content">
		<slot />
	</div>
</template>

<script setup>
</script>

<style lang="scss" scoped>
	.content {
		height: calc(100vh - 56px);
		overflow: auto;
	}
</style>
