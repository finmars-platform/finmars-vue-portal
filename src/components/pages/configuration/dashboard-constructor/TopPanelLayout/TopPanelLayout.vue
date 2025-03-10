<template>
	<div ref="wrapper" class="top-panel-layout">
		<GridLayout
			ref="gridLayout"
			v-model:layout="gridData"
			:col-num="columnsCount"
			:row-height="rowHeight"
			:max-rows="rowsCount"
			:auto-size="false"
			is-draggable
			is-resizable
			prevent-collision
			:vertical-compact="false"
			use-css-transforms
			@layout-updated="debouncedUpdateDashboard"
		>
			<template #item="{ item }">
				<div class="top-panel-layout__component">
					<FmIconButton
						variant="text"
						size="small"
						icon="mdi-pencil"
						color="var(--on-surface-variant)"
						class="top-panel-layout__component-edit"
						@click.stop.prevent="runEditComponent(item)"
					/>

					<FmIconButton
						variant="text"
						size="small"
						icon="mdi-delete"
						color="var(--error)"
						class="top-panel-layout__component-delete"
						@click.stop.prevent="removeComponent(item)"
					/>

					<div v-fm-html="componentsLabels[item.i] ?? ''" />
				</div>
			</template>
		</GridLayout>

		<div class="top-panel-layout__actions">
			<div
				v-for="r in rowsCount"
				:key="r"
				class="top-panel-layout__actions-row"
			>
				<div class="top-panel-layout__actions-row-btn">
					<FmTooltip
						activator="parent"
						type="secondary"
						location="top"
					>
						Insert row below
					</FmTooltip>

					<FmIconButton
						variant="outlined"
						size="small"
						icon="mdi-plus"
						color="var(--on-surface-variant)"
						@click.stop.prevent="insertRow(r - 1)"
						:disabled="!isRowAddable(r - 1)"
					/>
				</div>

				<div class="top-panel-layout__actions-row-btn">
					<FmTooltip
						activator="parent"
						type="secondary"
						location="top"
						:max-width="300"
					>
						{{
							isRowEmpty(r - 1)
								? 'Remove row'
								: 'Empty row before removing it'
						}}
					</FmTooltip>

					<FmIconButton
						v-if="!(r === 1 && rowsCount === 1)"
						variant="outlined"
						size="small"
						icon="mdi-minus"
						color="var(--on-surface-variant)"
						:disabled="!isRowEmpty(r - 1)"
						@click.stop.prevent="deleteRow(r - 1)"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { computed } from 'vue';
	import debounce from 'lodash/debounce';
	import { GridLayout } from 'grid-layout-plus';
	import { FmIconButton, FmHtml, FmTooltip } from '@finmars/ui';
	import { useLayout } from '../useLayout';

	const vFmHtml = FmHtml;

	const props = defineProps({
		data: {
			type: Object,
			default: () => ({})
		}
	});
	const emits = defineEmits(['update', 'edit:component']);

	const data = computed(() => props.data);
	const path = computed(() => ['fixed_area']);

	const {
		wrapper,
		gridLayout,
		gridData,
		columnsCount,
		rowHeight,
		rowHeightCss,
		rowsCount,
		componentsLabels,
		isRowEmpty,
		isRowAddable,
		updateDashboard,
		insertRow,
		deleteRow,
		removeComponent,
		runEditComponent
	} = useLayout(data, path, emits);

	const debouncedUpdateDashboard = debounce(updateDashboard, 100);
</script>

<style lang="scss" scoped>
	.top-panel-layout {
		--columns-count: v-bind(columnsCount);
		--rows-count: v-bind(rowsCount);
		--row-height: v-bind(rowHeightCss);

		position: relative;
		width: 100%;
		padding-right: 72px;
		height: calc(
			calc(var(--row-height) * var(--rows-count)) +
				calc(10px * (calc(var(--rows-count) + 1)))
		);
		max-height: calc(
			calc(var(--row-height) * var(--rows-count)) +
				calc(10px * (calc(var(--rows-count) + 1)))
		);

		&::after {
			position: absolute;
			content: '';
			background-color: var(--surface);
			left: 0;
			width: 100%;
			bottom: 0;
			height: 4px;
		}

		&__component {
			position: relative;
			display: flex;
			width: 100%;
			height: 100%;
			border-radius: 4px;
			background-color: var(--surface-container);
			box-shadow: 0 2px 3px 0 var(--on-surface-variant);
			padding: 28px 4px 4px 4px;
			font: var(--body-small-font);
			color: var(--on-surface);
			overflow: hidden;

			button {
				position: absolute;
				top: 2px;
				width: 24px !important;
				height: 24px !important;
			}

			&-delete {
				right: 2px;
			}

			&-edit {
				right: 26px;
			}

			div {
				white-space: wrap;
			}
		}

		&__actions {
			position: absolute;
			top: 0;
			right: 0;
			width: 72px;
			padding: 5px 0;
			display: grid;
			grid-template-rows: repeat(
				var(--rows-count),
				calc(var(--row-height) + 10px)
			);

			&-row {
				display: flex;
				width: 100%;
				height: 100%;
				justify-content: center;
				align-items: center;
				column-gap: 2px;

				button {
					color: var(--primary) !important;
					caret-color: var(--primary) !important;
				}

				&-btn {
					position: relative;
					width: 32px;
					height: 32px;
				}
			}
		}
	}

	.vgl-layout {
		width: 100%;
		height: 100%;
		overflow: hidden;

		:deep(.vgl-item:not(.vgl-item--placeholder)) {
			border-radius: 4px;
		}

		:deep(.vgl-item__resizer) {
			--vgl-resizer-size: 12px;
			--vgl-resizer-border-color: var(--primary);
		}

		:deep(.vgl-item--resizing) {
			opacity: 90%;
		}

		:deep(.vgl-item--static) {
			background-color: var(--tertiary);
		}

		&::before {
			position: absolute;
			content: '';
			width: calc(100% - 5px);
			height: calc(100% - 5px);
			margin: 5px;
			background-image: linear-gradient(
					to right,
					var(--outline-variant) 1px,
					transparent 1px
				),
				linear-gradient(
					to bottom,
					var(--outline-variant) 1px,
					transparent 1px
				);
			background-repeat: repeat;
			background-size: calc(calc(100% - 5px) / var(--columns-count))
				calc(var(--row-height) + 10px);
		}

		&::after {
			position: absolute;
			content: '';
			background-color: var(--surface);
			top: 0;
			height: 100%;
			right: 0;
			width: 4px;
		}
	}
</style>
