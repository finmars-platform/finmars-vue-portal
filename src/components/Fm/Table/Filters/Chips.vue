<template>
	<div class="gFiltersContainer" v-bind="$attrs">
		<FmMenu
			:opened="showFilterSettingsRef"
			:positionX="posXRef"
			:positionY="posYRef"
			:openOnClick="false"
			:closeOnCLickOutside="false"
		>
			<template #btn>
				<FmChips
					class="g-filter-chips"
					:items="chips"
					canDelete
					@chipClick="scope.onFilterChipClick"
					@delete="chipData => emit('removeFilter', chipData)"
				>
					<FmBtn
						type="action"
						@click="openFiltersAddition"
						style="margin: 2px 0"
					>ADD FILTER</FmBtn>
				</FmChips>
			</template>

		</FmMenu>
		<!--		<div ng-if="!isReport">
					<g-ev-filters ev-data-service="evDataService"
								  ev-event-service="evEventService"
								  attribute-data-service="attributeDataService"></g-ev-filters>
				</div>-->
	</div>

	<FmAttributesSelectModal
		v-model="attrsSelOpenedRef"
		title="Add filters"
		:content_type="content_type"
		:attributes="attrsForFiltersRef"
		:selected="selAttrsKeysComp"
		:disabledAttributes="selAttrsKeysComp"
		:multiselect="true"
		@selectedAttributesChanged="selected => emit('addFilters', selected)"
	/>

</template>

<script setup>
	/*
	 * Supporting component for the
	 * components/Fm/Table/Filters/Rv.vue, components/Fm/Table/Filters/Ev.vue.
	 * Must always have it as the parent.
	 * */

	let evAttrsStore = useEvAttributesStore();

	let props = defineProps({
		filters: {
			type: Array,
			required: true,
		},
		chips: Array,
		content_type: {
			type: String,
			required: true,
		},
	});

	const emit = defineEmits(['addFilters', 'removeFilter']);

	let attrsSelOpenedRef = ref(false);
	let showFilterSettingsRef = ref(false);

	let posXRef = ref(0);
	let posYRef = ref(0);

	let scope = reactive({});

	let attrsForFiltersRef = ref([]);

	let selAttrsKeysComp = computed(() => {
		return props.filters.map(filter => filter.key);
	});

	scope.onFilterChipClick = (emitData) => {

		// scope.popupData.filterKey = emitData.data.id;

		posXRef.value = emitData.event.clientX;
		posYRef.value = emitData.event.clientY;

		showFilterSettingsRef.value = true;

	}

	function openFiltersAddition() {

		attrsForFiltersRef.value = evAttrsStore.getDataForAttributesSelector(props.content_type);

		attrsSelOpenedRef.value = true;

	}


</script>

<style scoped lang="scss">

</style>
