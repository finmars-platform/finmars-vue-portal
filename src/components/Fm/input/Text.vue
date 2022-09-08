<template>
	<BaseInput
		:label="label"
		:modelValue="modelValue"
	>
		<template #button>
			<FmIcon
				icon="edit"
			/>
		</template>
		<template #sedeItems></template>
	</BaseInput>
</template>

<script setup>
	let props = defineProps({
		modelValue: String,
		label: String
	})
</script>

<style lang="scss" scoped>


</style>
