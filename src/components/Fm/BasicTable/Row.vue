<template>
	<!-- <button> instead of <div> because of 'disabled' attribute -->
    <button class="t_row" :class="{'active': active}">
        <slot />
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
    active: Boolean,
})

//# region variables, refs, computed

//# endregion

//# region hooks
//# endregion

// watchers
</script>

<style scoped lang="scss">
    /*
     * Some styles are applied inside FmBasicTable and FmBasicTableHeader
     * using :deep()
     */

    .t_row {
        display: flex;
        height: 36px;
        outline: solid transparent;
        transition: outline .1s;
        box-sizing: border-box;
        border-bottom: $basic-table-border;

        &.grid {
            display: grid;
        }

        &:not(.disabled) {
            cursor: pointer;

            &:not(.active):hover {
                background: #fac87863;
            }
        }

        &.active {
            background: #fac87863;
        }
    }
</style>
