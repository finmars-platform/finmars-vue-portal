<template>
	<div
		class="g-filters width-100 gFilters"
		:class="{ 'open-filters': areFiltersOpenedRef }"
	>
		<!-- IMPORTANT: for .gFiltersWrap padding should be set by styles, so that scripts can access it -->
		<div class="gFiltersWrap" style="padding: 0px">

			<div class="fm_container ev_toolbar g-filters-holder">

				<div
					class="g-filter-left-part gFiltersLeftPart"
				>
					<FmTableToolbarAddBtnRv v-if="isReport" />

					<FmTableToolbarAddBtnEv v-if="!isReport" />

				</div>

				<div class="gFiltersContainer flex aic fww">
					<FmTableFiltersRv
						v-if="isReport"
						@customFieldsMissing="updateMissingCustomFieldsList"
					/>

					<FmTableFiltersEv v-if="!isReport" />
				</div>

                <div class="flex aic gFiltersRightPart">
                    <FmTableToolbarActionsRv v-if="isReport" />

                    <FmTableToolbarActionsEv v-if="!isReport" />
                </div>
			</div>
			<!--			<template v-if="ready && !$scope.isReport">
							<FmTableFiltersEv />
						</template>-->

			<div
				v-if="viewContext !== 'dashboard' && ready"
				class="drop-area-wrap column-to-filters-drop-area display-none gFiltersDropArea"
			>
				<div class="g-drop-area gDropArea"></div>

				<div class="drop-area-content">
					<span>Drop here to add filters</span>
				</div>
			</div>

			<div
				v-if="viewContext !== 'dashboard' && ready"
				class="drop-area-wrap remove-column-drop-area display-none gDeletionDropArea"
			>
				<div class="g-drop-area gDropArea"></div>

				<div class="drop-area-content">
					<span class="material-icons">delete</span>
				</div>
			</div>

		</div>
		<!-- RowsBulkActionsDirective.vue-->
		<!--		<g-rows-bulk-actions
					v-if="isRootEntityViewer && viewContext !== 'dashboard'"
					ev-data-service="evDataService"
					ev-event-service="evEventService"
					content-wrap-element="contentWrapElement"
				></g-rows-bulk-actions>-->
	</div>
</template>

<script setup>

let {evDataService} = inject('fmTableData');

const isReport = evDataService.isEntityReport();
const viewContext = evDataService.getViewContext();

const ready = ref(false);

const areFiltersOpenedRef = ref(true); // inside dashboard

onMounted(() => {
    ready.value = true;
})

const updateMissingCustomFieldsList = function (errors) {

	const missingCustomFields = [];

	errors.forEach(error => {

		if (!missingCustomFields.find(field => field.key === error.key)) {
			missingCustomFields.push(error);
		}

	});

	evDataService.setMissingCustomFields({forFilters: missingCustomFields});

};

</script>

<style lang="scss" scoped>

.ev_toolbar {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 6px;
    align-items: flex-start;
    justify-content: space-between;
    background: $separ;
    padding-top: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid $border;
}

.g-use-from-above-filters-hidden {
    color: $primary;
}

</style>
