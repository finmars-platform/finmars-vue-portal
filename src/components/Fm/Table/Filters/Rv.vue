<template>

	<div class="fm_table_filters flex-row flex-i-start">

		<button
			type="icon"
			class="g-toggle-filters-btn md-icon-button chain-button m-l-10"
			:class="{
			'g-use-from-above-filters-hidden': !scope.showUseFromAboveFilters,
		}"
			@click="scope.toggleUseFromAboveFilters()"
		>
			<FmIcon icon="link" />
		</button>

		<!-- TODO: create component BasePopup. Use it instead of FmMenu. -->
		<FmMenu
			:opened="!!filterToEditRef"
			:positionX="posXRef"
			:positionY="posYRef"
			:openOnClick="false"
			:minWidth="380"
			:closeOnClickOutside="false"
		>

			<template #btn>
				<FmTableFiltersChips
					:filters="filtersListRef"
					:chips="filtersChipsRef"
					:content_type="contentType"
					v-bind="$attrs"
					@addFilters="addFilter"
					@removeFilter="scope.removeFilter"
					@openFilterSettings="openFilterSettings"
				/>
			</template>

			<FmTableFilterRvSettingsPopup
				:filter="filterToEditRef"
				@close="filterToEditRef = null"
			/>

		</FmMenu>

	</div>

</template>

<script setup>

	import dayjs from 'dayjs'
	import customParseFormat from 'dayjs/plugin/customParseFormat'
	dayjs.extend(customParseFormat)

    import evHelperService from '@/angular/services/entityViewerHelperService';
	import evEvents from "~/angular/services/entityViewerEvents";
	import * as filtersHelper from "@/components/Fm/Table/Filter/filtersHelper"

	let evAttrsStore = useEvAttributesStore();

	let emit = defineEmits(['customFieldsMissing']);

	let {evDataService, evEventService} = inject('fmTableData');

	let scope = reactive({});

	const contentType = evDataService.getContentType();

	let filtersListRef = ref([]);
	let filtersChipsRef = ref([]);
	let useFromAboveFilters = [];

	const customFieldsC = computed(() =>
		evAttrsStore.customFields[contentType]
	);

	watch(
		() => evAttrsStore.customFields[contentType],
		() => {
			filtersChipsRef.value = formatFiltersForChips();
		}
	)

	//# region Chips

	// 1923Move
	scope.filterSettingsChange = function () {
		evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)

		evDataService.resetTableContent(true)

		evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
	}

	scope.toggleUseFromAboveFilters = function () {

        scope.showUseFromAboveFilters = !scope.showUseFromAboveFilters;

        evEventService.dispatchEvent(evEvents.TOGGLE_SHOW_FROM_ABOVE_FILTERS);
        filtersChipsRef.value = formatFiltersForChips();

	}

	/* const getUseFromAboveFilters = function () {

			useFromAboveFilters = filters.filter((filter, index) => {

				if (filter.options && filter.options.use_from_above && Object.keys(filter.options.use_from_above).length) {

					filter.filtersListIndex = index;
					return true;

				}

				return false;

			});

		}; */

	function _checkCustomFieldFilterForError (filter, filterData, customFields) {

		const customField = customFields.find(field => filter.key === `custom_fields.${field.user_code}`)

		if (!customField) {

			filter.options.enabled = false;
			const description = `The ${filter.groups ? 'group' : 'column'} does not exist in the Configuration`

			filterData.error_data = {
				code: 10,
				description: description
			}

			const error = {
				key: filter.key,
				description: description
			}

			return [filter, filterData, error];

		}

		return [filter, filterData, null];

	}

	function _getChipTextElem (filterName, filterValues, filterType) {

		let filterVal = filterValues || "";

		switch (filterType) {
			case 'from_to':
				filterVal = `From ${filterValues.min_value} to ${filterValues.max_value}`;
				break;

			case 'out_of_range':
				filterVal = `Out of range from ${filterValues.min_value} to ${filterValues.max_value}`;
				break;

			case 'multiselector':
				filterVal = filterValues.join(', ');
				break;

			case 'date_tree':
				const formattedDates = filterValues.map(date => dayjs(date).format('YYYY-MM-DD'));
				filterVal = formattedDates.join(', ');
				break;
		}

		return `<span class="g-filter-chips-text">
						<span class="g-filter-chip-name">${filterName}:</span>
						<span class="g-filter-chip-value text-bold"> ${filterVal}</span>
					</span>`;

	}

	const formatFiltersForChips = function () {

		let filtersChips = [];
		const errors = []

		let filtersList = evDataService.getFilters();

		filtersList = filtersList.map((filter) => {

			if (filter.type === 'filter_link') {
				// don't show filter from dashboard component
				return;
			}

			const filterOpts = filter.options || {}

			// hide use from above filters if needed
			if (
				scope.showUseFromAboveFilters ||
				!filterOpts.use_from_above ||
				!Object.keys(filterOpts.use_from_above).length
			) {

				let filterData = {
					id: filter.key,
					isActive: filterOpts.enabled,
				}

				const filterName = filter.layout_name
					? filter.layout_name
					: filter.name

				let chipText = _getChipTextElem(
					filterName,
					filterOpts.filter_values,
					filterOpts.filter_type
				)

				if (
					filterOpts.use_from_above &&
					Object.keys(filterOpts.use_from_above).length
				) {
					filterData.classes = 'use-from-above-filter-chip'
					filterData.tooltipContent = chipText

					chipText = '<span class="material-icons m-r-4">link</span>' + chipText
				}

				filterData.text = chipText

				if (filter.key.startsWith('custom_fields')) {
					let error;

					[filter, filterData, error] =
						_checkCustomFieldFilterForError(
							filter,
							filterData,
							customFieldsC.value
						);

					if (error) errors.push(error)

				}

				filtersChips.push(filterData)
			}

			// filter can be changed by _checkCustomFieldFilterForError
			return filter;

		})

		evDataService.setFilters(filtersList);

		// if (errors.length) scope.vm.updateMissingCustomFieldsList(errors)
		if (errors.length) emit('customFieldsMissing', errors);

		// scope.vm.updateFilterAreaHeight()
		return filtersChips;
	}

	const addFilter = function (attributes) {

        const filtersToAdd = attributes.map(attr => {
            return evHelperService.getTableAttrInFormOf('filter', attr);
        })

        let filtersList = evDataService.getFilters();

        filtersList = filtersList.concat(filtersToAdd);

        evDataService.setFilters(filtersList);
        evEventService.dispatchEvent(evEvents.FILTERS_CHANGE);

	}

	scope.removeFilter = function (filtersToRemove) {

		let filters = evDataService.getFilters();

		filters = filters.filter((filter) => {
			return filtersToRemove.find((item) => item.id !== filter.key)
		})

		evDataService.setFilters(filters)

		evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)
		evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
	}
	//endregion

	//# region Editing of a filter
	let filterToEditRef = ref(null);

	let posXRef = ref(null);
	let posYRef = ref(null);

	const findFilter = function (filterKey) {

		const allFilters = evDataService.getFilters();

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

		let filterData = allFilters.find(
			filter => filter.key === filterKey
		);

		if (!filterData) {
			return null;
		}

		filterData = structuredClone(filterData);

		return useSetEvRvFilterDefaultOptions(filterData, true);

	}

	const openFilterSettings = function(emitData) {

		posXRef.value = emitData.event.clientX;
		posYRef.value = emitData.event.clientY;

		filterToEditRef.value = findFilter(emitData.data.id);

	}
	//# endregion

	const initEventListeners = function () {

		// placed here because formatFiltersForChips() should be called only after customFields update
		/* watcher instead

		evEventService.addEventListener(evEvents.DYNAMIC_ATTRIBUTES_CHANGE, function () {
			customFields = scope.attributeDataService.getCustomFieldsByEntityType(scope.entityType);
			formatFiltersForChips();
		});*/

		evEventService.addEventListener(evEvents.FILTERS_CHANGE, function () {

			const filtersList = evDataService.getFilters();
			filtersListRef.value = filtersList;

			// getUseFromAboveFilters();
			useFromAboveFilters = useFilterUseFromAboveFilters(filtersList);

			filtersChipsRef.value = formatFiltersForChips();

			/*setTimeout(function () { // wait until DOM elems reflow after ng-repeat

				const filterAreaHeightChanged = gFiltersVm.updateFilterAreaHeight();

				if (filterAreaHeightChanged) {
					evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT);
				}

			}, 0); */

		});

		evEventService.addEventListener(evEvents.ACTIVE_OBJECT_FROM_ABOVE_CHANGE, function () {

			if (useFromAboveFilters.length) {
				// UPDATE_TABLE or REQUEST_REPORT dispatched inside gFiltersHelper.insertActiveObjectDataIntoFilters()
				const filtersChangedFromAbove = useInsertActObjIntoEvRvFilters(evDataService, evEventService);

				if (filtersChangedFromAbove) {
					filtersChipsRef.value = formatFiltersForChips();
				}

			}

		});

		evEventService.addEventListener(evEvents.CLEAR_USE_FROM_ABOVE_FILTERS, function () {

			if (useFromAboveFilters.length) {

				let filters = evDataService.getFilters();

				useFromAboveFilters.forEach(ufaFilter => {

					filters[ufaFilter.filtersListIndex].options.filter_values = [];

				});

				evDataService.setFilters(filters);

				evEventService.dispatchEvent(evEvents.FILTERS_CHANGE);

				evDataService.resetTableContent(true);

				evEventService.dispatchEvent(evEvents.UPDATE_TABLE);

			}

		});

	};

	function init() {

		initEventListeners();

		useFromAboveFilters = useFilterUseFromAboveFilters(
			evDataService.getFilters()
		)

		filtersChipsRef.value = formatFiltersForChips();

	}

	init();

</script>

<style scoped lang="scss">

.g-toggle-filters-btn {
	padding: 8px;
  	border-radius: 100%;

	&:not([disabled]):hover {
		background-color: $primary-lighten-2;
		color: $primary;
	}

	&:not(.g-use-from-above-filters-hidden) {

		:deep(.icon) {
			color: $primary;
		}

	}
}

</style>
