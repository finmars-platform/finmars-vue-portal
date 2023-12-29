<template>
	<div>

		<div class="entity-editor-fixed-area"
			 data-ng-class="{'disabled-element': !vm.entity.is_enabled && vm.hasEnabledStatus}">

			<div class="entity-editor-fa-row">
				<!-- Fixed area content here -->
			</div>

		</div>

		<div>
			<div class="flex-row position-relative">
				<div class="">
					<FmTabs v-if="userTabs && userTabs.length" />
				</div>

				<FmMenu v-if="systemTabs && systemTabs.length">

					<template #btn>
						<FmBtn type="icon" icon="arrow_drop_down" />
					</template>

					<div class="fm_list">
						<div
							v-for="tab in systemTabs"
							class="fm_list_item"
						>

						</div>
					</div>
				</FmMenu>

			</div>

			<div class="tab_content_container">

				<!--
				Component here that will be rendering fields based on
				selected tab's data.
				 -->

			</div>
		</div>


	</div>
</template>

<script setup>

// stores
// props, emits
let props = defineProps({
	userTabs: Array,
	systemTabs: Array,
})

//# region variables, refs, computed
let activeTab = ref(null);
//# endregion

//# region hooks
//# endregion

// watchers
</script>

<style scoped lang="scss">

</style>
