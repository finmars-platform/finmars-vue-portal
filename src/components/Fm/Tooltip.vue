<template>
    <div class="fm_tooltip" ref="elem" v-if="shown"><slot /></div>
</template>

<script setup>
/** TODO: finish or delete
 * This component must not be used
 * **/
// stores
// props, emits

//# region variables, refs, computed
let elem = ref(null);
let shown = ref(true);
let parent;
//# endregion

function calculatePosition(tooltipElem, direction) {

    const activatorRect = parent.getBoundingClientRect()

    let tooltipHeight = tooltipElem.clientHeight
    let tooltipWidth = tooltipElem.clientWidth

    let positionX
    let positionY

    const spaceBetween = 2 // space between tooltip and anchor element

    positionX = activatorRect.left + (activatorRect.width - tooltipWidth) / 2

    if (direction === 'bottom') {
        positionY = activatorRect.bottom + spaceBetween
    } else {
        positionY = activatorRect['top'] - tooltipHeight - spaceBetween
    }

    //#region Prevents tooltip from creeping out of window
    const windowHeight = document.body.clientHeight
    const windowWidth = document.body.clientWidth

    if (tooltipHeight > windowHeight) tooltipHeight = windowHeight

    if (positionX + tooltipWidth > windowWidth) {
        tooltipElem.style.right = '0'
        tooltipElem.style.left = ''
    } else {
        tooltipElem.style.left = positionX + 'px'
        tooltipElem.style.right = ''
    }

    if (positionY + tooltipHeight > windowHeight) {
        tooltipElem.style.bottom = '0'
        tooltipElem.style.top = ''
    } else {
        tooltipElem.style.top = positionY + 'px'
        tooltipElem.style.bottom = ''
    }
    //# endregion Prevents popup from creeping out of window
}

//# region hooks
onMounted(() => {
    parent = elem.value.parentElement;
    shown.value = false;

    parent.addEventListener(function () {

        calculatePosition(el, tooltipElem, direction)
    })
})
//# endregion

// watchers
</script>

<style scoped lang="scss">

</style>
