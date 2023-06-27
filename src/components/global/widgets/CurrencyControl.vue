<template>
	<!-- <FmSelect
		class="m-b-0"
		attach="body"
		v-model="outputs.currency.__val"
		:items="currencies"
	/> -->
	<FmUnifiedDataSelect
		v-model="outputs.currency.__val"
		noBorders
		content_type="currencies.currency"
	/>
</template>

<script setup>

	const props = defineProps({
		uid: String
	})
	const dashStore = useStoreDashboard()

	let component = dashStore.getComponent(props.uid)

	const outputs = computed(() => {
		let props = dashStore.props.outputs.filter((prop) => prop.component_id == component.uid)
		let obj = {}

		props.forEach((prop) => {
			obj[prop.key] = prop
		})
		return obj
	})

	let currencies = ref([])

	init()
	async function init() {

	}
</script>

<style lang="scss" scoped>

</style>
