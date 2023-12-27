<template>
	<FmTableFilterBase
		:readyStatus="true"
		:filterType="filterTypeC"
		:types="filterTypes"
		@update:filterType="changeFilterType"
	>

		<div
			v-if="
					filter.options.filter_type !== 'from_to' &&
					filter.options.filter_type !== 'out_of_range'
				"
			class="height-100"
		>
			<BaseInput
				:modelValue="filter.options.filter_values[0]"
				type="number"
				label="Value"
				class="ci-placeholder2 m-b-0"
				@update:modelValue="newVal => changeFilterValue( [newVal] )"
			/>
		</div>

		<div
			v-if="
					filter.options.filter_type === 'from_to' ||
					filter.options.filter_type === 'out_of_range'
				"
			class="height-100"
		>
			<BaseInput
				:modelValue="filter.options.filter_values.min_value"
				type="number"
				label="From (incl)"
				class="g-filter-tnv-back g-filter-input no-input-arrows"
				@update:modelValue="changeMinVal"
			/>

			<BaseInput
				type="number"
				:modelValue="filter.options.filter_values.max_value"
				label="To (incl)"
				class="g-filter-tnv-back g-filter-input no-input-arrows"
				@update:modelValue="changeMaxVal"
			/>
		</div>

	</FmTableFilterBase>
</template>

<script setup>
/* *
 * Supporting component for the
 * components/Fm/Table/Filter/RvSettings/Popup.vue
 * Must always have it as the direct parent.
 * */

import * as gFiltersHelper from "@/components/Fm/Table/Filter/filtersHelper"

// stores
// props, emits
const props = defineProps({
	/** Do not change directly. Use emit('filterOptionsChanged', changedData) instead. */
	filter: {
		type: Object,
		required: true,
	},
	/* *
	 * Because of 'use from above' mode
	 * can not just use filter.options.filter_type
	 * */
	getActiveFilterType: Function,
})

const emit = defineEmits([
	'filterOptionsChanged',
	'openUseFromAboveSettings',
]);

//# region variables, refs, computed
function openUseFromAboveSettings () {
	/*[scope.activeFilter.type, filter.options] =
		await props.gFiltersHelper.openUseFromAboveSettings(
			props.openUseFromAboveSettings(),
			filter.options
		);*/
	emit('openUseFromAboveSettings');
}

const filterTypes = [
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

const filterTypeC = computed(() => {
	/* *
     * when reception of active filter type needs to update
     * modify getActiveFilterType inside FmTableFilterRvSettingsPopup
	 * */
	return props.getActiveFilterType(props.filter, filterTypes);
})
//# endregion

const changeFilterType = function (filterType) {

	if (filterType === 'use_from_above') {
		emit('openUseFromAboveSettings');
		return;
	}

	let filterOpts = JSON.parse(JSON.stringify( props.filter.options ));

	filterOpts.use_from_above = {}

	const resultList = gFiltersHelper.emptyNumberFilter(
		filterType,
		filterOpts,
	);

	filterOpts = resultList[1]

	emit('filterOptionsChanged', filterOpts)

};

const changeFilterValue = function (newVal) {

	let filterOptions = JSON.parse(JSON.stringify( props.filter.options ));

	filterOptions.filter_values = newVal;

	emit('filterOptionsChanged', filterOptions)

}

const changeMinVal = function (newVal) {
	changeFilterValue({
		min_value: newVal,
		max_value: props.filter.options.filter_values.max_value,
	});
};

const changeMaxVal = function (newVal) {
	changeFilterValue({
		min_value: props.filter.options.filter_values.min_value,
		max_value: newVal,
	});
};

</script>

<style scoped lang="scss">

</style>
