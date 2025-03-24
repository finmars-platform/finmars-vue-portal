<template>
	<div class="table-group-row">
		<div class="table-group-row__body">
			<ReportTableRowActions :is-menu-column-hidden="isMenuColumnHidden" :disabled="disabled" />

			<div class="table-group-row__groups-block">
				<FmIcon
					v-if="prependIcon"
					v-ripple.center.circle
					:icon="prependIcon"
					:class="['table-group-row__prepend', { 'table-group-row__prepend--disabled': disabled }]"
					@click.stop.prevent
				/>

				<span class="table-group-row__name">{{ group?.___group_name }}</span>
			</div>

			<template v-for="col in visibleColumns" :key="col.key">
				<div class="table-group-row__cell" :style="{ width: getCellWidth(col.key) }">
					{{ getCellValue(col.key) }}
				</div>
			</template>
		</div>
	</div>
</template>

<script setup>
	import { computed } from 'vue';
	import get from 'lodash/get';
	import { FmIcon, Ripple } from '@finmars/ui';
	import { REPORT_TABLE_CELL_MIN_WIDTH } from '../constants';
	import ReportTableRowActions from '~/components/pages/reports/common/ReportTableRowActions/ReportTableRowActions.vue';

	const vRipple = Ripple;

	const props = defineProps({
		group: {
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

	const groupsBlockPadding = computed(() => {
		let skipCheck = false;
		return groups.value.reduce((res, gr) => {
			if (gr.key === props.group.___group_type_key) {
				skipCheck = true;
			}

			if (!skipCheck) {
				const cssWidth = get(gr, ['style', 'width'], '0px');
				const processedWidth = parseInt(cssWidth.slice(0, -2), 10);
				const width = Math.max(processedWidth, REPORT_TABLE_CELL_MIN_WIDTH.group);
				res += width;
			}

			return res;
		}, 0);
	});
	const groupsBlockPaddingCss = computed(() => `${groupsBlockPadding.value + 8}px`);

	const columns = computed(() =>
		get(props.currentLayout, ['data', 'columns'], []).filter(
			(col) => !groupIds.value.includes(col.___column_id)
		)
	);
	const visibleColumns = computed(() => columns.value.filter((c) => !c.isHidden));

	const prependIcon = computed(() => {
		const group = groups.value.find((g) => g.key === props.group.___group_type_key);
		if (!group) return null;

		const isGroupFolded = get(group, ['report_settings', 'is_level_folded']);
		return isGroupFolded ? 'mdi-menu-right' : 'mdi-menu-down';
	});

	function getCellValue(key) {
		return get(props.group, ['subtotal', key], '');
	}

	function getCellWidth(key) {
		const cell = columns.value.find((c) => c.key === key);
		if (!cell) return '0';

		return get(cell, ['style', 'width'], '0');
	}
</script>

<style lang="scss" scoped>
	@use '@/assets/scss/core/_mixins' as mixins;

	.table-group-row {
		--table-row-group-block-width: v-bind(groupsBlockWidthCss);
		--table-row-group-block-padding-left: v-bind(groupsBlockPaddingCss);

		position: relative;
		width: 100%;
		height: var(--report-table-row-height);
		background-color: var(--surface-dim);
		color: var(--on-surface);

		&__body {
			display: flex;
			height: var(--report-table-row-height);
			justify-content: flex-start;
			align-items: center;
			border-bottom: 1px solid var(--outline-variant);
		}

		&__groups-block {
			position: relative;
			width: var(--table-row-group-block-width);
			height: 100%;
			display: flex;
			justify-content: flex-start;
			align-items: center;
			column-gap: 8px;
		}

		&__prepend {
			border-radius: 4px;
			cursor: pointer;

			&--disabled {
				pointer-events: none;
				cursor: auto;
			}
		}

		&__name {
			font: var(--body-medium-pro-font);
			color: var(--on-surface);
		}

		&__cell {
			position: relative;
			height: 100%;
			display: flex;
			justify-content: flex-start;
			align-items: center;
			padding: 0 8px;
			font: var(--body-medium-pro-font);
			color: var(--on-surface);
			border-right: 1px solid var(--outline-variant);
			@include mixins.text-overflow-ellipsis();
		}
	}
</style>
