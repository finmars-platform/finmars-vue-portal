<template>
	<div class="material-icons icon">{{ icon }}</div>
</template>

<script setup>
	let props = defineProps({
		icon: String
	})
</script>

<style lang="scss" scoped>
	.icon {
		display: block;
		cursor: pointer;
		transition: color 0.3s;

		&:hover {
			color: $text-hover;
		}
	}
</style>
