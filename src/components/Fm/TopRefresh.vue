<template>
	<div class="fm_container flex sb aic">
		<slot name="action">

		</slot>

		<v-btn color="#737373"
			size="small"
			height="auto"
			variant="text"
			stacked
			class="text-capitalize"
			@click="$emit('refresh')"
		>
			<v-icon start size="24" icon="mdi-refresh"></v-icon>
			refresh
		</v-btn>
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
		height: 60px;
		border-bottom: 1px solid $border;
	}
	.add {
		margin-right: 15px;
	}
</style>
