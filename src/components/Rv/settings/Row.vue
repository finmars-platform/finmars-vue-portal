<template>
	<div class="rs_row flex-row fc-space-between fi-center">
		<div>{{ props.label }}</div>

		<div class="rs_field_holder">
			<slot />
		</div>
	</div>
</template>

<script setup>
	let props = defineProps({
		label: String
	})
</script>

<style lang="scss" scoped>
	.rs_row {
		padding-bottom: 8px;
		// padding-left: 20px;
	}

	.rs_field_holder {
		width: 280px;

		:deep(.base-input), :deep(.fm_select) {
			margin-bottom: 0;
		}
	}
</style>
