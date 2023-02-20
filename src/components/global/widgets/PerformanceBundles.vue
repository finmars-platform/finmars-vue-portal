<template>
	<RvPerformanceBundles
		v-bind="componentProps"

		@setBundle="scope.currentBundle.value = $event"
	/>
</template>

<script setup>

	let props = defineProps({
		wid: String
	})
	let dashStore = useStoreDashboard()
	let widget = dashStore.getWidget(props.wid)

	let componentProps = computed(() => {
		let props = dashStore.scope.filter((prop) => prop.cid == widget.id)
		let obj = {}

		props.forEach((prop) => {
			obj[prop.name] = prop.__val
		})
		return obj
	})

	let scopee = {
		inputs: [
			'begin_date',
			'end_date',
			'calculation_type',
			'report_currency',
		],
		outputs: [
			'currentBundle'
		]
	}

</script>

<style lang="scss" scoped>

</style>
