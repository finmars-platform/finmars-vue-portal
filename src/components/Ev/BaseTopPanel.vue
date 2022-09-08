<template>
	<FmHorizontalPanel>
		<template #leftActions>
			<FmIcon icon="save" btn @click="$emit('saveListLayout')" />

		</template>

		<template #rightActions>
			<slot name="rightActions" />

			<FmIcon icon="settings" btn @click="$emit('openSettings')" />
		</template>
	</FmHorizontalPanel>
</template>

<script setup>
	defineEmits(['saveListLayout', 'openSettings'])

</script>

<style lang="scss" scoped>

</style>
