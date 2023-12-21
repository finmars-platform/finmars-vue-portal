<template>
<!--	<div
		v-bind="$attrs"
		v-if="readyStatusRef"
		class="g-filter-type-n-value flex-row fc-space-between m-b-16"
	>
		<FmSelect
			class="g-filter-types-select m-b-0"
			:modelValue="filterTypeC"
			:items="filterTypes"
			label="Filter type"
			@update:modelValue="scope.changeFilterType"
		/>

		<div class="g-filter-value-wrap">
			<div
				v-if="
					filter.options.filter_type !== 'multiselector' &&
					filter.options.filter_type !== 'selector'
				"
				class="height-100"
			>
				<BaseInput
					class="ci-placeholder2 m-b-0"
					:modelValue="filter.options.filter_values[0]"
					label="Value"
					@update:modelValue="newVal => changeFilterValue( [newVal] )"
				/>
			</div>

			<div
				v-if="filter.options.filter_type === 'selector'"
				class="height-100"
			>
				<FmSelect
					v-model="filter.options.filter_values[0]"
					:items="optionsRef"
				/>
			</div>

			<div
				v-if="filter.options.filter_type === 'multiselector'"
				class="height-100 g-filter-multiselector"
			>
				<BaseMultiSelectInput
					:modelValue="filter.options.filter_values"
					:modalTitle="
						`${filter.name}. Regime = ${filter.options.filter_type}`
					"
					:items="optionsRef"
					item_id="id"
					@update:modelValue="changeFilterValue"
				/>
			</div>
		</div>
	</div>

	<div
		v-else
		class="g-filter-type-loader flex-row fc-space-around fi-center m-b-16"
	>
		<FmLoader></FmLoader>
	</div>-->
	<FmTableFilterBase
		:readyStatus="readyStatusRef"
		:filterType="filterTypeC"
		:types="filterTypes"
		@update:filterType="scope.changeFilterType"
	>

		<div
			v-if="
					filter.options.filter_type !== 'multiselector' &&
					filter.options.filter_type !== 'selector'
				"
			class="height-100"
		>
			<BaseInput
				class="ci-placeholder2 m-b-0"
				:modelValue="filter.options.filter_values[0]"
				label="Value"
				@update:modelValue="newVal => changeFilterValue( [newVal] )"
			/>
		</div>

		<div
			v-if="filter.options.filter_type === 'selector'"
			class="height-100"
		>
			<FmSelect
				v-model="filter.options.filter_values[0]"
				:items="optionsRef"
			/>
		</div>

		<div
			v-if="filter.options.filter_type === 'multiselector'"
			class="height-100 g-filter-multiselector"
		>
			<BaseMultiSelectInput
				:modelValue="filter.options.filter_values"
				:modalTitle="
						`${filter.name}. Regime = ${filter.options.filter_type}`
					"
				:items="optionsRef"
				item_id="id"
				@update:modelValue="changeFilterValue"
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
});

const emit = defineEmits([
	'filterOptionsChanged',
	'openUseFromAboveModal',
]);

//# region variables, refs, computed
let scope = reactive({})

/*scope.getMultiselectorName = function () {
	return (
		filter.name + '. ' + 'Regime = ' + filter.options.filter_type
	)
}*/
let readyStatusRef = ref(false);

// Unique values of an attribute inside rv rows
let optionsRef = ref([]);

const multiselectorTitleComp = computed(() => {
	return `${filter.name}. Regime = ${filter.options.filter_type}`;
})
//# endregion

//# region hooks
//# endregion

// watchers

const openUseFromAboveSettings = function () {
	/*[scope.activeFilter.type, filter.options] =
		await props.gFiltersHelper.openUseFromAboveSettings(
			props.openUseFromAboveSettings(),
			filter.options
		);*/
	emit('openUseFromAboveModal');
}

const filterTypes = [
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
];

const filterTypeC = computed(() =>
	props.getActiveFilterType(props.filter, filterTypes)
)

scope.changeFilterType = async function (filterType) {

	if (filterType === 'use_from_above') {
		return;
	}

	let filterOpts = JSON.parse(JSON.stringify( props.filter.options ));

	filterOpts.use_from_above = {}
	// openUseFromAboveSettings() responsible for setting 'use_from_above' into scope.activeFilterType

	/* scope.activeFilter.type = filterType;
				filter.options.filter_type = scope.activeFilter.type;

				if (scope.activeFilter.type === 'empty') {
					filter.options.exclude_empty_cells = false;
				}

				filter.options.filter_values = []; */
	const resultList = gFiltersHelper.emptyTextFilter(
		filterType,
		filterOpts
	)

	filterOpts = resultList[1]

	if ( ['selector', 'multiselector'].includes(filterOpts.filter_type) ) {

		readyStatusRef.value = false;

		optionsRef.value = await props.getDataForSelects();

		readyStatusRef.value = true;

	}

	emit('filterOptionsChanged', filterOpts)

}

/**
 *
 * @param {Array} newVal
 */
const changeFilterValue = function (newVal) {

	let filterOptions = JSON.parse(JSON.stringify( props.filter.options ));

	filterOptions.filter_values = newVal;

	emit('filterOptionsChanged', filterOptions)

}

async function init() {
	console.log(
		"testing1923.FmTableFilterRvSettingsText props.filterType",
		props.filterType
	);

	if ( ['selector', 'multiselector']
			.includes(props.filter.options.filter_type) ) {

		optionsRef.value = await props.getDataForSelects();

	}

	readyStatusRef.value = true;

}

init();

</script>

<style scoped lang="scss">

</style>
