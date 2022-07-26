<template>
	<div class="fm_container flex sb aic">
		<slot name="action">

		</slot>

		<FmBtn class="text-capitalize"
			icon="refresh"
			type="text"
			@click="$emit('refresh')"
		>
			refresh
		</FmBtn>
	</div>
</template>

<script setup>

	const props = defineProps([
		'refresh'
	])
	const emit = defineEmits([
		'selected:type', 'update:modelValue'
	])
</script>
<style lang="scss" scoped>
	.fm_container {
		background: $separ;
		padding-top: 0;
		padding-bottom: 0;
		height: 65px;
		border-bottom: 1px solid $border;
		box-sizing: border-box;
	}
	.add {
		margin-right: 15px;
	}
</style>
