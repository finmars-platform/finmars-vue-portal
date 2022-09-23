<template>

</template>

<script setup>

	definePageMeta({
		middleware: 'index'
	});

</script>

<style lang="scss" scoped>
	.wrap {
		display: grid;
		grid-template-columns: 730px 500px;
		align-items: flex-start;
		justify-content: flex-start;
		gap: 20px
	}
	.hp_block {
		border: 1px solid $border;
		border-radius: 3px;
		background: $separ;
	}
	.hp_title {
		background: $main-darken;
		height: 33px;
		line-height: 33px;
		padding: 0 20px;
		font-weight: 500;
		border-bottom: 1px solid $border;
		font-size: 14px;
		font-weight: 500;
	}

</style>
