<template>
	<div
		class="g-filter-settings g-filter-popup-content"
	>

		<div class="g-filter-header flex sb aic">

			<div class="flex flex-i-center">
				<FmCheckbox
					v-model="filterRef.options.enabled"
				/>

				<h4>{{ filterRef.name }}</h4>
			</div>

			<FmIcon icon="close" @click="emit('close')" />

		</div>

		<div class="g-filter-content">
<!--			<AngularFmGridTableRvTextFilter
				v-if="filterRef.value_type === 10 || filterRef.value_type === 30"
			/>-->
			<FmTableFilterRvSettingsText
				v-if="filter.value_type === 10 || filterRef.value_type === 30"
				:filter="filterRef"
				:getActiveFilterType="getActiveFilterType"
				:getDataForSelects="getDataForSelects"
				@filterOptionsChanged="newVal => filterRef.options = newVal"
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
<!--			<FmCheckbox-->
<!--				v-model="filterRef.options.exclude_empty_cells"-->
<!--				label="Exclude cells with no value"-->
<!--			/>-->

		</div>

		<div class="g-filter-footer flex-row fc-flex-end">
			<FmBtn type="basic" @click="saveFilterSettings()" class="link-button">APPLY</FmBtn>
		</div>
	</div>
</template>

<script setup>

// stores
// props, emits
import evEvents from "~/angular/services/entityViewerEvents";
import * as filtersHelper from "~/components/Fm/Table/Filter/filtersHelper";

let evAttrsStore = useEvAttributesStore();

let props = defineProps({
	filter: {
		type: Object,
		required: true,
	}
})

let emit = defineEmits(['close'])
//# region variables, refs, computed
let {evDataService, evEventService} = inject('fmTableData');

const contentType = evDataService.getContentType();

// used to determine whether filter becomes use from above filter
let isUseFromAboveFilter = false;

/**
 *
 * @type {Ref<Object>}
 */
let filterRef = ref(null);
let attrsList = [];

//# endregion

//# region hooks
//# endregion

const getActiveFilterType = (filter, filterTypesList) => {

	if ( useIsFilterUseFromAbove(filterRef.value) ) {

		return 'use_from_above';

	} else {

		const activeType = filterTypesList.find(type => {
			// return type.value === vm.filter.options.filter_type;
			return type.id === filterRef.value.options.filter_type;
		});

		// return activeType ? activeType.value : null;
		return activeType ? activeType.id : null;

	}

};

const getDataForSelects = async function () {

	/* var columnRowsContent  = userFilterService.getCellValueByKey(vm.evDataService, filterRef.value.key);

	vm.columnRowsContent = columnRowsContent.map(userFilterService.mapColRowsContent); */

	let filterAttr = attrsList.find(attr => attr.key === filterRef.value.key);
	let key = filterRef.value.key; // for dynamic attribute

	if ( !key.includes('attributes.') ) { // not a dynamic attribute

		const keyParts = filterRef.value.key.split(".");
		key = keyParts.at(-1);

	}

	const opts = {
		filters: {
			content_type: filterAttr.content_type,
			key: key,
			value_type: filterRef.value.value_type,
		}
	};

	const res = await useApi(
		"specificDataValuesForSelect.get", opts
	)

	if (filterRef.value.value_type === 40) {
		// there is data processing inside rvDateFilterDirective
		return res;

	} else {
		return res.results.map( filtersHelper.mapColRowsContent );
	}

};

const processUseFromAboveToggle = function (filtersList) {

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

		ordinaryFilters.push( JSON.parse(JSON.stringify(filterRef.value)) );

		useFromAboveFilters = useFromAboveFilters.filter(
			ufaFilter => ufaFilter.key !== filterRef.value.key
		)

	} else {
		// became use from above filter

		ordinaryFilters = ordinaryFilters.filter(
			filter => filter.key !== filterRef.value.key
		);

		useFromAboveFilters.push( JSON.parse(JSON.stringify(filterRef.value)) );

	}

	return useFromAboveFilters.concat(ordinaryFilters);

}

const saveFilterSettings = function () {

	let filtersList = evDataService.getFilters();

	if (isUseFromAboveFilter !== useIsFilterUseFromAbove(filterRef.value) ) {
		// use from above has been toggled

		filtersList = processUseFromAboveToggle(filtersList);

	} else {

		const index = filtersList.findIndex(
			filter => filter.key === filterRef.value.key
		);

		filtersList[index] = JSON.parse(JSON.stringify( filterRef.value ));

	}

	evDataService.setFilters(filtersList);
	evEventService.dispatchEvent(evEvents.FILTERS_CHANGE);

	emit('close');

}

const init = function () {

	filterRef.value = JSON.parse(JSON.stringify(props.filter));

	attrsList = evAttrsStore.getAllAttributesByContentType(contentType);

}

init();

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
}

</style>
