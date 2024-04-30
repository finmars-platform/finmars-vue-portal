<template>
	<div class="filters_container gFiltersContainer" v-bind="$attrs">
		<FmChips
			class="fm_filter_chips"
			:items="chips"
			canDelete
			@chipClick="emitData => emit('openFilterSettings', emitData)"
			@delete="chipData => emit('removeFilter', chipData)"
		>
			<button
				@click="openFiltersAddition"
				class="chip add_filter_btn"
			>ADD FILTER</button>
		</FmChips>
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

	const emit = defineEmits(['addFilters', 'openFilterSettings', 'removeFilter']);

	let attrsSelOpenedRef = ref(false);

	let scope = reactive({});

	let attrsForFiltersRef = ref([]);

	let selAttrsKeysComp = computed(() => {
		return props.filters.map(filter => filter.key);
	});

	function openFiltersAddition() {

		attrsForFiltersRef.value = evAttrsStore.getDataForAttributesSelector(props.content_type);

		attrsSelOpenedRef.value = true;

	}


</script>

<style scoped lang="scss">

.add_filter_btn {
	color: var(--primary-color);
	background-color: initial;
	font-weight: 700;
	border-radius: 16px;
	padding-right: 12px;
	padding-left: 12px;
	// padding: 6px 12px;
	margin: 0 4px;
	font-size: 14px;
	box-sizing: border-box;

	&:not([disabled]):hover {
		background-color: $primary-lighten-2;
	}
}

//# region inside FmChips
:deep(.chip) {
	max-width: 240px;
	height: 33px;
	padding-top: 9px;
	padding-bottom: 9px;
	margin-bottom: 9px;
	cursor: pointer;

	// Only active filters must be orange
	&.active {
		background-color: $primary-lighten-2;
		color: var(--primary-color);

		&:hover {
			background-color: $primary;
			color: #fff;

			.icon {
				color: #fff;
			}

			span.error {
				color: #fff;
			}
		}

		.icon {
			color: var(--primary-color);

			&:hover {
				color: $text-pale2;
			}
		}

	}

	.material-icons:not(.error) {
		color: inherit;
	}
}

:deep(.chip_content) {
	display: flex;
	flex-direction: row;
	align-items: center;

	/*.g-filter-chips-text {
		width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
	}*/
}

:deep(.chip-wrap.use-from-above-filter-chip) {
	.chip {
		padding-top: 5px;
		padding-bottom: 5px;

		/*.material-icons:not(.error) {
			margin-right: 5px;
		}*/
	}
}

:deep( .chip-wrap:not(.use-from-above-filter-chip) ) {
	.chip {
		padding-top: 9px;
		padding-bottom: 9px;

		.chip-list-content {
			&.custom-field-error {
				padding-left: 5px;
			}
		}
	}
}
//# endregion

</style>
