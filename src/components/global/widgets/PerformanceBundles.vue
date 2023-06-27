<template>
	<RvPerformanceBundles
		v-bind="inputs"

		@setBundle="outputs.bundleId.__val = $event.id"
	/>
</template>

<script setup>

	let props = defineProps({
		uid: String
	})
	let dashStore = useStoreDashboard()
	let widget = dashStore.getComponent(props.uid)

	let inputs = computed(() => {
		let props = dashStore.props.inputs.filter((prop) => prop.component_id == widget.uid )
		let obj = {}

		props.forEach((prop) => {
			obj[prop.key] = prop.__val
		})
		return obj
	})

	let outputs = computed(() => {
		let props = dashStore.props.outputs.filter((prop) => prop.component_id == widget.uid )
		let obj = {}

		props.forEach((prop) => {
			obj[prop.key] = prop
		})
		return obj
	})

</script>

<style lang="scss" scoped>

</style>
