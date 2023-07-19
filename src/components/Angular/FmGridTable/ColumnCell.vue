<template>
	<FmMenu
		class="g-table-header-cell-wrapper gColumnElem gDraggableHead gcAreaDnD"
		draggable="true"
		:data-column-id="column.___column_id"
		:data-attr-key="column.key"
		:class="{
			'last-dragged': column.frontOptions && column.frontOptions.lastDragged,
			error: column.error_data,
		}"
		openOn="contextmenu"
	>
		<template #btn>
			<div
				class="g-table-header-cell-wrapper gColumnElem"
				:data-column-id="column.___column_id"
			>
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
								@click="$emit('sort')"
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
				></div></div
		></template>

		<template #default>
			<div class="fm_list">
				<div
					v-if="popupData.data.isAGroup"
					ng-include="'views/popups/entity-viewer/g-rv-group-settings-menu-options.html'"
				></div>
				<div>
					<md-button
						@click="
							popupData.data.renameColumn(
								popupData.data.item.key,
								null,
								$event,
								_$popup
							)
						"
						class="popup-menu-item"
					>
						<!--            <ng-md-icon icon="visibility_off"
										style="visibility: hidden;"></ng-md-icon>-->
						<span class="material-icons" style="visibility: hidden">done</span>
						<span>Rename</span>
					</md-button>
				</div>

				<div
					v-if="
						!popupData.data.columnHasCorrespondingGroup(popupData.data.item.key)
					"
				>
					<md-button
						@click="
							popupData.data.addColumnEntityToGrouping(popupData.data.item)
						"
						class="popup-menu-item"
					>
						<!--            <ng-md-icon icon="visibility_off"
										style="visibility: hidden;"></ng-md-icon>-->
						<span class="material-icons" style="visibility: hidden">done</span>
						<span>Add to grouping</span>
					</md-button>
				</div>

				<div
					v-if="
						!popupData.data.isReport ||
						popupData.data.columnHasCorrespondingGroup(popupData.data.item.key)
					"
				>
					<md-button
						@click="popupData.data.unGroup(popupData.data.item.key, _$popup)"
						class="popup-menu-item"
					>
						<!--            <ng-md-icon icon="visibility_off"
																style="visibility: hidden;"></ng-md-icon>-->
						<span class="material-icons" style="visibility: hidden">done</span>
						<span>Ungroup</span>
					</md-button>
				</div>

				<div>
					<md-button
						data-ng-disabled="!popupData.data.checkForFilteringBySameAttr(popupData.data.item.key) || popupData.data.viewContext === 'dashboard'"
						@click="popupData.data.addFiltersWithColAttr(popupData.data.item)"
						class="popup-menu-item"
					>
						<!--            <ng-md-icon icon="visibility_off"
										style="visibility: hidden;"></ng-md-icon>-->
						<span class="material-icons" style="visibility: hidden">done</span>
						<span>Add to Filters</span>
					</md-button>
				</div>

				<md-menu-divider></md-menu-divider>

				<div>
					<md-button
						@click="popupData.data.openNumberFormatDialog(popupData.data.item)"
						class="popup-menu-item"
					>
						<span class="material-icons" style="visibility: hidden">done</span>
						<span>Number Format</span>
					</md-button>
				</div>

				<md-menu-divider></md-menu-divider>

				<div v-if="popupData.data.$index !== 0">
					<md-button
						@click="popupData.data.onSubtotalSumClick(popupData.data.item, 1)"
						class="popup-menu-item"
					>
						<span
							class="material-icons"
							data-ng-show="popupData.data.isSubtotalSum"
							>done</span
						>
						<span
							class="material-icons"
							data-ng-show="!popupData.data.isSubtotalSum"
							style="visibility: hidden"
							>done</span
						>
						<span>Subtotal SUM</span>
					</md-button>
				</div>

				<div
					v-if="
						popupData.data.$index !== 0 &&
						!popupData.data.isSubtotalWeightedShouldBeExcluded(
							popupData.data.item
						)
					"
				>
					<md-button
						@click="popupData.data.onSubtotalWeightedClick(popupData.data.item)"
						class="popup-menu-item"
					>
						<span
							class="material-icons"
							data-ng-show="popupData.data.isSubtotalWeighted"
							>done</span
						>
						<span
							class="material-icons"
							style="visibility: hidden"
							data-ng-show="!popupData.data.isSubtotalWeighted"
							>done</span
						>
						<span>Subtotal Weighted</span>
					</md-button>
				</div>

				<div
					v-if="
						popupData.data.$index !== 0 &&
						!popupData.data.isSubtotalWeightedShouldBeExcluded(
							popupData.data.item
						)
					"
				>
					<md-button
						@click="
							popupData.data.onSubtotalAvgWeightedClick(popupData.data.item)
						"
						class="popup-menu-item"
					>
						<span
							class="material-icons"
							data-ng-show="popupData.data.isSubtotalAvgWeighted"
							>done</span
						>
						<span
							class="material-icons"
							style="visibility: hidden"
							data-ng-show="!popupData.data.isSubtotalAvgWeighted"
							>done</span
						>
						<span>Subtotal Avg. Weighted</span>
					</md-button>
				</div>

				<div>
					<md-button
						@click="popupData.data.reportHideGrandTotal(popupData.data.item)"
						class="popup-menu-item"
					>
						<ng-md-icon icon="done" style="visibility: hidden"></ng-md-icon>
						<span
							data-ng-show="!popupData.data.item.report_settings.hide_grandtotal"
							>Hide Grand Total</span
						>
						<span
							data-ng-show="popupData.data.item.report_settings.hide_grandtotal"
							>Show Grand Total</span
						>
					</md-button>
				</div>

				<md-menu-divider
					v-if="
						popupData.data.$index !== 0 &&
						!popupData.data.isSubtotalWeightedShouldBeExcluded(
							popupData.data.item
						)
					"
				></md-menu-divider>

				<div
					v-if="
						popupData.data.$index !== 0 &&
						!popupData.data.isSubtotalWeightedShouldBeExcluded(
							popupData.data.item
						)
					"
					data-ng-init="subtotalFormula = popupData.data.getSubtotalFormula(popupData.data.item)"
				>
					<md-button
						@click="
							popupData.data.selectSubtotalType(
								popupData.data.item,
								2 + 4 * popupData.data.isSubtotalAvgWeighted
							)
						"
						class="popup-menu-item"
						data-ng-disabled="!popupData.data.isSubtotalWeighted && !popupData.data.isSubtotalAvgWeighted"
					>
						<span
							class="material-icons"
							data-ng-show="!popupData.data.isTemporaryWeighted && (subtotalFormula === 2 || subtotalFormula === 6)"
							>done</span
						>
						<span
							class="material-icons"
							style="visibility: hidden"
							data-ng-show="popupData.data.isTemporaryWeighted || subtotalFormula !== 2 && subtotalFormula !== 6"
							>done</span
						>
						<span>Market Value</span>
					</md-button>
				</div>

				<div
					v-if="
						popupData.data.$index !== 0 &&
						!popupData.data.isSubtotalWeightedShouldBeExcluded(
							popupData.data.item
						)
					"
					data-ng-init="subtotalFormula = popupData.data.getSubtotalFormula(popupData.data.item)"
				>
					<md-button
						@click="
							popupData.data.selectSubtotalType(
								popupData.data.item,
								3 + 4 * popupData.data.isSubtotalAvgWeighted
							)
						"
						class="popup-menu-item"
						data-ng-disabled="!popupData.data.isSubtotalWeighted && !popupData.data.isSubtotalAvgWeighted"
					>
						<span
							class="material-icons"
							data-ng-show="!popupData.data.isTemporaryWeighted && (subtotalFormula === 3 || subtotalFormula === 7)"
							>done</span
						>
						<span
							class="material-icons"
							style="visibility: hidden"
							data-ng-show="popupData.data.isTemporaryWeighted || subtotalFormula !== 3 && subtotalFormula !== 7"
							>done</span
						>
						<span>Market Value %</span>
					</md-button>
				</div>

				<div
					v-if="
						popupData.data.$index !== 0 &&
						!popupData.data.isSubtotalWeightedShouldBeExcluded(
							popupData.data.item
						)
					"
					data-ng-init="subtotalFormula = popupData.data.getSubtotalFormula(popupData.data.item)"
				>
					<md-button
						@click="
							popupData.data.selectSubtotalType(
								popupData.data.item,
								4 + 4 * popupData.data.isSubtotalAvgWeighted
							)
						"
						class="popup-menu-item"
						data-ng-disabled="!popupData.data.isSubtotalWeighted && !popupData.data.isSubtotalAvgWeighted"
					>
						<span
							class="material-icons"
							data-ng-show="!popupData.data.isTemporaryWeighted && (subtotalFormula === 4 || subtotalFormula === 8)"
							>done</span
						>
						<span
							class="material-icons"
							style="visibility: hidden"
							data-ng-show="popupData.data.isTemporaryWeighted || subtotalFormula !== 4 && subtotalFormula !== 8"
							>done</span
						>
						<span>Exposure</span>
					</md-button>
				</div>

				<div
					v-if="
						popupData.data.$index !== 0 &&
						!popupData.data.isSubtotalWeightedShouldBeExcluded(
							popupData.data.item
						)
					"
					data-ng-init="subtotalFormula = popupData.data.getSubtotalFormula(popupData.data.item)"
				>
					<md-button
						@click="
							popupData.data.selectSubtotalType(
								popupData.data.item,
								5 + 4 * popupData.data.isSubtotalAvgWeighted
							)
						"
						class="popup-menu-item"
						data-ng-disabled="!popupData.data.isSubtotalWeighted && !popupData.data.isSubtotalAvgWeighted"
					>
						<span
							class="material-icons"
							data-ng-show="!popupData.data.isTemporaryWeighted && (subtotalFormula === 5 || subtotalFormula === 9)"
							>done</span
						>
						<span
							class="material-icons"
							style="visibility: hidden"
							data-ng-show="popupData.data.isTemporaryWeighted || subtotalFormula !== 5 && subtotalFormula !== 9"
							>done</span
						>
						<span>Exposure %</span>
					</md-button>
				</div>

				<div
					v-if="
						!popupData.data.isReport ||
						!popupData.data.columnHasCorrespondingGroup(popupData.data.item.key)
					"
					ng-include="'views/popups/groupTable/columnSettings/g-column-alignment-menu-options.html'"
					class="flex-column"
				></div>

				<div
					v-if="
						!popupData.data.isReport ||
						popupData.data.columnHasCorrespondingGroup(popupData.data.item.key)
					"
				>
					<md-button
						@click="
							popupData.data.removeGroup(
								popupData.data.item.___column_id ||
									popupData.data.item.___group_type_id
							)
						"
						class="popup-menu-item"
					>
						<span class="material-icons" style="visibility: hidden">done</span>
						<span>Remove</span>
					</md-button>
				</div>

				<div
					v-if="
						!popupData.data.isReport ||
						!popupData.data.columnHasCorrespondingGroup(popupData.data.item.key)
					"
				>
					<md-button
						@click="popupData.data.removeColumn(popupData.data.item)"
						class="popup-menu-item"
					>
						<span class="material-icons" style="visibility: hidden">done</span>
						<span>Remove</span>
					</md-button>
				</div>
			</div>
		</template>
	</FmMenu>
</template>

<script setup>
	const props = defineProps(['column', 'isReport', 'popupData', 'isGroup'])
	const emits = defineEmits(['sort', 'groupFold', 'groupUnfold'])
</script>

<style lang="scss" scoped></style>
