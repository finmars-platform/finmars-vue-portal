<template>
	<FmSelect
		:items="currencies"
		@update:modelValue="emits('selected', $event)"
	/>
</template>

<script setup>

	const emits = defineEmits(['selected'])

	let currencies = ref([])

	init()
	async function init() {
		let res = await useApi('currencyListLight.get')

		currencies.value = res.results
	}
</script>

<style lang="scss" scoped>

</style>
