<template>
	<div :class="['report-table', { 'report-table--no-overflow': headerCellMenuSettings.open }]">
		<div class="report-table__header-wrapper">
			<div ref="tableHeaderEl" class="report-table__header">
				<div class="report-table__header-checkbox" @click.stop.prevent>
					<FmCheckbox :disabled="isLoading" />
				</div>

				<div v-if="!isMenuColumnHidden" class="report-table__header-menu" @click.stop.prevent>
					<FmIconButton
						icon="mdi-label-outline"
						variant="text"
						class="report-table__header-menu-btn"
						:disabled="isLoading"
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
						@open-cell-menu="openHeaderCellMenu($event, 'group', gr)"
						@cell-resize="onCellResize('group', gr, $event)"
					/>
				</template>

				<template v-for="col in visibleColumns" :key="col.key">
					<ReportTableHeaderCell
						type="column"
						:item="col"
						:header-element="tableHeaderEl"
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
					:disabled="isLoading"
					@click.stop.prevent="isMenuColumnHidden = !isMenuColumnHidden"
				/>

				<FmMenu
					v-model="headerCellMenuSettings.open"
					:activator="tableHeaderEl"
					attach
					:target="[headerCellMenuSettings.x, headerCellMenuSettings.y]"
					:close-on-content-click="false"
					scroll-strategy="block"
					width="280"
				>
					<template v-if="headerCellMenuSettings.entity && headerCellMenuSettings.entity.value">
						<ReportNumericColumnSettingsMenu
							v-if="headerCellMenuSettings.entity?.value.value_type === 20"
							:column="headerCellMenuSettings.entity.value"
						/>

						<ReportColumnSettingsMenu
							v-else
							:column="headerCellMenuSettings.entity.value"
							@action="runAction($event, headerCellMenuSettings.entity.value)"
						/>
					</template>
				</FmMenu>
			</div>
		</div>

		<div class="report-table__body">
			<template v-for="val in tableData?.children" :key="val.___group_identifier || val.id">
				<ReportTableItemRow v-if="val.id" :item="val" :is-menu-column-hidden="isMenuColumnHidden" />

				<ReportTableGroupRow v-else :group="val" :is-menu-column-hidden="isMenuColumnHidden" />
			</template>

			<ReportTableInfoRow
				v-if="tableData?.totalChildren > size(tableData?.children)"
				type="group"
				:is-menu-column-hidden="isMenuColumnHidden"
				:is-loading="isLocalLoading"
			>
				<div class="report-table__row-info">
					<span>({{ size(tableData?.children) }} of {{ tableData?.totalChildren }})</span>
					<FmButton
						rounded
						density="comfortable"
						:disabled="isLoading || isLocalLoading"
						@click.stop.prevent="loadMore"
					>
						Load More
					</FmButton>
				</div>
			</ReportTableInfoRow>
		</div>
	</div>
</template>

<script setup>
	import size from 'lodash/size';
	import { FmButton, FmCheckbox, FmIcon, FmIconButton, FmMenu, FmMenuItem } from '@finmars/ui';
	import { LABEL_OPTIONS } from './constants';
	import useReportTable from './useReportTable';
	import ReportTableHeaderCell from './ReportTableHeaderCell.vue';
	import ReportTableGroupRow from '../ReportTableGroupRow/ReportTableGroupRow.vue';
	import ReportTableItemRow from '../ReportTableItemRow/ReportTableItemRow.vue';
	import ReportTableInfoRow from '../ReportTableInfoRow/ReportTableInfoRow.vue';
	import ReportColumnSettingsMenu from '../ReportColumnSettingsMenu/ReportColumnSettingsMenu.vue';
	import ReportNumericColumnSettingsMenu from '../ReportNumericColumnSettingsMenu/ReportNumericColumnSettingsMenu.vue';

	const emits = defineEmits(['cell-resize']);

	const {
		isLoading,
		isLocalLoading,
		tableHeaderEl,
		groups,
		visibleColumns,
		tableData,
		isMenuColumnHidden,
		headerCellMenuSettings,
		onCellResize,
		loadMore,
		openHeaderCellMenu,
		runAction
	} = useReportTable(emits);
</script>

<style lang="scss" scoped>
	@use '@/assets/scss/core/_mixins' as mixins;

	.report-table {
		--report-table-row-height: 48px;
		--report-table-cell-min-width: 90px;

		position: relative;
		width: 100%;
		height: 100%;
		padding-right: 16px;
		padding-bottom: 8px;
		overflow-x: auto;

		&--no-overflow {
			overflow: hidden;
		}

		&__header-wrapper {
			position: sticky;
			width: max-content;
			top: 0;
			z-index: 1;
		}

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
			width: max-content;
		}

		&__row-info {
			display: flex;
			justify-content: flex-start;
			align-items: center;
			column-gap: 8px;

			button {
				text-transform: none;
			}
		}
	}
</style>
