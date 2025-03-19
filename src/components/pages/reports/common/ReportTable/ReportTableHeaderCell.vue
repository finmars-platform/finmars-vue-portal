<template>
	<div
		ref="cellEl"
		:class="[
			'table-header-cell',
			{
				'table-header-cell__group': type === 'group',
				'table-header-cell__column': type === 'column',
				'table-header-cell--sorted': sortData.key === item.key
			}
		]"
		:style="{ width: movingConfig.width }"
		@mouseup="onResizerMouseUp"
		@click.stop.prevent
	>
		<FmIcon
			v-if="type === 'group'"
			icon="mdi-menu-right"
			:class="['table-header-cell__prepend', { 'table-header-cell__prepend--disabled': disabled }]"
			@click.stop.prevent
		/>

		<span class="table-header-cell__text">
			{{ item.layout_name }}

			<FmTooltip type="secondary" activator="parent" location="top">
				{{ item.layout_name }}
			</FmTooltip>
		</span>

		<FmIcon :icon="sortIcon" v-ripple.center class="table-header-cell__sort" @click.stop.prevent />

		<FmIcon
			icon="mdi-dots-vertical"
			v-ripple.center
			:class="['table-header-cell__append', { 'table-header-cell__append--disabled': disabled }]"
			@click.stop.prevent="emits('open-cell-menu', $event)"
		/>

		<div
			class="table-header-cell__resizer"
			@click.stop.prevent
			@dragstart="onResizerDragStart"
			@mousedown="onResizerMouseDown"
			@mousemove.stop.prevent="onResizerMouseMove"
		/>
	</div>
</template>

<script setup>
	import { computed, ref, watch } from 'vue';
	import { FmIcon, FmTooltip, Ripple } from '@finmars/ui';
	import { REPORT_TABLE_CELL_MIN_WIDTH, REPORT_TABLE_CELL_MAX_WIDTH } from './constants';

	const vRipple = Ripple;

	const props = defineProps({
		type: {
			type: String,
			validator: (val) => ['group', 'column'].includes(val)
		},
		item: {
			type: Object,
			required: true
		},
		sortData: {
			type: Object,
			required: true
		},
		disabled: {
			type: Boolean
		}
	});
	const emits = defineEmits(['open-cell-menu', 'cell-resize']);

	const cellEl = ref(null);

	const cssGroupCellMinWidth = computed(() => `${REPORT_TABLE_CELL_MIN_WIDTH.group}px`);
	const cssColumnCellMinWidth = computed(() => `${REPORT_TABLE_CELL_MIN_WIDTH.column}px`);
	const sortIcon = computed(() => {
		if (props.sortData?.key !== props.item?.key) {
			return 'mdi-sort-descending';
		}

		return props.sortData?.sort === 'desc' ? 'mdi-sort-descending' : 'mdi-sort-ascending';
	});

	const movingConfig = ref({
		width:
			props.item.style?.width ||
			(props.type === 'group' ? cssGroupCellMinWidth.value : cssColumnCellMinWidth.value),
		shift: 0,
		changing: false
	});

	function onResizerDragStart() {
		return false;
	}

	function onResizerMouseDown(ev) {
		const cellElRect = cellEl.value.getBoundingClientRect();
		movingConfig.value.shift = ev.clientX - cellElRect.right;
		movingConfig.value.changing = true;
	}

	function onResizerMouseUp() {
		movingConfig.value.changing = false;
		movingConfig.value.shift = 0;
		return false;
	}

	function onResizerMouseMove(ev) {
		if (movingConfig.value.changing) {
			const cellElRect = cellEl.value.getBoundingClientRect();
			const newCellWidth = ev.clientX - movingConfig.value.shift - cellElRect.x;

			if (
				newCellWidth > REPORT_TABLE_CELL_MIN_WIDTH[props.type] &&
				newCellWidth < REPORT_TABLE_CELL_MAX_WIDTH
			) {
				movingConfig.value.width = `${newCellWidth}px`;
				emits('cell-resize', movingConfig.value.width);
			}
		}
	}

	watch(
		() => props.item?.style?.width,
		() => {
			if (movingConfig.value.width !== props.item?.style?.width) {
				movingConfig.value.width =
					props.item.style?.width ||
					(props.type === 'group' ? cssGroupCellMinWidth.value : cssColumnCellMinWidth.value);
			}
		}
	);
</script>

<style lang="scss" scoped>
	@use '@/assets/scss/core/_mixins' as mixins;

	.table-header-cell {
		--report-table-group-cell-min-width: v-bind(cssGroupCellMinWidth);
		--report-table-column-cell-min-width: v-bind(cssColumnCellMinWidth);

		position: relative;
		height: 100%;
		padding-top: 0;
		padding-bottom: 0;
		padding-right: 32px;
		display: flex;
		align-items: center;
		overflow: hidden;
		border-right: 1px solid var(--outline-variant);
		font: var(--label-medium-pro-font);

		&__group {
			min-width: var(--report-table-group-cell-min-width);
			padding-left: 32px;
		}

		&__column {
			min-width: var(--report-table-column-cell-min-width);
			padding-left: 8px;
		}

		&__prepend,
		&__append {
			position: absolute;
			border-radius: 4px;
			top: calc(var(--report-table-row-height) - 24px) / 2;
			cursor: pointer;

			&--disabled {
				pointer-events: none;
				cursor: auto;
			}
		}

		&__prepend {
			left: 4px;
		}

		&__append {
			right: 4px;
		}

		&__text {
			display: block;
			position: relative;
			width: 100%;
			@include mixins.text-overflow-ellipsis();
		}

		&__sort {
			position: absolute;
			border-radius: 4px;
			top: calc(var(--report-table-row-height) - 24px) / 2;
			right: 32px;
			opacity: 0;
		}

		&--sorted {
			padding-right: 60px;

			.table-header-cell__sort {
				opacity: 1;
				cursor: pointer;
			}
		}

		&:hover {
			padding-right: 60px;

			.table-header-cell__sort {
				opacity: 1;
				cursor: pointer;
			}
		}

		&__resizer {
			position: absolute;
			top: 0;
			height: 100%;
			right: 0;
			width: 3px;
			background-color: var(--outline-variant);
			cursor: col-resize;
		}
	}
</style>
