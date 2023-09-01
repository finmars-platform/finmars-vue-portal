<template>
	<FmSelect
		class="m-b-0"
		attach="body"
		v-model="outputs.portfolio.__val"
		:label="outputs.portfolio.name"
		:items="portfolios"
		height="calc(100% - 6px)"
		style="overflow: hidden"
	/>
</template>

<script setup>
	const props = defineProps({
		uid: String,
	})
	const dashStore = useStoreDashboard()

	let component = dashStore.getComponent(props.uid)

	const outputs = computed(() => {
		let props = dashStore.props.outputs.filter(
			(prop) => prop.component_id == component.uid
		)
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
		let res = await useApi('portfolioListLight.get')

		portfolios.value = res.results
	}
</script>

<style lang="scss" scoped></style>
