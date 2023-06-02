<template>
	<div
		class="g-table-header-cell-wrapper gColumnElem gDraggableHead gcAreaDnD"
		:class="{
			'last-dragged': column.frontOptions && column.frontOptions.lastDragged,
			error: column.error_data,
		}"
		:data-column-id="column.___column_id"
		:data-attr-key="column.key"
		draggable="true"
	>
		<!-- v-fm-tooltip="
			column?.error_data ? column?.error_data.description : column.name
		" -->
		<div class="g-cell g-table-header-cell position-relative">
			<div
				v-if="!isReport"
				@click="
					sortHandler(column, column?.options.sort === 'DESC' ? 'ASC' : 'DESC')
				"
				class="g-column-sort-settings-opener"
			></div>

			<span v-if="column?.error_data" class="material-icons error">error</span>

			<div class="g-table-header-button">
				<div class="column-name-wrapper">
					<div class="flex-row flex-i-center name-block">
						<div>
							<span v-if="!column.layout_name">{{ column.name }}</span>
							<span v-if="column.layout_name">{{ column.layout_name }}</span>
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
							v-show="column?.options.sort == 'DESC' || !column?.options.sort"
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

<script setup>
	const props = defineProps(['column', 'isReport'])
	const emits = defineEmits(['sort'])
</script>

<style lang="scss" scoped></style>
