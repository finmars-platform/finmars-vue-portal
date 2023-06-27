<template>
	<FmSelect
		:items="portfolios"
		prop_name="user_code"
		@update:modelValue="emits('selected', $event)"
	/>
</template>

<script setup>

	const emits = defineEmits(['selected'])

	let portfolios = ref([])

	init()
	async function init() {
		let res = await useApi('portfolioListLight.get')

		portfolios.value = res.results
	}
</script>

<style lang="scss" scoped>

</style>
