<template>
	<div class="type-mapping-item">
		{{ JSON.stringify(entity) }}
	</div>
</template>

<script setup>
	const props = defineProps({
		entity: {
			type: Object
		}
	});
</script>

<style lang="scss" scoped>
	.type-mapping-item {
		position: relative;
		width: 100%;
		height: 40px;
		margin-bottom: 8px;
		overflow: hidden;
	}
</style>
