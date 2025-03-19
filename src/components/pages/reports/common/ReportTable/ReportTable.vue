<template>
	<div class="report-table">
		<div ref="tableHeaderEl" class="report-table__header">
			<div class="report-table__header-checkbox">
				<FmCheckbox :disabled="disabled" />
			</div>

			<div v-if="!isMenuColumnHidden" class="report-table__header-menu">
				<FmIconButton
					icon="mdi-label-outline"
					variant="text"
					class="report-table__header-menu-btn"
					:disabled="disabled"
				>
					<FmMenu activator="parent">
						<template #default>
							<template v-for="item in LABEL_OPTIONS" :key="item.key">
								<FmMenuItem
									:class="[
										'report-table__header-menu-item',
										{ 'report-table__header-menu-item--bordered': item.key === 'reset' }
									]"
									item-size="medium"
								>
									<FmIcon :icon="item.icon" :color="item.color" />
								</FmMenuItem>
							</template>
						</template>
					</FmMenu>
				</FmIconButton>
			</div>

			<template v-for="gr in groups" :key="gr.key">
				<ReportTableHeaderCell
					type="group"
					:item="gr"
					:header-element="tableHeaderEl"
					:sort-data="sortGroup"
					:disabled="disabled"
					@open-cell-menu="openHeaderCellMenu($event, 'group', gr)"
					@cell-resize="onCellResize('group', gr, $event)"
				/>
			</template>

			<template v-for="col in visibleColumns" :key="col.key">
				<ReportTableHeaderCell
					type="column"
					:item="col"
					:sort-data="sortColumn"
					:header-element="tableHeaderEl"
					:disabled="disabled"
					@open-cell-menu="openHeaderCellMenu($event, 'column', col)"
					@cell-resize="onCellResize('column', col, $event)"
				/>
			</template>

			<FmIconButton
				:class="[
					'report-table__header-menu-icon',
					{ 'report-table__header-menu-icon--closed': isMenuColumnHidden }
				]"
				:icon="isMenuColumnHidden ? 'mdi-chevron-right' : 'mdi-chevron-left'"
				size="small"
				variant="tonal"
				:disabled="disabled"
				@click.stop.prevent="isMenuColumnHidden = !isMenuColumnHidden"
			/>

			<FmMenu
				v-model="headerCellMenuSettings.open"
				:activator="tableHeaderEl"
				:target="[headerCellMenuSettings.x, headerCellMenuSettings.y]"
				:close-on-content-click="false"
				scroll-strategy="block"
				width="240"
			>
				<div>
					{{ headerCellMenuSettings.entity.type }} {{ headerCellMenuSettings.entity.value }}
				</div>
			</FmMenu>
		</div>

		<div class="report-table__body">
			<template v-for="val in tableData?.children" :key="val.___group_identifier || val.id">
				<ReportTableRowForItem
					v-if="val.id"
					:item="val"
					:current-layout="currentLayout"
					:is-menu-column-hidden="isMenuColumnHidden"
					:disabled="disabled"
				/>

				<div v-else>ROW FOR GROUP</div>
			</template>
		</div>
	</div>
</template>

<script setup>
	import { computed, ref } from 'vue';
	import get from 'lodash/get';
	import { FmCheckbox, FmIcon, FmIconButton, FmMenu, FmMenuItem } from '@finmars/ui';
	import { LABEL_OPTIONS } from './constants';
	import ReportTableHeaderCell from './ReportTableHeaderCell.vue';
	import ReportTableRowForItem from '../ReportTableRowForItem/ReportTableRowForItem.vue';

	const props = defineProps({
		currentLayout: {
			type: Object,
			default: () => ({})
		},
		tableData: {
			type: Object,
			required: true,
			default: () => ({})
		},
		sortGroup: {
			type: Object,
			required: true
		},
		sortColumn: {
			type: Object,
			required: true
		},
		disabled: {
			type: Boolean
		}
	});

	const emits = defineEmits(['cell-resize']);

	const tableHeaderEl = ref(null);
	const isMenuColumnHidden = ref(false);
	const headerCellMenuSettings = ref({
		open: false,
		x: 0,
		y: 0,
		entity: {
			type: 'group',
			value: null
		}
	});

	const groups = computed(() => get(props.currentLayout, ['data', 'grouping'], []));
	const groupIds = computed(() => groups.value.map((gr) => gr.___group_type_id));
	const columns = computed(() =>
		get(props.currentLayout, ['data', 'columns'], []).filter(
			(col) => !groupIds.value.includes(col.___column_id)
		)
	);
	const visibleColumns = computed(() => columns.value.filter((col) => !col.isHidden));

	function openHeaderCellMenu(event, type = 'group', value) {
		console.log('openHeaderCellMenu: ', type, event, value);
		const elRect = event.target.getBoundingClientRect();
		headerCellMenuSettings.value = {
			open: true,
			x: elRect.x,
			y: elRect.y + elRect.height + 4,
			entity: {
				type,
				value
			}
		};
	}

	function onCellResize(type = 'group', item, width) {
		emits('cell-resize', { type, item, width });
	}
</script>

<style lang="scss" scoped>
	@use '@/assets/scss/core/_mixins' as mixins;

	.report-table {
		--report-table-row-height: 48px;
		--report-table-cell-min-width: 90px;

		position: relative;
		width: max-content;

		&__header {
			position: relative;
			width: max-content;
			height: var(--report-table-row-height);
			display: flex;
			justify-content: flex-start;
			align-items: center;
			background-color: var(--surface-container);
			color: var(--on-surface-variant);
			border-bottom: 1px solid var(--outline-variant);

			&-checkbox {
				display: flex;
				justify-content: center;
				align-items: center;
				width: var(--report-table-row-height);
				min-width: var(--report-table-row-height);
				height: 100%;
				border-right: 1px solid var(--outline-variant);
			}

			&-menu {
				display: flex;
				justify-content: center;
				align-items: center;
				width: calc(2 * var(--report-table-row-height));
				min-width: calc(2 * var(--report-table-row-height));
				height: 100%;
				border-right: 1px solid var(--outline-variant);
				padding-left: var(--report-table-row-height);

				&-btn {
					:deep(.v-icon) {
						color: var(--on-surface-variant) !important;
						caret-color: var(--on-surface-variant) !important;
					}
				}

				&-item {
					&--bordered {
						border-top: 1px solid var(--outline-variant);
					}
				}

				&-icon {
					position: absolute;
					width: 16px !important;
					height: 16px !important;
					left: calc(3 * var(--report-table-row-height) - 8px);
					top: 16px;
					z-index: 1;

					&--closed {
						left: calc(var(--report-table-row-height) - 8px);
					}
				}
			}
		}

		&__body {
			position: relative;
			width: 100%;
		}
	}
</style>
