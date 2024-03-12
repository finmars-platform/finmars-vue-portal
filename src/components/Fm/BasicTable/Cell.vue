<template>
	<!-- <button> instead of <div> because of 'disabled' attribute -->
	<button class="t_cell" :class="{'readonly': readonly}">
		<slot />
		<FmLoader v-if="loading" />
	</button>
</template>

<script setup>
/*
 * Supporting component for the
 * components/Fm/BasicTable/index.vue, components/Fm/BasicTable/Header.vue .
 * Must always have one of them as parent.
 */

// stores
// props, emits
let props = defineProps({
	loading: Boolean,
    readonly: Boolean,
})

//# region variables, refs, computed

//# endregion

//# region hooks
//# endregion

// watchers
</script>

<style scoped lang="scss">
    /*
     * Some styles are applied to this component inside components
     * FmBasicTable and FmBasicTableHeader using :deep()
     */

	.t_cell {
		display: block;
		height: inherit;
        padding: 0 16px;

		&:not(.no_collapsed) {
			overflow: hidden;

			.table-cell-btn {
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}

		& + & {
			border-left: 1px solid $border;
		}

		&[disabled] {
			background: $main-darken-2;
		}
	}
</style>
