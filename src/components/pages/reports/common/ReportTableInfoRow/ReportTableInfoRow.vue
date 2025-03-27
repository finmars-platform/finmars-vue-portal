<template>
	<div class="table-info-row">
		<div
			:class="['table-info-row__empty', { 'table-info-row__empty--short': isMenuColumnHidden }]"
		/>
	</div>
</template>

<script setup>
	import { computed } from 'vue';

	const props = defineProps({
		isMenuColumnHidden: {
			type: Boolean
		}
	});

	const rowPaddingCss = computed(() => `0px`);
</script>

<style lang="scss" scoped>
	.table-info-row {
		--table-info-row-padding-left: v-bind (rowPaddingCss);

		position: relative;
		width: 100%;
		height: var(--report-table-row-height);
		display: flex;
		justify-content: flex-start;
		align-items: center;
		background-color: var(--surface);
		color: var(--on-surface);
		border-bottom: 1px solid var(--outline-variant);
		border-right: 1px solid var(--outline-variant);

		&__empty {
			position: relative;
			height: 100%;
			width: calc(var(--report-table-row-height) * 3);
			background-color: var(--surface-container);
			border-right: 1px solid var(--outline-variant);

			&--short {
				width: var(--report-table-row-height);
			}
		}
	}
</style>
