<template>
	<div
		:class="[
			'table-item-cell',
			{
				'table-item-cell__numeric': isCellValueNumeric,
				'table-item-cell__numeric--accented':
					isCellValueNumeric && cellValue < 0 && negativeColorFormatId
			}
		]"
	>
		{{ isCellValueNumeric ? applyFormatValue() : cellValue }}
	</div>
</template>

<script setup>
	import { computed } from 'vue';
	import get from 'lodash/get';
	import has from 'lodash/has';
	import { formatValue } from '~/utils/renderHelper';
	import { REPORT_TABLE_CELL_MIN_WIDTH } from '../constants';

	const props = defineProps({
		col: {
			type: Object
		},
		item: {
			type: Object
		},
		disabled: {
			type: Boolean
		}
	});

	const cssColumnCellMinWidth = computed(() => `${REPORT_TABLE_CELL_MIN_WIDTH.column}px`);

	const cellWidthCss = computed(() => get(props.col, ['style', 'width'], 0));
	const cellValue = computed(() => get(props.item, [props.col?.key], ''));
	const isCellValueNumeric = computed(() => props.col?.value_type === 20);
	const numberFormat = computed(() =>
		has(props.col, 'report_settings')
			? get(props.col, ['report_settings'], {})
			: get(props.col, ['options', 'numberFormat'], {})
	);
	const negativeColorFormatId = computed(() => get(numberFormat.value, 'negative_color_format_id'));

	function applyFormatValue() {
		return formatValue(props.item, props.col);
	}
</script>

<style lang="scss" scoped>
	@use '@/assets/scss/core/_mixins' as mixins;

	.table-item-cell {
		--table-item-cell-min-width: v-bind(cssColumnCellMinWidth);
		--table-item-cell-width: v-bind(cellWidthCss);

		position: relative;
		height: 100%;
		min-width: var(--table-item-cell-min-width);
		width: var(--table-item-cell-width);
		display: flex;
		justify-content: flex-start;
		align-items: center;
		padding: 0 8px;
		font: var(--body-medium-font);
		color: var(--on-surface);
		border-right: 1px solid var(--outline-variant);
		@include mixins.text-overflow-ellipsis();

		&__numeric {
			justify-content: flex-end;

			&--accented {
				color: var(--error);
			}
		}
	}
</style>
