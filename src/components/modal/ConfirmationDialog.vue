<template>
	<div class="dialog">
		<div class="dialog__body">
			{{ text }}
		</div>
	</div>
</template>

<script setup>
	defineProps({
		text: {
			type: String,
			default: 'Are you sure you want to continue?'
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
			padding: 24px;
			font: var(--body-large-font);
			color: var(--on-surface);
		}
	}
</style>
