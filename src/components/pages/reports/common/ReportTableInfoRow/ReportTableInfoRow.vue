<template>
	<div class="table-info-row">
		<div
			:class="['table-info-row__empty', { 'table-info-row__empty--short': isMenuColumnHidden }]"
		/>

		<div class="table-info-row__content">
			<slot></slot>
		</div>

		<div v-if="isLoading" class="table-info-row__loader">
			<FmProgressCircular indeterminate size="32" />
		</div>
	</div>
</template>

<script setup>
	import { computed } from 'vue';
	import { storeToRefs } from 'pinia';
	import { FmProgressCircular } from '@finmars/ui';
	import { useBalanceReportStore } from '~/stores/useBalanceReportStore';
	import { REPORT_TABLE_CELL_MIN_WIDTH } from '../constants';

	const props = defineProps({
		type: {
			type: String,
			default: 'group',
			validator: (val) => ['group', 'items'].includes(val)
		},
		colKey: {
			type: [String, undefined]
		},
		isMenuColumnHidden: {
			type: Boolean
		},
		isLoading: {
			type: Boolean
		}
	});

	const balanceReportStore = useBalanceReportStore();
	const { groups, columns } = storeToRefs(balanceReportStore);

	const rowPaddingCss = computed(() => {
		if (!props.colKey) {
			return props.type === 'group' ? '40px' : '8px';
		}

		if (props.type === 'group') {
			const currentGroupIndex = groups.value.findIndex((gr) => gr.key === props.colKey);
			if (currentGroupIndex === -1) return '40px';

			const value = groups.value.reduce((acc, gr, index) => {
				if (index < currentGroupIndex) {
					const widthCss = gr.style.width;
					const width = parseInt(widthCss.slice(0, -2), 10);
					acc += Math.max(width, REPORT_TABLE_CELL_MIN_WIDTH.group);
				}

				return acc;
			}, 0);
			return `${value + 40}px`;
		}

		const currentColIndex = columns.value.findIndex((col) => col.key === props.colKey);
		if (currentColIndex === -1) return '8px';

		const value = columns.value.reduce((acc, col, index) => {
			if (index < currentColIndex) {
				const widthCss = col.style.width;
				const width = parseInt(widthCss.slice(0, -2), 10);
				acc += Math.max(width, REPORT_TABLE_CELL_MIN_WIDTH.column);
			}

			return acc;
		}, 0);
		return `${value + 8}px`;
	});
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

		&__content {
			display: flex;
			padding-left: var(--table-info-row-padding-left);
			width: max-content;
			justify-content: flex-start;
			align-items: center;
			column-gap: 8px;
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
