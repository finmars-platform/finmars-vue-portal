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

				<span class="table-group-row__name" :title="group?.___group_name">
					{{ group?.___group_name }}
				</span>
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

		<ReportTableInfoRow
			v-if="group.totalChildren > size(group.children) || group.hasServerResponseError"
			type="group"
			:col-key="group.___group_type_key"
			:is-menu-column-hidden="isMenuColumnHidden"
			:is-loading="isLocalLoading"
		>
			<div class="table-group-row__info">
				<span v-if="group.hasServerResponseError" class="table-group-row__info--error">Error</span>
				<span v-else>({{ size(group?.children) }} of {{ group?.totalChildren }})</span>

				<FmButton
					rounded
					density="comfortable"
					:disabled="isLoading || isLocalLoading"
					@click.stop.prevent="loadMore"
				>
					{{ group.hasServerResponseError ? 'Retry' : 'Load More' }}
				</FmButton>

				<div v-if="isLocalLoading" class="table-group-row__loader">
					<FmProgressCircular class="table-group-row__loader-element" indeterminate size="32" />
				</div>
			</div>
		</ReportTableInfoRow>

		<div v-if="isLocalLoading" class="table-group-row__loader">
			<FmProgressCircular class="table-group-row__loader-element" indeterminate size="32" />
		</div>
	</div>
</template>

<script setup>
	import { computed, ref, watch } from 'vue';
	import { storeToRefs } from 'pinia';
	import get from 'lodash/get';
	import size from 'lodash/size';
	import set from 'lodash/set';
	import isEmpty from 'lodash/isEmpty';
	import { FmButton, FmIcon, FmProgressCircular, Ripple } from '@finmars/ui';
	import {
		calculatePageNumberForRequest,
		prepareTableDataRequestOptions
	} from '~/components/pages/reports/common/utils';
	import { useMainReportStore } from '~/stores/useMainReportStore';
	import { REPORT_TABLE_CELL_MIN_WIDTH } from '../constants';
	import ReportTableRowActions from '~/components/pages/reports/common/ReportTableRowActions/ReportTableRowActions.vue';
	import ReportTableGroupRow from '~/components/pages/reports/common/ReportTableGroupRow/ReportTableGroupRow.vue';
	import ReportTableItemRow from '~/components/pages/reports/common/ReportTableItemRow/ReportTableItemRow.vue';
	import ReportTableInfoRow from '~/components/pages/reports/common/ReportTableInfoRow/ReportTableInfoRow.vue';

	const vRipple = Ripple;

	const props = defineProps({
		group: {
			type: Object,
			required: true,
			default: () => ({})
		},
		initialOpen: {
			type: [Boolean, undefined]
		},
		isMenuColumnHidden: {
			type: Boolean
		}
	});

	const mainReportStore = useMainReportStore();
	const {
		entityType,
		isLoading,
		currentLayout,
		groups,
		groupRows,
		columns,
		visibleColumns,
		tableData
	} = storeToRefs(mainReportStore);
	const { getTableData } = mainReportStore;

	const isLocalLoading = ref(false);

	const columnKey = computed(() => props.group?.___group_type_key);
	const currentGroupIndex = computed(() =>
		(groups.value || []).findIndex((g) => g.key === columnKey.value)
	);

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

	const prependIcon = computed(() => {
		const isGroupOpen = get(props.group, ['is_open']);
		return isGroupOpen ? 'mdi-menu-down' : 'mdi-menu-right';
	});

	const parentPath = computed(() =>
		props.group?.parents.reduce(
			(res, parent) => {
				res.push(parent);
				res.push('children');
				return res;
			},
			['children']
		)
	);

	function getCellValue(key) {
		return get(props.group, ['subtotal', key], '');
	}

	function getCellWidth(key) {
		const cell = columns.value.find((c) => c.key === key);
		if (!cell) return '0';

		const cssWidth = get(cell, ['style', 'width'], '0px');
		const width = parseInt(cssWidth.slice(0, -2), 10);
		return `${Math.max(width, REPORT_TABLE_CELL_MIN_WIDTH.column)}px`;
	}

	function toggleFolding() {
		const isOpen = !props.group.is_open;
		set(tableData.value, [...parentPath.value, props.group.___group_identifier, 'is_open'], isOpen);

		if (!isOpen && currentGroupIndex.value < size(groups.value) - 1) {
			groupRows.value.forEach((r) => {
				if (size(r.parents) > currentGroupIndex.value) {
					const prePath = r.parents.reduce((res, parentId) => {
						res.push(parentId);
						res.push('children');
						return res;
					}, []);
					const path = ['children', ...prePath, r.___group_identifier, 'is_open'];
					set(tableData.value, path, false);
				}
			});
		}
	}

	async function loadChildren(page = 1) {
		const requestOptions = prepareTableDataRequestOptions({
			currentLayout: currentLayout.value,
			groupIndex: currentGroupIndex.value,
			groupValues: [...props.group.parents, props.group.___group_identifier],
			page
		});

		try {
			isLocalLoading.value = true;
			const type = currentGroupIndex.value !== size(groups.value) - 1 ? 'group' : 'column';
			await getTableData({
				type,
				entityType: entityType.value,
				options: requestOptions,
				path: [...parentPath.value, props.group.___group_identifier],
				justThisLevel: true
			});
		} finally {
			isLocalLoading.value = false;
		}
	}

	async function loadMore() {
		const newPage = calculatePageNumberForRequest({
			totalItems: props.group?.totalChildren,
			currentItemsCount: size(props.group?.children)
		});
		await loadChildren(newPage);
	}

	watch(
		() => props.group.is_open,
		async (val) => {
			if (
				!val ||
				(val &&
					size(props.group.children) > 0 &&
					props.group.totalChildren === size(props.group.children))
			)
				return;

			await loadChildren();
		},
		{
			immediate: true
		}
	);
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
			display: block;
			font: var(--body-medium-pro-font);
			color: var(--on-surface);
			@include mixins.text-overflow-ellipsis();
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

		&__info {
			display: flex;
			justify-content: flex-start;
			align-items: center;
			column-gap: 8px;

			button {
				text-transform: none;
			}

			&--error {
				color: var(--error);
			}
		}

		&__loader {
			position: absolute;
			inset: 0;
			z-index: 5;
			pointer-events: none;

			&-element {
				position: absolute;
				left: calc(var(--table-row-group-block-padding-left) + 192px);
				top: calc(var(--report-table-row-height) / 2 - 16px);
			}
		}
	}
</style>
