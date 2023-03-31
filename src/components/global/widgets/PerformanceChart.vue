<template>
	<RvPerformanceChart
		v-bind="inputs"
	/>
</template>

<script setup>

	let props = defineProps({
		wid: String
	})
	let dashStore = useStoreDashboard()
	let widget = dashStore.getWidget(props.wid)

	let inputs = computed(() => {
		let props = dashStore.scope.filter((prop) => prop.cid == widget.id && prop.direct == 'input')
		let obj = {}

		props.forEach((prop) => {
			obj[prop.name] = prop.__val
		})
		return obj
	})

</script>

<style lang="scss" scoped>

</style>
