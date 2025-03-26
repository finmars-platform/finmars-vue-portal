<template>
	<div class="table-group-row">
		<div class="table-group-row__body">
			<ReportTableRowActions :is-menu-column-hidden="isMenuColumnHidden" :disabled="isLoading" />

			<div class="table-group-row__groups-block">
				<FmIcon
					v-if="prependIcon"
					v-ripple.center.circle
					:icon="prependIcon"
					:class="['table-group-row__prepend', { 'table-group-row__prepend--disabled': isLoading }]"
					@click.stop.prevent="toggleFolding"
				/>

				<span class="table-group-row__name">{{ group?.___group_name }}</span>
			</div>

			<template v-for="col in visibleColumns" :key="col.key">
				<div class="table-group-row__cell" :style="{ width: getCellWidth(col.key) }">
					{{ getCellValue(col.key) }}
				</div>
			</template>
		</div>

		<div v-if="group.is_open && !isEmpty(group.children)" class="table-group-row__children">
			<template v-for="val in group?.children" :key="val.___group_identifier || val.id">
				<ReportTableItemRow v-if="val.id" :item="val" :is-menu-column-hidden="isMenuColumnHidden" />

				<ReportTableGroupRow v-else :group="val" :is-menu-column-hidden="isMenuColumnHidden" />
			</template>
		</div>

		<div v-if="isLocalLoading" class="table-group-row__loader">
			<FmProgressCircular indeterminate size="32" />
		</div>
	</div>
</template>

<script setup>
	import { computed, ref } from 'vue';
	import { storeToRefs } from 'pinia';
	import get from 'lodash/get';
	import size from 'lodash/size';
	import set from 'lodash/set';
	import isEmpty from 'lodash/isEmpty';
	import { FmIcon, FmProgressCircular, Ripple } from '@finmars/ui';
	import { prepareTableDataRequestOptions } from '~/components/pages/reports/common/utils';
	import { useBalanceReportStore } from '~/stores/useBalanceReportStore';
	import { REPORT_TABLE_CELL_MIN_WIDTH } from '../constants';
	import ReportTableRowActions from '~/components/pages/reports/common/ReportTableRowActions/ReportTableRowActions.vue';
	import ReportTableGroupRow from '~/components/pages/reports/common/ReportTableGroupRow/ReportTableGroupRow.vue';
	import ReportTableItemRow from '~/components/pages/reports/common/ReportTableItemRow/ReportTableItemRow.vue';

	const vRipple = Ripple;

	const props = defineProps({
		group: {
			type: Object,
			required: true,
			default: () => ({})
		},
		isMenuColumnHidden: {
			type: Boolean
		}
	});

	const balanceReportStore = useBalanceReportStore();
	const { entityType, isLoading, currentLayout, groups, groupIds, columns, tableData } =
		storeToRefs(balanceReportStore);
	const { getTableData } = balanceReportStore;

	const isLocalLoading = ref(false);

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

	const _columns = computed(() =>
		columns.value.filter((col) => !groupIds.value.includes(col.___column_id))
	);
	const visibleColumns = computed(() => _columns.value.filter((c) => !c.isHidden));

	const prependIcon = computed(() => {
		const isGroupOpen = get(props.group, ['is_open']);
		return isGroupOpen ? 'mdi-menu-down' : 'mdi-menu-right';
	});

	function getCellValue(key) {
		return get(props.group, ['subtotal', key], '');
	}

	function getCellWidth(key) {
		const cell = columns.value.find((c) => c.key === key);
		if (!cell) return '0';

		return get(cell, ['style', 'width'], '0');
	}

	async function toggleFolding() {
		console.log('toggleFolding => ', props.group);
		const parentPath = props.group.parents.reduce(
			(res, parent) => {
				res.push(parent);
				res.push('children');
				return res;
			},
			['children']
		);
		console.log('parentPath =>', parentPath);

		if (props.group.is_open) {
			set(tableData.value, [...parentPath, props.group.___group_identifier, 'is_open'], false);
			return;
		}

		if (size(props.group.children) > 0) {
			set(tableData.value, [...parentPath, props.group.___group_identifier, 'is_open'], true);
			return;
		}

		const currentGroupIndex = groups.value.findIndex(
			(g) => g.key === props.group.___group_type_key
		);
		console.log('currentGroupIndex =>', currentGroupIndex);
		const requestOptions = prepareTableDataRequestOptions({
			currentLayout: currentLayout.value,
			groupIndex: currentGroupIndex,
			groupValues: [...props.group.parents, props.group.___group_identifier]
		});
		console.log('requestOptions =>', requestOptions);

		try {
			isLocalLoading.value = true;
			const type = currentGroupIndex !== size(groups.value) - 1 ? 'group' : 'column';
			await getTableData({
				type,
				entityType: entityType.value,
				options: requestOptions,
				path: [...parentPath, props.group.___group_identifier]
			});
			set(tableData.value, [...parentPath, props.group.___group_identifier, 'is_open'], true);
		} finally {
			isLocalLoading.value = false;
		}
	}
</script>

<style lang="scss" scoped>
	@use '@/assets/scss/core/_mixins' as mixins;

	.table-group-row {
		--table-row-group-block-width: v-bind(groupsBlockWidthCss);
		--table-row-group-block-padding-left: v-bind(groupsBlockPaddingCss);

		position: relative;
		width: 100%;
		min-height: var(--report-table-row-height);
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
			padding-left: var(--table-row-group-block-padding-left);
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

		&__loader {
			position: absolute;
			inset: 0;
			z-index: 5;
			pointer-events: none;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}
</style>
