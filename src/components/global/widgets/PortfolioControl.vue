<template>
	<FmSelect
		class="m-b-0"
		attach="body"
		v-model="outputs.portfolio.__val"
		:items="portfolios"
	/>
</template>

<script setup>

	const props = defineProps({
		wid: String
	})
	const dashStore = useStoreDashboard()

	let component = dashStore.getWidget(props.wid)

	const outputs = computed(() => {
		let props = dashStore.props.outputs.filter((prop) => prop.component_id == component.uid)
		let obj = {}

		props.forEach((prop) => {
			obj[prop.key] = prop
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
