<template>

	<div class="panel_wrap">
		<FmHorizontalPanel height="65">
			<template #leftActions>
				<slot name="action" />
			</template>

			<template #rightActions>
				<FmBtn class="text-capitalize"
							 icon="refresh"
							 type="text"
							 @click="$emit('refresh')"
				>
					refresh
				</FmBtn>
			</template>
		</FmHorizontalPanel>
	</div>

</template>

<script setup>

	const emit = defineEmits([
		'selected:type', 'update:modelValue', 'refresh'
	])
</script>
<style lang="scss" scoped>
	/*.fm_container {
		background: $separ;
		padding-top: 0;
		padding-bottom: 0;
		height: 65px;
		border-bottom: 1px solid $border;
		box-sizing: border-box;
	}*/
	.panel_wrap {
		height: 65px;
	}
	.add {
		margin-right: 15px;
	}
</style>
