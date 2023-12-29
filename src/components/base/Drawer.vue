<template>
    <Teleport to="body" v-if="modelValue">
        <transition name="draw">
            <!--
                v-show="modelValue" instead of v-hide
                because of v-bind="$attrs" inside its child
            -->
            <div
                v-show="modelValue"
                class="drawer_wrap"
            >
                <div class="drawer_container"
                     v-bind="$attrs">

                    <slot :close="close" />

                </div>
            </div>
        </transition>
    </Teleport>
</template>

<script setup>

// stores
// props, emits
let props = defineProps({
    modelValue: Boolean,
})

let emit = defineEmits(['update:modelValue', 'cancel'])
//# region variables, refs, computed

//# endregion

//# region hooks
//# endregion

// watchers

function close() {
    emit('update:modelValue', false);
}
</script>

<style scoped lang="scss">

</style>
