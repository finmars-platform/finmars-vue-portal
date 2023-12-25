<template>
    <FmTableFilterBase
        :readyStatus="readyStatusRef"
        :filterType="filterTypeC"
        :types="filterTypes"
        @update:filterType="changeFilterType"
    >

		<div v-if="filter.options.filter_type === 'date_tree'"
			 class="date-tree height-100">

<!--			<date-tree-input data-title=""
							 data-dates-list="columnRowsContent"
							 data-dates-tree="filter.options.dates_tree"
							 data-nothing-selected-text="Off"
							 data-callback-method="dateTreeChanged(filter.options.dates_tree)"></date-tree-input>-->
			<FmDateTreeInput
				:datesTree="filter.options.dates_tree"
				:options="dateTreeOptsList"
				placeholder="Off"
				@update:datesTree="datesTreeChanged"
			/>

		</div>

        <div
            v-else-if="
					filter.options.filter_type === 'from_to' ||
					filter.options.filter_type === 'out_of_range'
				"
            class="height-100"
        >
			<FmInputDate
				:modelValue="filter.options.filter_values.min_value"
				label="From (incl)"
				class="g-filter-tnv-back g-filter-input no-input-arrows"
				@update:modelValue="changeMinVal"
			/>

			<FmInputDate
				:modelValue="filter.options.filter_values.max_value"
				label="To (incl)"
				class="g-filter-tnv-back g-filter-input no-input-arrows"
				@update:modelValue="changeMaxVal"
			/>
        </div>

        <div
            v-else
            class="height-100"
        >
            <FmInputDate
                :modelValue="filter.options.filter_values[0]"
                class="g-filter-tnv-back g-filter-input no-input-arrows"
                @update:modelValue="newVal => changeFilterValue( [newVal] )"
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
	getDataForSelects: Function,
})

const emit = defineEmits([
    'filterOptionsChanged',
    'openUseFromAboveModal',
]);
console.log("testing1923.filterDate filter ", props.filter);
//# region variables, refs, computed

let readyStatusRef = ref(false);
let dateTreeOptsList = ref([]);

function openUseFromAboveSettings () {
    /*[scope.activeFilter.type, filter.options] =
        await props.gFiltersHelper.openUseFromAboveSettings(
            props.openUseFromAboveSettings(),
            filter.options
        );*/
    emit('openUseFromAboveModal');
}

const filterTypes = [
	{name: 'Equal', id: 'equal'},
	{name: 'Not equal', id: 'not_equal'},
	{name: 'Greater than', id: 'greater'},
	{name: 'Greater or equal to', id: 'greater_equal'},
	{name: 'Less than', id: 'less'},
	{name: 'Less or equal to', id: 'less_equal'},
	{name: 'From ... to ... (incl)', id: 'from_to'},
	{name: 'Out of range (incl)', id: 'out_of_range'},
	{name: 'Empty cells', id: 'empty'},
	{name: 'Date tree', id: 'date_tree'},

	{
        name: 'Linked',
        id: 'use_from_above',
        onClick: openUseFromAboveSettings,
    },
]

const filterTypeC = computed(() => {
	/* *
     * when reception of active filter type needs to update
     * modify function getActiveFilterType inside FmTableFilterRvSettingsPopup
	 * */
	return props.getActiveFilterType(props.filter, filterTypes);
})
//# endregion

//# region hooks
//# endregion

const getDataForSelects = async function () {

	readyStatusRef.value = false;

	const res = await props.getDataForSelects();

	/*scope.columnRowsContent = res.results.map(cRowsContent => {
		return {value: cRowsContent};
	});*/

	readyStatusRef.value = true;

	return res.results.map(value => {
		return {value: value};
	});

};


const changeFilterType = async function (filterType) {

	if (filterType === 'use_from_above') {
		return;
	}

	let filterOpts = JSON.parse(JSON.stringify( props.filter.options ));

	filterOpts.use_from_above = {};

	const resultList = gFiltersHelper.emptyDateFilter(
		filterType,
		filterOpts,
	);

	filterOpts = resultList[1];

	if (filterOpts.filter_type === 'date_tree') {

		dateTreeOptsList.value = await getDataForSelects();

	}

	emit('filterOptionsChanged', filterOpts);

}

const changeFilterValue = function (newVal) {
	console.log("testing1923.filterDate changeFilterValue", newVal);
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

const datesTreeChanged = function (newVal) {
	console.log("testing1923.filterDate datesTreeChanged", newVal);
	let filterOptions = JSON.parse(JSON.stringify( props.filter.options ));

	filterOptions.filter_values = gFiltersHelper.convertDatesTreeToFlatList(newVal);
	filterOptions.dates_tree = newVal;
	console.log("testing1923.filterDate datesTreeChanged ашдеукЩзешщты",
		filterOptions);
	emit('filterOptionsChanged', filterOptions);

}

async function init () {

	if (props.filter.options.filter_type === 'date_tree') {

		dateTreeOptsList.value = await getDataForSelects();
		// readyStatusRef will be set to 'true' by getDataForSelects()
		console.log("testing1923.filterDate", dateTreeOptsList.value);
	} else {
		readyStatusRef.value = true;
	}

}

init();

</script>

<style scoped lang="scss">

</style>
