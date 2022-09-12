<template>
	<div class="rs_row flex-row fc-space-between fi-center">
		<div class="rs_field_label">{{ props.label }}</div>

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
		padding-bottom: 10px;
	}

	.rs_field_label {
		width: 200px;
	}
	.rs_field_holder {
		width: 280px;

		:deep(.base-input), :deep(.fm_select) {
			margin-bottom: 0;
		}
	}
</style>
