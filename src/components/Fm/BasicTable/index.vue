<template>
    <div class="table1" :class="{'readonly': isReadonly}">

        <div v-if="$slots.header" class="t_head"><slot name="header" /></div>

        <div>
            <!-- Default slot that contains table rows -->
            <slot />

            <div v-if="props.loading" class="center p-16">
                <FmLoader />
            </div>
        </div>
    </div>
</template>

<script setup>
/* *
 * Used instead of BaseTable
 * */

// stores
// props, emits
let props = defineProps({
	loading: Boolean,
})

//# region variables, refs, computed

//# endregion

//# region hooks
//# endregion

// watchers
</script>

<style scoped lang="scss">

    .table1 {
        border-top: $basic-table-border;
        border-right: $basic-table-border;
        border-left: $basic-table-border;
        width: 100%;
        font-size: 14px;

        &:not(.disabled) {

            .t_head {
                :deep(.t_row) {
                    height: 50px;
                    font-weight: 500;

                    &:not(.disabled):hover {
                        background-color: initial;
                    }
                }

                :deep( .t_cell:not(.disabled) ) {
                    &:hover {
                        color: $text-lighten;
                    }
                }
            }

        }
    }

    .t_head {
        background-color: #f2f2f2;
    }

</style>
