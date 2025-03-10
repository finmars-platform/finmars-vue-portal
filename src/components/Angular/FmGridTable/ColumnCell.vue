<template>
	<FmMenu
		openOnRightClick
		class="g-table-header-cell-wrapper gColumnElem gDraggableHead gcAreaDnD"
		draggable="true"
		:data-column-id="isGroup ? item.___group_type_id : item.___column_id"
		:data-attr-key="item.key"
		:class="{
			'last-dragged': item.frontOptions?.lastDragged,
			error: item.error_data
		}"
		@update:opened="columnsData.onContextMenuClose(item)"
	>
		<template #btn>
			<div class="g-table-header-cell-wrapper">
				<!-- v-tooltip="
			item.error_data ? item.error_data.description : item.name
		" -->
				<div
					class="g-cell g-table-header-cell position-relative"
					:class="{ 'g-table-header-group-cell': isGroup }"
				>
					<div
						v-if="!isReport"
						@click="
							columnsData.sortHandler(
								item,
								item.options?.sort === 'DESC' ? 'ASC' : 'DESC'
							)
						"
						class="g-column-sort-settings-opener"
					></div>

					<div
						v-if="isGroup"
						class="g-cell-button"
						@click="
							item.report_settings?.is_level_folded
								? $emit('groupUnfold')
								: $emit('groupFold')
						"
					>
						<span class="material-icons">{{
							item.report_settings?.is_level_folded
								? 'add'
								: 'remove'
						}}</span>
					</div>

					<span v-if="item.error_data" class="material-icons error"
						>error</span
					>

					<div class="g-table-header-button">
						<div class="column-name-wrapper">
							<div class="flex-row flex-i-center name-block">
								<div>
									<span v-if="!item.layout_name">{{
										item.name
									}}</span>
									<span v-if="item.layout_name">{{
										item.layout_name
									}}</span>
									<span v-if="item.status == 'missing'"
										>(Deleted)</span
									>
								</div>

								<span
									v-if="
										item.options.sort_settings &&
										item.options.sort_settings.mode ===
											'manual'
									"
									class="column-manual-sort-icon"
								>
									m
									<md-tooltip md-direction="top">
										Manual Sorting Activated
									</md-tooltip>
								</span>
							</div>

							<FmBtn
								type="icon"
								:class="[
									'sort',
									item.options.sort ? 'has-sort' : ''
								]"
								:disabled="columnsData.dataIsLoading"
								@click.stop="$emit('sort')"
							>
								<span
									v-show="
										item.options.sort === 'DESC' ||
										!item.options.sort
									"
									class="material-icons gt-sorting-icon"
									>arrow_upward</span
								>
								<span
									v-show="item.options.sort === 'ASC'"
									class="material-icons gt-sorting-icon"
									>arrow_downward</span
								>
							</FmBtn>
						</div>
					</div>
				</div>

				<AngularFmGridTableColumnResizer />

				<div
					class="g-table-header-drop gDraggableHeadArea"
					:data-attr-key="item.key"
				></div>
			</div>
		</template>

		<template #default="{ close }">
			<div class="fm_list">
				<template v-if="isGroup">
					<div
						class="fm_list_item"
						@click="
							columnsData.reportSetSubtotalType(
								item,
								'line',
								close
							)
						"
					>
						<FmIcon
							icon="done"
							v-show="
								item.report_settings.subtotal_type === 'line'
							"
						/>
						<span>Subtotal on Top</span>
					</div>

					<div
						class="fm_list_item"
						@click="
							columnsData.reportSetSubtotalType(
								item,
								'area',
								close
							)
						"
					>
						<FmIcon
							icon="done"
							v-show="
								item.report_settings.subtotal_type == 'area'
							"
						/>
						<span>Subtotal on Bottom</span>
					</div>

					<div
						class="fm_list_item"
						@click="
							columnsData.reportSetSubtotalType(
								item,
								'arealine',
								close
							)
						"
					>
						<FmIcon
							icon="done"
							v-show="
								item.report_settings.subtotal_type == 'arealine'
							"
						/>
						<span>Subtotal on Top and Bottom</span>
					</div>
				</template>

				<div
					class="fm_list_item"
					@click="columnsData.openRenameColumn(item.key, close)"
				>
					Rename
				</div>

				<div
					class="fm_list_item"
					v-if="!columnsData.columnHasCorrespondingGroup(item.key)"
					@click="
						columnsData.addColumnEntityToGrouping(item), close()
					"
				>
					Add to grouping
				</div>

				<div
					class="fm_list_item"
					v-if="
						!isReport ||
						columnsData.columnHasCorrespondingGroup(item.key)
					"
					@click="columnsData.unGroup(item.key, close)"
				>
					Ungroup
				</div>

				<div
					class="fm_list_item"
					v-if="
						columnsData.checkForFilteringBySameAttr(item.key) &&
						viewContext != 'dashboard'
					"
					@click="columnsData.addFiltersWithColAttr(item), close()"
				>
					Add to Filters
				</div>

				<template v-if="item.value_type === 20">
					<hr />

					<div
						class="fm_list_item"
						@click="
							columnsData.openNumberFormatDialog(item.key, close)
						"
					>
						Number Format
					</div>
					<hr />

					<div
						class="fm_list_item"
						@click="
							columnsData.onSubtotalSumClick(item, 1), close()
						"
					>
						<FmIcon icon="done" v-show="isSubtotalSum()" />

						<span>Subtotal SUM</span>
					</div>

					<div
						class="fm_list_item"
						v-if="itemIndex !== 0 && showSubtotalWeighted()"
						@click="columnsData.onSubtotalWeightedClick(item)"
					>
						<FmIcon v-show="isSubtotalWeighted" icon="done" />
						<span>Subtotal Weighted</span>
					</div>

					<div
						class="fm_list_item"
						v-if="itemIndex !== 0 && showSubtotalWeighted()"
						@click="columnsData.onSubtotalAvgWeightedClick(item)"
					>
						<FmIcon icon="done" v-show="isSubtotalAvgWeighted()" />
						<span>Subtotal Avg. Weighted</span>
					</div>

					<div
						class="fm_list_item"
						@click="columnsData.reportHideGrandTotal(item, close)"
					>
						{{
							item.report_settings?.hide_grandtotal
								? 'Show Grand Total'
								: 'Hide Grand Total'
						}}
					</div>

					<hr />

					<button
						class="fm_list_item"
						v-if="itemIndex !== 0 && showSubtotalWeighted()"
						:disabled="isSubtotalWeightedDisabled"
						@click="
							columnsData.selectSubtotalType(
								item,
								2 + 4 * isSubtotalAvgWeighted(),
								close
							)
						"
					>
						<FmIcon
							icon="done"
							v-show="
								!item.frontOptions?.temporaryWeightedActive &&
								(columnsData.getSubtotalFormula(item) === 2 ||
									columnsData.getSubtotalFormula(item) === 6)
							"
						/>

						<span>Market Value</span>
					</button>

					<button
						class="fm_list_item"
						v-if="itemIndex !== 0 && showSubtotalWeighted()"
						:disabled="isSubtotalWeightedDisabled"
						@click="
							columnsData.selectSubtotalType(
								item,
								3 + 4 * isSubtotalAvgWeighted(),
								close
							)
						"
					>
						<FmIcon
							icon="done"
							v-show="
								!item.frontOptions.temporaryWeightedActive &&
								(columnsData.getSubtotalFormula(item) === 3 ||
									columnsData.getSubtotalFormula(item) === 7)
							"
						/>
						<span>Market Value %</span>
					</button>

					<button
						class="fm_list_item"
						v-if="itemIndex !== 0 && showSubtotalWeighted()"
						:disabled="isSubtotalWeightedDisabled"
						@click="
							columnsData.selectSubtotalType(
								item,
								4 + 4 * isSubtotalAvgWeighted(),
								close
							)
						"
					>
						<FmIcon
							icon="done"
							v-show="
								!item.frontOptions.temporaryWeightedActive &&
								(columnsData.getSubtotalFormula(item) === 4 ||
									columnsData.getSubtotalFormula(item) === 8)
							"
						/>
						<span>Exposure</span>
					</button>

					<button
						class="fm_list_item"
						v-if="itemIndex !== 0 && showSubtotalWeighted()"
						:disabled="isSubtotalWeightedDisabled"
						@click="
							columnsData.selectSubtotalType(
								item,
								5 + 4 * isSubtotalAvgWeighted()
							)
						"
					>
						<FmIcon
							icon="done"
							v-show="
								!item.frontOptions.temporaryWeightedActive &&
								(columnsData.getSubtotalFormula(item) === 5 ||
									columnsData.getSubtotalFormula(item) === 9)
							"
						/>
						<span>Exposure %</span>
					</button>
				</template>

				<div
					v-if="item.value_type === 10"
					class="fm_list_item"
					@click="columnsData.editManualSorting($event, item)"
				>
					Manual Sort
				</div>
				<hr />

				<div
					v-if="
						!isReport ||
						!columnsData.columnHasCorrespondingGroup(item.key)
					"
					class="fm_list_item disabled flex aic"
				>
					<FmIcon
						class="i_align"
						icon="format_align_left"
						v-tooltip="'Left alignment'"
						@click="
							columnsData.changeColumnTextAlign(
								item,
								'left',
								close
							)
						"
						:class="{
							active: columnsData.checkColTextAlign(item, 'left')
						}"
					/>

					<FmIcon
						class="i_align"
						icon="format_align_center"
						v-tooltip="'Center alignment'"
						@click="
							columnsData.changeColumnTextAlign(
								item,
								'center',
								close
							)
						"
						:class="{
							active: columnsData.checkColTextAlign(
								item,
								'center'
							)
						}"
					/>

					<FmIcon
						class="i_align"
						icon="format_align_right"
						v-tooltip="'Right alignment'"
						@click="
							columnsData.changeColumnTextAlign(
								item,
								'right',
								close
							)
						"
						:class="{
							active: columnsData.checkColTextAlign(item, 'right')
						}"
					/>
				</div>

				<hr />

				<div
					class="fm_list_item"
					v-if="
						!isReport ||
						columnsData.columnHasCorrespondingGroup(item.key)
					"
					@click="columnsData.removeGroup(item.key, close)"
				>
					Remove
				</div>

				<div
					class="fm_list_item"
					v-if="
						!isReport ||
						!columnsData.columnHasCorrespondingGroup(item.key)
					"
					@click="columnsData.removeColumn(item, close)"
				>
					Remove
				</div>
			</div>
		</template>
	</FmMenu>
</template>

<script setup>
	/*
	 * Supporting component for the
	 * components/Angular/FmGridTable/Columns.vue .
	 * Must always have it as parent.
	 * */

	const props = defineProps({
		item: Object, // column or group
		itemIndex: Number,
		isReport: Boolean,
		isGroup: Boolean,
		/** @values 'dashboard', 'split_panel', undefined */
		viewContext: String
	});

	// eslint-disable-next-line
	const emits = defineEmits(['sort', 'groupFold', 'groupUnfold']);

	/** Methods and variables from components/Angular/FmGridTable/Columns.vue. Reactive. */
	const columnsData = inject('columnsData');

	if (!columnsData) {
		throw new Error(
			'components/Angular/FmGridTable/ColumnCell.vue has not found components/Angular/FmGridTable/Columns.vue as its a parent'
		);
	}

	/*let checkSubtotalFormula = function (column, type) {
		if (column.hasOwnProperty('report_settings') && column.report_settings) {
			if (column.report_settings.subtotal_formula_id === type) {
				return true
			}
		}

		return false
	}*/

	/**
	 * Check whether attribute of column / group allows activating subtotal weighted
	 *
	 * @return {boolean} - true if subtotal weighted allowed
	 */
	let showSubtotalWeighted = function () {
		const withoutSubtotalWeighted = [
			'market_value',
			'market_value_percent',
			'exposure',
			'exposure_percent'
		];

		return !withoutSubtotalWeighted.some(
			(excludedKey) => props.item.key === excludedKey
		);
	};

	function isSubtotalSum() {
		return columnsData.getSubtotalFormula(props.item) === 1;
	}

	/*function isSubtotalWeighted() {

		if (props.item.frontOptions.subtotalWeightedActive) {
			return true;
		}

		const subtotalFormula = columnsData.getSubtotalFormula(props.item)
		return subtotalFormula >= 2 && subtotalFormula <= 5;

	}*/
	const isSubtotalWeighted = computed(() => {
		if (props.item.frontOptions.subtotalWeightedActive) {
			return true;
		}

		const subtotalFormula = columnsData.getSubtotalFormula(props.item);
		return subtotalFormula >= 2 && subtotalFormula <= 5;
	});

	function isSubtotalAvgWeighted() {
		if (props.item.frontOptions.subtotalAvgWeightedActive) {
			return true;
		}

		const subtotalFormula = columnsData.getSubtotalFormula(props.item);
		return subtotalFormula >= 6 && subtotalFormula <= 9;
	}

	const isSubtotalWeightedDisabled = computed(() => {
		return (
			!isSubtotalWeighted.value &&
			!isSubtotalAvgWeighted(props.item) &&
			!props.item.frontOptions.subtotalWeightedActive &&
			!props.item.frontOptions.subtotalAvgWeightedActive
		);
	});
</script>

<style lang="scss" scoped>
	$border: #e0e0e0;

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
			color: var(--card-secondary-text-color);

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
			color: var(--primary-color);
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
