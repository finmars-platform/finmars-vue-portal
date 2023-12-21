<template>
	<div
		v-bind="$attrs"
		v-if="readyStatus"
		class="g-filter-type-n-value flex-row fc-space-between m-b-16"
	>
		<FmSelect
			class="g-filter-types-select m-b-0"
			:modelValue="filterType"
			:items="types"
			label="Filter type"
			@update:modelValue="newVal => emit('update:filterType', newVal)"
		/>

		<div class="g-filter-value-wrap">
			<slot />
		</div>
	</div>

	<div
		v-else
		class="g-filter-type-loader flex-row fc-space-around fi-center m-b-16"
	>
		<FmLoader></FmLoader>
	</div>
</template>

<script setup>
/*
 * Supporting component for the
 * components/Fm/Table/Filters/Rv.vue, components/Fm/Table/Filters/Ev.vue.
 * Must always have one of the as the parent.
 *
 * Must contain only template and styles
 * */

// stores
// props, emits
let props = defineProps({
	/** Used to show loader if filter has data to load
	 * (e.g. options for selectors inside text filter)
	 * */
	readyStatus: Boolean,
	filterType: String,
	types: {
		type: Array,
		required: true,
	},
})

let emit = defineEmits(['update:filterType']);

//# region variables, refs, computed

//# endregion

// watchers
</script>

<style scoped lang="scss">

</style>
