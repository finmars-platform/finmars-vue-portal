<template>
	<FmSelect
		v-model="outputs"
		:items="portfolios"
		@update:modelValue="emits('selected', $event)"
	/>
</template>

<script setup>

	const emits = defineEmits(['selected'])
	const props = defineProps({
		wid: String
	})
	const dashStore = useStoreDashboard()

	let component = dashStore.getWidget(props.wid)

	const inputs = computed(() => {
		let props = dashStore.props.inputs.filter((prop) => prop.component_id == widget.id)
		let obj = {}

		props.forEach((prop) => {
			obj[prop.name] = prop.__val
		})
		return obj
	})

	const outputs = computed(() => {
		let props = dashStore.scope.filter((prop) => prop.cid == widget.id && prop.direct == 'output')
		let obj = {}

		props.forEach((prop) => {
			obj[prop.name] = prop
		})
		return obj
	})

	let current = ref(0)
	let portfolios = ref([])

	init()
	async function init() {
		let res = await useApi('portfolioLight.get')

		portfolios.value = res.results
	}
</script>

<style lang="scss" scoped>

</style>
