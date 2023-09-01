<template>
	<div class="g-filter-type-n-value flex-row fc-space-between aifs m-b-16">
		<FmSelect
			class="g-filter-types-select m-b-0"
			v-model="scope.activeFilter.type"
			:items="scope.filterTypes"
			label="Filter type"
			@update:modelValue="scope.changeFilterType(scope.activeFilter.type)"
		/>

		<div class="g-filter-value-wrap">
			<div
				v-if="
					scope.filter.options.filter_type !== 'from_to' &&
					scope.filter.options.filter_type !== 'out_of_range'
				"
				class="height-100"
			>
				<BaseInput
					class="g-filter-tnv-back g-filter-input no-input-arrows m-b-0"
					type="number"
					v-model="scope.filter.options.filter_values[0]"
					label="Value"
				/>
			</div>

			<div
				v-if="
					scope.filter.options.filter_type === 'from_to' ||
					scope.filter.options.filter_type === 'out_of_range'
				"
				class="height-100"
			>
				<BaseInput
					type="number"
					v-model="scope.filter.options.filter_values.min_value"
					label="From (incl)"
					class="g-filter-tnv-back g-filter-input no-input-arrows"
				/>

				<BaseInput
					type="number"
					v-model="scope.filter.options.filter_values.max_value"
					label="To (incl)"
					class="g-filter-tnv-back g-filter-input no-input-arrows"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
	import popupEvents from '@/angular/services/events/popupEvents'

	const props = defineProps(['vm', 'gFiltersHelper'])

	let scope = reactive({})
	// export default function (gFiltersHelper) {

	// link: function (scope, elem, attrs) {
	scope.filter = props.vm.filter
	scope.isReport = true
	scope.activeFilter = {
		type: null,
	}

	const openUseFromAboveSettings = async function () {
		;[scope.activeFilter.type, scope.filter.options] =
			await props.gFiltersHelper.openUseFromAboveSettings(
				props.vm.openUseFromAboveSettings(),
				scope.filter.options
			)
		scope.$apply()
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

		{
			name: 'Linked',
			id: 'use_from_above',
			onClick: openUseFromAboveSettings,
		},
	]

	scope.readyStatus = true

	scope.changeFilterType = function (filterType) {
		/* scope.filter.options.filter_type = scope.activeFilter.type;

					if (scope.activeFilter.type === 'from_to' || scope.activeFilter.type === 'out_of_range') {

						scope.filter.options.filter_values = {}

					} else {

						if (scope.activeFilter.type === 'empty') {
							scope.filter.options.exclude_empty_cells = false;
						}

						scope.filter.options.filter_values = [];

					} */

		if (filterType !== 'use_from_above') {
			scope.filter.options.use_from_above = {}

			const resultList = props.gFiltersHelper.emptyNumberFilter(
				filterType,
				scope.filter.options
			)
			scope.activeFilter.type = resultList[0]
			scope.filter.options = resultList[1]
		}
	}

	const initEventListeners = function () {
		props.vm.popupEventService.addEventListener(
			popupEvents.CLOSE_POPUP,
			function () {
				scope.$destroy()
			}
		)
	}

	const init = function () {
		scope.activeFilter.type = props.vm.getActiveFilterType(scope.filterTypes)

		initEventListeners()
	}

	init()
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
