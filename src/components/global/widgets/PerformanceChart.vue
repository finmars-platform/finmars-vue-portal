<template>
	<RvPerformanceChart
		v-bind="inputs"
	/>
</template>

<script setup>

	const props = defineProps({
		wid: String
	})
	const dashStore = useStoreDashboard()
	let widget = dashStore.getWidget(props.wid)

	const inputs = computed(() => {
		let props = dashStore.props.inputs.filter((prop) => prop.component_id == widget.uid )
		let obj = {}

		props.forEach((prop) => {
			obj[prop.key] = prop.__val
		})
		return obj
	})

</script>

<style lang="scss" scoped>

</style>
