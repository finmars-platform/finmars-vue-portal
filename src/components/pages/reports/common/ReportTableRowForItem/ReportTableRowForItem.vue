<template>
	<div class="table-item-row">
		<ReportTableRowActions :is-menu-column-hidden="isMenuColumnHidden" :disabled="disabled" />
	</div>
</template>

<script setup>
	import ReportTableRowActions from '~/components/pages/reports/common/ReportTableRowActions/ReportTableRowActions.vue';

	const props = defineProps({
		item: {
			type: Object,
			required: true,
			default: () => ({})
		},
		currentLayout: {
			type: Object,
			required: true,
			default: () => ({})
		},
		isMenuColumnHidden: {
			type: Boolean
		},
		disabled: {
			type: Boolean
		}
	});
</script>

<style lang="scss" scoped>
	.table-item-row {
		position: relative;
		width: 100%;
		height: var(--report-table-row-height);
		display: flex;
		justify-content: flex-start;
		align-items: center;
		background-color: var(--surface);
		color: var(--on-surface);
		border-bottom: 1px solid var(--outline-variant);
	}
</style>
