<template>
	<div
		class="g-filter-settings"
	>
		<div class="g-filter-header flex sb aic">
			<h4>{{ filterRef.name }}</h4>
			<FmIcon icon="close" @click="emit('cancel')" />
		</div>

		<div class="g-filter-content">
			<AngularFmGridTableRvTextFilter
				v-if="filterRef.value_type === 10 || filterRef.value_type === 30"
			/>

			<AngularFmGridTableRvNumberFilter
				v-if="filterRef.value_type === 20"
			/>

			<!--            <div v-if="filter.value_type === 40" class="m-b-24">
							<rv-date-filter></rv-date-filter>
						</div>

						<div v-if="filter.value_type === 50" class="m-b-24">
							<rv-boolean-filter></rv-boolean-filter>
						</div>-->

			<FmCheckbox
				class="m-b-4"
				v-model="filterRef.options.enabled"
				label="Enabled"
			/>
			<FmCheckbox
				v-model="filterRef.options.exclude_empty_cells"
				label="Exclude cells with no value"
			/>
		</div>

		<div class="g-filter-footer flex sb">
			<FmBtn type="text" @click="emit('cancel')" class="link-button">cancel</FmBtn>
			<FmBtn @click="saveFilterSettings()" class="link-button">APPLY</FmBtn>
		</div>
	</div>
</template>

<script setup>

// stores
// props, emits
import {useIsFilterUseFromAbove} from "~/composables/evRv/useFilters";
import evEvents from "~/angular/services/entityViewerEvents";

let props = defineProps({
	filterKey: {
		type: String,
		required: true,
	}
})

let emit = defineEmits(['cancel', 'save'])
//# region variables, refs, computed
let {evDataService, evEventService} = inject('fmTableData');

// used to determine whether filter becomes use from above filter
let isUseFromAboveFilter = false;

let filterRef = ref(null);

//# endregion

//# region hooks
//# endregion

// watchers

const findFilter = function () {

	const allFilters = evDataService.getFilters();

	isUseFromAboveFilter = false;

	/*allFilters.forEach((filter) => {

		if (isUseFromAbove(filter)) {

			if (filter.key === props.filterKey) {
				filterRef.value = filter
				isUseFromAboveFilter = true
			}

		}
		else {

			if (filter.key === props.filterKey) {
				filterRef.value = filter
			}
		}

	})*/

	let filterData = allFilters.findIndex(
		filter => filter.key === props.filterKey
	);

	if (!filterData) {
		return null;
	}

	filterData = structuredClone(filterData);

	isUseFromAboveFilter = useIsFilterUseFromAbove(filterData);

	return useSetEvRvFilterDefaultOptions(filterData, true);

}

const saveFilterSettings = function () {

	let filtersList = evDataService.getFilters();

	if (isUseFromAboveFilter !== useIsFilterUseFromAbove(filterRef.value) ) {
		// use from above has been toggled

		/* *
		 * Use from above filters must be at the beginning of
		 * an array with filters. Because of that, toggling filter
		 * as 'use from above' changes order of this filter in the array.
		 * */

		let useFromAboveFilters = useFilterUseFromAboveFilters(filtersList);

		let ordinaryFilters = filtersList.filter(filter => {

			return !useFromAboveFilters.find(
				ufaFilter => ufaFilter.key === filter.key
			);

		});

		if (isUseFromAboveFilter) {
			// became ordinary filter

			ordinaryFilters.push( JSON.parse(JSON.stringify(filterRef)) );

			useFromAboveFilters = useFromAboveFilters.filter(
				ufaFilter => ufaFilter.key !== filterRef.value.key
			)

		} else {
			// became use from above filter

			ordinaryFilters = ordinaryFilters.filter(
				filter => filter.key !== filterRef.value.key
			);

			useFromAboveFilters.push( JSON.parse(JSON.stringify(filterRef)) );

		}

	}

	filtersList = useFromAboveFilters.concat(ordinaryFilters);

	evDataService.setFilters(filtersList);
	evEventService.dispatchEvent(evEvents.FILTERS_CHANGE);

	emit('save');

}

const init = function () {
	filterRef.value = findFilter();

	evEventService.addEventListener(evEvents.FILTERS_CHANGE, function () {
		filterRef.value = findFilter();
	})
}

</script>

<style scoped lang="scss">

.g-filter-settings {
	width: 350px;
	background: #fff;
	box-shadow: 0 1px 4px hsl(0deg 0% 40% / 25%);
	border-radius: 5px;
	border: 1px solid $border;
}
h4 {
	font-weight: 600;
}
.g-filter-header {
	border-bottom: 1px solid $border;
	padding: 10px 20px;
}
.g-filter-content {
	padding: 20px;
}
.g-filter-footer {
	padding: 10px 20px;
	border-top: 1px solid $border;
}

</style>
