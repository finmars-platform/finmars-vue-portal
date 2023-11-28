<template>
    <iframe :src="frame + '?iframe=true'" width="100%" frameborder="0"></iframe>
</template>

<script setup>
    let frame = ref(window.location.href.replace('/v/', '/a/#!/'))
    frame = ref('https://dev.finmars.com/space0crgw/a/#!/')
</script>

<style lang="scss" scoped>
    iframe {
        height: 100%;
    }
</style>
