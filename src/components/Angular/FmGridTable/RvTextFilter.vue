<template>
	<div
		v-bind="$attrs"
		v-if="scope.readyStatus"
		class="g-filter-type-n-value flex-row fc-space-between m-b-16"
	>
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
					scope.filter.options.filter_type !== 'multiselector' &&
					scope.filter.options.filter_type !== 'selector'
				"
				class="height-100"
			>
				<BaseInput
					class="ci-placeholder2 m-b-0"
					v-model="vm.filter.options.filter_values[0]"
					label="Value"
				/>
			</div>

			<div
				v-if="scope.filter.options.filter_type === 'selector'"
				class="height-100"
			>
				<FmSelect
					v-model="scope.filter.options.filter_values[0]"
					:items="columnRowsContent"
				/>
			</div>

			<div
				v-if="scope.filter.options.filter_type === 'multiselector'"
				class="height-100 g-filter-multiselector"
			>
				<two-fields-multiselect
					dialog-title="{{getMultiselectorName()}}"
					items="columnRowsContent"
					model="filter.options.filter_values"
					selected-items-indication="chips"
					nothing-selected-text="Off"
					small-options="{'dialogParent': '.dialog-containers-wrap'}"
				></two-fields-multiselect>
			</div>
		</div>
	</div>

	<div v-else class="g-filter-type-loader flex-row fc-space-around fi-center">
		<FmLoader></FmLoader>
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
	}

	scope.filterTypes = [
		{ name: 'Equal', id: 'equal' },
		{ name: 'Contains', id: 'contains' },
		{ name: 'Has substring', id: 'contains_has_substring' },
		// {name: 'Does not contains', id: 'does_not_contains'},
		{ name: 'Select', id: 'selector' },
		{ name: 'Multiple Select', id: 'multiselector' },
		{ name: 'Empty cells', id: 'empty' },

		{
			name: 'Linked',
			id: 'use_from_above',
			onClick: openUseFromAboveSettings,
		},
	]

	scope.changeFilterType = function (filterType) {
		if (filterType !== 'use_from_above') {
			scope.filter.options.use_from_above = {}
			// openUseFromAboveSettings() responsible for setting 'use_from_above' into scope.activeFilterType

			/* scope.activeFilter.type = filterType;
						scope.filter.options.filter_type = scope.activeFilter.type;

						if (scope.activeFilter.type === 'empty') {
							scope.filter.options.exclude_empty_cells = false;
						}

						scope.filter.options.filter_values = []; */
			const resultList = props.gFiltersHelper.emptyTextFilter(
				filterType,
				scope.filter.options
			)
			scope.activeFilter.type = resultList[0]
			scope.filter.options = resultList[1]
		}
	}

	scope.getMultiselectorName = function () {
		return (
			scope.filter.name + '. ' + 'Regime = ' + scope.filter.options.filter_type
		)
	}

	const init = function () {
		scope.activeFilter.type = props.vm.getActiveFilterType(scope.filterTypes)

		if (!props.vm.columnRowsContent || !props.vm.columnRowsContent.length) {
			props.vm.getDataForSelects()
		}

		scope.columnRowsContent = props.vm.columnRowsContent
		scope.readyStatus = true
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
