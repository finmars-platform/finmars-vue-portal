<template>
	<FmHorizontalPanel>
		<template #leftActions>
			<EvLayoutsManager :loadingLayout="loadingLayout" />

			<FmIcon icon="save" btn @click="$emit('saveListLayout')" />

			<BaseInput
				type="text"
				v-model="searchParam"
				@keyup.enter="refresh()"
				@update:modelValue="$emit('search', searchParam)"
				placeholder="Search for a ..."
				class="bi_no_borders"
			/>
		</template>

		<template #rightActions>
			<slot name="rightActions" />

			<FmIcon icon="settings" btn @click="$emit('openSettings')" />
		</template>
	</FmHorizontalPanel>
</template>

<script setup>
	let props = defineProps({
		loadingLayout: Boolean,
	})

	defineEmits(['saveListLayout', 'openSettings'])
</script>

<style lang="scss" scoped></style>
