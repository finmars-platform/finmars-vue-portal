<template>
	<RvPerformanceDetail
		v-bind="inputs"
		:calculation_type="widget.settings[0].calculation_type"

		@setMonth="outputs.currentBundleYear.__val = $event"
	/>
</template>

<script setup>

	const props = defineProps({
		uid: String
	})
	let dashStore = useStoreDashboard()
	let widget = dashStore.getComponent(props.uid)

	const inputs = computed(() => {
		let props = dashStore.props.inputs
			.filter((prop) => prop.component_id == widget.uid)
		let obj = {}

		props.forEach((prop) => {
			obj[prop.key] = prop.__val
		})

		return obj
	})

	const outputs = computed(() => {
		let props = dashStore.props.outputs.filter((prop) => prop.component_id == widget.uid)
		let obj = {}

		props.forEach((prop) => {
			obj[prop.key] = prop
		})
		return obj
	})

</script>

<style lang="scss" scoped>

</style>
