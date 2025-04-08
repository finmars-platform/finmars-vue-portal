<template>
	<div class="numeric-column-settings-menu">
		<template v-for="item in currentMenuItems" :key="item.action">
			<template v-if="item.type === 'menu-item'">
				<div
					v-if="item.action === 'alignment'"
					class="numeric-column-settings-menu__item-alignment"
				>
					<FmTooltip location="top" type="secondary">
						<template #activator="{ props }">
							<FmIconButton
								v-bind="props"
								icon="mdi-format-align-left"
								:variant="currentColumnAlignment === 'left' ? 'tonal' : 'outlined'"
								@click.stop.prevent="runAction(`${item.action}:left`)"
							/>
						</template>

						<span>Left alignment</span>
					</FmTooltip>

					<FmTooltip location="top" type="secondary">
						<template #activator="{ props }">
							<FmIconButton
								v-bind="props"
								icon="mdi-format-align-center"
								:variant="currentColumnAlignment === 'center' ? 'tonal' : 'outlined'"
								@click.stop.prevent="runAction(`${item.action}:center`)"
							/>
						</template>

						<span>Center alignment</span>
					</FmTooltip>

					<FmTooltip location="top" type="secondary">
						<template #activator="{ props }">
							<FmIconButton
								v-bind="props"
								icon="mdi-format-align-right"
								:variant="currentColumnAlignment === 'right' ? 'tonal' : 'outlined'"
								@click.stop.prevent="runAction(`${item.action}:right`)"
							/>
						</template>

						<span>Right alignment</span>
					</FmTooltip>
				</div>

				<div
					v-else-if="item.action === 'hide:total'"
					class="numeric-column-settings-menu__item"
					@click.stop.prevent="runAction(item.action)"
				>
					{{ isGrandTotalHidden ? item.title[0] : item.title[1] }}
				</div>

				<div
					v-else
					class="numeric-column-settings-menu__item"
					@click.stop.prevent="runAction(item.action)"
				>
					<FmIcon
						v-if="showPrependIcon(item)"
						icon="mdi-check"
						color="var(--on-surface)"
						class="numeric-column-settings-menu__prepend"
					/>

					{{ item.title }}
				</div>
			</template>

			<div v-else class="numeric-column-settings-menu__delimiter" />
		</template>
	</div>
</template>

<script setup>
	import { computed } from 'vue';
	import hasIn from 'lodash/hasIn';
	import get from 'lodash/get';
	import size from 'lodash/size';
	import { FmIcon, FmIconButton, FmTooltip } from '@finmars/ui';
	import {
		getColumnSubtotalFormula,
		isSubtotalSum,
		isSubtotalWeighted as _isSubtotalWeighted,
		isSubtotalAvgWeighted as _isSubtotalAvgWeighted,
		isGrandTotalHidden as _isGrandTotalHidden
	} from '../utils';
	import { REPORT_NUMERIC_COLUMN_MENU_ITEMS } from './constants';

	const props = defineProps({
		column: {
			type: Object
		},
		currentLayout: {
			type: Object,
			default: () => ({})
		}
	});
	const emits = defineEmits(['action']);

	const isGroup = computed(() => hasIn(props.column, '___group_type_id'));
	const columnPositionNumberInTable = computed(() => {
		const tableGroupsSize = size(get(props.currentLayout, ['data', 'grouping'], []));
		const indexInGroups = get(props.currentLayout, ['data', 'grouping'], []).findIndex(
			(g) => g.key === props.column.key
		);
		if (isGroup.value && indexInGroups !== -1) {
			return indexInGroups;
		}

		const indexInColumns = get(props.currentLayout, ['data', 'columns'], []).findIndex(
			(c) => c.key === props.column.key
		);
		if (indexInGroups !== -1) {
			return tableGroupsSize + indexInColumns;
		}

		return indexInColumns;
	});
	const currentColumnAlignment = computed(() => get(props.column, ['style', 'text_align']));

	const subtotalFormula = computed(() => getColumnSubtotalFormula(props.column));

	const isSubtotalWeighted = computed(() => _isSubtotalWeighted(props.column));
	const isSubtotalAvgWeighted = computed(() => _isSubtotalAvgWeighted(props.column));

	const isGrandTotalHidden = computed(() => _isGrandTotalHidden(props.column));

	const currentMenuItems = computed(() =>
		REPORT_NUMERIC_COLUMN_MENU_ITEMS.filter((i) =>
			i.available.includes(isGroup.value ? 'group' : 'item')
		)
			.filter((i) => {
				if (columnPositionNumberInTable.value !== 0) return true;

				return ![
					'subtotal:sum',
					'subtotal:weighted',
					'subtotal:av-weighted',
					'format:number:market',
					'format:number:market:percentage',
					'format:number:exposure',
					'format:number:exposure:percentage'
				].includes(i.action);
			})
			.filter((i) => {
				if (isSubtotalWeighted.value || isSubtotalAvgWeighted.value) return true;

				return ![
					'format:number:market',
					'format:number:market:percentage',
					'format:number:exposure',
					'format:number:exposure:percentage'
				].includes(i.action);
			})
	);

	function showPrependIcon(menuItem) {
		if (menuItem.action === 'subtotal:sum') {
			return isSubtotalSum(props.column);
		}

		if (menuItem.action === 'subtotal:weighted') {
			return isSubtotalWeighted.value;
		}

		if (menuItem.action === 'subtotal:av-weighted') {
			return isSubtotalAvgWeighted.value;
		}

		if (menuItem.action === 'format:number:market') {
			return subtotalFormula.value === 2 || subtotalFormula.value === 6;
		}

		if (menuItem.action === 'format:number:market:percentage') {
			return subtotalFormula.value === 3 || subtotalFormula.value === 7;
		}

		if (menuItem.action === 'format:number:exposure') {
			return subtotalFormula.value === 4 || subtotalFormula.value === 8;
		}

		if (menuItem.action === 'format:number:exposure:percentage') {
			return subtotalFormula.value === 5 || subtotalFormula.value === 9;
		}

		return false;
	}

	function runAction(payload) {
		emits('action', payload);
	}
</script>

<style lang="scss" scoped>
	.numeric-column-settings-menu {
		position: relative;
		width: 100%;
		min-height: 200px;
		max-height: 360px;
		overflow-x: hidden;
		overflow-y: auto;
		font: var(--body-large-font);
		color: var(--on-surface);

		&__item,
		&__item-alignment {
			position: relative;
			display: flex;
			width: 100%;
			height: 48px;
			padding: 0 16px 0 32px;
			align-items: center;
		}

		&__item {
			justify-content: flex-start;
			cursor: pointer;

			&:hover {
				background-color: var(--surface-container-highest);
			}
		}

		&__item-alignment {
			justify-content: flex-start;
			column-gap: 16px;
		}

		&__delimiter {
			position: relative;
			width: 100%;
			height: 1px;
			border-bottom: 1px solid var(--outline-variant);
		}

		&__prepend {
			position: absolute;
			left: 4px;
			top: 12px;
		}
	}
</style>
