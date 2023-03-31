<template>
	<FmInputDate
		v-model="value"
		@change="outputs.date.__val = value"
	/>
</template>

<script setup>

	let props = defineProps({
		wid: String
	})

	let value = ref('2022-09-09')
	let dashStore = useStoreDashboard()
	let widget = dashStore.getWidget(props.wid)

	let outputs = computed(() => {
		let props = dashStore.scope.filter((prop) => prop.cid == widget.id && prop.direct == 'output')
		let obj = {}

		props.forEach((prop) => {
			obj[prop.name] = prop
		})
		return obj
	})

</script>

<style lang="scss" scoped>

</style>
