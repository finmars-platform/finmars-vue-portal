<template>
	<FmSelect
		:items="bundles"
		prop_name="user_code"
		@update:modelValue="emits('selected', $event)"
	/>
</template>

<script setup>

	const emits = defineEmits(['selected'])

	let bundles = ref([])

	init()
	async function init() {
		let res = await useApi('portfolioBundleList.get')

		bundles.value = res.results
	}
</script>

<style lang="scss" scoped>

</style>
