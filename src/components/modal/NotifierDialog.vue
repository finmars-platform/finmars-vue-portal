<template>
	<div class="dialog">
		<div v-for="item in items" class="dialog__body" :key="item">
			{{item}}
		</div>
	</div>
</template>

<script setup>
	defineProps({
		items: {
			type: Array,
			default: ['Are you sure you want to continue?']
		}
	});
</script>

<style lang="scss" scoped>
	.dialog {
		position: relative;
		width: 100%;

		&__body {
			position: relative;
			width: 100%;
			padding: 12px 20px 8px 20px;
			font: var(--body-large-font);
			color: var(--on-surface);
		}
	}
</style>
