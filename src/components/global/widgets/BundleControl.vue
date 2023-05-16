<template>
	<FmSelect
		class="m-b-0"
		attach="body"
		v-model="outputs.bundleId.__val"
		:items="bundles"
		prop_name="user_code"
	/>
</template>

<script setup>

	const props = defineProps({
		wid: String
	})
	const dashStore = useStoreDashboard()

	let component = dashStore.getWidget(props.wid)

	const outputs = computed(() => {
		let props = dashStore.props.outputs.filter((prop) => prop.component_id == component.uid)
		let obj = {}

		props.forEach((prop) => {
			obj[prop.key] = prop
		})
		return obj
	})

	let bundles = ref([])

	init()
	async function init() {
		let res = await useApi('portfolioBundles.get')

		bundles.value = res.results
	}
</script>

<style lang="scss" scoped>

</style>
