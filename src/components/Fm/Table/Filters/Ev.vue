<template>

	<!-- <md-button
							v-if="scope.thereAreFrontendFilters"
							class="g-toggle-filters-btn md-icon-button"
							@click="toggleFiltersToShow()"
						>
							<span
								v-show="scope.shownFiltersType === 'frontend'"
								class="material-icons"
								>laptop_mac</span
							>
							<span
								v-show="scope.shownFiltersType === 'backend'"
								class="material-icons"
								>dns</span
							>
						</md-button> -->

	<FmBtn
		v-if="thereAreFrontendFiltersRef"
		type="text"
		class="g-toggle-filters-btn"
		@click="toggleFiltersToShow()"
	>
		<span
			v-show="scope.shownFiltersType == 'frontend'"
			class="material-icons"
		>
			laptop_mac
		</span>

		<span
			v-show="scope.shownFiltersType == 'backend'"
			class="material-icons"
		>
			dns
		</span>

	</FmBtn>

</template>

<script setup>

// stores
// props, emits

//# region variables, refs, computed
let scope = reactive({});
const thereAreFrontendFiltersRef = ref(false);

function toggleFiltersToShow() {

}
//# endregion

//# region hooks
//# endregion

// watchers
</script>

<style scoped lang="scss">

</style>
