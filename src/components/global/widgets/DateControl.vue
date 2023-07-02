<template>
	<div>
		<FmInputDate
			:label="outputs.date.name"
			:modelValue="value"
			class="m-b-0"
			style="height: 44px"
			@update:modelValue="saveVal"
		/>
	</div>
</template>

<script setup>
	import dayjs from 'dayjs'

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

	let value = ref(outputs.value.date.__val)

	let clearDeb

	function saveVal(val) {
		value.value = val

		clearTimeout(clearDeb)

		if (!/\d{4}-\d{2}-\d{2}/.test(val)) return false
		clearDeb = setTimeout(() => {
			outputs.value.date.__val = val
		}, 500)
	}
</script>

<style lang="scss" scoped></style>
