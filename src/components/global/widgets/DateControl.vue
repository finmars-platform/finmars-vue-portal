<template>
	<FmInputDate
		:modelValue="outputs.date.__val"
		@update:modelValue="outputs.date.__val = $event"
	/>
</template>

<script setup>

	const props = defineProps({
		uid: String
	})

	const dashStore = useStoreDashboard()
	let component = dashStore.getComponent(props.uid)
	let value = ref('2022-09-09')

	const outputs = computed(() => {
		let props = dashStore.props.outputs.filter((prop) => prop.component_id == component.uid)
		let obj = {}

		props.forEach((prop) => {
			obj[prop.key] = prop
		})
		return obj
	})

</script>

<style lang="scss" scoped>

</style>
