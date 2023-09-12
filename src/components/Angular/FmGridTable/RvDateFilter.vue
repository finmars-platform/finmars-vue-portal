<template>
	<div class="g-filter-type-n-value flex-row fc-space-between">
		<FmSelect
			class="g-filter-types-select m-b-0"
			v-model="scope.activeFilter.type"
			:items="scope.filterTypes"
			label="Filter type"
			@update:modelValue="scope.changeFilterType(scope.activeFilter.type)"
		/>

		<div class="g-filter-value-wrap">
			<FmInputDate
				v-if="
					scope.filter.options.filter_type !== 'from_to' &&
					scope.filter.options.filter_type !== 'out_of_range' &&
					scope.filter.options.filter_type !== 'date_tree'
				"
				v-model="scope.filter.options.filter_values[0]"
				label="Date"
			/>

			<div
				v-if="
					scope.filter.options.filter_type === 'from_to' ||
					scope.filter.options.filter_type === 'out_of_range'
				"
			>
				<FmInputDate
					v-model="scope.filter.options.min_value"
					label="From (incl)"
				/>

				<FmInputDate
					v-model="scope.filter.options.max_value"
					label="To (incl)"
				/>
			</div>

			<date-tree-input
				class="date-tree height-100"
				v-if="scope.filter.options.filter_type === 'date_tree'"
				title=""
				dates-list="columnRowsContent"
				dates-tree="filter.options.dates_tree"
				nothing-selected-text="Off"
				callback-method="dateTreeChanged(filter.options.dates_tree)"
			></date-tree-input>
		</div>
	</div>
</template>

<script setup>
	import popupEvents from '@/angular/services/events/popupEvents'

	// link: function (scope, elem, attrs, props.vm) {

	const props = defineProps(['vm', 'gFiltersHelper'])

	let scope = reactive({})

	scope.filter = props.vm.filter
	scope.isReport = false
	scope.activeFilter = {
		type: null,
	}

	const openUseFromAboveSettings = async function () {
		;[scope.activeFilter.type, scope.filter.options] =
			await props.gFiltersHelper.openUseFromAboveSettings(
				props.vm.openUseFromAboveSettings(),
				scope.filter.options
			)
	}

	scope.filterTypes = [
		{ name: 'Equal', id: 'equal' },
		{ name: 'Not equal', id: 'not_equal' },
		{ name: 'Greater than', id: 'greater' },
		{ name: 'Greater or equal to', id: 'greater_equal' },
		{ name: 'Less than', id: 'less' },
		{ name: 'Less or equal to', id: 'less_equal' },
		{ name: 'From ... to ... (incl)', id: 'from_to' },
		{ name: 'Out of range (incl)', id: 'out_of_range' },
		{ name: 'Empty cells', id: 'empty' },
		{ name: 'Date tree', id: 'date_tree' },

		{
			name: 'Linked',
			id: 'use_from_above',
			onClick: openUseFromAboveSettings,
		},
	]

	scope.readyStatus = true

	scope.dateTreeChanged = function (dateTree) {
		scope.filter.options.filter_values =
			props.gFiltersHelper.convertDatesTreeToFlatList(dateTree)
	}

	scope.changeFilterType = async function (filterType) {
		if (filterType !== 'use_from_above') {
			scope.filter.options.use_from_above = {}

			const resultList = props.gFiltersHelper.emptyDateFilter(
				filterType,
				scope.filter.options
			)
			scope.activeFilter.type = resultList[0]
			scope.filter.options = resultList[1]
		}
	}

	const init = function () {
		scope.activeFilter.type = props.vm.getActiveFilterType(scope.filterTypes)

		if (!props.vm.columnRowsContent || !props.vm.columnRowsContent.length) {
			props.vm.getDataForSelects()
		}

		scope.columnRowsContent = props.vm.columnRowsContent
	}

	init()

	props.vm.popupEventService.addEventListener(
		popupEvents.CLOSE_POPUP,
		function () {
			scope.$destroy()
		}
	)
</script>

<style lang="scss" scoped>
	.g-filter-settings {
		position: absolute;
		left: 0;
		top: 50px;
		width: 300px;
		background: #fff;
		z-index: 111;
	}
	.g-filter-type-n-value {
		display: grid;
		grid-template-columns: repeat(2, 49%);
	}
</style>
