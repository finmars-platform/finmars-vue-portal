<template>
	<div class="numeric-column-settings-menu">
		{{ column }}
	</div>
</template>

<script setup>
	const props = defineProps({
		column: {
			type: Object
		}
	});
</script>

<style lang="scss" scoped>
	.numeric-column-settings-menu {
		position: relative;
		width: 100%;
		min-height: 200px;
		max-height: 400px;
		overflow-x: hidden;
		overflow-y: auto;
	}
</style>
