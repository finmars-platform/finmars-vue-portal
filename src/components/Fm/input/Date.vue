<template>
	<BaseInput
		:label="label"
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
		label: String
	})
</script>

<style lang="scss" scoped>


</style>
