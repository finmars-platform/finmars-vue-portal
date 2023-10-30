<template>
	<FmMenu
		class="g-table-header-cell-wrapper gColumnElem gDraggableHead gcAreaDnD"
		draggable="true"
		:data-column-id="column.___column_id || column.___group_type_id"
		:data-attr-key="column.key"
		:class="{
			'last-dragged': column.frontOptions && column.frontOptions.lastDragged,
			error: column.error_data,
		}"
		openOn="contextmenu"
	>
		<template #btn>
			<div class="g-table-header-cell-wrapper">
				<!-- v-fm-tooltip="
			column?.error_data ? column?.error_data.description : column.name
		" -->
				<div
					class="g-cell g-table-header-cell position-relative"
					:class="{ 'g-table-header-group-cell': isGroup }"
				>
					<div
						v-if="!isReport"
						@click="
							sortHandler(
								column,
								column?.options.sort === 'DESC' ? 'ASC' : 'DESC'
							)
						"
						class="g-column-sort-settings-opener"
					></div>

					<div
						v-if="isGroup"
						class="g-cell-button"
						@click="
							column.report_settings?.is_level_folded
								? $emit('groupUnfold')
								: $emit('groupFold')
						"
					>
						<span class="material-icons">{{
							column.report_settings?.is_level_folded ? 'add' : 'remove'
						}}</span>
					</div>

					<span v-if="column?.error_data" class="material-icons error"
						>error</span
					>

					<div class="g-table-header-button">
						<div class="column-name-wrapper">
							<div class="flex-row flex-i-center name-block">
								<div>
									<span v-if="!column.layout_name">{{ column.name }}</span>
									<span v-if="column.layout_name">{{
										column.layout_name
									}}</span>
									<span v-if="column?.status == 'missing'">(Deleted)</span>
								</div>

								<span
									v-if="
										column?.options.sort_settings &&
										column?.options.sort_settings.mode === 'manual'
									"
									class="column-manual-sort-icon"
								>
									m
									<md-tooltip md-direction="top">
										Manual Sorting Activated
									</md-tooltip>
								</span>
							</div>

							<div
								:class="['sort', column?.options.sort ? 'has-sort' : '']"
								@click.stop="$emit('sort')"
							>
								<span
									v-show="
										column?.options.sort == 'DESC' || !column?.options.sort
									"
									class="material-icons gt-sorting-icon"
									>arrow_upward</span
								>
								<span
									v-show="column?.options.sort == 'ASC'"
									class="material-icons gt-sorting-icon"
									>arrow_downward</span
								>
							</div>
						</div>
					</div>
				</div>

				<AngularFmGridTableColumnResizer />

				<div
					class="g-table-header-drop gDraggableHeadArea"
					:data-attr-key="column.key"
				></div>
			</div>
		</template>

		<template #default="{ close }">
			<div class="fm_list">
				<template v-if="popupData.data.isAGroup">
					<div
						class="fm_list_item"
						@click="
							popupData.data.reportSetSubtotalType(popupData.data.item, 'line'),
								close()
						"
					>
						<FmIcon
							icon="done"
							v-show="
								popupData.data.item.report_settings.subtotal_type == 'line'
							"
						/>
						<span>Subtotal on Top</span>
					</div>

					<div
						class="fm_list_item"
						@click="
							popupData.data.reportSetSubtotalType(popupData.data.item, 'area'),
								close()
						"
					>
						<FmIcon
							icon="done"
							v-show="
								popupData.data.item.report_settings.subtotal_type == 'area'
							"
						/>
						<span>Subtotal on Bottom</span>
					</div>

					<div
						class="fm_list_item"
						@click="
							popupData.data.reportSetSubtotalType(
								popupData.data.item,
								'arealine'
							),
								close()
						"
					>
						<FmIcon
							icon="done"
							v-show="
								popupData.data.item.report_settings.subtotal_type == 'arealine'
							"
						/>
						<span>Subtotal on Top and Bottom</span>
					</div>
				</template>

				<div
					class="fm_list_item"
					@click="popupData.data.renameColumn(popupData.data.item.key), close()"
				>
					Rename
				</div>

				<div
					class="fm_list_item"
					v-if="
						!popupData.data.columnHasCorrespondingGroup(popupData.data.item.key)
					"
					@click="
						popupData.data.addColumnEntityToGrouping(popupData.data.item),
							close()
					"
				>
					Add to grouping
				</div>

				<div
					class="fm_list_item"
					v-if="
						!popupData.data.isReport ||
						popupData.data.columnHasCorrespondingGroup(popupData.data.item.key)
					"
					@click="
						popupData.data.unGroup(popupData.data.item.key, _$popup), close()
					"
				>
					Ungroup
				</div>

				<div
					class="fm_list_item"
					v-if="
						popupData.data.checkForFilteringBySameAttr(
							popupData.data.item.key
						) && popupData.data.viewContext != 'dashboard'
					"
					@click="
						popupData.data.addFiltersWithColAttr(popupData.data.item), close()
					"
				>
					Add to Filters
				</div>

				<template v-if="popupData.data.item.value_type == 20">
					<hr />

					<div
						class="fm_list_item"
						@click="
							popupData.data.openNumberFormatDialog(popupData.data.item),
								close()
						"
					>
						Number Format
					</div>
					<hr />

					<div
						class="fm_list_item"
						@click="
							popupData.data.onSubtotalSumClick(popupData.data.item, 1), close()
						"
					>
						<FmIcon icon="done" v-show="popupData.data.isSubtotalSum" />

						<span>Subtotal SUM</span>
					</div>

					<div
						class="fm_list_item"
						v-if="
							popupData.data.$index !== 0 &&
							!popupData.data.isSubtotalWeightedShouldBeExcluded(
								popupData.data.item
							)
						"
						@click="popupData.data.onSubtotalWeightedClick(popupData.data.item)"
					>
						<FmIcon icon="done" v-show="popupData.data.isSubtotalWeighted" />
						<span>Subtotal Weighted</span>
					</div>

					<div
						class="fm_list_item"
						v-if="
							popupData.data.$index !== 0 &&
							!popupData.data.isSubtotalWeightedShouldBeExcluded(
								popupData.data.item
							)
						"
						@click="
							popupData.data.onSubtotalAvgWeightedClick(popupData.data.item)
						"
					>
						<FmIcon icon="done" v-show="popupData.data.isSubtotalAvgWeighted" />
						<span>Subtotal Avg. Weighted</span>
					</div>

					<div
						class="fm_list_item"
						@click="
							popupData.data.reportHideGrandTotal(popupData.data.item), close()
						"
					>
						{{
							popupData.data.item.report_settings?.hide_grandtotal
								? 'Show Grand Total'
								: 'Hide Grand Total'
						}}
					</div>

					<hr />

					<div
						class="fm_list_item"
						v-if="
							popupData.data.$index !== 0 &&
							!popupData.data.isSubtotalWeightedShouldBeExcluded(
								popupData.data.item
							)
						"
						:class="{
							disabled:
								!popupData.data.isSubtotalWeighted &&
								!popupData.data.isSubtotalAvgWeighted,
						}"
						@click="
							popupData.data.selectSubtotalType(
								popupData.data.item,
								2 + 4 * popupData.data.isSubtotalAvgWeighted
							),
								close()
						"
					>
						<FmIcon
							icon="done"
							v-show="
								!popupData.data.isTemporaryWeighted &&
								(popupData.data.getSubtotalFormula(popupData.data.item) === 2 ||
									popupData.data.getSubtotalFormula(popupData.data.item) === 6)
							"
						/>

						<span>Market Value</span>
					</div>

					<div
						class="fm_list_item"
						v-if="
							popupData.data.$index !== 0 &&
							!popupData.data.isSubtotalWeightedShouldBeExcluded(
								popupData.data.item
							)
						"
						:class="{
							disabled:
								!popupData.data.isSubtotalWeighted &&
								!popupData.data.isSubtotalAvgWeighted,
						}"
						@click="
							popupData.data.selectSubtotalType(
								popupData.data.item,
								3 + 4 * popupData.data.isSubtotalAvgWeighted
							),
								close()
						"
					>
						<FmIcon
							icon="done"
							v-show="
								!popupData.data.isTemporaryWeighted &&
								(popupData.data.getSubtotalFormula(popupData.data.item) === 3 ||
									popupData.data.getSubtotalFormula(popupData.data.item) === 7)
							"
						/>
						<span>Market Value %</span>
					</div>

					<div
						class="fm_list_item"
						v-if="
							popupData.data.$index !== 0 &&
							!popupData.data.isSubtotalWeightedShouldBeExcluded(
								popupData.data.item
							)
						"
						:class="{
							disabled:
								!popupData.data.isSubtotalWeighted &&
								!popupData.data.isSubtotalAvgWeighted,
						}"
						@click="
							popupData.data.selectSubtotalType(
								popupData.data.item,
								4 + 4 * popupData.data.isSubtotalAvgWeighted
							),
								close()
						"
					>
						<FmIcon
							icon="done"
							v-show="
								!popupData.data.isTemporaryWeighted &&
								(popupData.data.getSubtotalFormula(popupData.data.item) === 4 ||
									popupData.data.getSubtotalFormula(popupData.data.item) === 8)
							"
						/>
						<span>Exposure</span>
					</div>

					<div
						class="fm_list_item"
						v-if="
							popupData.data.$index !== 0 &&
							!popupData.data.isSubtotalWeightedShouldBeExcluded(
								popupData.data.item
							)
						"
						:class="{
							disabled:
								!popupData.data.isSubtotalWeighted &&
								!popupData.data.isSubtotalAvgWeighted,
						}"
						@click="
							popupData.data.selectSubtotalType(
								popupData.data.item,
								5 + 4 * popupData.data.isSubtotalAvgWeighted
							)
						"
					>
						<FmIcon
							icon="done"
							v-show="
								!popupData.data.isTemporaryWeighted &&
								(popupData.data.getSubtotalFormula(popupData.data.item) === 5 ||
									popupData.data.getSubtotalFormula(popupData.data.item) === 9)
							"
						/>
						<span>Exposure %</span>
					</div>
				</template>

				<div
					v-if="popupData.data.item.value_type === 10"
					class="fm_list_item"
					@click="popupData.data.editManualSorting($event, popupData.data.item)"
				>
					Manual Sort
				</div>
				<hr />

				<div
					v-if="
						!popupData.data.isReport ||
						!popupData.data.columnHasCorrespondingGroup(popupData.data.item.key)
					"
					class="fm_list_item disabled flex aic"
				>
					<FmIcon
						class="i_align"
						icon="format_align_left"
						v-fm-tooltip="'Left alignment'"
						@click="
							popupData.data.changeColumnTextAlign(popupData.data.item, 'left'),
								close()
						"
						:class="{
							active: popupData.data.checkColTextAlign(
								popupData.data.item,
								'left'
							),
						}"
					/>

					<FmIcon
						class="i_align"
						icon="format_align_center"
						v-fm-tooltip="'Center alignment'"
						@click="
							popupData.data.changeColumnTextAlign(
								popupData.data.item,
								'center'
							),
								close()
						"
						:class="{
							active: popupData.data.checkColTextAlign(
								popupData.data.item,
								'center'
							),
						}"
					/>

					<FmIcon
						class="i_align"
						icon="format_align_right"
						v-fm-tooltip="'Right alignment'"
						@click="
							popupData.data.changeColumnTextAlign(
								popupData.data.item,
								'right'
							),
								close()
						"
						:class="{
							active: popupData.data.checkColTextAlign(
								popupData.data.item,
								'right'
							),
						}"
					/>
				</div>

				<hr />

				<div
					class="fm_list_item"
					v-if="
						!popupData.data.isReport ||
						popupData.data.columnHasCorrespondingGroup(popupData.data.item.key)
					"
					@click="
						popupData.data.removeGroup(
							popupData.data.item.___column_id ||
								popupData.data.item.___group_type_id
						)
					"
				>
					Remove
				</div>

				<div
					class="fm_list_item"
					v-if="
						!popupData.data.isReport ||
						!popupData.data.columnHasCorrespondingGroup(popupData.data.item.key)
					"
					@click="popupData.data.removeColumn(popupData.data.item)"
				>
					Remove
				</div>
			</div>
		</template>
	</FmMenu>
</template>

<script setup>
	const props = defineProps(['column', 'isReport', 'popupData', 'isGroup'])
	const emits = defineEmits(['sort', 'groupFold', 'groupUnfold'])
</script>

<style lang="scss" scoped>
	.fm_list_item {
		border-top: none;
		padding-left: 40px;
		height: 40px;
		position: relative;

		.icon:not(.i_align) {
			position: absolute;
			left: 10px;
		}
		&.disabled {
			color: $text-lighten;
			&:hover {
				background: none;
			}
		}
	}
	.i_align {
		& + & {
			margin-left: 15px;
		}
		&:hover.icon,
		&.active.icon {
			color: $primary;
		}
	}
	hr {
		height: 1px;
		background: $border;

		& + & {
			display: none;
		}
	}
</style>
