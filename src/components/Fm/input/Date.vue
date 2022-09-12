<template>
	<BaseInput
		:label="label"
		:modelValue="modelValue"
		@update:modelValue="$emit('update:modelValue', $event)"
	>
		<template #button>
			<FmIcon
				icon="calendar_month"
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
