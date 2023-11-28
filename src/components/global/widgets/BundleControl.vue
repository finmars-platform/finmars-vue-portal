<template>
	<FmSelect
		class="m-b-0"
		attach="body"
		v-model="outputs.bundleId.__val"
		:label="outputs.bundleId.name"
		:items="bundles"
		height="calc(100% - 6px)"
		style="overflow: hidden"
		prop_name="user_code"
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

	let bundles = ref([])

	init()
	async function init() {
		let res = await useApi('portfolioBundleList.get')

		bundles.value = res.results
	}
</script>

<style lang="scss" scoped></style>
