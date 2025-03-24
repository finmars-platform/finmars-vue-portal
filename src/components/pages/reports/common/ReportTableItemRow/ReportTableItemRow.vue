<template>
	<div class="table-item-row">
		<ReportTableRowActions :is-menu-column-hidden="isMenuColumnHidden" :disabled="disabled" />

		<div class="table-item-row__groups-block" />

		<template v-for="col in visibleColumns" :key="col.key">
			<ReportTableItemCell :col="col" :item="item" :disabled="disabled" />
		</template>
	</div>
</template>

<script setup>
	import { computed } from 'vue';
	import get from 'lodash/get';
	import { REPORT_TABLE_CELL_MIN_WIDTH } from '../constants';
	import ReportTableRowActions from '~/components/pages/reports/common/ReportTableRowActions/ReportTableRowActions.vue';
	import ReportTableItemCell from './ResportTableItemCell.vue';

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

	const groups = computed(() => get(props.currentLayout, ['data', 'grouping'], []));
	const groupIds = computed(() => groups.value.map((gr) => gr.___group_type_id));
	const groupsBlockWidth = computed(() =>
		groups.value.reduce((res, gr) => {
			const cssWidth = get(gr, ['style', 'width'], '0px');
			const processedWidth = parseInt(cssWidth.slice(0, -2), 10);
			const width = Math.max(processedWidth, REPORT_TABLE_CELL_MIN_WIDTH.group);
			res += width;

			return res;
		}, 0)
	);
	const groupsBlockWidthCss = computed(() => `${groupsBlockWidth.value}px`);
	const columns = computed(() =>
		get(props.currentLayout, ['data', 'columns'], []).filter(
			(col) => !groupIds.value.includes(col.___column_id)
		)
	);
	const visibleColumns = computed(() => columns.value.filter((c) => !c.isHidden));
</script>

<style lang="scss" scoped>
	.table-item-row {
		--table-row-group-block-width: v-bind(groupsBlockWidthCss);

		position: relative;
		width: 100%;
		height: var(--report-table-row-height);
		display: flex;
		justify-content: flex-start;
		align-items: center;
		background-color: var(--surface);
		color: var(--on-surface);
		border-bottom: 1px solid var(--outline-variant);

		&__groups-block {
			position: relative;
			width: var(--table-row-group-block-width);
		}
	}
</style>
